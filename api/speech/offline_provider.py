"""
Offline / Mock speech providers for testing and network-isolated environments.
"""
from __future__ import annotations

from typing import Any, Optional

from speech.base import BaseSTTProvider, BaseTTSProvider, TranscribeResult, TTSResult


class OfflineSTTProvider(BaseSTTProvider):
    """Offline STT provider indicating speech service is unavailable."""

    def is_configured(self) -> bool:
        return True

    def supported_languages(self) -> list[str]:
        return []

    async def transcribe(
        self, audio_bytes: bytes, filename: str, language_hint: str = "auto"
    ) -> TranscribeResult:
        raise RuntimeError("Speech transcription is unavailable in offline mode. Please type your question.")


class OfflineTTSProvider(BaseTTSProvider):
    """Offline TTS provider indicating voice synthesis is unavailable."""

    def is_configured(self) -> bool:
        return True

    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        return {}

    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        raise NotImplementedError("Voice synthesis is unavailable in offline mode.")
