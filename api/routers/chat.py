"""
Chat router — POST /chat and GET /chat/history/{session_id}

Flow:
  1. Auto-detect language if not provided (langdetect).
  2. Retrieve relevant context chunks from RAG.
  3. Call AI provider with message + context + history.
  4. Persist the exchange to Redis (key: chat:{session_id}).
  5. Return ChatResponse with citations.
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, HTTPException, Request
from langdetect import detect, LangDetectException

from config import get_settings
from models import ChatRequest, ChatResponse, ChatMessage, Citation
from routers.teacher import record_question
from utils.ethiopian_calendar import gregorian_to_ethiopian

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# ── Redis helper ──────────────────────────────────────────────────────────────

def _get_redis() -> Optional[aioredis.Redis]:
    """Return a lazy Redis client, or None if unavailable."""
    try:
        return aioredis.from_url(settings.redis_url, decode_responses=True)
    except Exception as exc:
        logger.warning("Redis unavailable: %s", exc)
        return None


# ── Language specification & detection ────────────────────────────────────────

SUPPORTED_LANGUAGES: dict[str, dict[str, str]] = {
    "en": {"name": "English", "native": "English", "dir": "ltr"},
    "am": {"name": "Amharic", "native": "አማርኛ", "dir": "ltr"},
    "om": {"name": "Afaan Oromo", "native": "Afaan Oromoo", "dir": "ltr"},
    "ti": {"name": "Tigrinya", "native": "ትግርኛ", "dir": "ltr"},
    "so": {"name": "Somali", "native": "Soomaali", "dir": "ltr"},
    "ar": {"name": "Arabic", "native": "العربية", "dir": "rtl"},
    "sw": {"name": "Swahili", "native": "Kiswahili", "dir": "ltr"},
    "fr": {"name": "French", "native": "Français", "dir": "ltr"},
}

_TIGRINYA_MARKERS = {
    "ከመይ", "ናይ", "ኣለኹ", "እዩ", "እንታይ", "ትምህርቲ", "ብኸመይ", "ቀዳማይ", "ሓበሬታ",
    "ቐ", "ቘ", "ኸ", "ዀ", "ጘ", "ጝ"
}

_OROMO_KEYWORDS = {
    "afaan", "oromoo", "oromo", "oromootiin", "akkam", "nagaa", "barnoota", "barachuu", "barataa", 
    "hojii", "danda", "danda'aa", "danda'u", "maaloo", "waa", "ani", "eessa", "akkamitti", "maal"
}

_SOMALI_KEYWORDS = {
    "soomaali", "sidee", "barashada", "shaqo", "mahadsanid", "fadlan", "waa", "maxay", "waxbarasho", "koorsada"
}

_SWAHILI_KEYWORDS = {
    "habari", "jambo", "kazi", "masomo", "asante", "naomba", "tafadhali", "nini", "vipi", "mimi", "kujifunza", "nataka"
}

_FRENCH_KEYWORDS = {
    "bonjour", "comment", "formation", "merci", "travail", "suis", "cours", "pourquoi", "aide", "inscrire"
}

_TIMEOUT_MESSAGES = {
    "en": "I'm taking longer than expected. Please try again in a moment.",
    "am": "ትንሽ ጊዜ ወስዷል። እባክዎ እንደገና ይሞክሩ።",
    "om": "Yeroo dheeraa fudhachaa jira. Maaloo xiqqoo turanii irra deebi'aa yaalaa.",
    "ti": "ካብቲ ዝተጸበናዮ ንላዕሊ ግዜ ወሲዱ ኣሎ። እባክኹም ድሕሪ ቅሩብ ደቓይቕ ደጊምኩም ፈትኑ።",
    "so": "Waqti dheer ayey qaadatay. Fadlan wax yar ka dib mar kale isku day.",
    "ar": "استغرق الرد وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى بعد لحظات.",
    "sw": "Inachukua muda mrefu kuliko ilivyotarajiwa. Tafadhali jaribu tena baada ya muda mfupi.",
    "fr": "Le délai de réponse est plus long que prévu. Veuillez réessayer dans un instant.",
}

_ERROR_MESSAGES = {
    "en": "An error occurred while generating a response. Please try again.",
    "am": "ምላሽ ሲፈጥር ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።",
    "om": "Deebii uumuu irratti dogoggorri uumameera. Maaloo irra deebi'aa yaalaa.",
    "ti": "ምላሽ ኣብ ምፍጣር ጌጋ ተፈጢሩ። እባክኹም ደጊምኩም ፈትኑ።",
    "so": "Khalad ayaa dhacay intii jawaabta la samaynayay. Fadlan mar kale isku day.",
    "ar": "حدث خطأ أثناء إنشاء الرد. يرجى المحاولة مرة أخرى.",
    "sw": "Hitilafu imetokea wakati wa kutoa jibu. Tafadhali jaribu tena.",
    "fr": "Une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer.",
}


def _detect_language(text: str) -> str:
    """
    Zero-shot language detection across Ethiopian and regional refugee languages:
    - Amharic (am), Afaan Oromo (om), Tigrinya (ti), Somali (so)
    - Arabic (ar), Swahili (sw), French (fr), English (en)
    """
    if not text or not text.strip():
        return "en"

    # 1. Arabic script detection (\u0600 - \u06FF)
    if any("\u0600" <= c <= "\u06ff" for c in text):
        return "ar"

    # 2. Ethiopic script detection (\u1200 - \u137F)
    if any("\u1200" <= c <= "\u137f" for c in text):
        # Disambiguate Tigrinya vs Amharic
        words = set(text.split())
        if any(marker in text for marker in _TIGRINYA_MARKERS) or any(m in words for m in _TIGRINYA_MARKERS):
            return "ti"
        return "am"

    # 3. Keyword heuristic check for Latin scripts
    lower = text.lower()
    words = set(lower.split())

    # Strip punctuation for cleaner token matching
    import re
    cleaned_tokens = set(re.findall(r"[\w']+", lower))

    if any(k in cleaned_tokens for k in _OROMO_KEYWORDS) or any(k in lower for k in ("afaan orom", "barachuu", "akkamitti", "akkam jirtu", "barnoota")):
        return "om"
    if any(k in cleaned_tokens for k in _SOMALI_KEYWORDS) or any(k in lower for k in ("mahadsanid", "waxbarasho")):
        return "so"
    if any(k in cleaned_tokens for k in _SWAHILI_KEYWORDS) or any(k in lower for k in ("habari", "asante sana", "naomba kusaidiwa")):
        return "sw"
    if any(k in cleaned_tokens for k in _FRENCH_KEYWORDS) or any(k in lower for k in ("bonjour", "s'il vous plaît", "merci beaucoup")):
        return "fr"

    # 4. Fallback to langdetect
    try:
        code = detect(text)
        if code in SUPPORTED_LANGUAGES:
            return code
        if code in ("so", "sw", "fr", "ar", "am"):
            return code
    except LangDetectException:
        pass

    return "en"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse, summary="Send a chat message")
async def chat(body: ChatRequest) -> ChatResponse:
    """
    Accept a chat message, run cross-lingual RAG retrieval, call the AI provider,
    and return a structured response with citations in the learner's language.
    """
    # 1. Language detection & routing
    language = body.language
    if not language or language == "auto" or language not in SUPPORTED_LANGUAGES:
        language = _detect_language(body.message)

    # Record question anonymously for instructor analytics (NO user info)
    record_question(body.message, language)

    # Ethiopian calendar calculation for response timestamp
    eth_date = gregorian_to_ethiopian(datetime.now())
    eth_str = eth_date.format_am() if language in ("am", "ti") else eth_date.format_en()

    # 2. RAG retrieval
    try:
        from rag.retriever import retrieve
        chunks: list[dict] = await retrieve(body.message, language, n_results=5)
    except Exception as exc:
        logger.warning("RAG retrieval failed: %s", exc)
        chunks = []

    # 3. Build citations from chunks
    citations: list[Citation] = [
        Citation(
            id=c.get("id", str(uuid.uuid4())),
            source=c.get("source", "unknown"),
            excerpt=c.get("text", "")[:200],
            url=c.get("url"),
        )
        for c in chunks
    ]

    # 4. Call AI provider (with 30-second timeout guard)
    response_id = str(uuid.uuid4())
    provider_name = settings.ai_provider

    try:
        from ai.factory import get_provider
        provider = get_provider()
        provider_name = getattr(provider, "name", type(provider).__name__)

        reply_text, ai_citations = await asyncio.wait_for(
            provider.chat(
                body.message,
                language,
                chunks,
                body.history,
                simple_mode=body.simple_mode,
            ),
            timeout=30.0,
        )
        if ai_citations:
            citations = ai_citations
    except asyncio.TimeoutError:
        reply_text = _TIMEOUT_MESSAGES.get(language, _TIMEOUT_MESSAGES["en"])
        logger.warning("AI provider timed out for session %s", body.session_id)
    except Exception as exc:
        logger.error("AI provider error: %s", exc)
        reply_text = _ERROR_MESSAGES.get(language, _ERROR_MESSAGES["en"])

    response = ChatResponse(
        id=response_id,
        text=reply_text,
        language=language,
        citations=citations,
        provider=provider_name,
        timestamp=datetime.now(timezone.utc),
        ethiopian_date=eth_str,
    )

    # 5. Persist to Redis
    if body.session_id:
        redis = _get_redis()
        if redis:
            try:
                key = f"chat:{body.session_id}"
                # Append user message + assistant reply to history list
                async with redis:
                    for msg in [
                        ChatMessage(role="user", content=body.message, language=language),
                        ChatMessage(role="assistant", content=reply_text, language=language),
                    ]:
                        await redis.rpush(key, msg.model_dump_json())
                    await redis.expire(key, 60 * 60 * 24)  # 24-hour TTL
            except Exception as exc:
                logger.warning("Could not persist chat history: %s", exc)

    return response


@router.get(
    "/history/{session_id}",
    summary="Retrieve chat history for a session",
    response_model=list[ChatMessage],
)
async def get_history(session_id: str) -> list[ChatMessage]:
    """
    Return the stored message history for *session_id*.
    Returns an empty list if Redis is unavailable or the key does not exist.
    """
    redis = _get_redis()
    if not redis:
        return []
    try:
        async with redis:
            raw_messages: list[str] = await redis.lrange(f"chat:{session_id}", 0, -1)
        return [ChatMessage.model_validate_json(m) for m in raw_messages]
    except Exception as exc:
        logger.warning("Could not retrieve chat history: %s", exc)
        return []
