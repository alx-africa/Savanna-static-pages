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


# Standard 26-letter Latin Alphabet Grapheme Names in Ethiopic phonetics (Alphabet G2P).
# This is an algorithmic phonetic table (A-Z), NOT a dictionary of words.
LATIN_LETTER_PHONETICS: dict[str, str] = {
    "A": "ኤ", "B": "ቢ", "C": "ሲ", "D": "ዲ", "E": "ኢ", "F": "ኤፍ",
    "G": "ጂ", "H": "ኤች", "I": "አይ", "J": "ጄ", "K": "ኬ", "L": "ኤል",
    "M": "ኤም", "N": "ኤን", "O": "ኦ", "P": "ፒ", "Q": "ኪው", "R": "አር",
    "S": "ኤስ", "T": "ቲ", "U": "ዩ", "V": "ቪ", "W": "ደብሊው", "X": "ኤክስ",
    "Y": "ዋይ", "Z": "ዜድ"
}

# Algorithmic English phoneme-to-syllable rewrite rules for arbitrary unseen words
PHONEME_SYLLABLE_RULES: list[tuple[str, str]] = [
    ("tion", "ሽን"), ("sion", "ሽን"), ("ment", "መንት"), ("ing", "ኢንግ"),
    ("ch", "ች"), ("sh", "ሽ"), ("th", "ስ"), ("ph", "ፍ"), ("wh", "ው"),
    ("qu", "ክው"), ("ck", "ክ"), ("ee", "ኢ"), ("ea", "ኢ"), ("oo", "ኡ"),
    ("ou", "አው"), ("ai", "ኤ"), ("ay", "ኤ"), ("b", "ብ"), ("c", "ክ"),
    ("d", "ድ"), ("f", "ፍ"), ("g", "ግ"), ("h", "ህ"), ("j", "ጅ"),
    ("k", "ክ"), ("l", "ል"), ("m", "ም"), ("n", "ን"), ("p", "ፕ"),
    ("r", "ር"), ("s", "ስ"), ("t", "ት"), ("v", "ቭ"), ("w", "ው"),
    ("x", "ክስ"), ("y", "ይ"), ("z", "ዝ"), ("a", "አ"), ("e", "ኤ"),
    ("i", "ኢ"), ("o", "ኦ"), ("u", "ኡ")
]


def _prepare_natural_speech_utterance(text: str, lang: str, default_voice: str) -> tuple[str, str]:
    """
    Scalable, zero-delay speech preparation without hardcoded word dictionaries.
    
    1. Pure English utterances route cleanly to en-US-JennyNeural with native pronunciation.
    2. Pure Amharic utterances route directly to am-ET-MekdesNeural.
    3. Mixed bilingual utterances (Ethiopic text containing embedded English words or acronyms):
       - All-caps acronyms (AI, API, URL, HTML, etc.) are algorithmically expanded via 26-letter G2P.
       - Arbitrary English words are algorithmically mapped via phonological syllable rules.
       - Synthesizes in a single continuous stream with Mekdes to eliminate audio-gap delays.
    """
    clean_text = text.strip()
    if not clean_text:
        return "", default_voice

    if lang != "am":
        return clean_text, default_voice

    has_ethiopic = bool(re.search(r"[\u1200-\u137F]", clean_text))
    has_latin = bool(re.search(r"[a-zA-Z]", clean_text))

    # Case 1: Pure Latin / English utterance -> speak with native English voice
    if has_latin and not has_ethiopic:
        return clean_text, "en-US-JennyNeural"

    # Case 2: Pure Ethiopic utterance -> speak directly with Amharic voice
    if not has_latin:
        return clean_text, default_voice

    # Case 3: Mixed bilingual sentence (Ethiopic containing untranslated Latin words/acronyms)
    # 1. Expand all-caps acronyms (e.g. AI -> ኤአይ, API -> ኤፒአይ, HTML -> ኤችቲኤምኤል)
    def _expand_acronym(m: re.Match[str]) -> str:
        token = m.group(0)
        return "".join(LATIN_LETTER_PHONETICS.get(char, char) for char in token)

    result = re.sub(r"\b[A-Z]{2,6}\b", _expand_acronym, clean_text)

    # 2. Algorithmic phoneme transliteration for arbitrary unseen Latin words
    def _transliterate_unseen_word(m: re.Match[str]) -> str:
        w = m.group(0).lower()
        out = w
        for en_sub, am_sub in PHONEME_SYLLABLE_RULES:
            out = out.replace(en_sub, am_sub)
        return out

    result = re.sub(r"[a-zA-Z]+", _transliterate_unseen_word, result)
    return result, default_voice


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
        """Stream a text segment through Edge-TTS into MP3 bytes."""
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
        synth_text, active_voice = _prepare_natural_speech_utterance(text, lang, default_voice)
        if not synth_text:
            raise ValueError("Cannot synthesize empty text.")

        try:
            audio_buffer = await asyncio.wait_for(
                self._stream_segment(synth_text, active_voice),
                timeout=self.timeout
            )
            if not audio_buffer:
                raise RuntimeError("Edge-TTS produced no audio frames.")

            return TTSResult(
                audio_bytes=audio_buffer,
                media_type="audio/mpeg",
                voice_name=active_voice,
                language=lang,
                provider="edge-tts",
            )
        except asyncio.TimeoutError as exc:
            raise TimeoutError("Edge-TTS synthesis timed out.") from exc
        except Exception as exc:
            raise RuntimeError(f"Edge-TTS synthesis failed: {exc}") from exc
