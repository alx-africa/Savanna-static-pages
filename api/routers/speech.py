"""
Speech router — Speech-to-Text (STT) and Text-to-Speech (TTS)
Serving Ethiopian national languages (Amharic, Afaan Oromoo, Tigrinya, Somali)
and regional refugee languages (Arabic, Kiswahili, French, English).

Features:
  - POST /speech/transcribe: Spoken language identification (LID) and STT transcription via replaceable providers (Addis AI, Whisper, etc.).
  - POST /speech/synthesize: Natural speech synthesis with caching and explicit user consent.
  - GET  /speech/voices: Multi-lingual voice directory with active provider metadata.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response

from config import get_settings
from models import SynthesizeRequest, TranscribeResponse, VoiceInfo
from speech.service import SpeechService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/speech", tags=["Speech & Voice Accessibility"])
settings = get_settings()

# Initialize speech service with active settings
speech_service = SpeechService(settings=settings)


@router.get("/voices", response_model=dict[str, list[VoiceInfo]], summary="Get available TTS voices across supported languages")
async def list_voices() -> dict[str, list[VoiceInfo]]:
    """Return verified available neural voices categorized by language from the active TTS provider."""
    raw_voices = speech_service.get_voices()
    result: dict[str, list[VoiceInfo]] = {}
    for lang, voices in raw_voices.items():
        result[lang] = [
            VoiceInfo(
                id=v["id"],
                name=v["name"],
                language=lang,
                gender=v.get("gender", "neutral"),
                locale=v.get("locale", lang),
                provider=v.get("provider", "unknown"),
            )
            for v in voices
        ]
    return result


@router.post("/synthesize", summary="Synthesize natural speech from text across supported languages")
async def synthesize_speech(body: SynthesizeRequest):
    """
    Synthesize text into speech audio.
    Supports languages with verified voices from the active provider.
    Returns 501 Not Implemented if speech synthesis is unavailable for the requested language.
    """
    lang = body.language.lower()
    try:
        res = await speech_service.synthesize(
            text=body.text,
            language=lang,
            voice=body.voice,
        )
        return Response(
            content=res.audio_bytes,
            media_type=res.media_type,
            headers={
                "Content-Disposition": f'inline; filename="savanna_{lang}.mp3"',
                "X-Savanna-Voice": res.voice_name,
                "X-Savanna-Language": lang,
                "X-Savanna-Provider": res.provider,
                "Cache-Control": "public, max-age=86400",  # Cache audio for efficiency
            },
        )
    except NotImplementedError as exc:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail={
                "error": "voice_synthesis_unavailable",
                "language": lang,
                "message": str(exc),
                "supported_languages": list(speech_service.get_voices().keys()),
            },
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": "tts_timeout",
                "message": f"Voice synthesis timed out: {exc}",
            },
        )
    except Exception as exc:
        logger.warning("Voice synthesis error (%s): %s", lang, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "tts_synthesis_failed",
                "message": str(exc),
            },
        )


@router.post("/transcribe", response_model=TranscribeResponse, summary="Transcribe audio speech to text with language detection")
async def transcribe_speech(
    file: UploadFile = File(..., description="Audio file (webm, wav, ogg, mp3) from client microphone"),
    language: Optional[str] = Form("auto", description="Spoken language hint or 'auto' for zero-shot LID"),
) -> TranscribeResponse:
    """
    Transcribe speech audio into text using the configured ASR provider (Addis AI, Whisper, etc.).
    Returns 503 Service Unavailable when no genuine speech-to-text provider is configured or reachable.
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

    try:
        res = await speech_service.transcribe(
            audio_bytes=contents,
            filename=file.filename or "recording.webm",
            language_hint=lang_hint,
        )
        return TranscribeResponse(
            text=res.text,
            language=res.language,
            confidence=res.confidence,
            duration_seconds=res.duration_seconds,
            provider=res.provider,
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": "transcription_timeout",
                "message": f"Speech transcription timed out: {exc}",
            },
        )
    except Exception as exc:
        logger.warning("Speech transcription error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "speech_transcription_unavailable",
                "message": str(exc),
                "language_hint": lang_hint,
            },
        )
