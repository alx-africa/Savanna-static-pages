"""
SpeechService — centralized coordinator for replaceable STT and TTS providers.
Includes caching, secret sanitization, and fallback orchestration.
"""
from __future__ import annotations

import collections
import hashlib
import logging
import re
from typing import Any, Optional

from config import Settings
from speech.addis_provider import AddisAISTTProvider, AddisAITTSProvider
from speech.base import BaseSTTProvider, BaseTTSProvider, TranscribeResult, TTSResult
from speech.edgetts_provider import EdgeTTSProvider
from speech.offline_provider import OfflineSTTProvider, OfflineTTSProvider
from speech.whisper_provider import WhisperSTTProvider

logger = logging.getLogger(__name__)


def sanitize_secrets(msg: str, *keys: str) -> str:
    """Ensure sensitive tokens and API keys are redacted from user-facing error messages."""
    sanitized = str(msg)
    for k in keys:
        if k and len(k) > 4:
            sanitized = sanitized.replace(k, "[REDACTED_API_KEY]")
    # Generic regex for potential Bearer or API keys
    sanitized = re.sub(r"(sk-[a-zA-Z0-9_-]{10,})", "[REDACTED_KEY]", sanitized)
    return sanitized


class SpeechService:
    """Manages speech transcription and synthesis across configured providers."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.stt_provider: BaseSTTProvider = self._resolve_stt_provider()
        self.tts_provider: BaseTTSProvider = self._resolve_tts_provider()
        # In-memory bounded LRU cache for audio synthesis: key -> TTSResult
        self._tts_cache: collections.OrderedDict[str, TTSResult] = collections.OrderedDict()
        self._max_cache_size = 250

    def _resolve_stt_provider(self) -> BaseSTTProvider:
        prov_name = (self.settings.stt_provider or "addisai").lower()
        if prov_name == "addisai":
            if self.settings.addis_api_key:
                return AddisAISTTProvider(
                    api_key=self.settings.addis_api_key,
                    base_url=self.settings.addis_api_base_url,
                )
            # Graceful automatic fallback if Addis key missing but OpenAI key present
            if self.settings.openai_api_key:
                logger.info("STT provider is 'addisai' but ADDIS_API_KEY is not set. Falling back to OpenAI Whisper.")
                return WhisperSTTProvider(api_key=self.settings.openai_api_key)
            return AddisAISTTProvider(api_key="", base_url=self.settings.addis_api_base_url)

        if prov_name == "whisper":
            return WhisperSTTProvider(api_key=self.settings.openai_api_key)

        return OfflineSTTProvider()

    def _resolve_tts_provider(self) -> BaseTTSProvider:
        prov_name = (self.settings.tts_provider or "edgetts").lower()
        if prov_name == "addisai":
            if self.settings.addis_api_key:
                return AddisAITTSProvider(
                    api_key=self.settings.addis_api_key,
                    base_url=self.settings.addis_api_base_url,
                )
            logger.info("TTS provider is 'addisai' but ADDIS_API_KEY is not set. Falling back to Edge-TTS.")
            return EdgeTTSProvider()

        if prov_name == "edgetts":
            return EdgeTTSProvider()

        return OfflineTTSProvider()

    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        """Return catalog of available voices from active TTS provider."""
        return self.tts_provider.get_voices()

    async def transcribe(
        self, audio_bytes: bytes, filename: str, language_hint: str = "auto"
    ) -> TranscribeResult:
        """Transcribe speech audio using the active STT provider."""
        try:
            return await self.stt_provider.transcribe(
                audio_bytes=audio_bytes,
                filename=filename,
                language_hint=language_hint,
            )
        except Exception as exc:
            clean_err = sanitize_secrets(str(exc), self.settings.addis_api_key, self.settings.openai_api_key)
            # Re-raise with sanitized message
            raise RuntimeError(clean_err) from None

    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        """Synthesize text into speech with caching."""
        cache_key = hashlib.sha256(f"{language}:{voice or ''}:{text.strip()}".encode("utf-8")).hexdigest()

        if cache_key in self._tts_cache:
            # Move to end (most recently used)
            self._tts_cache.move_to_end(cache_key)
            return self._tts_cache[cache_key]

        try:
            res = await self.tts_provider.synthesize(
                text=text,
                language=language,
                voice=voice,
            )
            # Cache successful synthesis
            self._tts_cache[cache_key] = res
            if len(self._tts_cache) > self._max_cache_size:
                self._tts_cache.popitem(last=False)  # Evict oldest entry
            return res
        except (NotImplementedError, TimeoutError):
            raise
        except Exception as exc:
            clean_err = sanitize_secrets(str(exc), self.settings.addis_api_key, self.settings.openai_api_key)
            raise RuntimeError(clean_err) from None
