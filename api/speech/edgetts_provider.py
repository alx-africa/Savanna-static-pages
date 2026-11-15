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


# Comprehensive dictionary of technical, educational, and job-board English terms
# mapped to canonical Ethiopian Amharic phonetic pronunciation
ENGLISH_TO_AMHARIC_PHONETICS: dict[str, str] = {
    # Acronyms & Short forms
    "ai": "ኤአይ",
    "api": "ኤፒአይ",
    "ui": "ዩአይ",
    "ux": "ዩኤክስ",
    "it": "አይቲ",
    "hr": "ኤችአር",
    "qa": "ኪውኤ",
    "pr": "ፒአር",
    "ceo": "ሲኢኦ",
    "cto": "ሲቲኦ",
    "cfo": "ሲኤፍኦ",
    "url": "ዩአርኤል",
    "html": "ኤችቲኤምኤል",
    "css": "ሲኤስኤስ",
    "js": "ጄኤስ",
    "pdf": "ፒዲኤፍ",
    "lms": "ኤልኤምኤስ",
    "cv": "ሲቪ",
    "faq": "ኤፍኤኪው",
    "id": "አይዲ",
    "app": "አፕ",
    "apps": "አፕስ",
    "pc": "ፒሲ",
    "os": "ኦኤስ",
    "wcag": "ደብሊውሲኤጂ",

    # Professional Roles & Technical Concepts
    "virtual assistant": "ቨርቹዋል አሲስታንት",
    "virtual": "ቨርቹዋል",
    "assistant": "አሲስታንት",
    "software": "ሶፍትዌር",
    "hardware": "ሃርድዌር",
    "online": "ኦንላይን",
    "offline": "ኦፍላይን",
    "digital": "ዲጂታል",
    "internet": "ኢንተርኔት",
    "chat": "ቻት",
    "chatbot": "ቻትቦት",
    "chatgpt": "ቻት ጂፒቲ",
    "claude": "ክላውድ",
    "gemini": "ጄሚናይ",
    "email": "ኢሜይል",
    "computer": "ኮምፒውተር",
    "website": "ዌብሳይት",
    "web": "ዌብ",
    "remote": "ሪሞት",
    "data": "ዳታ",
    "cloud": "ክላውድ",
    "code": "ኮድ",
    "coding": "ኮዲንግ",
    "developer": "ዲቨሎፐር",
    "development": "ዲቨሎፕመንት",
    "engineer": "ኢንጅነር",
    "engineering": "ኢንጅነሪንግ",
    "manager": "ማናጀር",
    "management": "ማኔጅመንት",
    "specialist": "ስፔሻሊስት",
    "expert": "ኤክስፐርት",
    "consultant": "ኮንሰልታንት",
    "support": "ሰፖርት",
    "service": "ሰርቪስ",
    "services": "ሰርቪሶች",
    "senior": "ሲኒየር",
    "junior": "ጁኒየር",
    "full-time": "ፉል ታይም",
    "part-time": "ፓርት ታይም",
    "contract": "ኮንትራት",
    "freelance": "ፍሪላንስ",
    "internship": "ኢንተርንሺፕ",
    "login": "ሎጊን",
    "sign in": "ሳይን ኢን",
    "sign up": "ሳይን አፕ",
    "logout": "ሎግ አውት",
    "dashboard": "ዳሽቦርድ",
    "filter": "ፊልተር",
    "filters": "ፊልተሮች",
    "search": "ሰርች",
    "profile": "ፕሮፋይል",
    "settings": "ሴቲንግስ",
    "status": "ስታተስ",
    "role": "ሮል",
    "post": "ፖስት",
    "posted": "ፖስት የተደረገ",
    "jobs": "ጆብስ",
    "job": "ጆብ",
    "resume": "ሬዙሜ",
    "portfolio": "ፖርትፎሊዮ",
    "project": "ፕሮጀክት",
    "projects": "ፕሮጀክቶች",
    "task": "ታስክ",
    "tasks": "ታስኮች",
    "calendar": "ካላንደር",
    "slack": "ስላክ",
    "zoom": "ዙም",
    "notion": "ኖሽን",
    "google": "ጉግል",
    "microsoft": "ማይክሮሶፍት",
    "linkedin": "ሊንክድኢን",
    "facebook": "ፌስቡክ",
    "twitter": "ትዊተር",
    "instagram": "ኢንስታግራም",
    "canva": "ካንቫ",
    "workspace": "ዎርክስፔስ",
    "feedback": "ፊድባክ",
    "system": "ሲስተም",
    "systems": "ሲስተሞች",
    "network": "ኔትወርክ",
    "server": "ሰርቨር",
    "client": "ክላይንት",
    "clients": "ክላይንቶች",
    "link": "ሊንክ",
    "button": "በትን",
    "menu": "ሜኑ",
    "click": "ክሊክ",
    "tab": "ታብ",
    "course": "ኮርስ",
    "courses": "ኮርሶች",
    "module": "ሞጁል",
    "modules": "ሞጁሎች",
    "lesson": "ሌሰን",
    "lessons": "ሌሰኖች",
    "certificate": "ሰርተፊኬት",
    "level": "ሌቨል",
    "admin": "አድሚን",
    "office": "ኦፊስ",
    "call": "ኮል",
    "video": "ቪዲዮ",
    "audio": "ኦዲዮ",
    "phone": "ፎን",
    "python": "ፓይተን",
    "javascript": "ጃቫስክሪፕት",
    "react": "ሪአክት",
    "kubernetes": "ኩበርኔትስ",
    "microservices": "ማይክሮሰርቪሰስ"
}


def _prepare_natural_speech_utterance(text: str, lang: str, default_voice: str) -> tuple[str, str]:
    """
    Scalable, zero-delay speech preparation.
    Prevents engine switching pauses by naturally phonetizing English technical terms
    and acronyms inside Amharic sentences so they synthesize in one continuous, fluid stream.
    Pure English utterances route cleanly to en-US-JennyNeural.
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

    # Case 3: Mixed bilingual sentence (Amharic containing English words/acronyms/terms)
    # Phonetize English tokens into authentic Ethiopic syllables for continuous single-stream audio
    result = clean_text

    # 1. Multi-word phrases first
    for phrase, am_phonetic in sorted(ENGLISH_TO_AMHARIC_PHONETICS.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in phrase or "-" in phrase:
            pattern = re.compile(rf"\b{re.escape(phrase)}\b", re.IGNORECASE)
            result = pattern.sub(am_phonetic, result)

    # 2. Single-word matches & acronyms
    for word, am_phonetic in sorted(ENGLISH_TO_AMHARIC_PHONETICS.items(), key=lambda x: len(x[0]), reverse=True):
        if " " not in word and "-" not in word:
            pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
            result = pattern.sub(am_phonetic, result)

    # 3. Rule-based phoneme transliteration for any remaining unseen English words
    def _transliterate_unseen_word(m: re.Match[str]) -> str:
        w = m.group(0).lower()
        if w in ENGLISH_TO_AMHARIC_PHONETICS:
            return ENGLISH_TO_AMHARIC_PHONETICS[w]
        rules = [
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
        out = w
        for en_sub, am_sub in rules:
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
