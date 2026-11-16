"""
Privacy and PII (Personally Identifiable Information) protection utilities.
Provides deterministic redaction and masking for logs, analytics, and telemetry
to comply with GDPR, FERPA, and ethical AI standards.
"""
from __future__ import annotations

import re
from typing import Optional


def mask_email(email: Optional[str]) -> str:
    """Mask an email address for privacy-safe logging (e.g. j***n@example.com)."""
    if not email or "@" not in email:
        return "[REDACTED_EMAIL]"
    parts = email.strip().split("@", 1)
    user, domain = parts[0], parts[1]
    if len(user) <= 2:
        masked_user = user[0] + "***"
    else:
        masked_user = user[0] + "***" + user[-1]
    return f"{masked_user}@{domain}"


def mask_name(name: Optional[str]) -> str:
    """Mask a person's name for privacy-safe logging (e.g. J***n D***e)."""
    if not name:
        return "[REDACTED_NAME]"
    words = name.strip().split()
    masked_words = []
    for w in words:
        if len(w) <= 2:
            masked_words.append(w[0] + "*")
        else:
            masked_words.append(w[0] + "***" + w[-1])
    return " ".join(masked_words)


def mask_phone(phone: Optional[str]) -> str:
    """Mask a phone number for privacy-safe logging (e.g. +251******89)."""
    if not phone:
        return "[N/A]"
    clean = re.sub(r"[\s\-\(\)]", "", phone.strip())
    if len(clean) <= 4:
        return "[REDACTED_PHONE]"
    return clean[:4] + "*" * (len(clean) - 6) + clean[-2:]
