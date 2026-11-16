"""
Unified notifications helper — sends alerts via Telegram and SMS to operators and learners.
Supports dynamic operator chat registration in Redis, HTML parse mode, and graceful fallback.
"""
from __future__ import annotations

import html
import logging
import os
from typing import Optional

import httpx
import redis.asyncio as aioredis

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def get_operator_chat_id() -> Optional[str]:
    """
    Get configured operator chat ID from:
    1. Environment variable ESCALATION_OPERATOR_CHAT_ID
    2. Redis key 'operator_chat_id' (dynamically set via Telegram bot /operator command)
    """
    env_id = os.getenv("ESCALATION_OPERATOR_CHAT_ID")
    if env_id and env_id.strip():
        return env_id.strip()

    try:
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        async with r:
            redis_id = await r.get("operator_chat_id")
            if redis_id and redis_id.strip():
                return redis_id.strip()
    except Exception as exc:
        logger.debug("Could not read operator_chat_id from Redis: %s", exc)

    return None


async def set_operator_chat_id(chat_id: str) -> bool:
    """Store dynamically registered operator chat ID in Redis."""
    try:
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        async with r:
            await r.set("operator_chat_id", chat_id)
            return True
    except Exception as exc:
        logger.error("Failed to store operator_chat_id in Redis: %s", exc)
        return False


async def send_telegram_direct(chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
    """Send a direct Telegram message to a given chat ID."""
    token = settings.telegram_bot_token
    if not token:
        logger.warning("Telegram bot token not configured; message not sent to chat %s", chat_id)
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": False,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info("Telegram notification sent successfully to chat %s", chat_id)
                return True
            logger.warning("Telegram send failed (HTTP %s): %s", resp.status_code, resp.text)
            return False
    except Exception as exc:
        logger.error("Failed to send Telegram message to chat %s: %s", chat_id, exc)
        return False


async def notify_operator_telegram(text: str, parse_mode: str = "HTML") -> bool:
    """
    Send an alert to the operator channel (environment variable or Redis registered).
    """
    chat_id = await get_operator_chat_id()
    if not chat_id:
        logger.info("[OPERATOR NOTIFICATION - NO CHAT_ID CONFIGURED]\n%s", text)
        return False

    return await send_telegram_direct(chat_id, text, parse_mode=parse_mode)
