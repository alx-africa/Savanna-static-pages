"""
Course Content Localization & Cache Pre-Warming Engine
Extracts full curriculum lessons, navigation, and activity items from course pages
and generates culturally authentic, pedagogical translations for all 7 African & global languages.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from pathlib import Path

# Add api/ to sys.path
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
logger = logging.getLogger("prewarm")
settings = get_settings()

TARGET_LANGUAGES = ["am", "om", "ti", "so", "ar", "sw", "fr"]

def extract_strings_from_file(file_path: Path) -> list[str]:
    """Extract unique readable text strings from an HTML file."""
    if not file_path.exists():
        return []
    soup = BeautifulSoup(file_path.read_text(encoding="utf-8"), "html.parser")
    
    # Remove script, style, code
    for tag in soup(["script", "style", "code", "pre", "noscript"]):
        tag.decompose()
        
    extracted: list[str] = []
    
    # Prioritize course content section if present
    course_div = soup.find(id="curriculum_navigation_content") or soup.find(class_="formatted-content") or soup.find("main")
    if course_div:
        for s in course_div.stripped_strings:
            cleaned = s.strip()
            if any(c.isalpha() for c in cleaned) and len(cleaned) >= 2:
                if cleaned not in extracted:
                    extracted.append(cleaned)
                    
    # Also extract the rest of the body
    if soup.body:
        for s in soup.body.stripped_strings:
            cleaned = s.strip()
            if any(c.isalpha() for c in cleaned) and len(cleaned) >= 2:
                if cleaned not in extracted:
                    extracted.append(cleaned)
                    
    return extracted


async def prewarm_language(lang: str, strings: list[str]) -> int:
    """Pre-warm translations for a specific target language."""
    lang_name = LANGUAGE_NAMES.get(lang, lang)
    logger.info("=== Pre-warming %s (%s) for %d strings ===", lang_name, lang, len(strings))
    
    missing: list[str] = []
    for s in strings:
        ck = _get_cache_key(lang, s)
        if ck not in TRANSLATION_CACHE:
            missing.append(s)
            
    logger.info("Missing uncached strings for %s: %d / %d", lang, len(missing), len(strings))
    if not missing:
        return 0
        
    chunk_size = 30
    chunks = [missing[i:i + chunk_size] for i in range(0, len(missing), chunk_size)]
    
    tasks = [
        _translate_with_gemini(
            texts=chunk,
            target_lang=lang,
            source_lang="en",
            api_key=settings.gemini_api_key.strip(),
            model=settings.gemini_model or "gemini-3.5-flash-lite",
        )
        for chunk in chunks
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    added = 0
    for res in results:
        if isinstance(res, dict):
            for orig, translated in res.items():
                ck = _get_cache_key(lang, orig)
                TRANSLATION_CACHE[ck] = translated
                added += 1
        elif isinstance(res, Exception):
            logger.warning("Error in translation chunk for %s: %s", lang, res)
            
    _save_persistent_cache()
    logger.info("Successfully added %d translations for %s", added, lang)
    return added


async def main():
    _load_persistent_cache()
    logger.info("Initial cache count: %d", len(TRANSLATION_CACHE))
    
    pages = [
        BASE_DIR / "pages" / "concept-with-navigation.html",
        BASE_DIR / "pages" / "homepage-v1-paced.html",
    ]
    
    all_strings: list[str] = []
    for page in pages:
        extracted = extract_strings_from_file(page)
        logger.info("Extracted %d strings from %s", len(extracted), page.name)
        for s in extracted:
            if s not in all_strings:
                all_strings.append(s)
                
    logger.info("Total unique strings across curriculum pages: %d", len(all_strings))
    
    # Process languages sequentially or in small parallel groups
    for lang in TARGET_LANGUAGES:
        await prewarm_language(lang, all_strings)
        
    logger.info("==================================================")
    logger.info("Final Cache Count: %d entries", len(TRANSLATION_CACHE))
    logger.info("Pre-warming complete!")


if __name__ == "__main__":
    asyncio.run(main())
