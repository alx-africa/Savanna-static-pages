"""
Microsoft Edge-TTS Text-to-Speech provider implementation.
Provides verified neural voice synthesis across supported languages.
"""
from __future__ import annotations

import asyncio
import logging
import re
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


def _segment_bilingual_utterance(text: str, lang: str, default_voice: str) -> list[tuple[str, str]]:
    """
    Intelligently segment code-switched bilingual utterances.
    Prevents Edge-TTS from reading English/Latin words using Amharic/Ethiopic phonetics.
    Each segment is paired with its native voice for seamless parallel synthesis.
    """
    clean_text = text.strip()
    if not clean_text:
        return []
    if lang != "am":
        return [(clean_text, default_voice)]

    has_ethiopic = bool(re.search(r"[\u1200-\u137F]", clean_text))
    has_latin = bool(re.search(r"[a-zA-Z]", clean_text))

    # Case 1: Pure Latin / English words in an Amharic session -> speak with native English voice
    if has_latin and not has_ethiopic:
        return [(clean_text, "en-US-JennyNeural")]

    # Case 2: Pure Ethiopic text -> speak with Amharic voice
    if not (has_latin and has_ethiopic):
        return [(clean_text, default_voice)]

    # Case 3: Mixed bilingual text -> split into English clusters vs Ethiopic clusters
    tokens = re.split(r"([A-Za-z0-9\+\#\.\-]+(?:\s+[A-Za-z0-9\+\#\.\-]+)*)", clean_text)
    raw_segments: list[tuple[str, str]] = []
    for token in tokens:
        if not token:
            continue
        if re.search(r"[a-zA-Z]", token) and not re.search(r"[\u1200-\u137F]", token):
            raw_segments.append((token.strip(), "en-US-JennyNeural"))
        else:
            t = token.strip()
            if t:
                raw_segments.append((t, default_voice))

    # Merge adjacent segments sharing the same voice
    merged: list[tuple[str, str]] = []
    for seg_text, seg_voice in raw_segments:
        if not seg_text:
            continue
        if merged and merged[-1][1] == seg_voice:
            merged[-1] = (merged[-1][0] + " " + seg_text, seg_voice)
        else:
            merged.append((seg_text, seg_voice))
    return merged


class EdgeTTSProvider(BaseTTSProvider):
    """Neural voice synthesis via Microsoft Edge-TTS."""

    def __init__(self):
        # 25.0s timeout ensures long curriculum paragraphs and detailed multimodal
        # visual descriptions synthesize reliably without premature termination
        self.timeout = 25.0

    def is_configured(self) -> bool:
        return HAS_EDGE_TTS

    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        return EDGE_VOICE_CATALOG

    async def _stream_segment(self, segment_text: str, voice: str) -> bytes:
        """Stream a single text segment through Edge-TTS into MP3 bytes."""
        communicate = edge_tts.Communicate(text=segment_text, voice=voice)
        buf = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.extend(chunk["data"])
        return bytes(buf)

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

        default_voice = voice or _DEFAULT_EDGE_VOICES[lang]
        segments = _segment_bilingual_utterance(text, lang, default_voice)
        if not segments:
            raise ValueError("Cannot synthesize empty text.")

        async def _synthesize_all() -> bytes:
            if len(segments) == 1:
                seg_text, seg_voice = segments[0]
                return await self._stream_segment(seg_text, seg_voice)

            # Concurrent synthesis of code-switched bilingual segments
            try:
                tasks = [self._stream_segment(s_txt, s_vc) for s_txt, s_vc in segments]
                chunk_list = await asyncio.gather(*tasks)
                return b"".join(chunk_list)
            except Exception as exc:
                logger.warning("Segmented synthesis failed, falling back to unified voice: %s", exc)
                return await self._stream_segment(text.strip(), default_voice)

        try:
            audio_buffer = await asyncio.wait_for(_synthesize_all(), timeout=self.timeout)
            if not audio_buffer:
                raise RuntimeError("Edge-TTS produced no audio frames.")

            return TTSResult(
                audio_bytes=audio_buffer,
                media_type="audio/mpeg",
                voice_name=default_voice,
                language=lang,
                provider="edge-tts",
            )
        except asyncio.TimeoutError as exc:
            raise TimeoutError("Edge-TTS synthesis timed out.") from exc
        except Exception as exc:
            raise RuntimeError(f"Edge-TTS synthesis failed: {exc}") from exc
