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

import hashlib
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

from config import get_settings

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

CACHE_FILE = Path(__file__).resolve().parent.parent.parent / "docs" / "translations_cache.json"

# In-memory translation cache: key is "{target_lang}:{sha256(text)}"
TRANSLATION_CACHE: dict[str, str] = {}


def _get_cache_key(target_lang: str, text: str) -> str:
    cleaned = text.strip()
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
    model: str = "gemini-3.5-flash-lite"
) -> dict[str, str]:
    """Translate an array of texts using Google Gemini with structured JSON output."""
    lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)
    target_model = model or "gemini-3.5-flash-lite"
    if "gemini-3.5-flash" in target_model and not target_model.endswith("-lite"):
        target_model = "gemini-3.5-flash-lite"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"

    prompt = (
        f"You are a professional, culturally authentic localization engine. "
        f"Translate the following JSON array of web content strings from {source_lang} into {lang_name}.\n"
        f"Rules:\n"
        f"1. Preserve numbers, acronyms, and formatting intact.\n"
        f"2. Ensure natural, fluent educational tone in {lang_name}.\n"
        f"3. Return ONLY a valid JSON object where keys are the EXACT original strings and values are the translated strings.\n\n"
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

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code == 404:
            # Fallback to gemini-3.5-flash-lite
            fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
            res = await client.post(fallback_url, json=payload)

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
        try:
            parsed = json.loads(raw_json)
            if isinstance(parsed, dict):
                return {str(k): str(v) for k, v in parsed.items()}
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse Gemini translation JSON: %s. Raw: %s", exc, raw_json)

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
            results[s] = TRANSLATION_CACHE[ck]
            cached_hits += 1
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
            active_provider = f"gemini ({settings.gemini_model or 'gemini-3.5-flash'})"
            for chunk in chunks:
                try:
                    res_dict = await _translate_with_gemini(
                        texts=chunk,
                        target_lang=target,
                        source_lang=source,
                        api_key=settings.gemini_api_key.strip(),
                        model=settings.gemini_model or "gemini-3.5-flash",
                    )
                    new_translations.update(res_dict)
                except Exception as exc:
                    logger.warning("Gemini batch translation error: %s", exc)

        elif settings.openai_api_key:
            active_provider = "openai"
            for chunk in chunks:
                try:
                    res_dict = await _translate_with_openai(
                        texts=chunk,
                        target_lang=target,
                        source_lang=source,
                        api_key=settings.openai_api_key.strip(),
                        model=settings.openai_model,
                    )
                    new_translations.update(res_dict)
                except Exception as exc:
                    logger.warning("OpenAI batch translation error: %s", exc)
        else:
            active_provider = "fallback-identity"

        # Update cache with newly translated strings
        for orig, translated in new_translations.items():
            ck = _get_cache_key(target, orig)
            TRANSLATION_CACHE[ck] = translated
            translated_count += 1

        if translated_count > 0:
            _save_persistent_cache()

        # Fill results
        for s in req.strings:
            cleaned = s.strip()
            if s not in results:
                ck = _get_cache_key(target, cleaned)
                # If translation exists in cache, use it; otherwise fallback to original string
                results[s] = TRANSLATION_CACHE.get(ck, s)

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
