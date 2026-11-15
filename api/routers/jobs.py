"""
Jobs router

GET  /jobs                  — list all jobs (optional ?keyword=&?type= filters)
GET  /jobs/{job_id}         — single job detail
POST /job-alert             — subscribe to job alerts (stored in Redis)
POST /jobs/{job_id}/answer  — RAG-powered Q&A about a specific job
"""
from __future__ import annotations

import json
import logging
import os
import uuid
from pathlib import Path
from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, HTTPException, Query

from config import get_settings
from models import (
    Job,
    JobAlertRequest,
    JobAlertResponse,
    JobApplicationRequest,
    JobApplicationResponse,
    ChatRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# Path to the jobs data file (relative to the api/ directory)
_JOBS_PATH = Path(__file__).parent.parent.parent / "docs" / "jobs" / "jobs.json"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_jobs() -> list[dict]:
    """Load and return the raw jobs list from disk."""
    try:
        with open(_JOBS_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        logger.error("jobs.json not found at %s", _JOBS_PATH)
        return []
    except json.JSONDecodeError as exc:
        logger.error("jobs.json is malformed: %s", exc)
        return []


def _get_redis() -> Optional[aioredis.Redis]:
    try:
        return aioredis.from_url(settings.redis_url, decode_responses=True)
    except Exception as exc:
        logger.warning("Redis unavailable: %s", exc)
        return None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[Job], summary="List all available jobs")
async def list_jobs(
    keyword: Optional[str] = Query(None, description="Filter by keyword in title, description, or skills"),
    type: Optional[str] = Query(None, description="Filter by job type (full-time, part-time, contract, remote)"),
    language: Optional[str] = Query(None, description="Preferred language for localized job cards (am, om, ti, so, ar, sw, fr, en)"),
) -> list[Job]:
    """
    Return all jobs from jobs.json. Supports optional `keyword`, `type`, and `language`
    query-string filters. Keyword matching checks English and localized translations.
    """
    raw_jobs = _load_jobs()
    jobs: list[Job] = []
    for raw in raw_jobs:
        try:
            jobs.append(Job.model_validate(raw))
        except Exception as exc:
            logger.warning("Skipping malformed job entry: %s", exc)

    # Apply keyword filter across English and localized translations
    if keyword:
        kw = keyword.lower()
        filtered = []
        for j in jobs:
            match = (
                kw in j.title.lower()
                or kw in j.description.lower()
                or any(kw in s.lower() for s in j.skills)
                or kw in j.company.lower()
                or kw in j.location.lower()
            )
            # Check translations for keyword match
            if not match and j.translations:
                for lang_data in j.translations.values():
                    if (
                        kw in lang_data.get("title", "").lower()
                        or kw in lang_data.get("description", "").lower()
                    ):
                        match = True
                        break
            if match:
                filtered.append(j)
        jobs = filtered

    # Apply type filter
    if type:
        jobs = [j for j in jobs if j.type.lower() == type.lower()]

    # If language requested, adapt title and description if translation exists
    if language and language != "en":
        adapted_jobs: list[Job] = []
        for j in jobs:
            trans = j.translations.get(language)
            if trans:
                job_dict = j.model_dump()
                job_dict["title"] = trans.get("title", j.title)
                job_dict["description"] = trans.get("description", j.description)
                adapted_jobs.append(Job.model_validate(job_dict))
            else:
                adapted_jobs.append(j)
        jobs = adapted_jobs

    # Return newest first
    jobs.sort(key=lambda j: j.posted_at, reverse=True)
    return jobs


def to_schema_org_job_posting(job: dict) -> dict:
    """
    Format job dictionary as a standard schema.org/JobPosting JSON-LD object.
    Adheres to Level 3 Open Standards (Technical Guide lines 501-509).
    """
    return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.get("title", ""),
        "description": job.get("description", ""),
        "datePosted": str(job.get("posted_at", "2026-11-14T00:00:00Z"))[:10],
        "employmentType": "FULL_TIME" if "full" in str(job.get("type", "")).lower() else "CONTRACT",
        "jobLocationType": "TELECOMMUTE",
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.get("company", "African Remote Employer"),
            "sameAs": job.get("url")
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.get("location", "Addis Ababa"),
                "addressCountry": "ET"
            }
        },
        "jobBenefits": "Remote work, inclusive workplace, interview accommodations without medical proof",
        "skills": ", ".join(job.get("skills", []))
    }


@router.get("/{job_id}/schema", summary="Get schema.org/JobPosting JSON-LD for a job (Level 3 Open Standard)")
async def get_job_schema(job_id: str) -> dict:
    """Return standard schema.org JSON-LD metadata for external search engines."""
    raw_jobs = _load_jobs()
    for raw in raw_jobs:
        if raw.get("id") == job_id:
            return to_schema_org_job_posting(raw)
    raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")


@router.get("/{job_id}", response_model=Job, summary="Get a single job by ID")
async def get_job(
    job_id: str,
    language: Optional[str] = Query(None, description="Preferred language for job details"),
) -> Job:
    """Return a specific job entry by its ID, with optional language adaptation."""
    raw_jobs = _load_jobs()
    for raw in raw_jobs:
        if raw.get("id") == job_id:
            job = Job.model_validate(raw)
            if language and language != "en" and job.translations.get(language):
                trans = job.translations[language]
                job_dict = job.model_dump()
                job_dict["title"] = trans.get("title", job.title)
                job_dict["description"] = trans.get("description", job.description)
                return Job.model_validate(job_dict)
            return job
    raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")


@router.post(
    "/{job_id}/answer",
    summary="Answer questions about a specific job using RAG",
)
async def answer_job_question(job_id: str, body: ChatRequest) -> dict:
    """
    Use the RAG retriever (domain='jobs') to answer questions about a specific job.
    Returns the answer text and any relevant citations.
    """
    import asyncio

    # Fetch the job to include its data as context
    raw_jobs = _load_jobs()
    job_raw = next((r for r in raw_jobs if r.get("id") == job_id), None)
    if not job_raw:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")

    job_context = (
        f"Job Title: {job_raw.get('title')}\n"
        f"Company: {job_raw.get('company')}\n"
        f"Location: {job_raw.get('location')}\n"
        f"Type: {job_raw.get('type')}\n"
        f"Description: {job_raw.get('description')}\n"
        f"Skills: {', '.join(job_raw.get('skills', []))}"
    )

    # RAG retrieval
    try:
        from rag.retriever import retrieve
        chunks: list[dict] = await retrieve(body.message, body.language, n_results=5, domain="jobs")
    except Exception as exc:
        logger.warning("RAG retrieval failed: %s", exc)
        chunks = []

    context_texts = [job_context] + [c.get("text", "") for c in chunks]

    # AI answer
    try:
        from ai.factory import get_provider
        provider = get_provider()
        context_chunks = [
            {"id": f"job_{job_id}", "text": job_context, "source": f"Job: {job_raw.get('title')}"}
        ] + chunks
        answer, job_cites = await provider.chat(
            body.message,
            body.language,
            context_chunks,
            body.history,
        )
        if job_cites:
            citations = [
                {"id": c.id, "source": c.source, "excerpt": c.excerpt}
                for c in job_cites
            ]
        else:
            citations = [
                {"id": c.get("id"), "source": c.get("source"), "excerpt": c.get("text", "")[:200]}
                for c in chunks
            ]
    except Exception as exc:
        logger.error("AI provider error in job answer: %s", exc)
        answer = "Sorry, I could not generate an answer right now. Please try again."
        citations = []

    return {
        "job_id": job_id,
        "answer": answer,
        "language": body.language,
        "citations": citations,
    }


# ── Job alerts ────────────────────────────────────────────────────────────────

alert_router = APIRouter()


@router.post("/alert", response_model=JobAlertResponse, operation_id="subscribe_job_alert_jobs_alert", summary="Subscribe to job alerts (/jobs/alert)")
@alert_router.post("", response_model=JobAlertResponse, operation_id="subscribe_job_alert_root", summary="Subscribe to job alerts (/job-alert)")
async def subscribe_job_alert(body: JobAlertRequest) -> JobAlertResponse:
    """
    Store a job-alert subscription in Redis. The alert scheduler
    (api/jobs/alerts.py) picks up these subscriptions every 6 hours.
    """
    sub_id = str(uuid.uuid4())
    sub_data = {
        "subscription_id": sub_id,
        **body.model_dump(),
    }

    redis = _get_redis()
    if redis:
        try:
            async with redis:
                await redis.set(f"job_alert:{sub_id}", json.dumps(sub_data))
        except Exception as exc:
            logger.warning("Could not persist job alert subscription: %s", exc)
    else:
        logger.warning("Redis unavailable — job alert subscription %s not persisted", sub_id)

    channel_desc = {
        "telegram": "Telegram",
        "sms": "SMS",
        "both": "Telegram and SMS",
    }.get(body.channel, body.channel)

    return JobAlertResponse(
        subscription_id=sub_id,
        message=(
            f"You are now subscribed to job alerts via {channel_desc}. "
            f"Subscription ID: {sub_id}"
        ),
    )


# ── Job applications ─────────────────────────────────────────────────────────

@router.post(
    "/{job_id}/apply",
    response_model=JobApplicationResponse,
    status_code=201,
    summary="Submit a job application with optional interview accommodation (No medical proof needed)",
)
async def apply_to_job(job_id: str, body: JobApplicationRequest) -> JobApplicationResponse:
    """
    Submit an application for a specific job listing.
    Supports no-barrier interview accommodation requests without medical proof.
    Persists application in Redis and alerts operators.
    """
    raw_jobs = _load_jobs()
    job_raw = next((r for r in raw_jobs if r.get("id") == job_id), None)
    if not job_raw:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")

    from datetime import datetime, timezone
    import random
    import string

    year = datetime.now(timezone.utc).year
    rand_digits = "".join(random.choices(string.digits, k=4))
    app_id = f"APP-{year}-{rand_digits}"
    submitted_at = datetime.now(timezone.utc).isoformat()

    accommodation_ref: Optional[str] = None
    if body.accommodation_type and body.accommodation_type.strip():
        from routers.accommodate import _generate_reference, _notify_operator
        from models import AccommodationRequest
        accommodation_ref = _generate_reference()
        # Notify operator of accommodation request attached to job application
        try:
            acc_req = AccommodationRequest(
                name=body.applicant_name,
                email=body.email,
                accommodation_type=body.accommodation_type,
                notes=f"Attached to application for {job_raw.get('title')} ({job_id})",
                language=body.language or "en",
            )
            await _notify_operator(accommodation_ref, acc_req)
        except Exception as exc:
            logger.warning("Could not send accommodation notification: %s", exc)

    app_record = {
        "application_id": app_id,
        "job_id": job_id,
        "job_title": job_raw.get("title"),
        "company": job_raw.get("company"),
        "applicant_name": body.applicant_name,
        "email": body.email,
        "resume_url": body.resume_url,
        "cover_note": body.cover_note or "",
        "accommodation_type": body.accommodation_type,
        "accommodation_reference": accommodation_ref,
        "submitted_at": submitted_at,
        "status": "submitted",
    }

    redis = _get_redis()
    if redis:
        try:
            async with redis:
                await redis.set(f"job_application:{app_id}", json.dumps(app_record), ex=2592000)
        except Exception as exc:
            logger.warning("Could not persist job application %s: %s", app_id, exc)

    logger.info(
        "[JOB_APPLICATION] app_id=%s job_id=%s name=%s email=%s acc_ref=%s",
        app_id,
        job_id,
        body.applicant_name,
        body.email,
        accommodation_ref,
    )

    msg = f"Your application for {job_raw.get('title')} has been received (ID: {app_id})."
    if accommodation_ref:
        msg += f" Your interview accommodation has been confirmed without medical proof (Ref: {accommodation_ref})."

    return JobApplicationResponse(
        application_id=app_id,
        job_id=job_id,
        job_title=job_raw.get("title", ""),
        applicant_name=body.applicant_name,
        email=body.email,
        status="submitted",
        accommodation_reference=accommodation_ref,
        submitted_at=submitted_at,
        message=msg,
    )
