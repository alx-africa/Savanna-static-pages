"""
Targeted Pre-Warming for Course Lesson: "The Future of the VA Industry"
Extracts the 88 unique curriculum lesson strings from pages/concept-with-navigation.html
and translates them pedagogically across all 7 African & global languages.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "api"))

from bs4 import BeautifulSoup
from config import get_settings
from routers.translate import (
    LANGUAGE_NAMES,
    _get_cache_key,
    _load_persistent_cache,
    _normalize_text,
    _save_persistent_cache,
    _translate_with_gemini,
    TRANSLATION_CACHE,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("prewarm_lesson")
settings = get_settings()

TARGET_LANGUAGES = ["am", "om", "ti", "so", "ar", "sw", "fr"]

def get_lesson_strings() -> list[str]:
    html_path = BASE_DIR / "pages" / "concept-with-navigation.html"
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    content = soup.find(id="curriculum_navigation_content")
    
    strings: list[str] = []
    for s in content.stripped_strings:
        cleaned = s.strip()
        if any(c.isalpha() for c in cleaned) and len(cleaned) >= 2 and cleaned not in strings:
            strings.append(cleaned)
            
    # Also include the curriculum header switcher & score strings
    curr_header = soup.find(id="student-current-curriculum")
    if curr_header:
        for s in curr_header.stripped_strings:
            cleaned = s.strip()
            if any(c.isalpha() for c in cleaned) and len(cleaned) >= 2 and cleaned not in strings:
                strings.append(cleaned)
                
    return strings


async def prewarm_lang(lang: str, strings: list[str]):
    lang_name = LANGUAGE_NAMES.get(lang, lang)
    logger.info("Translating lesson for %s (%s)...", lang_name, lang)
    
    missing = [s for s in strings if _get_cache_key(lang, s) not in TRANSLATION_CACHE]
    logger.info("Strings to translate for %s: %d", lang, len(missing))
    if not missing:
        return
        
    chunk_size = 8
    chunks = [missing[i:i + chunk_size] for i in range(0, len(missing), chunk_size)]
    
    for idx, chunk in enumerate(chunks):
        logger.info("  Chunk %d/%d (%d strings)...", idx + 1, len(chunks), len(chunk))
        res = await _translate_with_gemini(
            texts=chunk,
            target_lang=lang,
            source_lang="en",
            api_key=settings.gemini_api_key.strip(),
            model=settings.gemini_model or "gemini-3.5-flash-lite",
        )
        if res:
            for orig, translated in res.items():
                ck = _get_cache_key(lang, orig)
                TRANSLATION_CACHE[ck] = translated
            _save_persistent_cache()
            logger.info("  Saved %d translations to cache.", len(res))
        # Small delay between chunks to respect rate limit
        await asyncio.sleep(2.0)


async def main():
    _load_persistent_cache()
    strings = get_lesson_strings()
    logger.info("Extracted %d core curriculum lesson strings.", len(strings))
    
    for lang in TARGET_LANGUAGES:
        await prewarm_lang(lang, strings)
        await asyncio.sleep(3.0)
        
    logger.info("All lesson strings pre-warmed! Cache size: %d", len(TRANSLATION_CACHE))

if __name__ == "__main__":
    asyncio.run(main())
