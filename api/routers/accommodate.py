"""
Accommodation router — POST /accommodate

Flow:
  1. Generate a reference number ACC-{year}-{random 4 digits}.
  2. Send a Telegram notification to the operator channel (or log if not set).
  3. Return AccommodationResponse with language-appropriate message and next_steps.
"""
from __future__ import annotations

import logging
import os
import secrets
import string
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter

from config import get_settings
from models import AccommodationRequest, AccommodationResponse
from utils.ethiopian_calendar import gregorian_to_ethiopian
from utils.privacy import mask_email, mask_name

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

ESCALATION_OPERATOR_CHAT_ID: Optional[str] = os.getenv("ESCALATION_OPERATOR_CHAT_ID")

# ── Copy ──────────────────────────────────────────────────────────────────────

_NEXT_STEPS = {
    "en": [
        "Your request has been received",
        "An accessibility coordinator will contact you within 2 business days",
        "Please have your interview details ready",
    ],
    "am": [
        "ጥያቄዎ ተቀብሏል",
        "የተደራሽነት አስተባባሪ በ2 የሥራ ቀናት ውስጥ ያነጋግርዎታል",
        "የቃለ-ምልልሱ ዝርዝሮችዎን ዝግጁ ያድርጉ",
    ],
    "om": [
        "Gaaffiin keessan nu ga'eera",
        "Qindeessaan dandeettii guyyoota hojii 2 keessatti isin qunnama",
        "Odeeffannoo qormaata keessanii qopheeffadhaa",
    ],
    "ti": [
        "ሕቶኹም ተቐቢልናዮ ኣለና",
        "ኣተሓባባሪ ተበጻሕነት ኣብ ውሽጢ 2 ናይ ስራሕ መዓልታት ከዘራርበኩም እዩ",
        "ዝርዝር ቃለ-መሕትትኩም ድሉው ግበሩ",
    ],
    "so": [
        "Codsigaaga waa la helay",
        "Isku-duwaha naafada ayaa kula soo xiriiri doona 2 maalmood oo shaqo gudahood",
        "Fadlan diyaarso faahfaahinta waraysigaaga",
    ],
    "ar": [
        "تم استلام طلبك بنجاح",
        "سيتواصل معك منسق التيسيرات وسهولة الوصول خلال يومي عمل",
        "يرجى تجهيز تفاصيل المقابلة الخاصة بك",
    ],
    "sw": [
        "Ombi lako limepokelewa",
        "Mratibu wa ufikiaji atawasiliana nawe ndani ya siku 2 za kazi",
        "Tafadhali weka maelezo yako ya mahojiano tayari",
    ],
    "fr": [
        "Votre demande a été bien reçue",
        "Un coordinateur d'accessibilité vous contactera sous 2 jours ouvrables",
        "Veuillez préparer les détails de votre entretien",
    ],
}

_CONFIRM_MSG = {
    "en": (
        "Thank you, {name}. Your accommodation request ({ref}) has been received. "
        "We will contact you at {email} within 2 business days."
    ),
    "am": (
        "አመሰግናለሁ፣ {name}። የተደራሽነት ጥያቄዎ ({ref}) ተቀብሏል። "
        "በ{email} በ2 የሥራ ቀናት ውስጥ እናናግርዎታለን።"
    ),
    "om": (
        "Galatoomaa, {name}. Gaaffiin mijeeffannaa keessanii ({ref}) dhiyaateera. "
        "Guyyoota hojii 2 keessatti karaa {email} isin qunnamna."
    ),
    "ti": (
        "የቐንየልና፣ {name}። ናይ ተበጻሕነት ሕቶኹም ({ref}) ተቐቢልናዮ ኣለና። "
        "ኣብ ውሽጢ 2 ናይ ስራሕ መዓልታት ብ {email} ክንረኽበኩም ኢና።"
    ),
    "so": (
        "Mahadsanid, {name}. Codsigaaga wax-ka-beddelka ({ref}) waa la helay. "
        "Waxaan kugula soo xiriiri doonnaa {email} 2 maalmood oo shaqo gudahood."
    ),
    "ar": (
        "شكرًا لك، {name}. تم استلام طلب التيسيرات الخاص بك ({ref}). "
        "سنتواصل معك عبر {email} خلال يومي عمل."
    ),
    "sw": (
        "Asante, {name}. Ombi lako la huduma maalum ({ref}) limepokelewa. "
        "Tutawasiliana nawe kupitia {email} ndani ya siku 2 za kazi."
    ),
    "fr": (
        "Merci, {name}. Votre demande d'aménagements ({ref}) a été reçue. "
        "Nous vous contacterons à {email} sous 2 jours ouvrables."
    ),
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _generate_reference() -> str:
    year = datetime.now(timezone.utc).year
    digits = "".join(secrets.choice(string.digits) for _ in range(4))
    return f"ACC-{year}-{digits}"


async def _notify_operator(ref: str, body: AccommodationRequest) -> None:
    """
    Send a Telegram message to the operator (via env var or Redis registered operator chat).
    """
    import html
    from utils.notifications import notify_operator_telegram

    text = (
        f"♿ <b>Accommodation Request</b>\n"
        f"<b>Ref:</b> <code>{html.escape(ref)}</code>\n"
        f"<b>Name:</b> {html.escape(body.name)}\n"
        f"<b>Email:</b> {html.escape(body.email)}\n"
        f"<b>Phone:</b> {html.escape(body.phone or 'N/A')}\n"
        f"<b>Type:</b> {html.escape(body.accommodation_type)}\n"
        f"<b>Interview Date:</b> {html.escape(body.interview_date or 'Not specified')}\n"
        f"<b>Notes:</b> {html.escape(body.notes or 'None')}\n"
        f"<b>Language:</b> {html.escape(body.language.upper())}\n"
        f"<b>Time:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
    )

    logger.info(
        "[ACCOMMODATION] ref=%s name=%s email=%s type=%s",
        ref,
        mask_name(body.name),
        mask_email(body.email),
        body.accommodation_type,
    )

    try:
        await notify_operator_telegram(text, parse_mode="HTML")
    except Exception as exc:
        logger.error("Telegram notification for accommodation failed: %s", exc)


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=AccommodationResponse,
    summary="Submit an accessibility / accommodation request",
)
async def accommodate(body: AccommodationRequest) -> AccommodationResponse:
    """
    Record an accommodation request and notify the accessibility coordinator.
    Responds in the requested language (8 supported languages: en, am, om, ti, so, ar, sw, fr).
    """
    lang = body.language if body.language in _CONFIRM_MSG else "en"
    ref = _generate_reference()

    await _notify_operator(ref, body)

    message = _CONFIRM_MSG[lang].format(name=body.name, ref=ref, email=body.email)
    next_steps = _NEXT_STEPS[lang]
    eth_date = gregorian_to_ethiopian(datetime.now())
    eth_str = eth_date.format_am() if lang in ("am", "ti") else eth_date.format_en()

    return AccommodationResponse(
        reference=ref,
        message=message,
        next_steps=next_steps,
        ethiopian_date=eth_str,
    )
