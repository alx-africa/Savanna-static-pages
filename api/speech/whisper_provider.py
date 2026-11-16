"""
OpenAI Whisper Speech-to-Text provider implementation.
"""
from __future__ import annotations

import io
import logging
from typing import Optional

from speech.base import BaseSTTProvider, TranscribeResult

logger = logging.getLogger(__name__)


class WhisperSTTProvider(BaseSTTProvider):
    """Cloud Speech-to-Text via OpenAI Whisper."""

    def __init__(self, api_key: str):
        self.api_key = api_key.strip() if api_key else ""
        self._client = None
        if self.api_key:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=self.api_key)
            except ImportError:
                self._client = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self._client)

    def supported_languages(self) -> list[str]:
        # Whisper officially supports these languages; Oromo and Tigrinya are unsupported
        return ["en", "am", "so", "ar", "sw", "fr"]

    async def transcribe(
        self, audio_bytes: bytes, filename: str, language_hint: str = "auto"
    ) -> TranscribeResult:
        if not self.is_configured():
            raise RuntimeError("OpenAI Whisper API key is not configured.")

        lang_hint = (language_hint or "auto").lower()
        whisper_lang = lang_hint if lang_hint in self.supported_languages() else None

        audio_io = io.BytesIO(audio_bytes)
        audio_io.name = filename or "recording.webm"

        try:
            resp = await self._client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_io,
                language=whisper_lang,
            )
            detected = getattr(resp, "language", lang_hint if lang_hint != "auto" else "en")
            return TranscribeResult(
                text=resp.text,
                language=detected,
                confidence=0.96,
                duration_seconds=round(len(audio_bytes) / 16000.0, 2),
                provider="openai-whisper",
            )
        except Exception as exc:
            logger.warning("OpenAI Whisper transcription failed: %s", exc)
            raise RuntimeError(f"OpenAI Whisper error: {exc}") from exc
