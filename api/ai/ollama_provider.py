"""Ollama-backed AI provider using httpx.AsyncClient."""
from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

import httpx

from ai.provider import AIProvider
from models import ChatMessage, Citation

if TYPE_CHECKING:
    from config import Settings

logger = logging.getLogger(__name__)

_LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "am": "Amharic (አማርኛ)",
    "om": "Afaan Oromo (Afaan Oromoo)",
    "ti": "Tigrinya (ትግርኛ)",
    "so": "Somali (Soomaali)",
    "ar": "Arabic (العربية)",
    "sw": "Kiswahili (Swahili)",
    "fr": "French (Français)",
}

def get_system_prompt(language: str, simple_mode: bool = False) -> str:
    lang_name = _LANGUAGE_NAMES.get(language, "English")
    prompt = (
        f"You are a helpful multilingual learning assistant for Savanna, an online learning platform "
        f"serving Ethiopian and regional refugee learners (including Eritrean, Sudanese, Somali, and Congolese learners). "
        f"You MUST respond fluently and naturally in {lang_name}. "
        f"Answer ONLY from the provided course content. "
        f"If the answer is not in the provided content, state clearly in {lang_name} that the course material does not mention it. "
        f"Always cite your sources using [source_id] notation corresponding to the course chunks provided. "
        f"Do not make up information.\n\n"
        f"CRITICAL TERMINOLOGY & ENTITY PRESERVATION RULES:\n"
        f"1. Do NOT translate technical acronyms, tool names, coding terms, or proper nouns into literal words.\n"
        f"2. Always preserve technical acronyms, course codes, software tools, metrics, percentages (e.g. '70%'), proper institution/organization names, and URLs in their standard professional notation (e.g. 'Virtual Assistant', 'VA', 'Pull Request', 'Git', 'GitHub', 'HTML', 'CSS', 'JavaScript', 'Python', 'CRM', 'QA Review', etc.).\n"
        f"3. When explaining a technical concept in {lang_name}, provide the natural pedagogical explanation in {lang_name} "
        f"while retaining the standard industry term in English (e.g. 'Gabaasa qorannoo (QA Review)' in Oromo or "
        f"'የጥራት ማረጋገጫ ግምገማ (QA Review)' in Amharic)."
    )
    if simple_mode:
        prompt += (
            f"\n\n[SIMPLE MODE ACTIVATED] Use very plain, simple words in {lang_name}. "
            f"Keep sentences short (under 12 words). Avoid convoluted sentence structures so non-native speakers "
            f"and low-literacy learners can easily understand."
        )
    return prompt

_CITATION_RE = re.compile(r"\[([^\]]+)\]")


def _build_context_block(context_chunks: list[dict]) -> str:
    if not context_chunks:
        return "No additional context available."
    lines = ["=== Provided course content ==="]
    for chunk in context_chunks:
        lines.append(f"[{chunk['id']}] (source: {chunk['source']})\n{chunk['text']}")
        lines.append("---")
    return "\n".join(lines)


def _extract_citations(
    response_text: str, context_chunks: list[dict]
) -> list[Citation]:
    chunk_map = {c["id"]: c for c in context_chunks}
    seen: set[str] = set()
    citations: list[Citation] = []
    for match in _CITATION_RE.finditer(response_text):
        ref = match.group(1)
        if ref in chunk_map and ref not in seen:
            seen.add(ref)
            c = chunk_map[ref]
            citations.append(
                Citation(
                    id=ref,
                    source=c["source"],
                    excerpt=c["text"][:200],
                )
            )
    return citations


def _build_ollama_messages(
    message: str,
    language: str,
    context_chunks: list[dict],
    history: list[ChatMessage],
    simple_mode: bool = False,
    page_context: dict | None = None,
) -> list[dict]:
    system_prompt = get_system_prompt(language, simple_mode)
    context_block = _build_context_block(context_chunks, page_context=page_context)

    messages: list[dict] = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"Here is the relevant content to answer from:\n\n{context_block}",
        },
        {
            "role": "assistant",
            "content": "Understood. I will answer only from the provided content.",
        },
    ]

    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": message})
    return messages


class OllamaProvider(AIProvider):
    def __init__(self, settings: "Settings") -> None:
        self._settings = settings

    @property
    def name(self) -> str:
        return "ollama"

    async def chat(
        self,
        message: str,
        language: str,
        context_chunks: list[dict],
        history: list[ChatMessage],
        simple_mode: bool = False,
        page_context: dict | None = None,
    ) -> tuple[str, list[Citation]]:
        messages = _build_ollama_messages(message, language, context_chunks, history, simple_mode, page_context=page_context)
        payload = {
            "model": self._settings.ollama_model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0.2},
        }
        url = f"{self._settings.ollama_base_url.rstrip('/')}/api/chat"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                text: str = data.get("message", {}).get("content", "")
                citations = _extract_citations(text, context_chunks)
                return text, citations

        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            logger.warning(
                "Ollama unreachable at %s, falling back to offline: %s", url, exc
            )
            # Lazy import to avoid circular dependency
            from ai.offline_provider import OfflineProvider  # noqa: PLC0415

            offline = OfflineProvider(self._settings)
            return await offline.chat(message, language, context_chunks, history)

        except httpx.HTTPStatusError as exc:
            logger.error("Ollama HTTP error %s: %s", exc.response.status_code, exc)
            return (
                f"⚠️ Ollama returned an error ({exc.response.status_code}). "
                "Please check that the model is loaded.",
                [],
            )

        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected Ollama error: %s", exc)
            return f"⚠️ An unexpected error occurred: {exc}", []
