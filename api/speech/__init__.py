"""
Savanna Multilingual Speech Module (STT and TTS).
"""
from speech.addis_provider import AddisAISTTProvider, AddisAITTSProvider
from speech.base import BaseSTTProvider, BaseTTSProvider, TranscribeResult, TTSResult
from speech.edgetts_provider import EdgeTTSProvider
from speech.offline_provider import OfflineSTTProvider, OfflineTTSProvider
from speech.service import SpeechService, sanitize_secrets
from speech.whisper_provider import WhisperSTTProvider

__all__ = [
    "BaseSTTProvider",
    "BaseTTSProvider",
    "TranscribeResult",
    "TTSResult",
    "AddisAISTTProvider",
    "AddisAITTSProvider",
    "WhisperSTTProvider",
    "EdgeTTSProvider",
    "OfflineSTTProvider",
    "OfflineTTSProvider",
    "SpeechService",
    "sanitize_secrets",
]
