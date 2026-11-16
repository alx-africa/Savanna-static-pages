"""Job alert scheduler — sends alerts via Telegram and SMS."""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
import httpx
import redis.asyncio as aioredis

from config import get_settings
from channels.sms_handler import send_sms

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


async def _get_redis() -> aioredis.Redis | None:
    try:
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        await r.ping()
        return r
    except Exception as exc:
        logger.warning("Redis unavailable for job alerts: %s", exc)
        return None


def load_jobs() -> list[dict[str, Any]]:
    import httpx

    # 1. Try candidate file locations
    candidates = [
        Path(settings.docs_path) / "jobs" / "jobs.json",
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

    for candidate in candidates:
        if candidate.exists():
            try:
                jobs = json.loads(candidate.read_text(encoding="utf-8"))
                if jobs:
                    return jobs
            except Exception as exc:
                logger.error("Failed to read jobs file from %s: %s", candidate, exc)

    # 2. Try fetching from internal API
    try:
        api_url = f"{settings.api_base_url}/jobs"
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(api_url)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("jobs", [])
    except Exception as exc:
        logger.debug("Could not fetch jobs from API fallback: %s", exc)

    return []


async def load_subscriptions(r: aioredis.Redis) -> list[dict[str, Any]]:
    subscriptions = []
    try:
        keys = await r.keys("job_alert:*")
        for key in keys:
            val = await r.get(key)
            if val:
                try:
                    subscriptions.append(json.loads(val))
                except Exception:
                    pass
    except Exception as exc:
        logger.error("Error loading subscriptions from Redis: %s", exc)
    return subscriptions


def filter_jobs_for_sub(jobs: list[dict[str, Any]], sub: dict[str, Any]) -> list[dict[str, Any]]:
    keywords = [kw.lower() for kw in sub.get("keywords", []) if kw]
    if not keywords:
        return jobs[:3]
    matched = []
    for job in jobs:
        text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('skills', []))}".lower()
        if any(kw in text for kw in keywords):
            matched.append(job)
    return matched[:3]


async def send_telegram_alert(chat_id: str, job: dict[str, Any], lang: str = "en") -> bool:
    if not settings.telegram_bot_token:
        logger.warning("Telegram bot token not configured.")
        return False

    import html
    title = html.escape(str(job.get("title", "")))
    company = html.escape(str(job.get("company", "")))
    location = html.escape(str(job.get("location", "")))
    desc = html.escape(str(job.get("description", "")[:200]))
    url = job.get("url", "#")

    if lang == "am":
        text = (
            f"🔔 <b>አዲስ የሥራ ማስታወቂያ!</b>\n\n"
            f"💼 <b>{title}</b>\n"
            f"🏢 {company} ({location})\n"
            f"📝 {desc}...\n\n"
            f"🔗 <a href='{url}'>ዝርዝሩን ይመልከቱ</a>"
        )
    else:
        text = (
            f"🔔 <b>New Job Opportunity!</b>\n\n"
            f"💼 <b>{title}</b>\n"
            f"🏢 {company} ({location})\n"
            f"📝 {desc}...\n\n"
            f"🔗 <a href='{url}'>View and Apply</a>"
        )

    url_api = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url_api, json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
                "disable_web_page_preview": False
            })
            return resp.status_code == 200
    except Exception as exc:
        logger.error("Failed to send Telegram alert: %s", exc)
        return False


async def send_sms_alert(phone: str, job: dict[str, Any], lang: str = "en") -> bool:
    title = job.get("title", "")[:28]
    company = job.get("company", "")[:18]
    url = job.get("url", "")
    templates = {
        "en": f"NEW JOB: {title} at {company}. Apply: {url}",
        "am": f"አዲስ ሥራ: {title} በ {company}። ማመልከቻ: {url}",
        "om": f"HOJII HAARAA: {title} bakka {company}. Iyyadhu: {url}",
        "ti": f"ሓድሽ ስራሕ: {title} ኣብ {company}። ንምምልካት: {url}",
        "so": f"SHAQO CUSUB: {title} ee {company}. Codso: {url}",
        "ar": f"وظيفة جديدة: {title} في {company}. التقديم: {url}",
        "sw": f"KAZI MPYA: {title} pale {company}. Tuma maombi: {url}",
        "fr": f"NOUVEL EMPLOI: {title} chez {company}. Postuler: {url}",
    }
    msg = templates.get(lang, templates["en"])
    return await send_sms(phone, msg[:160], settings)


async def check_and_send_alerts():
    logger.info("Running job alert check...")
    r = await _get_redis()
    if not r:
        logger.info("Skipping alert check: Redis unavailable.")
        return

    jobs = load_jobs()
    if not jobs:
        logger.info("No jobs found in store.")
        return

    subscriptions = await load_subscriptions(r)
    logger.info("Found %d active job alert subscriptions.", len(subscriptions))

    for sub in subscriptions:
        user_id = sub.get("user_id", "unknown")
        channel = sub.get("channel", "both")
        contact = sub.get("contact", "")
        lang = sub.get("language", "en")
        if not contact:
            continue

        relevant_jobs = filter_jobs_for_sub(jobs, sub)
        for job in relevant_jobs:
            job_id = job.get("id", "")
            sent_key = f"job_sent:{user_id}:{job_id}"
            already_sent = await r.get(sent_key)
            if already_sent:
                continue

            # Determine Telegram and SMS targets
            tg_target = sub.get("telegram_chat_id") or (contact if contact.isdigit() and len(contact) < 12 else None)
            sms_target = sub.get("phone") or (contact if not contact.isdigit() or len(contact) >= 9 else None)

            sent_any = False
            if channel in ("telegram", "both") and tg_target:
                tg_ok = await send_telegram_alert(tg_target, job, lang)
                if tg_ok:
                    sent_any = True
                    logger.info("Sent Telegram job alert %s to %s", job_id, tg_target)

            if channel in ("sms", "both") and sms_target:
                sms_ok = await send_sms_alert(sms_target, job, lang)
                if sms_ok:
                    sent_any = True
                    logger.info("Sent SMS job alert %s to %s", job_id, sms_target)

            if sent_any:
                # Remember sent job for 7 days
                await r.set(sent_key, "1", ex=7 * 86400)


async def main():
    logger.info("Starting Savanna Job Alert Worker (interval: every 6h)...")
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_and_send_alerts, "interval", hours=6, next_run_time=datetime.now(timezone.utc))
    scheduler.start()
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
