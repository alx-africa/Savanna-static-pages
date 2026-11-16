"""
Production-Grade Linguistic Validator & Language Identification Quality Gate

Ensures linguistic fidelity, prevents cross-lingual bleed (e.g. Amharic leaking
into Tigrinya, or English echoing verbatim into target languages), enforces
Unicode script integrity, and flags mojibake corruption.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ValidationResult:
    is_valid: bool
    status: str
    error_code: Optional[str] = None
    details: Optional[str] = None
    detected_markers: Optional[list[str]] = None


class LinguisticValidator:
    """Production quality gate for machine translation and LLM localization outputs."""

    # Unicode script ranges
    GEEZ_PATTERN = re.compile(r"[\u1200-\u137F]")
    ARABIC_PATTERN = re.compile(r"[\u0600-\u06FF]")
    LATIN_PATTERN = re.compile(r"[a-zA-Z\u00C0-\u024F]")

    # Mojibake signature patterns (UTF-8 bytes decoded as Latin-1/Windows-1252)
    MOJIBAKE_PATTERN = re.compile(r"[\u00C2-\u00DF][\u0080-\u00BF]|[ÙØÃÂ][\u0080-\u00BF]")

    # Exclusive Amharic grammatical markers (do NOT exist in authentic Tigrinya)
    AMHARIC_EXCLUSIVE_WORDS = [
        "ነው", "ናት", "ናቸው", "ነበረ", "ነበር",  # Copula forms
        "እና",                                # Conjunction "and" (Tigrinya uses -ን or ምስ)
        "ምን", "የት", "ለምን", "እንዴት",            # Interrogatives (Tigrinya: እንታይ, ኣበይ, ስለምንታይ, ከመይ)
        "እንዲሁም", "በጣም", "አስፈለገ", "ትክክለኛ",    # Vocabulary
        "የስራ", "የተማሪ", "የክፍል", "የኮርስ",        # Nouns with Amharic possessive prefix የ-
        "ረዳት", "ረዳቶች",                        # Assistant/assistants (Tigrinya uses ረዳኢ / ረዳእቲ)
    ]
    AMHARIC_PREFIX_REGEX = re.compile(r"(?:^|\s)የ(?:ሚ|ማይ|[\u1200-\u137F]{3,})")
    AMHARIC_PHRASES = [
        "ምን ማለት ነው",
        "ማለት ምን ማለት ነው",
        "የት ነው የሚሰሩት",
        "ማለት ነው",
        "የመረጡባቸው",
        "የሚሰሩት",
    ]

    # Exclusive Tigrinya grammatical markers
    TIGRINYA_EXCLUSIVE_WORDS = [
        "ናይ",                                # Independent genitive particle (Tigrinya possessive)
        "እዩ", "እያ", "እዮም", "ነይሩ", "ነይራ",    # Copula forms
        "እንታይ", "ኣበይ", "ስለምንታይ", "ከመይ",        # Interrogatives
        "ምስ",                                # Conjunction particle "with/and"
        "ረዳኢ", "ረዳእቲ",                        # Assistant / assistants
        "ዕማም", "ዕማማት",                        # Tasks
        "ብሓቂ", "ደጊምሲ", "ምስትንታን",            # Vocabulary
    ]
    TIGRINYA_PREFIX_REGEX = re.compile(r"(?:^|\s)(?:ናይ\s+|ዝ[\u1200-\u137F]{2,}|ዘይ[\u1200-\u137F]{2,})")

    @classmethod
    def validate(
        cls,
        text: str,
        target_lang: str,
        source_lang: str = "en",
        source_text: Optional[str] = None,
    ) -> ValidationResult:
        """Validate a single translated string against target language requirements."""
        if not text or not text.strip():
            return ValidationResult(is_valid=False, status="EMPTY_STRING", error_code="EMPTY")

        cleaned = text.strip()

        # 1. Mojibake Detection
        if cls.MOJIBAKE_PATTERN.search(cleaned):
            return ValidationResult(
                is_valid=False,
                status="CORRUPTED_MOJIBAKE",
                error_code="MOJIBAKE",
                details="Detected UTF-8 decoded as Latin-1/Windows-1252 artifact",
            )

        # 2. Script Fidelity Verification
        if target_lang in ("am", "ti"):
            if not cls.GEEZ_PATTERN.search(cleaned):
                return ValidationResult(
                    is_valid=False,
                    status="SCRIPT_MISMATCH",
                    error_code="EXPECTED_GEEZ_SCRIPT",
                    details=f"Target {target_lang} requires Ge'ez script, but none was found",
                )
        elif target_lang == "ar":
            if not cls.ARABIC_PATTERN.search(cleaned):
                return ValidationResult(
                    is_valid=False,
                    status="SCRIPT_MISMATCH",
                    error_code="EXPECTED_ARABIC_SCRIPT",
                    details="Target Arabic requires Arabic script, but none was found",
                )
        elif target_lang in ("om", "so", "sw", "fr", "en"):
            # Should not contain Ge'ez or Arabic characters
            if cls.GEEZ_PATTERN.search(cleaned) or cls.ARABIC_PATTERN.search(cleaned):
                return ValidationResult(
                    is_valid=False,
                    status="SCRIPT_MISMATCH",
                    error_code="UNEXPECTED_NON_LATIN_SCRIPT",
                    details=f"Target {target_lang} uses Latin script, but Ge'ez/Arabic found",
                )

        # 3. Cross-Lingual Bleed: Tigrinya (ti) Quality Gate
        if target_lang == "ti":
            am_detected = []
            ti_detected = []

            # Check phrases
            for phrase in cls.AMHARIC_PHRASES:
                if phrase in cleaned:
                    am_detected.append(phrase)

            # Check word tokens
            tokens = re.split(r"[\s፡፣፤፦]+", cleaned)
            for token in tokens:
                token_stripped = token.strip("?:!.,()[]\"'«»")
                if token_stripped in cls.AMHARIC_EXCLUSIVE_WORDS:
                    am_detected.append(token_stripped)
                if token_stripped in cls.TIGRINYA_EXCLUSIVE_WORDS:
                    ti_detected.append(token_stripped)

            # Check Amharic prefixes
            if cls.AMHARIC_PREFIX_REGEX.search(cleaned):
                prefix_match = cls.AMHARIC_PREFIX_REGEX.search(cleaned).group().strip()
                # Exclude if it happens to be valid in Tigrinya
                if not prefix_match.startswith("ዝ"):
                    am_detected.append(f"prefix:{prefix_match}")

            # Check Tigrinya prefixes
            if cls.TIGRINYA_PREFIX_REGEX.search(cleaned):
                ti_detected.append(cls.TIGRINYA_PREFIX_REGEX.search(cleaned).group().strip())

            # Evaluate contamination threshold
            if am_detected and len(am_detected) >= len(ti_detected):
                return ValidationResult(
                    is_valid=False,
                    status="CROSS_LINGUAL_BLEED",
                    error_code="AMHARIC_LEAK_INTO_TIGRINYA",
                    details=f"Detected Amharic grammatical markers in Tigrinya translation",
                    detected_markers=am_detected,
                )

        # 4. Cross-Lingual Bleed: Amharic (am) Quality Gate
        if target_lang == "am":
            ti_detected = []
            tokens = re.split(r"[\s፡፣፤፦]+", cleaned)
            for token in tokens:
                token_stripped = token.strip("?:!.,()[]\"'«»")
                if token_stripped in cls.TIGRINYA_EXCLUSIVE_WORDS:
                    ti_detected.append(token_stripped)

            if ti_detected:
                return ValidationResult(
                    is_valid=False,
                    status="CROSS_LINGUAL_BLEED",
                    error_code="TIGRINYA_LEAK_INTO_AMHARIC",
                    details="Detected Tigrinya grammatical markers in Amharic translation",
                    detected_markers=ti_detected,
                )

        # 5. Untranslated Verbatim Echo Check (for longer non-English targets)
        if target_lang != "en" and source_text and len(source_text.strip().split()) >= 4:
            if cleaned.lower() == source_text.strip().lower():
                return ValidationResult(
                    is_valid=False,
                    status="UNTRANSLATED_ECHO",
                    error_code="VERBATIM_COPY",
                    details="Target string matches source string verbatim without translation",
                )

        return ValidationResult(is_valid=True, status="PASSED")
