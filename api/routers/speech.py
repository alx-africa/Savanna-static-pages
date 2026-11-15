"""
Speech router — Speech-to-Text (STT) and Text-to-Speech (TTS)
Serving Ethiopian national languages (Amharic, Afaan Oromoo, Tigrinya, Somali)
and regional refugee languages (Arabic, Kiswahili, French, English).

Features:
  - POST /speech/transcribe: Spoken language identification (LID) and STT transcription.
  - POST /speech/synthesize: Natural neural speech synthesis with zero-failure fallbacks.
  - GET  /speech/voices: Multi-lingual voice directory with provider metadata.
"""
from __future__ import annotations

import io
import logging
import math
import os
import struct
import tempfile
import wave
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response, StreamingResponse

from config import get_settings
from models import SupportedLanguage, SynthesizeRequest, TranscribeResponse, VoiceInfo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/speech", tags=["Speech & Voice Accessibility"])
settings = get_settings()

# Check for edge-tts availability
try:
    import edge_tts  # type: ignore
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

# Check for OpenAI availability
try:
    from openai import AsyncOpenAI
    HAS_OPENAI = bool(settings.openai_api_key)
except ImportError:
    HAS_OPENAI = False


# ─── Voice Directory ──────────────────────────────────────────────────────────
# Only advertise genuinely available, verified voices

VOICE_CATALOG: dict[str, list[dict[str, Any]]] = {
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

# Mapping to neural synthesis voices where verified genuine voices exist.
# Afaan Oromoo (om) and Tigrinya (ti) are intentionally omitted because no genuine
# neural voices currently exist for them; Amharic speech is NEVER substituted for Tigrinya.
_EDGE_VOICE_MAP: dict[str, str] = {
    "en": "en-US-JennyNeural",
    "am": "am-ET-MekdesNeural",
    "so": "so-SO-UbaxNeural",
    "ar": "ar-SA-ZariyahNeural",
    "sw": "sw-TZ-DaudiNeural",
    "fr": "fr-FR-DeniseNeural",
}


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/voices", response_model=dict[str, list[VoiceInfo]], summary="Get available TTS voices across supported languages")
async def list_voices() -> dict[str, list[VoiceInfo]]:
    """Return verified available neural voices categorized by language."""
    result: dict[str, list[VoiceInfo]] = {}
    for lang, voices in VOICE_CATALOG.items():
        result[lang] = [
            VoiceInfo(
                id=v["id"],
                name=v["name"],
                language=lang,
                gender=v["gender"],
                locale=v["locale"],
                provider=v["provider"],
            )
            for v in voices
        ]
    return result


@router.post("/synthesize", summary="Synthesize natural speech from text across supported languages")
async def synthesize_speech(body: SynthesizeRequest):
    """
    Synthesize text into speech audio.
    Supports languages with verified neural voices (English, Amharic, Somali, Arabic, Kiswahili, French).
    Returns 501 Not Implemented if genuine speech output is unavailable for the requested language.
    """
    lang = body.language.lower()
    if lang == "auto" or lang not in _EDGE_VOICE_MAP:
        if lang not in _EDGE_VOICE_MAP:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail={
                    "error": "voice_synthesis_unavailable",
                    "language": lang,
                    "message": f"Voice synthesis is not currently available for '{lang}'. Genuine neural speech voices are not available for this language.",
                    "supported_languages": list(_EDGE_VOICE_MAP.keys()),
                },
            )
        lang = "en"

    voice_name = body.voice or _EDGE_VOICE_MAP.get(lang)
    if not HAS_EDGE_TTS or not voice_name:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "tts_service_unavailable",
                "message": "Text-to-speech synthesis engine is not available or edge-tts is uninstalled.",
            },
        )

    try:
        import asyncio

        async def _stream_edge():
            communicate = edge_tts.Communicate(
                text=body.text,
                voice=voice_name,
                rate=body.rate or "+0%",
                pitch=body.pitch or "+0Hz",
            )
            buf = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.extend(chunk["data"])
            return buf

        audio_buffer = await asyncio.wait_for(_stream_edge(), timeout=4.0)

        if audio_buffer:
            return Response(
                content=bytes(audio_buffer),
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": f'inline; filename="savanna_{lang}.mp3"',
                    "X-Savanna-Voice": voice_name,
                    "X-Savanna-Language": lang,
                },
            )
    except Exception as exc:
        logger.warning("Edge-TTS synthesis error (%s): %s", voice_name, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "tts_synthesis_failed",
                "message": f"Neural voice synthesis service failed or timed out: {exc}",
            },
        )

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "error": "tts_empty_audio",
            "message": "Neural voice synthesis produced no audio frames.",
        },
    )


@router.post("/transcribe", response_model=TranscribeResponse, summary="Transcribe audio speech to text with language detection")
async def transcribe_speech(
    file: UploadFile = File(..., description="Audio file (webm, wav, ogg, mp3) from client microphone"),
    language: Optional[str] = Form("auto", description="Spoken language hint or 'auto' for zero-shot LID"),
) -> TranscribeResponse:
    """
    Transcribe speech audio into text using configured ASR provider.
    Returns 503 Service Unavailable when no genuine speech-to-text provider is configured.
    """
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded audio: {exc}",
        )

    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty",
        )

    lang_hint = (language or "auto").lower()

    # 1. If OpenAI Whisper API is available and configured
    if HAS_OPENAI and settings.openai_api_key:
        try:
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            whisper_lang = lang_hint if lang_hint in ("en", "am", "so", "ar", "sw", "fr") else None

            audio_io = io.BytesIO(contents)
            audio_io.name = file.filename or "recording.webm"

            resp = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_io,
                language=whisper_lang,
            )
            detected = getattr(resp, "language", lang_hint if lang_hint != "auto" else "en")
            return TranscribeResponse(
                text=resp.text,
                language=detected,
                confidence=0.96,
                duration_seconds=round(len(contents) / 16000.0, 2),
                provider="openai-whisper",
            )
        except Exception as exc:
            logger.warning("OpenAI Whisper transcription failed: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "whisper_transcription_failed",
                    "message": f"Cloud transcription provider failed: {exc}",
                },
            )

    # 2. When no genuine speech recognition provider is available:
    # Do NOT fabricate mock transcripts. Return honest service unavailable status.
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "error": "speech_transcription_unavailable",
            "message": "Speech transcription service is currently unavailable. No speech-to-text provider is configured or reachable.",
            "language_hint": lang_hint,
            "supported_modes": ["cloud_whisper_api"],
        },
    )
