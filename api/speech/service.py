"""
SpeechService — centralized coordinator for replaceable STT and TTS providers.
Includes caching, secret sanitization, and fallback orchestration.
"""
from __future__ import annotations

import collections
import hashlib
import logging
import re
from pathlib import Path
from typing import Any, Optional

from config import Settings
from speech.addis_provider import AddisAISTTProvider, AddisAITTSProvider
from speech.base import BaseSTTProvider, BaseTTSProvider, TranscribeResult, TTSResult
from speech.edgetts_provider import EdgeTTSProvider
from speech.gemini_provider import GeminiSTTProvider
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

    def __init__(self, settings: Settings, cache_dir: Optional[Path] = None):
        self.settings = settings
        self.stt_provider: BaseSTTProvider = self._resolve_stt_provider()
        self.tts_provider: BaseTTSProvider = self._resolve_tts_provider()
        # In-memory bounded LRU cache for audio synthesis: key -> TTSResult
        self._tts_cache: collections.OrderedDict[str, TTSResult] = collections.OrderedDict()
        self._max_cache_size = 500
        # Persistent on-disk audio cache for sub-millisecond response and offline operation
        if cache_dir is not None:
            self._cache_dir = cache_dir
        else:
            self._cache_dir = Path(__file__).resolve().parent.parent / "data" / "tts_cache"
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_stt_provider(self) -> BaseSTTProvider:
        prov_name = (self.settings.stt_provider or "addisai").lower()
        if prov_name == "offline":
            return OfflineSTTProvider()
        if prov_name == "gemini" and self.settings.gemini_api_key:
            return GeminiSTTProvider(
                api_key=self.settings.gemini_api_key,
                model=self.settings.gemini_model or "gemini-3.5-flash-lite",
            )

        if prov_name == "addisai":
            if self.settings.addis_api_key:
                return AddisAISTTProvider(
                    api_key=self.settings.addis_api_key,
                    base_url=self.settings.addis_api_base_url,
                )
            # Automatic fallback to Gemini Multimodal STT if configured
            if self.settings.gemini_api_key:
                logger.info("STT provider is 'addisai' but ADDIS_API_KEY is not set. Falling back to Gemini Multimodal STT.")
                return GeminiSTTProvider(
                    api_key=self.settings.gemini_api_key,
                    model=self.settings.gemini_model or "gemini-3.5-flash-lite",
                )
            # Graceful automatic fallback if Addis key missing but OpenAI key present
            if self.settings.openai_api_key:
                logger.info("STT provider is 'addisai' but ADDIS_API_KEY is not set. Falling back to OpenAI Whisper.")
                return WhisperSTTProvider(api_key=self.settings.openai_api_key)
            return AddisAISTTProvider(api_key="", base_url=self.settings.addis_api_base_url)

        if prov_name == "whisper":
            if self.settings.openai_api_key:
                return WhisperSTTProvider(api_key=self.settings.openai_api_key)
            if self.settings.gemini_api_key:
                return GeminiSTTProvider(api_key=self.settings.gemini_api_key, model=self.settings.gemini_model or "gemini-3.5-flash-lite")

        if self.settings.gemini_api_key:
            return GeminiSTTProvider(api_key=self.settings.gemini_api_key, model=self.settings.gemini_model or "gemini-3.5-flash-lite")

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
        """Transcribe speech audio using active STT provider with automatic Gemini fallback."""
        if not self.stt_provider.is_configured():
            raise RuntimeError("Speech transcription provider is not configured.")

        primary_exc = None
        res = None
        try:
            res = await self.stt_provider.transcribe(
                audio_bytes=audio_bytes,
                filename=filename,
                language_hint=language_hint,
            )
            if res and res.text and res.text.strip():
                return res
        except Exception as exc:
            primary_exc = exc
            logger.warning("Primary STT provider failed: %s", exc)

        # Automatic fallback to Gemini Multimodal STT if configured
        if self.settings.gemini_api_key and not isinstance(self.stt_provider, GeminiSTTProvider):
            try:
                gemini_stt = GeminiSTTProvider(
                    api_key=self.settings.gemini_api_key,
                    model=self.settings.gemini_model or "gemini-3.5-flash-lite",
                )
                logger.info("Falling back to Gemini Multimodal STT.")
                return await gemini_stt.transcribe(
                    audio_bytes=audio_bytes,
                    filename=filename,
                    language_hint=language_hint,
                )
            except Exception as g_exc:
                logger.warning("Gemini STT fallback failed: %s", g_exc)

        if primary_exc is not None:
            clean_err = sanitize_secrets(str(primary_exc), self.settings.addis_api_key, self.settings.openai_api_key)
            raise RuntimeError(clean_err) from None

        return res if res is not None else TranscribeResult(text="", language=language_hint, confidence=0.0, duration_seconds=0.0, provider="none")

    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        """Synthesize text into speech with memory and disk caching."""
        clean_text = text.strip()
        cache_key = hashlib.sha256(f"{language}:{voice or ''}:{clean_text}".encode("utf-8")).hexdigest()

        # 1. In-memory LRU hit (0ms)
        if cache_key in self._tts_cache:
            self._tts_cache.move_to_end(cache_key)
            return self._tts_cache[cache_key]

        # 2. Persistent on-disk audio cache hit (<1ms, survives restarts & offline)
        disk_file = self._cache_dir / f"{cache_key}.mp3"
        if disk_file.is_file():
            try:
                audio_bytes = disk_file.read_bytes()
                res = TTSResult(
                    audio_bytes=audio_bytes,
                    media_type="audio/mpeg",
                    voice_name=voice or "cached",
                    language=language,
                    provider="disk-cache",
                )
                self._tts_cache[cache_key] = res
                return res
            except Exception as e:
                logger.warning("Failed to read TTS disk cache for %s: %s", cache_key, e)

        # 3. Provider synthesis
        try:
            res = await self.tts_provider.synthesize(
                text=clean_text,
                language=language,
                voice=voice,
            )
            # Write to disk cache for instantaneous future playback
            try:
                disk_file.write_bytes(res.audio_bytes)
            except Exception as e:
                logger.warning("Failed to write TTS disk cache: %s", e)

            # Cache successful synthesis in memory LRU
            self._tts_cache[cache_key] = res
            if len(self._tts_cache) > self._max_cache_size:
                self._tts_cache.popitem(last=False)  # Evict oldest entry
            return res
        except (NotImplementedError, TimeoutError):
            raise
        except Exception as exc:
            clean_err = sanitize_secrets(str(exc), self.settings.addis_api_key, self.settings.openai_api_key)
            raise RuntimeError(clean_err) from None
