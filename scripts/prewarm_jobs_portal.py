"""
Targeted Pre-Warming for Job Searching Portal: pages/jobs-portal.html
Translates all 57 unique job portal strings with workforce & career pedagogical context
across all 7 African & global languages into docs/translations_cache.json.
"""
from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "api"))

from bs4 import BeautifulSoup
from config import get_settings
from routers.translate import (
    LANGUAGE_NAMES,
    _get_cache_key,
    _load_persistent_cache,
    _save_persistent_cache,
    _translate_with_gemini,
    TRANSLATION_CACHE,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("prewarm_jobs")
settings = get_settings()

TARGET_LANGUAGES = ["am", "om", "ti", "so", "ar", "sw", "fr"]

def get_job_strings() -> list[str]:
    html_path = BASE_DIR / "pages" / "jobs-portal.html"
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    for s in soup(["script", "style", "code", "pre"]):
        s.decompose()

    strings: list[str] = []
    for s in soup.stripped_strings:
        cleaned = s.strip()
        if any(c.isalpha() for c in cleaned) and len(cleaned) >= 2 and cleaned not in strings:
            strings.append(cleaned)
    return strings


async def prewarm_lang(lang: str, strings: list[str]):
    lang_name = LANGUAGE_NAMES.get(lang, lang)
    logger.info("Pre-warming Jobs Portal for %s (%s)...", lang_name, lang)
    missing = [s for s in strings if _get_cache_key(lang, s) not in TRANSLATION_CACHE]
    logger.info("Missing strings for %s: %d / %d", lang, len(missing), len(strings))
    if not missing:
        return

    chunk_size = 10
    chunks = [missing[i:i + chunk_size] for i in range(0, len(missing), chunk_size)]

    for idx, chunk in enumerate(chunks):
        logger.info("  Chunk %d/%d (%d strings)...", idx + 1, len(chunks), len(chunk))
        res = await _translate_with_gemini(
            texts=chunk,
            target_lang=lang,
            source_lang="en",
            api_key=settings.gemini_api_key.strip(),
            model=settings.gemini_model or "gemini-3.5-flash-lite",
            site_type="jobs",
            domain="jobs-portal.html",
        )
        if res:
            for orig, translated in res.items():
                TRANSLATION_CACHE[_get_cache_key(lang, orig)] = translated
            _save_persistent_cache()
            logger.info("  Saved %d job translations to cache.", len(res))
        await asyncio.sleep(2.0)


async def main():
    _load_persistent_cache()
    strings = get_job_strings()
    logger.info("Extracted %d unique strings from jobs-portal.html.", len(strings))

    for lang in TARGET_LANGUAGES:
        await prewarm_lang(lang, strings)
        await asyncio.sleep(2.0)

    logger.info("All Job Portal strings pre-warmed! Cache size: %d", len(TRANSLATION_CACHE))


if __name__ == "__main__":
    asyncio.run(main())
