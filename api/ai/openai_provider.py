"""OpenAI-backed AI provider using AsyncOpenAI."""
from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

import openai

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
        f"Do not make up information."
    )
    if simple_mode:
        prompt += (
            f" [SIMPLE MODE ACTIVATED] Use very plain, simple words in {lang_name}. "
            f"Keep sentences short (under 12 words). Avoid technical jargon so non-native speakers "
            f"and low-literacy learners can easily understand."
        )
    return prompt

_CITATION_RE = re.compile(r"\[([^\]]+)\]")


def _build_context_block(context_chunks: list[dict]) -> str:
    """Format RAG chunks into a readable context block."""
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
    """Parse [chunk_id] references from the response and map to chunks."""
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


class OpenAIProvider(AIProvider):
    def __init__(self, settings: "Settings") -> None:
        self._settings = settings
        self._client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    @property
    def name(self) -> str:
        return "openai"

    async def chat(
        self,
        message: str,
        language: str,
        context_chunks: list[dict],
        history: list[ChatMessage],
        simple_mode: bool = False,
    ) -> tuple[str, list[Citation]]:
        system_prompt = get_system_prompt(language, simple_mode)
        context_block = _build_context_block(context_chunks)

        messages: list[dict] = [
            {"role": "system", "content": system_prompt},
            # Inject the RAG context as a user message so it's always visible
            {
                "role": "user",
                "content": f"Here is the relevant content to answer from:\n\n{context_block}",
            },
            {"role": "assistant", "content": "Understood. I will answer only from the provided content."},
        ]

        # Append conversation history
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})

        # Append the current user query
        messages.append({"role": "user", "content": message})

        try:
            response = await self._client.chat.completions.create(
                model=self._settings.openai_model,
                messages=messages,  # type: ignore[arg-type]
                temperature=0.2,
                max_tokens=1024,
            )
            text = response.choices[0].message.content or ""
            citations = _extract_citations(text, context_chunks)
            return text, citations
        except openai.AuthenticationError as exc:
            logger.error("OpenAI authentication error: %s", exc)
            return "⚠️ AI service authentication failed. Please check the API key.", []
        except openai.RateLimitError as exc:
            logger.warning("OpenAI rate limit hit: %s", exc)
            return "⚠️ AI service is busy. Please try again in a moment.", []
        except openai.APIConnectionError as exc:
            logger.error("OpenAI connection error: %s", exc)
            return "⚠️ Could not reach the AI service. Please check your connection.", []
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected error from OpenAI: %s", exc)
            return f"⚠️ An unexpected error occurred: {exc}", []
