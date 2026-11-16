"""
Telegram bot — Savanna Multilingual Assistant

Commands:
  /start      — Welcome message (EN + AM), lists commands
  /help       — Command reference
  /language   — Toggle between English and Amharic
  /jobs       — Show 5 newest job listings (inline keyboard for more)
  /accommodate — Start accommodation request flow (3-step ConversationHandler)
  /escalate   — Notify operator and provide web escalation link

Regular messages → chat API → reply with text + citation sources.

Language preference is stored per user in an in-memory dict.
Run with python telegram_bot.py (polling mode).
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Language store (in-memory + Redis persistent) ───────────────────────────
user_language: dict[int, str] = {}  # user_id → "en" | "am" | "om" | "ti" | "so" | "ar" | "sw" | "fr" | "auto"


async def _get_user_lang(user_id: int) -> str:
    if user_id in user_language:
        return user_language[user_id]
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        val = await r.get(f"user_lang:{user_id}")
        await r.aclose()
        if val:
            user_language[user_id] = val
            return val
    except Exception:
        pass
    return "auto"


async def _set_user_lang(user_id: int, lang: str) -> None:
    user_language[user_id] = lang
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        await r.set(f"user_lang:{user_id}", lang)
        await r.aclose()
    except Exception:
        pass


def _lang(user_id: int) -> str:
    return user_language.get(user_id, "auto")


# ── Copy ──────────────────────────────────────────────────────────────────────

WELCOME = {
    "en": (
        "👋 Welcome to *Savanna Multilingual Assistant*!\n\n"
        "I can help you with:\n"
        "• Course questions (8 languages supported)\n"
        "• Browsing remote job opportunities\n"
        "• Requesting accessibility accommodations\n"
        "• Connecting you to a live operator\n\n"
        "Type /help to see all commands."
    ),
    "am": (
        "👋 ወደ *ሳቫና ባለ-ቋንቋ ረዳት* እንኳን ደህና መጡ!\n\n"
        "ሊረዳዎ የምችለው:\n"
        "• የኮርስ ጥያቄዎች (በ 8 ቋንቋዎች)\n"
        "• የርቀት የሥራ ዕድሎችን ማሰስ\n"
        "• ተደራሽነት ጥያቄ ማስገባት\n"
        "• ወደ ሰው ኦፕሬተር ማስተላለፍ\n\n"
        "ሁሉንም ትዕዛዞች ለማየት /help ይፃፉ።"
    ),
    "om": (
        "👋 Baga nagaan gara *Gargaaraa Afaan Baay'ee Savanna* dhuftan!\n\n"
        "Waanin isin gargaaruu danda'u:\n"
        "• Gaaffii barnootaa (afaanota 8n)\n"
        "• Carraawwan hojii fageenyaa barbaaduu\n"
        "• Gaaffii mijeeffannaa dhiyeessuu\n"
        "• Gargaaraa kallattiitti wal qunnamsiisuu\n\n"
        "Ajajoota hunda arguuf /help barreessaa."
    ),
    "ti": (
        "👋 ናብ *ሳቫና ብዙሕ-ቋንቋ ሓጋዚ* ብደሓን መጻእኩም!\n\n"
        "ክሕግዘኩም ዝኽእሎም:\n"
        "• ሕቶታት ትምህርቲ (ብ 8 ቋንቋታት)\n"
        "• ናይ ርሑቕ ስራሕ ዕድላት ምድላይ\n"
        "• ናይ ተበጻሕነት ሕቶ ምቕራብ\n"
        "• ምስ ቀጥታዊ ኦፕሬተር ምትእስሳር\n\n"
        "ኩሎም ትእዛዛት ንምርኣይ /help ጽሓፉ።"
    ),
    "so": (
        "👋 Ku soo dhowow *Kaaliyaha Luuqadaha Badan ee Savanna*!\n\n"
        "Waxaan kaa caawin karaa:\n"
        "• Su'aalaha koorsada (8 luqadood)\n"
        "• Raadinta fursadaha shaqo ee fog\n"
        "• Dalbashada wax-ka-beddelka naafada\n"
        "• Ku xiridda shaqaale toos ah\n\n"
        "Geli /help si aad u aragto dhammaan amarrada."
    ),
    "ar": (
        "👋 مرحبًا بك في *مساعد سافانا متعدد اللغات*!\n\n"
        "يمكنني مساعدتك في:\n"
        "• أسئلة الدورات التدريبية (بـ 8 لغات)\n"
        "• استعراض فرص العمل عن بُعد\n"
        "• طلب ترتيبات التيسير لذوي الإعاقة\n"
        "• التواصل مع موظف دعم مباشر\n\n"
        "اكتب /help لعرض جميع الأوامر."
    ),
    "sw": (
        "👋 Karibu kwenye *Msaidizi wa Lugha Nyingi wa Savanna*!\n\n"
        "Ninaweza kukusaidia kwa:\n"
        "• Maswali ya masomo (lugha 8 zikisaidiwa)\n"
        "• Kutafuta nafasi za kazi za mbali\n"
        "• Kuomba usaidizi wa ufikiaji\n"
        "• Kuunganishwa na opereta wa moja kwa moja\n\n"
        "Andika /help kuona amri zote."
    ),
    "fr": (
        "👋 Bienvenue sur l'*Assistant Multilingue Savanna* !\n\n"
        "Je peux vous aider avec :\n"
        "• Vos questions sur les cours (8 langues prises en charge)\n"
        "• La recherche d'opportunités d'emploi à distance\n"
        "• La demande d'aménagements d'accessibilité\n"
        "• La mise en relation avec un opérateur en direct\n\n"
        "Tapez /help pour voir toutes les commandes."
    ),
}

HELP_TEXT = {
    "en": (
        "📋 *Available Commands*\n\n"
        "/start — Welcome message\n"
        "/help — This help text\n"
        "/status — Check system & alert status\n"
        "/language — Select your preferred language\n"
        "/jobs — Browse 5 latest job listings\n"
        "/alerts — Subscribe/manage instant job alerts\n"
        "/accommodate — Request accessibility accommodation\n"
        "/escalate — Connect to a live human operator\n"
        "/operator — Set this chat as the operator channel\n\n"
        "Or just ask any course question in any language!"
    ),
    "am": (
        "📋 *የሚገኙ ትዕዛዞች*\n\n"
        "/start — የእንኳን ደህና መጡ መልዕክት\n"
        "/help — ይህ የእርዳታ ጽሑፍ\n"
        "/language — ቋንቋ ይምረጡ\n"
        "/jobs — 5 የቅርብ ጊዜ የሥራ ዕድሎችን ያሳይ\n"
        "/alerts — የሥራ ማስጠንቀቂያ ለመመዝገብ\n"
        "/accommodate — ተደራሽነት ጥያቄ ያስገቡ\n"
        "/escalate — ወደ ሕያው ኦፕሬተር ያስተላልፉ\n"
        "/operator — ይህንን ቻት እንደ ኦፕሬተር ቻናል ያዘጋጁ\n\n"
        "ወይም ማንኛውንም ጥያቄ በፈለጉት ቋንቋ ይጠይቁ!"
    ),
    "om": (
        "📋 *Ajajoota Jiran*\n\n"
        "/start — Ergaa baga nagaan dhuftanii\n"
        "/help — Odeeffannoo gargaarsaa kana\n"
        "/language — Afaan filadhaa\n"
        "/jobs — Hojiiwwan dhiyoo 5 ilaalaa\n"
        "/accommodate — Gaaffii mijeeffannaa dhiyeessaa\n"
        "/escalate — Gargaaraa namaa qunnamaa\n\n"
        "Yookaan gaaffii barnootaa afaan kamiiniyyuu gaafadhaa!"
    ),
    "ti": (
        "📋 *ዝርከቡ ትእዛዛት*\n\n"
        "/start — ናይ እንቋዕ ደሓን መጻእኩም መልእኽቲ\n"
        "/help — እዚ ናይ ሓገዝ ጽሑፍ\n"
        "/language — ቋንቋ ምረጹ\n"
        "/jobs — 5 ዝሓደሹ ናይ ስራሕ ዕድላት ርኣዩ\n"
        "/accommodate — ናይ ተበጻሕነት ሕቶ ኣቕርቡ\n"
        "/escalate — ምስ ሰብኣዊ ኦፕሬተር ተራኸቡ\n\n"
        "ወይ ዝኾነ ናይ ትምህርቲ ሕቶ ብዝመረጽኩምዎ ቋንቋ ሕተቱ!"
    ),
    "so": (
        "📋 *Amarka La Heli Karo*\n\n"
        "/start — Farriinta soo dhoweynta\n"
        "/help — Qoraalkan caawinta\n"
        "/language — Dooro luuqaddaada\n"
        "/jobs — Eeg 5-ta shaqo ee ugu dambeeya\n"
        "/accommodate — Dalbo wax-ka-beddelka gelitaanka\n"
        "/escalate — La xiriir hawlwadeen toos ah\n\n"
        "Ama weydii su'aal kasta luqad kasta!"
    ),
    "ar": (
        "📋 *الأوامر المتاحة*\n\n"
        "/start — رسالة الترحيب\n"
        "/help — نص المساعدة هذا\n"
        "/language — اختر لغتك المفضلة\n"
        "/jobs — استعراض أحدث 5 وظائف\n"
        "/accommodate — طلب ترتيبات التيسير لذوي الإعاقة\n"
        "/escalate — التواصل مع موظف دعم بشري مباشر\n\n"
        "أو اكتب أي سؤال دراسي بأي لغة وسأجيبك!"
    ),
    "sw": (
        "📋 *Amri Zinazopatikana*\n\n"
        "/start — Ujumbe wa kukaribisha\n"
        "/help — Maelezo haya ya usaidizi\n"
        "/language — Chagua lugha unayopendelea\n"
        "/jobs — Tazama nafasi 5 za hivi punde za kazi\n"
        "/accommodate — Omba marekebisho ya ufikiaji\n"
        "/escalate — Unganishwa na mhudumu wa kibinadamu\n\n"
        "Au uliza swali lolote la masomo kwa lugha yoyote!"
    ),
    "fr": (
        "📋 *Commandes disponibles*\n\n"
        "/start — Message de bienvenue\n"
        "/help — Ce texte d'aide\n"
        "/language — Choisissez votre langue préférée\n"
        "/jobs — Consulter les 5 dernières offres d'emploi\n"
        "/accommodate — Demander un aménagement d'accessibilité\n"
        "/escalate — Contacter un opérateur humain en direct\n\n"
        "Ou posez simplement n'importe quelle question de cours dans votre langue !"
    ),
}

LANGUAGE_CONFIRMED = {
    "en": "✅ Language set to *English* 🇬🇧",
    "am": "✅ ቋንቋ ወደ *አማርኛ* ተቀይሯል 🇪🇹",
    "om": "✅ Afaan gara *Afaan Oromootti* jijjiirameera 🇪🇹",
    "ti": "✅ ቋንቋ ናብ *ትግርኛ* ተቐይሩ ኣሎ 🇪🇷",
    "so": "✅ Luuqadda waxaa loo beddelay *Soomaali* 🇸🇴",
    "ar": "✅ تم ضبط اللغة إلى *العربية* 🇸🇦",
    "sw": "✅ Lugha imewekwa kuwa *Kiswahili* 🇰🇪",
    "fr": "✅ Langue définie sur *Français* 🇫🇷",
    "auto": "✨ *Auto-Detection* enabled. Savanna will reply in the language you type!",
}

ESCALATE_MSG = {
    "en": (
        "🚨 Your escalation request has been sent to an operator.\n"
        "You can also open the web assistant for a live session:\n"
        "{url}"
    ),
    "am": (
        "🚨 ጥያቄዎ ወደ ኦፕሬተር ተልኳል።\n"
        "ቀጥታ ክፍለ ጊዜ ለማድረግ የድር ረዳቱን ይከፍቱ:\n"
        "{url}"
    ),
    "om": (
        "🚨 Gaaffiin keessan gara gargaaraatti ergameera.\n"
        "Walgahii kallattii gochuuf gargaaraa weebii banaa:\n"
        "{url}"
    ),
    "ti": (
        "🚨 ሕቶኹም ናብ ኦፕሬተር ተላኢኹ ኣሎ።\n"
        "ቀጥታዊ ርክብ ንምግባር ናይ ወብ ሓጋዚ ይኽፈቱ:\n"
        "{url}"
    ),
    "so": (
        "🚨 Codsigaaga waxaa loo diray hawlwadeen.\n"
        "Waxaad sidoo kale furi kartaa kaaliyaha shabakadda:\n"
        "{url}"
    ),
    "ar": (
        "🚨 تم إرسال طلب التصعيد الخاص بك إلى موظف الدعم.\n"
        "يمكنك أيضًا فتح المساعد عبر الويب لجلسة مباشرة:\n"
        "{url}"
    ),
    "sw": (
        "🚨 Ombi lako la kupata msaada limetumwa kwa mhudumu.\n"
        "Unaweza pia kufungua msaidizi wa wavuti kwa kipindi cha moja kwa moja:\n"
        "{url}"
    ),
    "fr": (
        "🚨 Votre demande de transfert a été envoyée à un opérateur.\n"
        "Vous pouvez également ouvrir l'assistant web pour une session en direct :\n"
        "{url}"
    ),
}

# Accommodation ConversationHandler states
ACCOM_NAME_EMAIL, ACCOM_TYPE, ACCOM_NOTES = range(3)


def _format_job(job: dict, lang: str = "en") -> str:
    import html
    title = html.escape(str(job.get("title", "Job Title")))
    company = html.escape(str(job.get("company", "Company")))
    location = html.escape(str(job.get("location", "Remote")))
    jtype = html.escape(str(job.get("type", "N/A")))
    url = job.get("url", "#")
    desc = html.escape(str(job.get("description", ""))[:130])
    return f"💼 <b>{title}</b>\n🏢 {company}\n📍 {location} | {jtype}\n{desc}…\n🔗 <a href='{url}'>{url}</a>"


async def _load_jobs(n: int = 5) -> list[dict]:
    import httpx
    import json
    from pathlib import Path

    # 1. Try internal API endpoint
    api_url = f"{settings.api_base_url}/jobs"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(api_url)
            if resp.status_code == 200:
                data = resp.json()
                jobs = data.get("jobs", [])
                if jobs:
                    return jobs[:n]
    except Exception as exc:
        logger.debug("API jobs fetch failed, falling back to disk: %s", exc)

    # 2. Disk candidates
    candidates = [
        Path("/app/docs/jobs/jobs.json"),
        Path("./docs/jobs/jobs.json"),
        Path(__file__).parent.parent / "docs" / "jobs" / "jobs.json",
        Path(__file__).parent.parent.parent / "docs" / "jobs" / "jobs.json",
    ]
    try:
        from config import get_docs_path
        candidates.insert(0, get_docs_path() / "jobs" / "jobs.json")
    except Exception:
        pass

    for p in candidates:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as fh:
                    jobs = json.load(fh)
                jobs.sort(key=lambda j: j.get("posted_at", ""), reverse=True)
                return jobs[:n]
            except Exception as exc:
                logger.error("Could not load jobs from %s: %s", p, exc)

    return []


async def _chat_api(message: str, language: str) -> str:
    """Call the API chat endpoint with fallback to local RAG + AI pipeline."""
    import httpx

    # 1. Primary: Delegate to core API /chat service
    api_url = f"{settings.api_base_url}/chat"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(api_url, json={"message": message, "language": language})
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("text", "")
                citations = data.get("citations", [])
                if citations:
                    urls = [f"• {c.get('title', 'Source')}: {c.get('url', '')}" for c in citations if c.get("url")]
                    if urls:
                        reply += "\n\n📚 *Sources:*\n" + "\n".join(urls[:3])
                return reply
    except Exception as exc:
        logger.debug("Core chat API request failed, trying local fallback: %s", exc)

    # 2. Local fallback
    try:
        from rag.retriever import retrieve
        from ai.factory import get_provider

        chunks: list[dict] = await retrieve(message, language, n_results=5)
        provider = get_provider()
        reply, citations = await provider.chat(
            message,
            language,
            chunks,
            [],
        )
        # Append citation sources
        sources = [c.source for c in citations if c.source] if citations else [c.get("source") for c in chunks if c.get("source")]
        sources = list(dict.fromkeys(sources))
        if sources:
            source_labels = {
                "en": "📚 *Sources:* ",
                "am": "📚 *ምንጮች:* ",
                "om": "📚 *Maddoota:* ",
                "ti": "📚 *መወከሲታት:* ",
                "so": "📚 *Xogta:* ",
                "ar": "📚 *المصادر:* ",
                "sw": "📚 *Vyanzo:* ",
                "fr": "📚 *Sources :* ",
            }
            label = source_labels.get(language, "📚 *Sources:* ")
            reply += f"\n\n{label}" + ", ".join(sources[:3])
        return reply
    except Exception as exc:
        logger.error("Chat API error in Telegram bot: %s", exc)
        fallbacks = {
            "en": "Sorry, I couldn't generate a response right now.",
            "am": "ይቅርታ፣ ምላሽ ማመንጨት አልቻልኩም።",
            "om": "Dhiifama, yeroo ammaa deebii kennuu hin dandeenye.",
            "ti": "ይቕሬታ፣ ሕጂ መልሲ ክህብ ኣይከኣልኩን።",
            "so": "Waan ka xumahay, hadda jawaab ma bixin karo.",
            "ar": "عذرًا، لم أتمكن من إنشاء رد في الوقت الحالي.",
            "sw": "Samahani, sikuweza kutoa jibu kwa sasa.",
            "fr": "Désolé, je n'ai pas pu générer de réponse pour le moment.",
        }
        return fallbacks.get(language, fallbacks["en"])


# ── Bot handlers ──────────────────────────────────────────────────────────────

def build_application(token: str):
    """Build and return the telegram Application object."""
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
    from telegram.ext import (
        Application,
        ApplicationBuilder,
        CallbackQueryHandler,
        CommandHandler,
        ConversationHandler,
        ContextTypes,
        MessageHandler,
        filters,
    )

    def _build_language_keyboard() -> InlineKeyboardMarkup:
        return InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🇬🇧 English", callback_data="setlang_en"),
                InlineKeyboardButton("🇪🇹 አማርኛ", callback_data="setlang_am"),
            ],
            [
                InlineKeyboardButton("🇪🇹 Afaan Oromoo", callback_data="setlang_om"),
                InlineKeyboardButton("🇪🇷 ትግርኛ", callback_data="setlang_ti"),
            ],
            [
                InlineKeyboardButton("🇸🇴 Soomaali", callback_data="setlang_so"),
                InlineKeyboardButton("🇸🇦 العربية", callback_data="setlang_ar"),
            ],
            [
                InlineKeyboardButton("🇰🇪 Kiswahili", callback_data="setlang_sw"),
                InlineKeyboardButton("🇫🇷 Français", callback_data="setlang_fr"),
            ],
            [
                InlineKeyboardButton("✨ Auto-Detect (ራስ-ገዝ)", callback_data="setlang_auto"),
            ],
        ])

    # ── /start ────────────────────────────────────────────────────────────────
    async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        lang = await _get_user_lang(uid)
        effective_lang = "en" if lang == "auto" else lang
        welcome_text = WELCOME.get(effective_lang, WELCOME["en"])

        prompt = (
            f"{welcome_text}\n\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"🌍 *Please select your language / እባክዎ ቋንቋዎን ይምረጡ:*"
        )
        await update.message.reply_text(
            prompt,
            parse_mode="Markdown",
            reply_markup=_build_language_keyboard(),
        )

    # ── /help ─────────────────────────────────────────────────────────────────
    async def help_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        lang = await _get_user_lang(uid)
        if lang == "auto":
            lang = "en"
        await update.message.reply_text(HELP_TEXT.get(lang, HELP_TEXT["en"]), parse_mode="Markdown")

    # ── /language ─────────────────────────────────────────────────────────────
    async def language_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        current = await _get_user_lang(uid)
        prompt = (
            f"🌍 *Select your preferred language / ቋንቋ ይምረጡ*\n"
            f"(Currently: `{current}`)"
        )
        await update.message.reply_text(prompt, parse_mode="Markdown", reply_markup=_build_language_keyboard())

    async def language_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        data = query.data or ""
        if data.startswith("setlang_"):
            code = data.replace("setlang_", "")
            uid = query.from_user.id
            await _set_user_lang(uid, code)
            confirmation = LANGUAGE_CONFIRMED.get(code, f"✅ Language set to *{code}*")
            await query.edit_message_text(confirmation, parse_mode="Markdown")

            # Follow up with welcome & quick navigation in the newly chosen language
            effective_lang = "en" if code == "auto" else code
            quick_nav = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("💼 Browse Jobs", callback_data="jobs_more"),
                    InlineKeyboardButton("🔔 Job Alerts", callback_data="jobs_alert_sub"),
                ],
                [
                    InlineKeyboardButton("🌐 Switch Language", callback_data="change_lang"),
                ]
            ])
            action_prompt = (
                f"{WELCOME.get(effective_lang, WELCOME['en'])}\n\n"
                f"💡 _Tip: You can ask course questions directly, browse /jobs, or type /help for all commands._"
            )
            await query.message.reply_text(action_prompt, parse_mode="Markdown", reply_markup=quick_nav)

    async def change_lang_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        uid = query.from_user.id
        current = await _get_user_lang(uid)
        prompt = (
            f"🌍 *Select your preferred language / ቋንቋ ይምረጡ*\n"
            f"(Currently: `{current}`)"
        )
        await query.message.reply_text(prompt, parse_mode="Markdown", reply_markup=_build_language_keyboard())

    # ── /jobs ─────────────────────────────────────────────────────────────────
    async def jobs_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        lang = user_language.get(uid, "en")
        if lang == "auto":
            lang = "en"
        jobs = await _load_jobs(5)
        if not jobs:
            await update.message.reply_text(
                "No jobs available right now." if lang == "en" else "አሁን ምንም ሥራ የለም።"
            )
            return

        for job in jobs:
            text = _format_job(job, lang)
            keyboard = InlineKeyboardMarkup(
                [[InlineKeyboardButton("🔗 Apply", url=job.get("url", "#"))]]
            )
            await update.message.reply_text(text, parse_mode="HTML", reply_markup=keyboard)

        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Load more", callback_data="jobs_more")],
            [InlineKeyboardButton("🔔 Subscribe to Job Alerts", callback_data="jobs_alert_sub")],
        ])
        await update.message.reply_text(
            "Showing 5 latest jobs. Tap below for more or to get instant alerts." if lang == "en"
            else "5 የቅርብ ጊዜ ሥራዎችን ያሳያል። ለተጨማሪ ወይም ማስጠንቀቂያ ለመመዝገብ ከታች ጠቅ ያድርጉ።",
            reply_markup=keyboard,
        )

    async def jobs_more_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        uid = query.from_user.id
        lang = user_language.get(uid, "en")
        if lang == "auto":
            lang = "en"
        jobs = await _load_jobs(10)
        extra = jobs[5:]  # second page
        if not extra:
            await query.message.reply_text(
                "No more jobs at the moment." if lang == "en" else "ተጨማሪ ሥራ የለም።"
            )
            return
        for job in extra:
            text = _format_job(job, lang)
            keyboard = InlineKeyboardMarkup(
                [[InlineKeyboardButton("🔗 Apply", url=job.get("url", "#"))]]
            )
            await query.message.reply_text(text, parse_mode="HTML", reply_markup=keyboard)

    # ── /alerts Callback and Command ──────────────────────────────────────────
    async def jobs_alert_sub_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        uid = query.from_user.id
        chat_id = query.message.chat_id
        lang = user_language.get(uid, "en")

        import redis.asyncio as aioredis
        import json
        import uuid
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        sub_id = str(uuid.uuid4())
        sub_data = {
            "subscription_id": sub_id,
            "user_id": f"tg-{uid}",
            "channel": "telegram",
            "contact": str(chat_id),
            "telegram_chat_id": str(chat_id),
            "keywords": [],
            "language": lang,
        }
        try:
            async with r:
                await r.set(f"job_alert:{sub_id}", json.dumps(sub_data))
        except Exception as exc:
            logger.error("Error saving alert sub: %s", exc)

        confirm_msg = (
            "🔔 <b>Job Alerts Activated!</b>\n\nYou will receive instant alerts here on Telegram whenever new jobs are posted.\nType <code>/alerts off</code> to stop."
            if lang == "en"
            else "🔔 <b>የሥራ ማስጠንቀቂያ በርቷል!</b>\n\nአዳዲስ ክፍት ሥራዎች ሲለጠፉ ወዲያውኑ እዚህ በቴሌግራም መልእክት ይደርስዎታል።\nለማቆም <code>/alerts off</code> ይፃፉ።"
        )
        await query.message.reply_text(confirm_msg, parse_mode="HTML")

    async def alerts_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        chat_id = update.effective_chat.id
        lang = user_language.get(uid, "en")
        args = ctx.args or []
        arg_str = " ".join(args).strip().lower()

        import redis.asyncio as aioredis
        import json
        import uuid
        import html
        r = aioredis.from_url(settings.redis_url, decode_responses=True)

        if arg_str in ("off", "stop", "disable", "unsubscribe"):
            try:
                async with r:
                    keys = await r.keys("job_alert:*")
                    for k in keys:
                        v = await r.get(k)
                        if v and str(chat_id) in v:
                            await r.delete(k)
                await update.message.reply_text(
                    "❌ Job alerts turned off." if lang == "en" else "❌ የሥራ ማስጠንቀቂያ አገልግሎት ጠፍቷል።"
                )
            except Exception as exc:
                logger.error("Error disabling alerts: %s", exc)
            return

        keywords = [a for a in args if a]
        sub_id = str(uuid.uuid4())
        sub_data = {
            "subscription_id": sub_id,
            "user_id": f"tg-{uid}",
            "channel": "telegram",
            "contact": str(chat_id),
            "telegram_chat_id": str(chat_id),
            "keywords": keywords,
            "language": lang,
        }
        try:
            async with r:
                await r.set(f"job_alert:{sub_id}", json.dumps(sub_data))
        except Exception as exc:
            logger.error("Error registering job alert: %s", exc)

        kw_display = ", ".join(keywords) if keywords else "All Jobs"
        reply_msg = (
            f"🔔 <b>Job Alerts Activated!</b>\n\n"
            f"Target Filters: <b>{html.escape(kw_display)}</b>\n"
            f"You will receive immediate alerts when matching jobs are indexed.\n"
            f"Type <code>/alerts off</code> anytime to unsubscribe."
            if lang == "en"
            else
            f"🔔 <b>የሥራ ማስጠንቀቂያ በርቷል!</b>\n\n"
            f"የተመረጡ ቃላት: <b>{html.escape(kw_display)}</b>\n"
            f"ተዛማጅ ሥራ ሲገኝ ወዲያውኑ ማስታወቂያ ይደርስዎታል።\n"
            f"ለማጥፋት <code>/alerts off</code> ይፃፉ።"
        )
        await update.message.reply_text(reply_msg, parse_mode="HTML")

    # ── /operator Command ─────────────────────────────────────────────────────
    async def operator_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        chat_id = update.effective_chat.id
        from utils.notifications import set_operator_chat_id
        ok = await set_operator_chat_id(str(chat_id))
        if ok:
            await update.message.reply_text(
                f"🎧 <b>Live Operator Channel Connected!</b>\n\n"
                f"This chat (ID: <code>{chat_id}</code>) is now registered as the active operator channel.\n\n"
                f"You will receive live real-time alerts for:\n"
                f"• 📄 Job candidate applications\n"
                f"• ♿ Interview accessibility accommodations\n"
                f"• 🚨 Learner escalations & live support",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text("Could not set operator channel. Check Redis connection.")

    # ── /status Command ───────────────────────────────────────────────────────
    async def status_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        chat_id = update.effective_chat.id
        lang = user_language.get(uid, "en")

        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        is_subbed = False
        try:
            async with r:
                keys = await r.keys("job_alert:*")
                for k in keys:
                    v = await r.get(k)
                    if v and str(chat_id) in v:
                        is_subbed = True
                        break
        except Exception:
            pass

        alert_status = "Active 🔔" if is_subbed else "Not subscribed (type /alerts to enable)"
        text = (
            f"📊 <b>Savanna Assistant Status</b>\n\n"
            f"• <b>Status:</b> 🟢 Operational (Online)\n"
            f"• <b>Language:</b> <code>{lang.upper()}</code>\n"
            f"• <b>Chat ID:</b> <code>{chat_id}</code>\n"
            f"• <b>Job Alerts:</b> {alert_status}\n"
            f"• <b>Bot:</b> @InkluwBot\n\n"
            f"Type /help to see all available commands."
        )
        await update.message.reply_text(text, parse_mode="HTML")

    # ── /escalate ─────────────────────────────────────────────────────────────
    async def escalate_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        lang = user_language.get(uid, "en")
        if lang == "auto":
            lang = "en"
        widget_url = f"{settings.api_base_url}/widget/iframe.html"
        template = ESCALATE_MSG.get(lang, ESCALATE_MSG["en"])
        msg = template.format(url=widget_url)

        # Fire escalation API
        import httpx
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{settings.api_base_url}/escalate",
                    json={
                        "session_id": f"tg-{uid}",
                        "user_id": str(uid),
                        "reason": "User requested escalation via Telegram /escalate command",
                    },
                )
                data = resp.json()
                ticket_id = data.get("ticket_id", "N/A")
                msg += f"\n\nTicket ID: `{ticket_id}`"
        except Exception as exc:
            logger.warning("Could not call escalate API from bot: %s", exc)

        await update.message.reply_text(msg, parse_mode="Markdown")

    # ── /accommodate ConversationHandler ─────────────────────────────────────
    async def accom_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
        uid = update.effective_user.id
        lang = user_language.get(uid, "en")
        if lang == "auto":
            lang = "en"
        ctx.user_data["lang"] = lang
        prompt = (
            "Please enter your *full name* and *email address* (separated by a comma).\nExample: Jane Doe, jane@example.com"
            if lang == "en"
            else "እባክዎ *ሙሉ ስምዎን* እና *ኢሜይልዎን* ያስገቡ (በሰረዝ ይለዩ)።\nምሳሌ: ጄን ዶ, jane@example.com"
        )
        await update.message.reply_text(prompt, parse_mode="Markdown")
        return ACCOM_NAME_EMAIL

    async def accom_name_email(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
        lang = ctx.user_data.get("lang", "en")
        text = update.message.text.strip()
        parts = [p.strip() for p in text.split(",", 1)]
        if len(parts) != 2:
            await update.message.reply_text(
                "Please use format: Name, email@example.com"
                if lang == "en"
                else "እባክዎ ቅርጹን ይጠቀሙ: ስም, email@example.com"
            )
            return ACCOM_NAME_EMAIL
        ctx.user_data["name"] = parts[0]
        ctx.user_data["email"] = parts[1]

        types_en = "extra time | screen reader | sign language interpreter | wheelchair access | other"
        types_am = "ተጨማሪ ጊዜ | ስክሪን አንባቢ | የምልክት ቋንቋ አስተርጓሚ | የእጀ-ወንበር መዳረሻ | ሌላ"
        prompt = (
            f"What type of accommodation do you need?\n({types_en})"
            if lang == "en"
            else f"ምን ዓይነት ተደራሽነት ያስፈልጎዎታል?\n({types_am})"
        )
        await update.message.reply_text(prompt)
        return ACCOM_TYPE

    async def accom_type(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
        lang = ctx.user_data.get("lang", "en")
        ctx.user_data["accom_type"] = update.message.text.strip()
        prompt = (
            "Any additional notes? (interview date, special requirements, etc.) — or type *skip*."
            if lang == "en"
            else "ተጨማሪ ማስታወሻዎች? (የቃለ-ምልልስ ቀን, ልዩ መስፈርቶች) — ወይም *skip* ይፃፉ።"
        )
        await update.message.reply_text(prompt, parse_mode="Markdown")
        return ACCOM_NOTES

    async def accom_notes(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
        lang = ctx.user_data.get("lang", "en")
        notes_text = update.message.text.strip()
        notes = None if notes_text.lower() in ("skip", "ዝለል") else notes_text

        import httpx
        payload = {
            "name": ctx.user_data.get("name", ""),
            "email": ctx.user_data.get("email", ""),
            "accommodation_type": ctx.user_data.get("accom_type", "other"),
            "notes": notes,
            "language": lang,
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(f"{settings.api_base_url}/accommodate", json=payload)
                data = resp.json()
                ref = data.get("reference", "N/A")
                msg = data.get("message", "Request submitted.")
                steps = "\n".join(f"• {s}" for s in data.get("next_steps", []))
                await update.message.reply_text(
                    f"✅ {msg}\n\n*Next steps:*\n{steps}\n\nRef: `{ref}`",
                    parse_mode="Markdown",
                )
        except Exception as exc:
            logger.error("Accommodation API call failed: %s", exc)
            await update.message.reply_text(
                "Sorry, there was an error submitting your request. Please try again."
                if lang == "en"
                else "ይቅርታ፣ ጥያቄዎን ማስገባት አልተቻለም። እንደገና ይሞክሩ።"
            )
        ctx.user_data.clear()
        return ConversationHandler.END

    async def accom_cancel(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
        lang = ctx.user_data.get("lang", "en")
        await update.message.reply_text(
            "Accommodation request cancelled." if lang == "en" else "ጥያቄው ተሰርዟል።"
        )
        ctx.user_data.clear()
        return ConversationHandler.END

    # ── Regular message handler ───────────────────────────────────────────────
    async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        uid = update.effective_user.id
        pref = user_language.get(uid, "auto")
        text = update.message.text or ""

        if pref == "auto":
            try:
                from routers.chat import _detect_language
                lang = _detect_language(text)
            except Exception:
                lang = "en"
        else:
            lang = pref

        # Show typing action
        await ctx.bot.send_chat_action(
            chat_id=update.effective_chat.id, action="typing"
        )
        reply = await _chat_api(text, lang)
        await update.message.reply_text(reply, parse_mode="Markdown")

    # ── Build application ─────────────────────────────────────────────────────
    app = (
        ApplicationBuilder()
        .token(token)
        .build()
    )

    accommodation_handler = ConversationHandler(
        entry_points=[CommandHandler("accommodate", accom_start)],
        states={
            ACCOM_NAME_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, accom_name_email)],
            ACCOM_TYPE:       [MessageHandler(filters.TEXT & ~filters.COMMAND, accom_type)],
            ACCOM_NOTES:      [MessageHandler(filters.TEXT & ~filters.COMMAND, accom_notes)],
        },
        fallbacks=[CommandHandler("cancel", accom_cancel)],
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("language", language_cmd))
    app.add_handler(CommandHandler("status", status_cmd))
    app.add_handler(CommandHandler("jobs", jobs_cmd))
    app.add_handler(CommandHandler("alerts", alerts_cmd))
    app.add_handler(CommandHandler("subscribe", alerts_cmd))
    app.add_handler(CommandHandler("operator", operator_cmd))
    app.add_handler(CommandHandler("escalate", escalate_cmd))
    app.add_handler(accommodation_handler)
    app.add_handler(CallbackQueryHandler(jobs_more_callback, pattern="^jobs_more$"))
    app.add_handler(CallbackQueryHandler(jobs_alert_sub_callback, pattern="^jobs_alert_sub$"))
    app.add_handler(CallbackQueryHandler(language_callback, pattern="^setlang_"))
    app.add_handler(CallbackQueryHandler(change_lang_callback, pattern="^change_lang$"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    return app


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    # Silence verbose HTTP logs to prevent bot token leakage in stdout/syslog
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

    # Add the api/ directory to sys.path so local imports resolve
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)

    from config import get_settings as _gs
    s = _gs()
    token = s.telegram_bot_token
    if not token or token == "placeholder" or token.startswith("sk-") or len(token) < 20:
        logger.warning(
            "TELEGRAM_BOT_TOKEN is not configured or is a placeholder. "
            "Telegram bot running in mock/idle mode to ensure Docker Compose boots cleanly. "
            "Set a valid TELEGRAM_BOT_TOKEN in .env to connect to live Telegram."
        )
        import time
        while True:
            time.sleep(3600)

    logger.info("Starting Savanna Telegram bot (polling mode)…")
    while True:
        try:
            application = build_application(token)
            application.run_polling(
                allowed_updates=["message", "callback_query"],
                bootstrap_retries=-1,
                drop_pending_updates=False,
            )
        except Exception as exc:
            logger.warning(
                "Telegram bot polling encountered an error: %s. "
                "Retrying connection in 5 seconds...",
                exc,
            )
            import time
            time.sleep(5)


if __name__ == "__main__":
    main()
