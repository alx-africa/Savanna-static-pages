"""
Vision router — Accessible AI image breakdown for blind and low-vision learners.

POST /describe-image
Accepts image URL or filename + language code, and delivers a structured
AI-powered multimodal visual breakdown:
  1. 🎯 Primary Subject
  2. 📊 Visual Elements & Text
  3. 💡 Pedagogical Context
  4. 🎨 Composition & Palette
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter

from ai.vision_analyzer import analyze_image_with_ai
from config import get_settings
from models import DescribeImageRequest, DescribeImageResponse, VisualBreakdown
from routers.chat import _detect_language, SUPPORTED_LANGUAGES
from utils.ethiopian_calendar import gregorian_to_ethiopian

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.post("/describe-image", response_model=DescribeImageResponse, summary="Get AI visual breakdown for an image")
async def describe_image(request: DescribeImageRequest) -> DescribeImageResponse:
    """
    Deliver an AI-powered visual breakdown of a course image or diagram
    for screen readers and speech synthesis in 8 languages.
    """
    # 1. Determine requested language
    lang = request.language
    if not lang or lang == "auto" or lang not in SUPPORTED_LANGUAGES:
        if request.context:
            lang = _detect_language(request.context)
        else:
            lang = "en"

    req_id = str(uuid.uuid4())
    eth_date = gregorian_to_ethiopian(datetime.now())

    # 2. Invoke AI Multimodal Vision Breakdown Engine
    ai_result, provider_name = await analyze_image_with_ai(
        filename=request.filename,
        url=request.url,
        language=lang,
        settings=settings,
        context=request.context,
    )

    breakdown_obj = VisualBreakdown(
        primary_subject=ai_result.get("primary_subject", "Educational graphic"),
        visual_elements=ai_result.get("visual_elements", []),
        pedagogical_context=ai_result.get("pedagogical_context", ""),
        composition_and_palette=ai_result.get("composition_and_palette", ""),
        intent_and_purpose=ai_result.get("intent_and_purpose") or ai_result.get("pedagogical_context", ""),
    )

    intent = (ai_result.get("intent_and_purpose") or ai_result.get("pedagogical_context") or "").strip()
    summary_text = (ai_result.get("summary") or "").strip()

    # If AI returned a unified summary (already crafted with Visual FIRST and Intent SECOND),
    # use it directly so audio speech exactly matches the model's coherent response.
    # Otherwise, synthesize a structured description placing Visual FIRST, Intent SECOND.
    if not summary_text:
        primary = (ai_result.get("primary_subject") or "Educational graphic").strip()
        if intent:
            intent_cue = " የዚህ ምስል ዓላማና ትርጉም፦ " if lang == "am" else " The pedagogical intent of this visual is: "
            summary_text = f"{primary}.{intent_cue}{intent}"
        else:
            summary_text = primary

    return DescribeImageResponse(
        id=req_id,
        description=summary_text,
        language=lang,
        source="ai-multimodal-breakdown",
        ai_provider=provider_name,
        visual_elements=ai_result.get("visual_elements", []),
        breakdown=breakdown_obj,
        ethiopian_date=str(eth_date),
    )
