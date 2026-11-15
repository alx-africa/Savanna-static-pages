"""Google Gemini AI Provider for multilingual real-time tutoring and RAG."""
from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING, Any

import httpx

from ai.openai_provider import _LANGUAGE_NAMES, _build_context_block, get_system_prompt
from ai.provider import AIProvider
from models import ChatMessage, Citation

if TYPE_CHECKING:
    from config import Settings

logger = logging.getLogger(__name__)
_CITATION_RE = re.compile(r"\[([^\]]+)\]")


class GeminiProvider(AIProvider):
    """Google Gemini AI provider supporting real-time multilingual instruction."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.api_key = settings.gemini_api_key.strip()
        self.model = settings.gemini_model or "gemini-3.5-flash"
        self.timeout = 25.0

    @property
    def name(self) -> str:
        return f"gemini ({self.model})"

    async def chat(
        self,
        message: str,
        language: str,
        context_chunks: list[dict],
        history: list[ChatMessage],
        simple_mode: bool = False,
    ) -> tuple[str, list[Citation]]:
        """Generate a pedagogical response in the learner's chosen language."""
        if not self.api_key:
            raise RuntimeError("Gemini API key is not configured.")

        system_prompt = get_system_prompt(language, simple_mode)
        context_block = _build_context_block(context_chunks)

        contents: list[dict[str, Any]] = []

        # Previous turns in dialogue
        for msg in (history or [])[-6:]:
            role = "model" if msg.role == "assistant" else "user"
            text_val = msg.content.strip()
            if text_val:
                contents.append({
                    "role": role,
                    "parts": [{"text": text_val}]
                })

        # Current turn with RAG curriculum chunks
        user_prompt = f"{context_block}\n\nLearner Question: {message}"
        contents.append({
            "role": "user",
            "parts": [{"text": user_prompt}]
        })

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1024,
            }
        }

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        params = {"key": self.api_key}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, params=params, json=payload)

            if resp.status_code == 404:
                # Fall back to gemini-3.5-flash-lite if 3.5-flash is not available
                logger.warning("Gemini model %s returned 404. Retrying with gemini-3.5-flash-lite.", self.model)
                fallback_endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(fallback_endpoint, params=params, json=payload)

            if resp.status_code != 200:
                err_text = resp.text
                logger.error("Gemini API error (%s): %s", resp.status_code, err_text)
                raise RuntimeError(f"Gemini API returned status {resp.status_code}: {err_text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return "I apologize, but I could not generate a response at this moment.", []

            content_obj = candidates[0].get("content", {})
            parts = content_obj.get("parts", [])
            reply_text = "".join(p.get("text", "") for p in parts).strip()

            # Extract citations
            cited_ids = set(_CITATION_RE.findall(reply_text))
            chunk_map = {c["id"]: c for c in context_chunks}
            citations: list[Citation] = []
            for cid in cited_ids:
                if cid in chunk_map:
                    c = chunk_map[cid]
                    citations.append(Citation(
                        id=c["id"],
                        source=c["source"],
                        excerpt=c["text"][:120],
                        url=c.get("url")
                    ))

            return reply_text, citations

        except httpx.TimeoutException:
            logger.error("Gemini API request timed out after %ss", self.timeout)
            raise TimeoutError("Gemini AI request timed out. Please try again.") from None
        except Exception as exc:
            logger.error("Gemini chat error: %s", exc)
            raise
