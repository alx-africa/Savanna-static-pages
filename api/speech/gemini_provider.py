"""
Gemini Multimodal STT Provider — high-accuracy speech-to-text
using Gemini 3.5 Flash Lite for Ethiopian national languages
(Amharic, Afaan Oromoo, Tigrinya, Somali) and refugee languages (Arabic, Swahili, French, English).
"""
from __future__ import annotations

import base64
import logging
import os
from typing import Optional

import httpx

from speech.base import BaseSTTProvider, TranscribeResult

logger = logging.getLogger(__name__)


class GeminiSTTProvider(BaseSTTProvider):
    """Multimodal STT provider powered by Google Gemini API."""

    def __init__(self, api_key: str, model: str = "gemini-3.5-flash-lite", timeout: float = 25.0):
        self.api_key = api_key.strip()
        self.model = model or "gemini-3.5-flash-lite"
        self.timeout = timeout

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def supported_languages(self) -> list[str]:
        return ["en", "am", "om", "ti", "so", "ar", "sw", "fr"]

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str,
        language_hint: Optional[str] = "auto",
    ) -> TranscribeResult:
        if not self.api_key:
            raise RuntimeError("Gemini API key is not configured for STT.")

        ext = filename.split(".")[-1].lower() if "." in filename else "webm"
        mime_map = {
            "webm": "audio/webm",
            "mp3": "audio/mp3",
            "mpeg": "audio/mp3",
            "wav": "audio/wav",
            "wave": "audio/wav",
            "ogg": "audio/ogg",
            "oga": "audio/ogg",
            "m4a": "audio/mp4",
        }
        mime = mime_map.get(ext, "audio/webm")
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        lang_instr = f" The expected language is {language_hint}." if language_hint and language_hint != "auto" else ""
        prompt = (
            "Transcribe this speech audio recording verbatim into text in the spoken language."
            f"{lang_instr} "
            "Do not add any preamble, conversational greeting, explanation, translation, or notes. "
            "Output ONLY the exact spoken transcription."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime,
                                "data": audio_b64,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "maxOutputTokens": 2048,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, params={"key": self.api_key}, json=payload)
            if resp.status_code != 200:
                logger.error("Gemini STT error (%s): %s", resp.status_code, resp.text)
                raise RuntimeError(f"Gemini STT returned status {resp.status_code}: {resp.text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return TranscribeResult(
                    text="",
                    language=language_hint or "en",
                    confidence=0.0,
                    duration_seconds=0.0,
                    provider=f"gemini ({self.model})",
                )

            parts = candidates[0].get("content", {}).get("parts", [])
            transcribed_text = "".join(p.get("text", "") for p in parts).strip()

            return TranscribeResult(
                text=transcribed_text,
                language=language_hint if language_hint and language_hint != "auto" else "auto",
                confidence=0.95,
                duration_seconds=0.0,
                provider=f"gemini ({self.model})",
            )
