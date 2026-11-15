"""Pydantic request / response schemas shared across all routers."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Literal, Optional
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
    title: Optional[str] = None


# ─── Level 2 Technical Guide Data Contract ───────────────────────────────────

class AskV1Request(BaseModel):
    question: Optional[str] = None
    message: Optional[str] = None
    language: SupportedLanguage | str = "auto"
    session_id: Optional[str] = None
    simple_mode: bool = False

    def get_query(self) -> str:
        return (self.question or self.message or "").strip()


class AskV1Source(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    source: str = ""
    excerpt: str = ""


class AskV1Response(BaseModel):
    answer: str
    sources: list[AskV1Source] = []
    language: str = "en"
    ethiopian_date: Optional[str] = None


class LessonItem(BaseModel):
    id: Optional[str] = None
    title: str
    html: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None


class ContentV1Request(BaseModel):
    lessons: list[LessonItem] = []


class ContentV1Response(BaseModel):
    status: str = "indexed"
    count: int = 0
    message: str


class EscalationV1Request(BaseModel):
    conversation: list[Any] | str = []
    reason: Optional[str] = "Learner requested tutor help"
    learner_context: Optional[dict[str, Any]] = None
    session_id: Optional[str] = None


class EscalationV1Response(BaseModel):
    ticketId: str
    status: str = "pending"
    message: str = "A tutor will answer here. It may take until morning."
    operator_url: Optional[str] = None


class SMSInboundV1Request(BaseModel):
    from_: str = Field(..., alias="from")
    text: str

    class Config:
        populate_by_name = True


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
    language: Optional[str] = "en"
    learner_context: Optional[dict[str, Any]] = None


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
    translations: dict[str, dict[str, Any]] = Field(default_factory=dict)


class JobAlertRequest(BaseModel):
    user_id: str
    channel: Literal["telegram", "sms", "both"] = "both"
    contact: str                          # Telegram chat_id or phone number
    keywords: list[str] = []
    language: SupportedLanguage | str = "en"


class JobAlertResponse(BaseModel):
    subscription_id: str
    message: str


class JobApplicationRequest(BaseModel):
    applicant_name: str
    email: str
    resume_url: str
    cover_note: Optional[str] = ""
    accommodation_type: Optional[str] = None
    language: Optional[str] = "en"


class JobApplicationResponse(BaseModel):
    application_id: str
    job_id: str
    job_title: str
    applicant_name: str
    email: str
    status: str
    accommodation_reference: Optional[str] = None
    submitted_at: str
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


# ─── Speech (STT & TTS) ───────────────────────────────────────────────────────

class TranscribeResponse(BaseModel):
    text: str
    language: str
    confidence: float = 0.95
    duration_seconds: float = 0.0
    provider: str = "savanna-stt"


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)
    language: SupportedLanguage | str = "en"
    voice: Optional[str] = None
    rate: Optional[str] = "+0%"
    pitch: Optional[str] = "+0Hz"


class VoiceInfo(BaseModel):
    id: str
    name: str
    language: str
    gender: Literal["female", "male", "neutral"] = "neutral"
    locale: str
    provider: str

