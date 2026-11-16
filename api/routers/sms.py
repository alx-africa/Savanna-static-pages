"""
SMS webhook router

POST /webhook/sms            — Africa's Talking inbound SMS webhook
POST /webhook/sms/delivery   — delivery report handler (log + 200)

Routing logic:
  • Starts with JOB / KAZI → return a job listing summary (≤160 chars/SMS)
  • Anything else → pass to chat logic, reply truncated to 160 chars

Helpers:
  truncate_sms(text, page=1) — paginate into 155-char chunks with "(1/N)" prefix
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from fastapi import APIRouter, Form, Request, Response

from config import get_settings
from models import SMSInbound
from routers.chat import _detect_language

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# ── SMS helpers ───────────────────────────────────────────────────────────────

SMS_MAX = 160
SMS_PAGE_CONTENT = 155  # leaves room for "(1/N)" prefix in GSM-7

# UCS-2 (Ethiopic & Arabic) carrier boundaries
SMS_UCS2_MAX = 70
SMS_UCS2_PAGE_CONTENT = 65  # leaves room for "(1/N)" prefix in UCS-2


def is_ucs2_script(text: str) -> bool:
    """
    Detect if text contains Ethiopic (Ge'ez), Arabic, or non-GSM characters
    requiring UCS-2 70-character SMS carrier encoding (Ethio Telecom / Safaricom).
    """
    return any("\u1200" <= ch <= "\u137F" or "\u0600" <= ch <= "\u06FF" for ch in text)


def truncate_sms(text: str, page: int = 1) -> str:
    """
    Split *text* into carrier-compliant chunks and return the chunk at *page* (1-based).
    Uses 65-char chunks for UCS-2 scripts (Amharic, Tigrinya, Arabic) to fit 70-char carrier limits.
    Uses 155-char chunks for standard GSM-7 scripts (English, Afaan Oromoo, Somali, Swahili, French).
    Prepends a "(page/total)" indicator, e.g. "(1/3)".
    """
    chunk_size = SMS_UCS2_PAGE_CONTENT if is_ucs2_script(text) else SMS_PAGE_CONTENT
    chunks = [text[i: i + chunk_size] for i in range(0, len(text), chunk_size)]
    if not chunks:
        return ""
    total = len(chunks)
    idx = max(0, min(page - 1, total - 1))
    return f"({idx + 1}/{total}){chunks[idx]}"


_STRIP_PREFIXES = re.compile(
    r"^(HELP|JOB|KAZI|HOJII|SHAQO|ስራሕ|ስራ|وظيفة|عمل|EMPLOI|ALERT|SUBSCRIBE|ALERTS|ማስጠንቀቂያ|ተመዝገብ|STOP|UNSUBSCRIBE|ይቁም|ቁም|CHAT|HABARI|INFO|MSAADA|START|YES|NO)\s*",
    re.IGNORECASE,
)


def _strip_prefix(text: str) -> tuple[str, Optional[str]]:
    """
    Returns (stripped_text, prefix_upper_or_None).
    """
    m = _STRIP_PREFIXES.match(text.strip())
    if m:
        prefix = m.group(1).upper()
        return text[m.end():].strip(), prefix
    return text.strip(), None


async def _subscribe_sms_alert(phone: str, keywords_str: str, language: str) -> str:
    """Subscribe a phone number to job alerts via SMS."""
    import uuid
    import json
    import redis.asyncio as aioredis
    from config import get_settings
    s = get_settings()

    keywords = [k.strip() for k in keywords_str.split() if k.strip()]
    sub_id = str(uuid.uuid4())
    sub_data = {
        "subscription_id": sub_id,
        "user_id": f"sms-{phone}",
        "channel": "sms",
        "contact": phone,
        "phone": phone,
        "keywords": keywords,
        "language": language,
    }

    try:
        r = aioredis.from_url(s.redis_url, decode_responses=True)
        async with r:
            await r.set(f"job_alert:{sub_id}", json.dumps(sub_data))
    except Exception as exc:
        logger.warning("Could not persist SMS alert sub in Redis: %s", exc)

    confirmations = {
        "en": "Subscribed to Savanna Job Alerts! You will get matching jobs via SMS. Text STOP to cancel.",
        "am": "የሥራ ማስጠንቀቂያ ተመዝግቧል! አዳዲስ ሥራዎችን በSMS ይደርስዎታል። ለማቆም STOP ይላኩ።",
        "om": "Odeeffannoo hojii haarawaaf galmooftaniittu! Dhaabuuf STOP ergaa.",
        "ti": "ናይ ስራሕ መጠንቀቕታ ተመዝጊብኩም! ንምቁራጽ STOP ስደዱ።",
        "so": "Waxaad iska diiwaangelisay digniinta shaqada! Jooji: STOP.",
        "ar": "تم تفعيل تنبيهات الوظائف! لإلغاء الاشتراك أرسل STOP.",
        "sw": "Umejiandikisha kupokea taarifa za kazi! Kusitisha tuma STOP.",
        "fr": "Abonné aux alertes d'emploi Savanna! Pour stopper: STOP.",
    }
    msg = confirmations.get(language, confirmations["en"])
    max_len = SMS_UCS2_MAX if language in ("am", "ti", "ar") else SMS_MAX
    return msg[:max_len]


async def _unsubscribe_sms_alert(phone: str, language: str) -> str:
    """Unsubscribe a phone number from SMS job alerts."""
    import json
    import redis.asyncio as aioredis
    from config import get_settings
    s = get_settings()

    try:
        r = aioredis.from_url(s.redis_url, decode_responses=True)
        async with r:
            keys = await r.keys("job_alert:*")
            for k in keys:
                val = await r.get(k)
                if val:
                    try:
                        d = json.loads(val)
                        if d.get("contact") == phone or d.get("phone") == phone:
                            await r.delete(k)
                    except Exception:
                        pass
    except Exception as exc:
        logger.warning("Error unsubscribing SMS phone in Redis: %s", exc)

    unsub_msgs = {
        "en": "You have unsubscribed from Savanna Job Alerts.",
        "am": "ከሥራ ማስጠንቀቂያ አገልግሎት ተሰርዘዋል።",
        "om": "Beeksisa hojii irraa haqamtaniittu.",
        "ti": "ካብ ናይ ስራሕ መጠንቀቕታ ተሰሪዝኩም ኣለኹም።",
        "so": "Waa lagaa saaray digniinta shaqada.",
        "ar": "تم إلغاء اشتراكك في تنبيهات الوظائف بنجاح.",
        "sw": "Umejiondoa kwenye taarifa za kazi za Savanna.",
        "fr": "Vous êtes désabonné des alertes d'emploi Savanna.",
    }
    msg = unsub_msgs.get(language, unsub_msgs["en"])
    max_len = SMS_UCS2_MAX if language in ("am", "ti", "ar") else SMS_MAX
    return msg[:max_len]


async def process_sms_message(from_number: str, text: str) -> str:
    """Unified handler for incoming SMS text routing across webhook and v1 contract."""
    from routers.chat import _detect_language
    language = _detect_language(text)
    stripped, prefix = _strip_prefix(text)

    # 1. Job Alert Subscription (Level 2/3 Hackathon requirement)
    if prefix in ("ALERT", "ALERTS", "SUBSCRIBE", "ማስጠንቀቂያ", "ተመዝገብ"):
        return await _subscribe_sms_alert(from_number, stripped, language)

    # 2. Unsubscribe
    if prefix in ("STOP", "UNSUBSCRIBE", "ይቁም", "ቁም"):
        return await _unsubscribe_sms_alert(from_number, language)

    # 3. Help Command
    if prefix in ("HELP", "INFO", "MSAADA"):
        help_msgs = {
            "en": "Savanna: Text JOB for job openings, ALERT [skills] for alerts, or ask any course question.",
            "am": "ሳቫና: ለክፍት ስራዎች JOB፣ ለማስጠንቀቂያ ALERT ይላኩ ወይም ማንኛውንም ጥያቄ ይጠይቁ።",
            "om": "Savanna: Hojiif JOB, beeksisaaf ALERT ergaa ykn gaaffii barnootaa gaafadhaa.",
            "ti": "ሳቫና: ንስራሓት JOB፣ ንመጠንቀቕታ ALERT ስደዱ ወይ ሕቶ ሕተቱ።",
            "so": "Savanna: Shaqooyinka qor JOB, digniinta ALERT, ama weydii su'aalo.",
            "ar": "سافانا: أرسل JOB للوظائف أو ALERT لتنبيهات الوظائف أو اسأل أي سؤال.",
            "sw": "Savanna: Tuma JOB kupata kazi, ALERT kwa taarifa, au uliza swali lolote.",
            "fr": "Savanna: Envoyez JOB pour offres, ALERT pour alertes, ou posez une question.",
        }
        msg = help_msgs.get(language, help_msgs["en"])
        max_l = SMS_UCS2_MAX if language in ("am", "ti", "ar") else SMS_MAX
        return msg[:max_l]

    # 4. Job Listings Summary
    if prefix in ("JOB", "KAZI", "HOJII", "SHAQO", "ስራ", "ስራሕ", "وظيفة", "عمل", "EMPLOI"):
        return _job_summary(language)

    # 5. Course Q&A via Chat Pipeline
    return await _chat_reply(stripped or text, language)


def _job_summary(language: str = "en") -> str:
    """Return a compact job listing that fits in one SMS."""
    import json
    from pathlib import Path

    from config import get_docs_path
    jobs_path = get_docs_path() / "jobs" / "jobs.json"
    try:
        with open(jobs_path, "r", encoding="utf-8") as fh:
            jobs = json.load(fh)
    except Exception:
        no_jobs = {
            "en": "No jobs available. Visit our website for more info.",
            "am": "ምንም ክፍት ሥራ የለም። ለተጨማሪ መረጃ ድረ-ገጻችንን ይጎብኙ።",
            "om": "Hojiin hin jiru. Odeeffannoof weebsaayitii keenya daawwadhaa.",
            "ti": "ስራሕ የለን። ንተወሳኺ ሓበሬታ ወብሳይትና ተወከሱ።",
            "so": "Shaqo ma jirto. Booqo mareegtayada wixii macluumaad dheeraad ah.",
            "ar": "لا توجد وظائف متاحة حاليًا. زر موقعنا لمزيد من التفاصيل.",
            "sw": "Hakuna kazi zinazopatikana. Tembelea tovuti yetu kwa maelezo zaidi.",
            "fr": "Aucun emploi disponible. Visitez notre site pour plus d'infos.",
        }
        return no_jobs.get(language, no_jobs["en"])

    headers = {
        "en": "JOBS",
        "am": "ሥራዎች",
        "om": "HOJIIWWAN",
        "ti": "ስራሓት",
        "so": "SHAQOOYINKA",
        "ar": "الوظائف",
        "sw": "KAZI",
        "fr": "EMPLOIS",
    }
    header = headers.get(language, "JOBS")

    # Sort newest first, take top 3
    jobs_sorted = sorted(jobs, key=lambda j: j.get("posted_at", ""), reverse=True)[:3]
    lines = [f"{header}:"]
    for j in jobs_sorted:
        line = f"{j.get('title', 'Role')} @ {j.get('company', 'Co')} ({j.get('type', '')})"
        lines.append(line[:45])  # keep each line short

    lines.append("HELP")
    summary = " | ".join(lines)
    max_len = SMS_UCS2_MAX if language in ("am", "ti", "ar") else SMS_MAX
    return summary[:max_len]


# ── Chat via API logic (reuses chat router logic directly) ───────────────────

async def _chat_reply(text: str, language: str) -> str:
    """Run the chat pipeline and return a truncated SMS reply."""
    import asyncio

    # RAG retrieval
    try:
        from rag.retriever import retrieve
        chunks: list[dict] = await retrieve(text, language, n_results=3)
    except Exception:
        chunks = []

    # AI response
    try:
        from ai.factory import get_provider
        provider = get_provider()
        reply_tuple = await provider.chat(
            text,
            language,
            chunks,
            [],
        )
        reply = reply_tuple[0] if isinstance(reply_tuple, tuple) else str(reply_tuple)
    except Exception as exc:
        logger.error("AI provider error in SMS handler: %s", exc)
        fallbacks = {
            "en": "Sorry, I could not answer right now. Try again later.",
            "am": "ይቅርታ፣ ምላሽ አልሰጠሁም። ቆይተው ይሞክሩ።",
            "om": "Dhiifama, yeroo ammaa deebii kennuu hin dandeenye.",
            "ti": "ይቕሬታ፣ ሕጂ መልሲ ክህብ ኣይከኣልኩን። ጸኒሕኩም ፈትኑ።",
            "so": "Waan ka xumahay, hadda jawaab ma bixin karo.",
            "ar": "عذرًا، تعذر الرد الآن. يُرجى المحاولة لاحقًا.",
            "sw": "Samahani, sikuweza kutoa jibu kwa sasa.",
            "fr": "Désolé, impossible de répondre pour le moment.",
        }
        reply = fallbacks.get(language, fallbacks["en"])

    # Truncate to one SMS
    return truncate_sms(reply, page=1)


# ── Send reply via Africa's Talking ──────────────────────────────────────────

async def _send_sms_reply(to: str, message: str) -> None:
    """Fire-and-forget: send reply via the AT SMS helper."""
    try:
        from channels.sms_handler import send_sms
        success = await send_sms(to, message, settings)
        if not success:
            logger.warning("SMS reply to %s failed", to)
    except Exception as exc:
        logger.error("SMS send error: %s", exc)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/sms", summary="Africa's Talking inbound SMS webhook")
async def sms_inbound(request: Request):
    """
    Receive an inbound SMS from Africa's Talking and reply appropriately.

    AT sends the payload as application/x-www-form-urlencoded with fields:
      from, to, text, date, id, linkId, networkCode
    """
    form = await request.form()
    raw = {
        "from": form.get("from", ""),
        "to": form.get("to", ""),
        "text": form.get("text", ""),
        "date": form.get("date"),
        "id": form.get("id"),
    }

    try:
        inbound = SMSInbound.model_validate(raw)
    except Exception as exc:
        logger.error("Could not parse SMS inbound: %s — raw=%s", exc, raw)
        return Response(content="OK", media_type="text/plain")

    logger.info("SMS from %s: %s", inbound.from_, inbound.text)

    # Route based on unified message processor
    reply = await process_sms_message(inbound.from_, inbound.text)

    # Send the reply
    await _send_sms_reply(inbound.from_, reply)

    # AT expects a plain-text 200 response
    return Response(content="OK", media_type="text/plain")


@router.post("/sms/delivery", summary="Africa's Talking SMS delivery report")
async def sms_delivery(request: Request):
    """
    Receive delivery status reports from Africa's Talking.
    We log the payload and always return 200 OK as AT expects.
    """
    form = await request.form()
    logger.info(
        "SMS delivery report: id=%s status=%s network=%s",
        form.get("id"),
        form.get("status"),
        form.get("networkCode"),
    )
    return Response(content="OK", media_type="text/plain")
