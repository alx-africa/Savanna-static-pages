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

ENGLISH_VOICE = "en-US-JennyNeural"


def _normalize_speech_punctuation(text: str, lang: str) -> str:
    """
    Ensure natural speech rhythm, breathing pauses, and clause boundaries.
    
    Acoustic neural TTS engines (e.g. Edge-TTS am-ET-MekdesNeural) tokenize Western
    punctuation ('.', ',', ';', '?', '!') into acoustic pause and intonation tokens,
    but treat Ethiopic punctuation (።, ፣, ፤, ፧) as non-breaking glyphs, causing the
    AI to speak continuously in a run-on sentence without pausing.
    
    This function converts Ethiopic and non-breaking punctuation into acoustic cadence
    markers without altering the phonetic pronunciation:
      - '።' (Arat Neteb / Full stop) -> '. ' (400-500ms sentence drop & pause)
      - '፣' (Netela Neteb / Comma)   -> ', ' (200ms phrase pause)
      - '፤' (Dered Neteb / Semicolon)-> '; ' (300ms clause pause)
      - '፧' (Question Mark)          -> '? ' (interrogative intonation pause)
      - '፡' (Clause separator)       -> ': ' (when followed by space)
    """
    if lang in ("am", "ti"):
        # Map Ethiopic full stop to full stop + space
        t = re.sub(r"።\s*", ". ", text)
        # Map Ethiopic comma to comma + space
        t = re.sub(r"፣\s*", ", ", t)
        # Map Ethiopic semicolon to semicolon + space
        t = re.sub(r"፤\s*", "; ", t)
        # Map Ethiopic question mark to question mark + space
        t = re.sub(r"፧\s*", "? ", t)
        # Map Ethiopic word separator before space to colon + space
        t = re.sub(r"፡(?=\s+[A-Za-z\u1200-\u137F]|$)", ": ", t)
        # Clean up repeated punctuation
        t = re.sub(r"\.+", ".", t)
        t = re.sub(r",+", ",", t)
        t = re.sub(r";+", ";", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t
    return text


def _prepare_natural_speech_utterance(text: str, lang: str, default_voice: str) -> tuple[str, str]:
    """
    Scalable, zero-delay voice routing for Edge-TTS with natural punctuation cadence.
    
    1. Pure English utterances route cleanly to en-US-JennyNeural with native pronunciation.
    2. Amharic utterances route directly to am-ET-MekdesNeural with natural punctuation pauses.
    """
    clean_text = text.strip()
    if not clean_text:
        return "", default_voice

    if lang != "am":
        # For non-Amharic sessions, if pure Latin/English, route to English voice
        if lang in ("ar", "ti"):
            has_arabic = bool(re.search(r"[\u0600-\u06FF]", clean_text))
            has_ethiopic = bool(re.search(r"[\u1200-\u137F]", clean_text))
            has_latin = bool(re.search(r"[a-zA-Z]", clean_text))
            if has_latin and not has_arabic and not has_ethiopic:
                return clean_text, ENGLISH_VOICE
        return clean_text, default_voice

    has_ethiopic = bool(re.search(r"[\u1200-\u137F]", clean_text))
    has_latin = bool(re.search(r"[a-zA-Z]", clean_text))

    # Case 1: Pure Latin / English utterance -> speak with native English voice
    if has_latin and not has_ethiopic:
        return clean_text, ENGLISH_VOICE

    # Case 2: Ethiopic text -> normalize punctuation pauses and speak with Amharic voice
    clean_text = _normalize_speech_punctuation(clean_text, lang)
    return clean_text, default_voice


def _segment_bilingual_utterance(text: str, lang: str, default_voice: str) -> list[tuple[str, str]]:
    """
    Intelligent code-switching and bilingual routing for Edge-TTS:
    If a word or phrase is English (acronym, abbreviation, scientific name, tech term,
    or pure English sentence), route that specific segment to English native neural voice
    (en-US-JennyNeural), while narrating the native language portions with their authentic voice.
    """
    clean_text = text.strip()
    if not clean_text:
        return []

    if lang == "en":
        return [(clean_text, default_voice)]

    has_ethiopic = bool(re.search(r"[\u1200-\u137F]", clean_text))
    has_arabic = bool(re.search(r"[\u0600-\u06FF]", clean_text))
    has_latin = bool(re.search(r"[a-zA-Z]", clean_text))

    # Case 1: Pure Latin / English utterance in non-Latin script languages (am, ti, ar)
    if lang in ("am", "ti") and has_latin and not has_ethiopic:
        return [(clean_text, ENGLISH_VOICE)]
    if lang == "ar" and has_latin and not has_arabic:
        return [(clean_text, ENGLISH_VOICE)]

    # Case 2: Pattern for English tokens and phrases
    if lang in ("am", "ti", "ar"):
        # In Ethiopic or Arabic script, any sequence of Latin words/symbols is English
        en_pattern = re.compile(r"([A-Za-z0-9_#+.-]+(?:\s+[A-Za-z0-9_#+.-]+)*)")
    else:
        # In Latin-script languages (om, so, sw, fr):
        # Match uppercase acronyms (e.g. NASA, WHO, API, REST, SQL, AWS, AI, CPU, RAM, HTML, CSS),
        # dotted abbreviations, versions (COVID-19, IPv4, OAuth2), technical terms, and scientific names
        en_pattern = re.compile(
            r"("
            r"(?<![A-Za-z0-9])(?:COVID-19|IPv4|IPv6|OAuth2|W3C|WCAG|Web3)(?![A-Za-z0-9])"
            r"|\b[A-Z]{2,6}\b"
            r"|\b(?:[A-Z]\.){2,}\b"
            r"|(?i:\b(?:Machine\s+Learning|Artificial\s+Intelligence|Data\s+Science|Software\s+Engineer(?:ing)?|Full-?Stack|Cloud\s+Computing|Computer\s+Science|Virtual\s+Assistant|Deep\s+Learning|Cyber\s+Security|Front-?end|Back-?end|REST\s+API|Homo\s+sapiens|Panthera\s+leo|Escherichia\s+coli|Canis\s+lupus)\b)"
            r")"
        )

    segments: list[tuple[str, str]] = []
    last_idx = 0
    for m in en_pattern.finditer(clean_text):
        start, end = m.span()
        matched = m.group(1).strip()
        if not re.search(r"[a-zA-Z]", matched):
            continue
        # Avoid treating common native short words as English in Latin-script languages
        if lang in ("so", "sw", "om", "fr") and matched.lower() in (
            "iyo", "ama", "ee", "ku", "waa", "waxaa", "na", "ya", "wa", "kwa", "ni", "cha", "et", "ou", "de", "la", "le", "un", "une"
        ):
            continue

        if start > last_idx:
            prefix = clean_text[last_idx:start]
            if prefix.strip():
                clean_prefix = _normalize_speech_punctuation(prefix.strip(), lang) if lang in ("am", "ti") else prefix.strip()
                segments.append((clean_prefix, default_voice))

        segments.append((matched, ENGLISH_VOICE))
        last_idx = end

    if last_idx < len(clean_text):
        suffix = clean_text[last_idx:]
        if suffix.strip():
            clean_suffix = _normalize_speech_punctuation(suffix.strip(), lang) if lang in ("am", "ti") else suffix.strip()
            segments.append((clean_suffix, default_voice))

    if not segments:
        norm_text = _normalize_speech_punctuation(clean_text, lang) if lang in ("am", "ti") else clean_text
        return [(norm_text, default_voice)]

    # Merge adjacent segments with identical voice for efficient streaming
    merged: list[tuple[str, str]] = []
    for s_text, s_voice in segments:
        if merged and merged[-1][1] == s_voice:
            merged[-1] = (merged[-1][0] + " " + s_text, s_voice)
        else:
            merged.append((s_text, s_voice))
    return merged


class EdgeTTSProvider(BaseTTSProvider):
    """Neural voice synthesis via Microsoft Edge-TTS with bilingual English code-switching."""

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
        segments = _segment_bilingual_utterance(text, lang, default_voice)
        if not segments:
            raise ValueError("Cannot synthesize empty text.")

        try:
            # Case A: Single voice utterance (Pure native or pure English)
            if len(segments) == 1:
                seg_text, active_voice = segments[0]
                audio_buffer = await asyncio.wait_for(
                    self._stream_segment(seg_text, active_voice),
                    timeout=self.timeout
                )
            else:
                # Case B: Mixed code-switching utterance (Concurrent synthesis of native and English segments)
                tasks = [
                    asyncio.wait_for(self._stream_segment(s_text, s_voice), timeout=self.timeout)
                    for s_text, s_voice in segments
                ]
                buffers = await asyncio.gather(*tasks)
                audio_buffer = b"".join(buffers)
                active_voice = f"{default_voice}+{ENGLISH_VOICE}"

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
