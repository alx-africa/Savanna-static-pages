"""
Addis AI Speech Provider implementation.
Integrates with Addis AI Scribe STT and Addis AI Voices TTS.
Official docs:
  - https://docs.addisassistant.com/docs/capabilities/speech-to-text
  - https://docs.addisassistant.com/docs/capabilities/text-to-speech/streaming
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Optional

import httpx

from speech.base import BaseSTTProvider, BaseTTSProvider, TranscribeResult, TTSResult

logger = logging.getLogger(__name__)

# Supported languages in Addis Scribe
ADDIS_STT_LANGUAGES = ["am", "om", "ti", "en", "sw", "so", "auto"]

# Supported Addis AI neural voices by language
ADDIS_VOICE_CATALOG: dict[str, list[dict[str, Any]]] = {
    "am": [
        {"id": "am-hamen", "name": "ሐመና Hamena (Addis Neural)", "gender": "female", "locale": "am-ET", "provider": "addisai"},
        {"id": "am-alemu", "name": "ዓለሙ Alemu (Addis Neural)", "gender": "male", "locale": "am-ET", "provider": "addisai"},
    ],
    "om": [
        {"id": "om-bikila", "name": "Bikila (Addis Neural)", "gender": "male", "locale": "om-ET", "provider": "addisai"},
        {"id": "om-chaltu", "name": "Chaltu (Addis Neural)", "gender": "female", "locale": "om-ET", "provider": "addisai"},
    ],
    "ti": [
        {"id": "ti-selam", "name": "ሰላም Selam (Addis Neural)", "gender": "female", "locale": "ti-ET", "provider": "addisai"},
    ],
    "en": [
        {"id": "en-lucy", "name": "Lucy (Addis Neural)", "gender": "female", "locale": "en-US", "provider": "addisai"},
    ],
}


def _mask_key(key: str) -> str:
    """Mask sensitive API key for safe logging."""
    if not key or len(key) < 8:
        return "***"
    return f"{key[:4]}...{key[-3:]}"


class AddisAISTTProvider(BaseSTTProvider):
    """Hosted Speech-to-Text via Addis AI Scribe API."""

    def __init__(self, api_key: str, base_url: str = "https://api.addisassistant.com"):
        self.api_key = api_key.strip() if api_key else ""
        self.base_url = base_url.rstrip("/")
        self.timeout = 15.0

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def supported_languages(self) -> list[str]:
        return ["am", "om", "ti", "en", "sw", "so"]

    async def transcribe(
        self, audio_bytes: bytes, filename: str, language_hint: str = "auto"
    ) -> TranscribeResult:
        if not self.is_configured():
            raise RuntimeError("Addis AI API key is not configured. Set ADDIS_API_KEY in environment.")

        lang = language_hint.lower() if language_hint else "auto"
        request_id = f"savanna-{uuid.uuid4().hex[:12]}"
        endpoint = f"{self.base_url}/api/v1/scribe/transcribe"

        params = {
            "backend": "turbo",
            "request_id": request_id,
        }
        if lang != "auto":
            params["language"] = lang

        headers = {
            "x-api-key": self.api_key,
            "User-Agent": "Savanna-Learning-Platform/1.0",
        }

        # Infer mime-type from filename
        mime = "audio/webm"
        fn = filename or "recording.webm"
        if fn.endswith(".wav"):
            mime = "audio/wav"
        elif fn.endswith(".mp3"):
            mime = "audio/mpeg"
        elif fn.endswith(".ogg"):
            mime = "audio/ogg"

        files = {
            "audio": (fn, audio_bytes, mime)
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, params=params, headers=headers, files=files)

            if resp.status_code == 401 or resp.status_code == 403:
                logger.error("Addis AI authentication failed (key: %s)", _mask_key(self.api_key))
                raise RuntimeError("Addis AI authentication failed. Invalid API key.")

            if resp.status_code == 429:
                logger.warning("Addis AI rate limit exceeded.")
                raise RuntimeError("Addis AI rate limit exceeded. Please wait a moment and try again.")

            if resp.status_code >= 500:
                logger.error("Addis AI server error: %s", resp.status_code)
                raise RuntimeError(f"Addis AI transcription service error (HTTP {resp.status_code}).")

            resp.raise_for_status()
            data = resp.json()

            # Addis AI returns text or transcription field
            text = (
                data.get("text")
                or data.get("transcription")
                or (data.get("data") and data["data"].get("text"))
                or ""
            ).strip()

            detected_lang = (
                data.get("language")
                or data.get("detected_language")
                or (lang if lang != "auto" else "am")
            )

            confidence = float(data.get("confidence", 0.95))
            duration = float(data.get("duration", round(len(audio_bytes) / 16000.0, 2)))

            return TranscribeResult(
                text=text,
                language=detected_lang,
                confidence=confidence,
                duration_seconds=duration,
                provider="addisai",
            )

        except (httpx.TimeoutException, asyncio.TimeoutError) as exc:
            logger.warning("Addis AI transcription timed out after %ss", self.timeout)
            raise TimeoutError("Addis AI transcription service timed out.") from exc
        except httpx.RequestError as exc:
            logger.error("Addis AI connection error: %s", exc)
            raise RuntimeError(f"Failed to connect to Addis AI transcription service: {exc}") from exc


class AddisAITTSProvider(BaseTTSProvider):
    """Text-to-Speech via Addis AI Voices API."""

    def __init__(self, api_key: str, base_url: str = "https://api.addisassistant.com"):
        self.api_key = api_key.strip() if api_key else ""
        self.base_url = base_url.rstrip("/")
        self.timeout = 10.0

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        return ADDIS_VOICE_CATALOG

    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        if not self.is_configured():
            raise RuntimeError("Addis AI API key is not configured. Set ADDIS_API_KEY in environment.")

        lang = language.lower()
        if lang not in ADDIS_VOICE_CATALOG:
            raise NotImplementedError(f"Addis AI does not have a registered voice for language '{lang}'.")

        voice_id = voice or ADDIS_VOICE_CATALOG[lang][0]["id"]
        endpoint = f"{self.base_url}/api/v1/voice/generations/stream"

        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "Savanna-Learning-Platform/1.0",
        }
        payload = {
            "text": text,
            "voice": voice_id,
            "language": lang,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, headers=headers, json=payload)

            if resp.status_code == 401 or resp.status_code == 403:
                raise RuntimeError("Addis AI TTS authentication failed. Invalid API key.")

            resp.raise_for_status()
            audio_bytes = resp.content

            if not audio_bytes or len(audio_bytes) < 100:
                raise RuntimeError("Addis AI TTS returned empty audio stream.")

            return TTSResult(
                audio_bytes=audio_bytes,
                media_type="audio/mpeg",
                voice_name=voice_id,
                language=lang,
                provider="addisai",
            )
        except (httpx.TimeoutException, asyncio.TimeoutError) as exc:
            raise TimeoutError("Addis AI voice synthesis timed out.") from exc
        except httpx.RequestError as exc:
            raise RuntimeError(f"Addis AI voice synthesis network error: {exc}") from exc
