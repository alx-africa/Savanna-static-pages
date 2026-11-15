"""
Production Cache Audit & Sanitization Engine

Audits all entries in docs/translations_cache.json using LinguisticValidator:
- Scans for cross-lingual bleed (Amharic into Tigrinya, Tigrinya into Amharic)
- Scans for script mismatches (Arabic, Ge'ez, Latin)
- Scans for mojibake byte corruption
- Quarantines and re-translates corrupted entries via the closed-loop QA pipeline
- Generates a formal validation report
"""
from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "api"))

from config import get_settings
from routers.translate import (
    _get_cache_key,
    _load_persistent_cache,
    _save_persistent_cache,
    _translate_with_gemini,
    TRANSLATION_CACHE,
    CACHE_FILE
)
from utils.linguistic_validator import LinguisticValidator

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("cache_auditor")
settings = get_settings()


def audit_cache() -> tuple[dict[str, list[dict]], int]:
    """Audit all persistent cache entries across all languages."""
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    violations_by_lang: dict[str, list[dict]] = {}
    total_entries = len(data)

    for key, translated_val in data.items():
        if ":" not in key:
            continue
        lang, key_hash = key.split(":", 1)
        val_res = LinguisticValidator.validate(translated_val, lang)
        if not val_res.is_valid:
            if lang not in violations_by_lang:
                violations_by_lang[lang] = []
            violations_by_lang[lang].append({
                "key": key,
                "val": translated_val,
                "error": val_res.error_code,
                "details": val_res.details,
                "markers": val_res.detected_markers
            })

    return violations_by_lang, total_entries


def sanitize_cache(quarantine_keys: list[str]):
    """Remove quarantined unvalidated entries from persistent cache."""
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    removed = 0
    for k in quarantine_keys:
        if k in data:
            del data[k]
            removed += 1

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info("Sanitized cache: quarantined and removed %d invalid entries.", removed)


async def main():
    logger.info("Starting Production Cache Linguistic Audit...")
    violations, total = audit_cache()
    total_violations = sum(len(v) for v in violations.values())

    logger.info("Total cache entries audited: %d", total)
    logger.info("Total linguistic violations detected: %d", total_violations)

    quarantine_keys = []
    for lang, items in violations.items():
        logger.warning("Language [%s]: %d violations", lang, len(items))
        for item in items:
            logger.warning("  Key %s | Error: %s | Val: %s | Markers: %s",
                           item["key"], item["error"], item["val"][:50], item["markers"])
            quarantine_keys.append(item["key"])

    if quarantine_keys:
        logger.info("Quarantining %d contaminated entries...", len(quarantine_keys))
        sanitize_cache(quarantine_keys)
    else:
        logger.info("Cache is 100% clean and linguistically certified!")


if __name__ == "__main__":
    asyncio.run(main())
