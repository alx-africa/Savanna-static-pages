"""Offline FAQ fallback provider — no network required."""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

from ai.provider import AIProvider
from models import ChatMessage, Citation

if TYPE_CHECKING:
    from config import Settings

logger = logging.getLogger(__name__)

_OFFLINE_NOTES: dict[str, str] = {
    "en": "⚠️ Offline mode — answers from FAQ only.",
    "am": "⚠️ ከመስመር ውጭ ሁነታ — መልሶች ከFAQ ብቻ ናቸው።",
    "om": "⚠️ Haala toora alaa (Offline) — deebiin FAQ qofa irraa.",
    "ti": "⚠️ ካብ መስመር ወጻኢ — መልስታት ካብ FAQ ጥራይ እዮም።",
    "so": "⚠️ Qaabka khadka ka baxsan — jawaabaha FAQ kaliya.",
    "ar": "⚠️ وضع عدم الاتصال — الإجابات من الأسئلة الشائعة فقط.",
    "sw": "⚠️ Hali ya nje ya mtandao — majibu kutoka FAQ pekee.",
    "fr": "⚠️ Mode hors ligne — réponses issues de la FAQ uniquement.",
}

_MODE_PREFIXES: dict[str, str] = {
    "en": "💡 [Simple Mode — Plain Language]\n\n",
    "am": "💡 [ቀላል ሁነታ — አጭር ማብራሪያ]\n\n",
    "om": "💡 [Haala Salphaa — Ibsa Gabaabaa]\n\n",
    "ti": "💡 [ቀሊል ሁነታ — ሓጺር መብርሂ]\n\n",
    "so": "💡 [Qaab Fudud — Sharaxaad Kooban]\n\n",
    "ar": "💡 [الوضع المبسط — لغة واضحة]\n\n",
    "sw": "💡 [Hali Rahisi — Lugha Rahisi]\n\n",
    "fr": "💡 [Mode Simple — Langage Clair]\n\n",
}

_FALLBACK_TEXTS: dict[str, str] = {
    "en": "I don't have specific information about that in offline mode. Please try again when you're connected to the internet.",
    "am": "በመስመር ውጭ ሁነታ ስለዚህ የተለየ መረጃ የለኝም። እባክዎ ከኢንተርኔት ጋር ሲገናኙ እንደገና ይሞክሩ።",
    "om": "Haala toora alaa keessatti odeeffannoo kana hin qabu. Maaloo yeroo intarneetii qabdutti irra deebi'aa yaalaa.",
    "ti": "ኣብዚ ካብ መስመር ወጻኢ ኩነታት ብዛዕባዚ ፍሉይ ሓበሬታ የብለይን። ምስ ኢንተርነት ምስ ተራኸብኩም ደጊምኩም ፈትኑ።",
    "so": "Xog gaar ah kuma hayo qaabka khadka ka baxsan. Fadlan isku day markaad internetka ku xiranto.",
    "ar": "ليس لدي معلومات محددة حول ذلك في وضع عدم الاتصال. يرجى المحاولة مرة أخرى عند الاتصال بالإنترنت.",
    "sw": "Sina maelezo mahususi kuhusu hilo katika hali ya nje ya mtandao. Tafadhali jaribu tena ukiwa umeunganishwa.",
    "fr": "Je n'ai pas d'informations spécifiques à ce sujet en mode hors ligne. Veuillez réessayer lorsque vous serez connecté à Internet.",
}

_FAQ_SEARCH_PATHS = [
    "/app/docs/offline_faq.json",
    os.path.join(os.path.dirname(__file__), "..", "..", "docs", "offline_faq.json"),
    os.path.join(os.path.dirname(__file__), "..", "docs", "offline_faq.json"),
]

_DEFAULT_FAQ: list[dict] = [
    {
        "question": "What is Savanna? ሳቫና ምንድን ነው? Savanna maali? ሳቫና እንታይ እዩ? ما هي سافانا؟ Savanna ni nini? Qu'est-ce que Savanna?",
        "answer": "Savanna is an inclusive learning platform supporting 3,000 Digital Bridge learners in Amharic, Afaan Oromo, Tigrinya, Somali, Arabic, Swahili, French, and English.",
        "source": "offline_faq",
    },
    {
        "question": "What languages are supported? የሚደገፉ ቋንቋዎች? Afaan kamtu deeggarama? ቋንቋታት? ما هي اللغات المدعومة؟ Lugha gani zinatumika? Quelles langues sont prises en charge?",
        "answer": "Savanna natively supports 8 languages: Amharic (አማርኛ), Afaan Oromoo, Tigrinya (ትግርኛ), Somali (Soomaali), Arabic (العربية), Kiswahili, French (Français), and English.",
        "source": "offline_faq",
    },
    {
        "question": "How do I request accommodations? የተደራሽነት ማስተካከያ? Deeggarsa akkamitti gaafadha? ከመይ ገይረ ሓገዝ ይሓትት? طلب التسهيلات؟ Ombi la makazi? Demande d'aménagements?",
        "answer": "You can request interview and learning accommodations privately without medical proof via the /accommodate endpoint or by asking the assistant.",
        "source": "offline_faq",
    },
]


def _load_faq() -> list[dict]:
    """Load FAQ from disk, falling back to built-in defaults."""
    for path_str in _FAQ_SEARCH_PATHS:
        path = Path(path_str).resolve()
        if path.exists():
            try:
                with path.open("r", encoding="utf-8") as fh:
                    data = json.load(fh)
                    if isinstance(data, list):
                        logger.info("Loaded offline FAQ from %s (%d entries)", path, len(data))
                        return data
            except (json.JSONDecodeError, OSError) as exc:
                logger.warning("Failed to load FAQ from %s: %s", path, exc)
    logger.warning("No offline_faq.json found — using built-in defaults.")
    return _DEFAULT_FAQ


def _keyword_score(query: str, entry: dict, target_lang: str) -> int:
    """Keyword overlap score with stopword filtering and language affinity boost."""
    import re

    STOPWORDS = {
        "is", "the", "a", "an", "and", "or", "of", "to", "in", "on", "what", "how", "can", "i", "do",
        "ምን", "ነው", "እና", "ወይም", "በ", "ላይ", "እንዴት",
        "maal", "dha", "fi", "moo", "keessa", "irra", "akkamitti",
        "እንታይ", "እዩ", "ኣብ", "ከመይ",
        "waa", "maxay", "iyo", "ama", "ku", "sidee",
        "ما", "هو", "هي", "في", "على", "كيف",
        "ni", "ya", "na", "au", "katika", "kwa", "vipi",
        "est", "le", "la", "et", "ou", "dans", "sur", "comment"
    }

    query_tokens = {t for t in re.findall(r"[\w']+", query.lower()) if t not in STOPWORDS and len(t) > 1}
    if not query_tokens:
        return 0
    target = (entry.get("question", "") + " " + entry.get("answer", "")).lower()
    target_tokens = set(re.findall(r"[\w']+", target))
    matched = query_tokens & target_tokens
    base_score = len(matched)
    # Require at least 2 content tokens (or a single very specific token >= 5 chars) to prevent false matches
    if base_score < 2 and not any(len(m) >= 5 for m in matched):
        return 0
    if base_score > 0 and entry.get("language") == target_lang:
        base_score += 4  # Strong bonus for matching language
    return base_score


class OfflineProvider(AIProvider):
    def __init__(self, settings: "Settings") -> None:
        self._settings = settings
        self._faq: list[dict] = _load_faq()

    @property
    def name(self) -> str:
        return "offline"

    async def chat(
        self,
        message: str,
        language: str,
        context_chunks: list[dict],
        history: list[ChatMessage],
        simple_mode: bool = False,
        page_context: dict | None = None,
    ) -> tuple[str, list[Citation]]:
        note = _OFFLINE_NOTES.get(language, _OFFLINE_NOTES["en"])
        mode_prefix = _MODE_PREFIXES.get(language, _MODE_PREFIXES["en"]) if simple_mode else ""

        # If RAG context is provided, return the top chunk directly
        if context_chunks:
            top = context_chunks[0]
            raw_text = top['text']
            if simple_mode:
                sentences = raw_text.split(". ")
                raw_text = ". ".join(sentences[:2]) + ("." if not sentences[0].endswith(".") else "")
            text = f"{mode_prefix}{note}\n\n{raw_text}"
            citation = Citation(
                id=top["id"],
                source=top["source"],
                excerpt=top["text"][:200],
                url=top.get("url"),
                title=top.get("title", top["source"]),
            )
            return text, [citation]

        # Otherwise, do keyword search over the built-in FAQ
        best_entry: dict | None = None
        best_score = -1
        for entry in self._faq:
            score = _keyword_score(message, entry, language)
            if score > best_score:
                best_score = score
                best_entry = entry

        if best_entry is None or best_score == 0:
            fallback_msg = _FALLBACK_TEXTS.get(language, _FALLBACK_TEXTS["en"])
            fallback_text = f"{note}\n\n{fallback_msg}"
            return fallback_text, []

        answer = best_entry.get("answer", "No answer available.")
        source = best_entry.get("source", "offline_faq")
        chunk_id = f"faq_{self._faq.index(best_entry)}"
        text = f"{note}\n\n{answer}"
        citation = Citation(
            id=chunk_id,
            source=source,
            excerpt=answer[:200],
        )
        return text, [citation]
