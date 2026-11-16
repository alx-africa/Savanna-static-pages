"""
Pluggable Dynamic Translation Router
FastAPI endpoint for scalable, batch machine translation of host website content.

Supported languages:
- Amharic (am)
- Afaan Oromo (om)
- Tigrinya (ti)
- Somali (so)
- Arabic (ar) - RTL
- Kiswahili (sw)
- French (fr)
- English (en)

Features:
- Dual-layer caching: in-memory + persistent disk cache (docs/translations_cache.json)
- High-performance batching with Gemini 3.5 Flash JSON output
- Graceful fallbacks for unconfigured/offline modes (zero crashes)
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

from config import get_settings, get_docs_path
from utils.linguistic_validator import LinguisticValidator, ValidationResult

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/translate", tags=["Translation"])
settings = get_settings()

LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "am": "Amharic (አማርኛ)",
    "om": "Afaan Oromoo (Oromo)",
    "ti": "Tigrinya (ትግርኛ)",
    "so": "Somali (Soomaali)",
    "ar": "Arabic (العربية)",
    "sw": "Kiswahili (Swahili)",
    "fr": "French (Français)",
}

CACHE_FILE = get_docs_path() / "translations_cache.json"

# In-memory translation cache: key is "{target_lang}:{sha256(text)}"
TRANSLATION_CACHE: dict[str, str] = {}


def _normalize_text(text: str) -> str:
    """Normalize internal and external whitespace for robust cache key matching."""
    return re.sub(r"\s+", " ", text).strip()


def _get_cache_key(target_lang: str, text: str) -> str:
    cleaned = _normalize_text(text)
    h = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:16]
    return f"{target_lang}:{h}"


def _load_persistent_cache() -> None:
    """Load persistent translation cache from disk if available."""
    global TRANSLATION_CACHE
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    TRANSLATION_CACHE.update(data)
                    logger.info("Loaded %d persistent translations from %s", len(data), CACHE_FILE)
        except Exception as exc:
            logger.warning("Could not load translation cache file: %s", exc)


def _save_persistent_cache() -> None:
    """Save in-memory cache to disk."""
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(TRANSLATION_CACHE, f, ensure_ascii=False, indent=2)
    except Exception as exc:
        logger.warning("Could not save translation cache file: %s", exc)


# Initialize cache on module load
_load_persistent_cache()


class BatchTranslateRequest(BaseModel):
    strings: List[str] = Field(..., description="Array of unique text strings to translate")
    target_lang: str = Field(..., description="Target language code (am, om, ti, so, ar, sw, fr, en)")
    source_lang: str = Field(default="en", description="Source language code")
    domain: Optional[str] = Field(default=None, description="Host website domain for context")
    site_type: Optional[str] = Field(default="auto", description="Site type: auto, learning, jobs, or general")


class BatchTranslateResponse(BaseModel):
    translations: Dict[str, str] = Field(..., description="Map of original string to translated string")
    target_lang: str
    source_lang: str
    cached_count: int
    translated_count: int
    provider: str


async def _translate_with_gemini(
    texts: list[str],
    target_lang: str,
    source_lang: str,
    api_key: str,
    model: str = "gemini-3.5-flash-lite",
    site_type: str = "auto",
    domain: Optional[str] = None
) -> dict[str, str]:
    """Translate an array of texts using Google Gemini with structured JSON output and domain-adaptive guidance."""
    lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)
    target_model = model or "gemini-3.5-flash-lite"
    if "gemini-3.5-flash" in target_model and not target_model.endswith("-lite"):
        target_model = "gemini-3.5-flash-lite"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"

    # Auto-detect domain if requested
    detected_type = (site_type or "auto").lower()
    if detected_type == "auto":
        combined_text = " ".join(texts).lower() + " " + (domain or "").lower()
        has_job_terms = any(w in combined_text for w in [
            "job", "career", "salary", "apply now", "applicant", "candidate", "resume",
            "qualifications", "responsibilities", "compensation", "full-time", "part-time",
            "contract", "internship", "hiring", "vacancy", "stipend"
        ])
        has_learn_terms = any(w in combined_text for w in [
            "course", "lesson", "curriculum", "syllabus", "module", "assignment", "quiz",
            "grade", "instructor", "enroll", "student", "learn", "academy"
        ])
        if has_job_terms and not has_learn_terms:
            detected_type = "jobs"
        elif has_learn_terms:
            detected_type = "learning"
        else:
            detected_type = "general"

    if detected_type == "jobs":
        role_desc = "an expert career and workforce localization engine for African talent marketplaces, remote job boards, and digital hiring portals"
        guidelines = (
            "CRITICAL CAREER & JOB MARKETPLACE REQUIREMENTS:\n"
            f"1. Professional & Actionable Clarity: Translate job responsibilities, minimum qualifications, candidate requirements, and benefits into clear, empowering, professional phrasing that resonates with African job seekers and remote professionals in {lang_name}.\n"
            "2. Tech Stack & Qualifications: Preserve recognized technical tools, software, programming languages, and industry standards (e.g., Python, AWS, SQL, CRM, Excel, Agile, Full-Stack, VA) intact where standard, while translating the surrounding action, requirement, and experience expectation naturally.\n"
            "3. Compensation, Deadlines & Application Terms: Ensure terms like 'Remote', 'Full-time', 'Contract', 'Competitive Salary', 'Application Deadline', and 'Apply Now' are translated into authentic local career terminology.\n"
            "4. Formatting & JSON Output: Return ONLY a valid JSON object mapping each EXACT original string key to its intuitive translated string value."
        )
    elif detected_type == "learning":
        role_desc = "an expert pedagogical localization engine for African digital professionals learning modern tech careers (ALX / Holberton / Online Academies)"
        guidelines = (
            "CRITICAL PEDAGOGICAL & COURSE SCALABILITY REQUIREMENTS:\n"
            f"1. Contextual & Natural Clarity: Translate the real semantic meaning of the sentence rather than literal word-for-word replacement. Ensure the phrasing sounds completely natural, intuitive, and engaging to an educated native speaker of {lang_name}.\n"
            f"2. Technical Integrity & Hands-on Labs: Strictly preserve programming syntax, CLI commands, variable names, keywords, and file paths verbatim (e.g., 'def', 'import', 'npm', 'git clone', 'WHERE', 'SELECT', 'main.py') while translating instructional steps, comments, and conceptual guidance naturally into {lang_name}.\n"
            f"3. Quizzes & Assessments: Translate question stems, multiple-choice options, and instant feedback banners with absolute precision. Strictly preserve the logical meaning of qualifying terms such as 'NOT', 'ALWAYS', 'EXCEPT', 'TRUE', 'FALSE'.\n"
            f"4. Grading Rubrics & Criteria: Translate evaluative standards, scoring criteria, and performance indicators clearly and objectively so learners understand exactly what is required to pass.\n"
            f"5. Terminology Balance Across Disciplines: Keep core tech acronyms and recognizable industry designations clear (e.g., AI, Virtual Assistant, VA, DevOps, Kubernetes, REST API, Cloud) where standard in professional practice across Software Engineering, Data Science, and Virtual Assistance, while explaining the concepts clearly in {lang_name}.\n"
            "6. Sentence Flow & Grammar: Where strings are clauses, bullet points, table cells, or inline callouts of an educational lesson, ensure grammatical alignment so they fit smoothly into the broader lesson context.\n"
            "7. Formatting: Preserve numbers, bullet markers, and emojis intact.\n"
            "8. Output: Return ONLY a valid JSON object mapping each EXACT original string key to its intuitive translated string value."
        )
    else:
        role_desc = "an expert localization engine for African digital platforms, online learning academies, and modern job portals"
        guidelines = (
            "CRITICAL LOCALIZATION REQUIREMENTS:\n"
            f"1. Natural Fluency: Translate the real semantic meaning into authentic, culturally fluent {lang_name}.\n"
            "2. Professional Tech & Career Terms: Balance local linguistic clarity with global tech industry terminology.\n"
            "3. Formatting & Output: Return ONLY a valid JSON object mapping each EXACT original string key to its translated string value."
        )

    if target_lang == "ti":
        guidelines += (
            "\nCRITICAL TIGRINYA (ትግርኛ) LINGUISTIC ACCURACY & CONTRASTIVE ANCHORS:\n"
            "- Strictly generate authentic Tigrinya (ትግርኛ). Do NOT output Amharic (አማርኛ).\n"
            "- Possession: Use 'ናይ' (e.g. 'ናይ ቨርቹዋል ረዳኢ'), NEVER use Amharic prefix 'የ-'.\n"
            "- Copula: Use 'እዩ / እያ / እዮም' ('is / are'), NEVER use Amharic 'ነው / ናት / ናቸው'.\n"
            "- Interrogatives: Use 'እንታይ' ('what', NOT 'ምን'), 'ኣበይ' ('where', NOT 'የት'), 'ስለምንታይ' ('why', NOT 'ለምን').\n"
            "- Conjunction: Use suffix '-ን' or 'ምስ' ('and'), NEVER use Amharic 'እና'.\n"
            "- Noun forms: Use 'ረዳኢ / ረዳእቲ' for 'assistant / assistants' (NOT Amharic 'ረዳት / ረዳቶች').\n"
            "- Relative verbs: Use prefix 'ዝ-' (e.g. 'ዝሰርሑ'), NEVER Amharic prefix 'የሚ-' (e.g. 'የሚሰሩት').\n\n"
            "CONTRASTIVE FEW-SHOT ANCHORS:\n"
            '  * "Where Do Virtual Assistants Work?" -> "ቨርቹዋል ረዳእቲ ኣብ ኣበይ ይዓይዩ?" (REJECTED AMHARIC: "ቨርቹዋል ረዳቶች የት ነው የሚሰሩት?")\n'
            '  * "What is a Virtual Assistant?" -> "ቨርቹዋል ረዳኢ (VA) ማለት እንታይ እዩ?" (REJECTED AMHARIC: "ቨርቹዋል ረዳት ማለት ምን ማለት ነው?")\n'
            '  * "Evolution of the VA Role" -> "ምዕባለ ተራ ቨርቹዋል ረዳኢ" (REJECTED AMHARIC: "የቨርቹዋል ረዳት ሚና እድገትና ለውጥ")\n'
            '  * "Why Become a Virtual Assistant?" -> "ስለምንታይ ኢኻ ቨርቹዋል ረዳኢ ክትከውን ትደሊ?" (REJECTED AMHARIC: "ለምን ቨርቹዋል ረዳት መሆን አስፈለገ?")\n'
            '  * "Tasks and Specialisations" -> "ዕማማትን ፍሉይ ክእለታትን" (REJECTED AMHARIC: "ተግባራት እና ስፔሻላይዜሽኖች")\n'
        )

    prompt = (
        f"You are {role_desc}.\n"
        f"Translate the following JSON array of web content and UI strings from {source_lang} into {lang_name}.\n\n"
        f"{guidelines}\n\n"
        f"Strings to translate:\n"
        f"{json.dumps(texts, ensure_ascii=False)}"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 404:
                    fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
                    res = await client.post(fallback_url, json=payload)

                if res.status_code in (503, 429) and attempt < max_retries - 1:
                    logger.warning("Gemini %d on attempt %d, retrying after backoff...", res.status_code, attempt + 1)
                    await asyncio.sleep(2.5 * (attempt + 1))
                    continue

                if res.status_code != 200:
                    logger.error("Gemini translation error %d: %s", res.status_code, res.text)
                    return {}

                data = res.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    return {}

                content_parts = candidates[0].get("content", {}).get("parts", [])
                if not content_parts:
                    return {}

                raw_json = content_parts[0].get("text", "{}")
                candidate_dict: dict[str, str] = {}
                try:
                    parsed = json.loads(raw_json)
                    if isinstance(parsed, dict):
                        candidate_dict = {str(k): str(v) for k, v in parsed.items()}
                except Exception as exc:
                    logger.warning("Standard json.loads failed (%s), attempting regex key-value extraction...", exc)
                    # Resilient fallback regex parser for LLM JSON output with minor syntax quirks
                    matches = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', raw_json)
                    if matches:
                        recovered: dict[str, str] = {}
                        for k, v in matches:
                            try:
                                k_clean = json.loads(f'"{k}"')
                            except Exception:
                                k_clean = k
                            try:
                                v_clean = json.loads(f'"{v}"')
                            except Exception:
                                v_clean = v
                            recovered[k_clean] = v_clean
                        if recovered:
                            logger.info("Recovered %d translations via regex fallback parser.", len(recovered))
                            candidate_dict = recovered

                if not candidate_dict:
                    return {}

                # Production Linguistic Validation Quality Gate
                validated_batch: dict[str, str] = {}
                rejected_items: dict[str, str] = {}
                for orig_str, trans_str in candidate_dict.items():
                    val = LinguisticValidator.validate(trans_str, target_lang, source_lang, orig_str)
                    if val.is_valid:
                        validated_batch[orig_str] = trans_str
                    else:
                        rejected_items[orig_str] = val.error_code or "LINGUISTIC_VIOLATION"
                        logger.warning(
                            "Translation QA rejected [%s]: '%s' -> '%s' (Error: %s, Markers: %s)",
                            target_lang, orig_str, trans_str, val.error_code, val.detected_markers
                        )

                # If all strings pass, return immediately
                if len(validated_batch) == len(candidate_dict):
                    return validated_batch

                # If any string failed and retries remain, execute corrective re-generation pass
                if attempt < max_retries - 1 and rejected_items:
                    retry_strings = list(rejected_items.keys())
                    logger.info("Corrective re-generation pass triggered for %d strings on %s...", len(retry_strings), target_lang)
                    corrective_prompt = (
                        f"You are {role_desc}.\n"
                        f"CRITICAL CORRECTION REQUIRED: The previous translation violated linguistic purity rules for {lang_name}.\n"
                        f"{guidelines}\n\n"
                        f"Re-translate the following specific strings strictly adhering to authentic {lang_name} grammar:\n"
                        f"{json.dumps(retry_strings, ensure_ascii=False)}"
                    )
                    payload["contents"] = [{"role": "user", "parts": [{"text": corrective_prompt}]}]
                    await asyncio.sleep(2.0 * (attempt + 1))
                    continue

                return validated_batch
        except Exception as exc:
            if attempt < max_retries - 1:
                logger.warning("Gemini network error on attempt %d: %s, retrying...", attempt + 1, exc)
                await asyncio.sleep(2.5 * (attempt + 1))
            else:
                logger.error("Gemini translation failed after %d attempts: %s", max_retries, exc)

    return {}


async def _translate_with_openai(
    texts: list[str],
    target_lang: str,
    source_lang: str,
    api_key: str,
    model: str
) -> dict[str, str]:
    """Translate an array of texts using OpenAI API."""
    lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)
    url = "https://api.openai.com/v1/chat/completions"

    system_prompt = (
        f"You are a professional localization engine. Translate the provided JSON array of strings from {source_lang} into {lang_name}. "
        f"Return ONLY a valid JSON object mapping exact original strings to translated strings."
    )

    payload = {
        "model": model or "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(texts, ensure_ascii=False)}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }

    headers = {"Authorization": f"Bearer {api_key}"}

    async with httpx.AsyncClient(timeout=25.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        if res.status_code == 200:
            data = res.json()
            content = data["choices"][0]["message"]["content"]
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict):
                    # In case OpenAI wrapped in an outer key like {"translations": {...}}
                    if len(parsed) == 1 and isinstance(next(iter(parsed.values())), dict):
                        parsed = next(iter(parsed.values()))
                    return {str(k): str(v) for k, v in parsed.items()}
            except Exception as exc:
                logger.warning("OpenAI translation parse failed: %s", exc)

    return {}


@router.post("", response_model=BatchTranslateResponse, summary="Batch translate web content")
async def batch_translate(req: BatchTranslateRequest) -> BatchTranslateResponse:
    """
    Translate a batch of website text nodes into the requested target language.
    Uses multi-tier caching (in-memory + disk cache) and high-speed LLM translation.
    """
    target = (req.target_lang or "en").lower().strip()
    source = (req.source_lang or "en").lower().strip()

    if target not in LANGUAGE_NAMES:
        target = "en"

    # If target is identical to source, return identity mapping
    if target == source:
        return BatchTranslateResponse(
            translations={s: s for s in req.strings},
            target_lang=target,
            source_lang=source,
            cached_count=len(req.strings),
            translated_count=0,
            provider="identity",
        )

    results: dict[str, str] = {}
    missing: list[str] = []
    cached_hits = 0

    # 1. Check Cache
    for s in req.strings:
        cleaned = s.strip()
        if not cleaned:
            results[s] = s
            continue

        ck = _get_cache_key(target, cleaned)
        if ck in TRANSLATION_CACHE:
            cached_candidate = TRANSLATION_CACHE[ck]
            val = LinguisticValidator.validate(cached_candidate, target, source, cleaned)
            if val.is_valid:
                results[s] = cached_candidate
                cached_hits += 1
            else:
                logger.warning("Cache entry failed linguistic QA for %s, quarantining: %s (reason: %s)", target, cleaned, val.error_code)
                missing.append(cleaned)
        else:
            # Punctuation-tolerant cache check (e.g. trailing colon, period, question mark)
            unpunct = re.sub(r"[:.,?!;]+$", "", cleaned).strip()
            ck_un = _get_cache_key(target, unpunct) if unpunct != cleaned else None
            if ck_un and ck_un in TRANSLATION_CACHE:
                cached_candidate = TRANSLATION_CACHE[ck_un]
                val = LinguisticValidator.validate(cached_candidate, target, source, unpunct)
                if val.is_valid:
                    trailing_punct = cleaned[len(unpunct):]
                    results[s] = cached_candidate + trailing_punct
                    cached_hits += 1
                else:
                    missing.append(cleaned)
            else:
                missing.append(cleaned)

    # Deduplicate missing strings
    unique_missing = list(dict.fromkeys(missing))
    translated_count = 0
    active_provider = "cache"

    # 2. Invoke Translation Provider for Missing Strings (in chunks of up to 30)
    if unique_missing:
        chunk_size = 30
        chunks = [unique_missing[i : i + chunk_size] for i in range(0, len(unique_missing), chunk_size)]

        new_translations: dict[str, str] = {}

        if settings.gemini_api_key:
            active_provider = f"gemini ({settings.gemini_model or 'gemini-3.5-flash-lite'})"
            tasks = [
                _translate_with_gemini(
                    texts=chunk,
                    target_lang=target,
                    source_lang=source,
                    api_key=settings.gemini_api_key.strip(),
                    model=settings.gemini_model or "gemini-3.5-flash-lite",
                    site_type=req.site_type or "auto",
                    domain=req.domain,
                )
                for chunk in chunks
            ]
            results_list = await asyncio.gather(*tasks, return_exceptions=True)
            for res_dict in results_list:
                if isinstance(res_dict, dict):
                    new_translations.update(res_dict)
                elif isinstance(res_dict, Exception):
                    logger.warning("Gemini chunk translation exception: %s", res_dict)

        elif settings.openai_api_key:
            active_provider = "openai"
            tasks = [
                _translate_with_openai(
                    texts=chunk,
                    target_lang=target,
                    source_lang=source,
                    api_key=settings.openai_api_key.strip(),
                    model=settings.openai_model,
                )
                for chunk in chunks
            ]
            results_list = await asyncio.gather(*tasks, return_exceptions=True)
            for res_dict in results_list:
                if isinstance(res_dict, dict):
                    new_translations.update(res_dict)
                elif isinstance(res_dict, Exception):
                    logger.warning("OpenAI chunk translation exception: %s", res_dict)
        else:
            active_provider = "fallback-identity"

        # Update cache with newly translated strings that pass linguistic QA
        for orig, translated in new_translations.items():
            val = LinguisticValidator.validate(translated, target, source, orig)
            if val.is_valid:
                ck = _get_cache_key(target, orig)
                TRANSLATION_CACHE[ck] = translated
                translated_count += 1
            else:
                logger.error("Quality gate blocked unvalidated translation from cache: %s -> %s (%s)", orig, translated, val.error_code)

        if translated_count > 0:
            _save_persistent_cache()

        # Build normalized lookup map from new_translations for flexible key matching
        normalized_new = {_normalize_text(k): v for k, v in new_translations.items()}

        # Fill results
        for s in req.strings:
            cleaned = s.strip()
            if s not in results:
                ck = _get_cache_key(target, cleaned)
                norm_s = _normalize_text(cleaned)
                if ck in TRANSLATION_CACHE:
                    results[s] = TRANSLATION_CACHE[ck]
                elif norm_s in normalized_new:
                    results[s] = normalized_new[norm_s]
                elif cleaned in new_translations:
                    results[s] = new_translations[cleaned]
                else:
                    results[s] = s

    return BatchTranslateResponse(
        translations=results,
        target_lang=target,
        source_lang=source,
        cached_count=cached_hits,
        translated_count=translated_count,
        provider=active_provider,
    )


@router.get("/cache/stats", summary="Get translation cache metrics")
async def get_cache_stats() -> dict[str, Any]:
    """Return translation cache metrics."""
    by_lang: dict[str, int] = {}
    for k in TRANSLATION_CACHE:
        lang = k.split(":", 1)[0]
        by_lang[lang] = by_lang.get(lang, 0) + 1

    return {
        "total_cached_strings": len(TRANSLATION_CACHE),
        "by_language": by_lang,
        "supported_languages": list(LANGUAGE_NAMES.keys()),
    }
