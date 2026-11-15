"""
Microsoft Edge-TTS Text-to-Speech provider implementation.
Provides verified neural voice synthesis across supported languages.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from speech.base import BaseTTSProvider, TTSResult

logger = logging.getLogger(__name__)

try:
    import edge_tts  # type: ignore
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

EDGE_VOICE_CATALOG: dict[str, list[dict[str, Any]]] = {
    "en": [
        {"id": "en-US-JennyNeural", "name": "Jenny (Neural)", "gender": "female", "locale": "en-US", "provider": "edge-tts"},
        {"id": "en-US-GuyNeural", "name": "Guy (Neural)", "gender": "male", "locale": "en-US", "provider": "edge-tts"},
    ],
    "am": [
        {"id": "am-ET-MekdesNeural", "name": "መቅደስ Mekdes (Neural)", "gender": "female", "locale": "am-ET", "provider": "edge-tts"},
        {"id": "am-ET-AmehaNeural", "name": "አሜሃ Ameha (Neural)", "gender": "male", "locale": "am-ET", "provider": "edge-tts"},
    ],
    "so": [
        {"id": "so-SO-UbaxNeural", "name": "Ubax (Neural)", "gender": "female", "locale": "so-SO", "provider": "edge-tts"},
        {"id": "so-SO-MuuseNeural", "name": "Muuse (Neural)", "gender": "male", "locale": "so-SO", "provider": "edge-tts"},
    ],
    "ar": [
        {"id": "ar-SA-ZariyahNeural", "name": "زارية Zariyah (Neural)", "gender": "female", "locale": "ar-SA", "provider": "edge-tts"},
        {"id": "ar-SA-HamedNeural", "name": "حامد Hamed (Neural)", "gender": "male", "locale": "ar-SA", "provider": "edge-tts"},
    ],
    "sw": [
        {"id": "sw-TZ-DaudiNeural", "name": "Daudi (Neural)", "gender": "male", "locale": "sw-TZ", "provider": "edge-tts"},
    ],
    "fr": [
        {"id": "fr-FR-DeniseNeural", "name": "Denise (Neural)", "gender": "female", "locale": "fr-FR", "provider": "edge-tts"},
        {"id": "fr-FR-HenriNeural", "name": "Henri (Neural)", "gender": "male", "locale": "fr-FR", "provider": "edge-tts"},
    ],
}

_DEFAULT_EDGE_VOICES: dict[str, str] = {
    "en": "en-US-JennyNeural",
    "am": "am-ET-MekdesNeural",
    "so": "so-SO-UbaxNeural",
    "ar": "ar-SA-ZariyahNeural",
    "sw": "sw-TZ-DaudiNeural",
    "fr": "fr-FR-DeniseNeural",
}


class EdgeTTSProvider(BaseTTSProvider):
    """Neural voice synthesis via Microsoft Edge-TTS."""

    def __init__(self):
        self.timeout = 5.0

    def is_configured(self) -> bool:
        return HAS_EDGE_TTS

    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        return EDGE_VOICE_CATALOG

    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        if not HAS_EDGE_TTS:
            raise RuntimeError("edge-tts library is not installed in the environment.")

        lang = language.lower()
        if lang not in _DEFAULT_EDGE_VOICES:
            raise NotImplementedError(
                f"Voice synthesis is not currently available for '{lang}'. Genuine neural voices are not available."
            )

        voice_name = voice or _DEFAULT_EDGE_VOICES[lang]

        async def _stream():
            communicate = edge_tts.Communicate(text=text, voice=voice_name)
            buf = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.extend(chunk["data"])
            return buf

        try:
            audio_buffer = await asyncio.wait_for(_stream(), timeout=self.timeout)
            if not audio_buffer:
                raise RuntimeError("Edge-TTS produced no audio frames.")

            return TTSResult(
                audio_bytes=bytes(audio_buffer),
                media_type="audio/mpeg",
                voice_name=voice_name,
                language=lang,
                provider="edge-tts",
            )
        except asyncio.TimeoutError as exc:
            raise TimeoutError("Edge-TTS synthesis timed out.") from exc
        except Exception as exc:
            raise RuntimeError(f"Edge-TTS synthesis failed: {exc}") from exc
