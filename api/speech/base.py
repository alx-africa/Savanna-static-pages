"""
Base abstractions for replaceable Speech-to-Text (STT) and Text-to-Speech (TTS) providers.
Follows Savanna's provider-agnostic modular architecture.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class TranscribeResult:
    """Result of speech-to-text transcription."""
    text: str
    language: str
    confidence: float = 0.9
    duration_seconds: float = 0.0
    provider: str = ""


@dataclass
class TTSResult:
    """Result of text-to-speech audio synthesis."""
    audio_bytes: bytes
    media_type: str = "audio/mpeg"
    voice_name: str = ""
    language: str = ""
    provider: str = ""


class BaseSTTProvider(ABC):
    """Abstract interface for speech-to-text transcription providers."""

    @abstractmethod
    async def transcribe(
        self, audio_bytes: bytes, filename: str, language_hint: str = "auto"
    ) -> TranscribeResult:
        """Transcribe audio bytes into text with language identification."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if required API keys / runtime dependencies are present."""
        pass

    @abstractmethod
    def supported_languages(self) -> list[str]:
        """Return ISO-639-1 language codes supported by this provider."""
        pass


class BaseTTSProvider(ABC):
    """Abstract interface for text-to-speech synthesis providers."""

    @abstractmethod
    async def synthesize(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> TTSResult:
        """Synthesize text into audio bytes."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if required API keys / runtime dependencies are present."""
        pass

    @abstractmethod
    def get_voices(self) -> dict[str, list[dict[str, Any]]]:
        """Return catalog of available voices grouped by language."""
        pass
