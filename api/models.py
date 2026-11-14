"""Pydantic request / response schemas shared across all routers."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ─── Language Specification ──────────────────────────────────────────────────
# Comprehensive 8-language matrix for Ethiopia and regional refugee populations
SupportedLanguage = Literal[
    "en",    # English (academic, South Sudan, Kenya)
    "am",    # Amharic (አማርኛ - Federal working language)
    "om",    # Afaan Oromo (Afaan Oromoo - largest national demographic)
    "ti",    # Tigrinya (ትግርኛ - Tigray & Eritrean refugees)
    "so",    # Somali (Soomaali - Somali region & refugees)
    "ar",    # Arabic (العربية - Sudanese, South Sudanese, Yemeni refugees, RTL)
    "sw",    # Kiswahili (DRC, Kenya, Uganda refugees)
    "fr",    # French (Français - DRC, Burundian refugees)
    "auto",  # Automatic zero-shot language detection
]


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    language: str = "en"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096)
    language: SupportedLanguage | str = "auto"
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    simple_mode: bool = Field(default=False, description="Plain-language simple mode for cognitive accessibility")


class Citation(BaseModel):
    id: str
    source: str
    excerpt: str
    url: Optional[str] = None


class ChatResponse(BaseModel):
    id: str
    text: str
    language: str
    citations: list[Citation] = []
    provider: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ethiopian_date: Optional[str] = None


# ─── Escalation ──────────────────────────────────────────────────────────────

class EscalateRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    reason: Optional[str] = None
    sdp_offer: Optional[str] = None      # WebRTC SDP offer for screen share


class EscalateResponse(BaseModel):
    ticket_id: str
    operator_notified: bool
    sdp_answer: Optional[str] = None
    message: str


# ─── Jobs ─────────────────────────────────────────────────────────────────────

class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str                             # full-time | part-time | contract | remote
    description: str
    skills: list[str] = []
    posted_at: datetime
    url: Optional[str] = None


class JobAlertRequest(BaseModel):
    user_id: str
    channel: Literal["telegram", "sms", "both"] = "both"
    contact: str                          # Telegram chat_id or phone number
    keywords: list[str] = []
    language: SupportedLanguage | str = "en"


class JobAlertResponse(BaseModel):
    subscription_id: str
    message: str


# ─── Accommodation ───────────────────────────────────────────────────────────

class AccommodationRequest(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    accommodation_type: str = Field(
        ...,
        description="e.g. extra time, screen reader, sign language interpreter"
    )
    interview_date: Optional[str] = None
    notes: Optional[str] = None
    language: SupportedLanguage | str = "en"


class AccommodationResponse(BaseModel):
    reference: str
    message: str
    next_steps: list[str] = []
    ethiopian_date: Optional[str] = None


# ─── SMS webhook ─────────────────────────────────────────────────────────────

class SMSInbound(BaseModel):
    from_: str = Field(alias="from")
    to: str
    text: str
    date: Optional[str] = None
    id: Optional[str] = None

    model_config = {"populate_by_name": True}


# ─── Vision / Image Description ──────────────────────────────────────────────

class VisualBreakdown(BaseModel):
    primary_subject: str
    visual_elements: list[str] = []
    pedagogical_context: str
    composition_and_palette: str


class DescribeImageRequest(BaseModel):
    url: Optional[str] = None
    filename: Optional[str] = None
    language: SupportedLanguage | str = "auto"
    context: Optional[str] = None


class DescribeImageResponse(BaseModel):
    id: str
    description: str
    language: str
    source: str
    ai_provider: str = "savanna-ai-vision"
    visual_elements: list[str] = []
    breakdown: Optional[VisualBreakdown] = None
    ethiopian_date: Optional[str] = None


# ─── Health ──────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    ai_provider: str
