"""
Level 2 Technical Guide Contract Router
Implements the exact data contract mandated by the hackathon engineering guide:
  - POST /api/v1/ask          { question, language } -> { answer, sources: [{ title, url, id }] }
  - POST /api/v1/content      the host sends lessons to be indexed dynamically
  - POST /api/v1/escalations  { conversation } -> { ticketId }
  - POST /sms/inbound         { from, text } -> plain text reply (max 160 chars)
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Form, Request, Response
from fastapi.responses import PlainTextResponse

from config import get_settings
from models import (
    AskV1Request,
    AskV1Response,
    AskV1Source,
    ChatRequest,
    ContentV1Request,
    ContentV1Response,
    EscalationV1Request,
    EscalationV1Response,
    SMSInboundV1Request,
)
from routers.chat import chat as base_chat
from routers.escalate import _get_redis, _notify_operator
from routers.sms import _chat_reply, _job_summary, _strip_prefix, truncate_sms, process_sms_message
from rag.ingest import extract_semantic_sections

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


# ─── 1. POST /api/v1/ask ──────────────────────────────────────────────────────

@router.post("/ask", response_model=AskV1Response, summary="Ask the tutor (Level 2 Technical Guide Contract)")
async def ask_v1(body: AskV1Request) -> AskV1Response:
    """
    Data contract:
      POST /api/v1/ask { question, language } -> { answer, sources: [{ title, url, id }] }
    """
    query = body.get_query()
    if not query:
        return AskV1Response(
            answer="Please ask a question about the course content.",
            sources=[],
            language=body.language if body.language != "auto" else "en",
        )

    # Convert to standard ChatRequest
    chat_req = ChatRequest(
        message=query,
        language=body.language,
        session_id=body.session_id,
        simple_mode=body.simple_mode,
    )
    chat_resp = await base_chat(chat_req)

    # Format sources with title, url, and id
    sources: list[AskV1Source] = []
    for c in chat_resp.citations:
        sources.append(
            AskV1Source(
                id=c.id,
                title=c.title or c.source or "Course Section",
                url=c.url or f"pages/{c.source}",
                source=c.source,
                excerpt=c.excerpt,
            )
        )

    return AskV1Response(
        answer=chat_resp.text,
        sources=sources,
        language=chat_resp.language,
        ethiopian_date=chat_resp.ethiopian_date,
    )


# ─── 2. POST /api/v1/content ──────────────────────────────────────────────────

@router.post("/content", response_model=ContentV1Response, summary="Index host lessons (Level 2 Technical Guide Contract)")
async def index_content_v1(body: ContentV1Request) -> ContentV1Response:
    """
    Data contract:
      POST /api/v1/content
      The host sends its lessons to be indexed dynamically.
    """
    if not body.lessons:
        return ContentV1Response(
            status="no_op",
            count=0,
            message="No lessons provided to index.",
        )

    from rag.retriever import _BM25_INDEX, _build_bm25_corpus
    import rag.retriever as ret_mod

    indexed_count = 0
    # Add to BM25 in-memory corpus
    if ret_mod._BM25_INDEX is None:
        ret_mod._BM25_INDEX = _build_bm25_corpus()

    chunks_list = ret_mod._BM25_INDEX["chunks"]
    doc_tokens = ret_mod._BM25_INDEX["doc_tokens"]
    doc_lens = ret_mod._BM25_INDEX["doc_lens"]
    import re

    for lesson in body.lessons:
        lesson_id = lesson.id or f"host_{uuid.uuid4().hex[:8]}"
        title = lesson.title or "Host Lesson"
        url = lesson.url or f"/lessons/{lesson_id}"

        # If HTML content provided, extract semantic sections
        if lesson.html:
            secs = extract_semantic_sections(lesson.html, lesson_id, "course")
            for s in secs:
                chunks_list.append({
                    "id": f"{lesson_id}_{s.get('anchor') or len(chunks_list)}",
                    "text": s["text"],
                    "source": lesson_id,
                    "title": s.get("title", title),
                    "url": s.get("url", url),
                    "domain": "course",
                })
                toks = re.findall(r"[\w']+", s["text"].lower())
                doc_tokens.append(toks)
                doc_lens.append(len(toks))
                indexed_count += 1
        elif lesson.text:
            text = lesson.text.strip()
            chunks_list.append({
                "id": lesson_id,
                "text": text,
                "source": lesson_id,
                "title": title,
                "url": url,
                "domain": "course",
            })
            toks = re.findall(r"[\w']+", text.lower())
            doc_tokens.append(toks)
            doc_lens.append(len(toks))
            indexed_count += 1

    # Update BM25 stats
    N = len(chunks_list)
    ret_mod._BM25_INDEX["N"] = N
    ret_mod._BM25_INDEX["avgdl"] = (sum(doc_lens) / N) if N > 0 else 1.0

    logger.info("Host content indexing complete: added %d section chunks.", indexed_count)
    return ContentV1Response(
        status="indexed",
        count=indexed_count,
        message=f"Indexed {indexed_count} curriculum section(s) from host.",
    )


# ─── 3. POST /api/v1/escalations ──────────────────────────────────────────────

@router.post("/escalations", response_model=EscalationV1Response, summary="Escalate to human tutor (Level 2 Technical Guide Contract)")
async def escalate_v1(body: EscalationV1Request) -> EscalationV1Response:
    """
    Data contract:
      POST /api/v1/escalations { conversation } -> { ticketId }
    """
    ticket_id = f"ESC-{datetime.now().year}-{uuid.uuid4().hex[:4].upper()}"
    redis = _get_redis()

    ticket_data = {
        "ticket_id": ticket_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reason": body.reason or "Learner requested tutor help",
        "conversation": body.conversation,
        "learner_context": body.learner_context or {},  # Android Chrome / Screen reader fallback context
        "session_id": body.session_id or str(uuid.uuid4()),
        "status": "pending",
    }

    if redis:
        try:
            async with redis:
                await redis.set(f"ticket:{ticket_id}", json.dumps(ticket_data), ex=86400 * 3)
                await redis.lpush("tickets:pending", ticket_id)
        except Exception as exc:
            logger.warning("Could not persist ticket to Redis: %s", exc)

    # Push to operator Telegram channel
    try:
        from models import EscalateRequest
        req = EscalateRequest(session_id=body.session_id or "web", reason=body.reason)
        asyncio.create_task(_notify_operator(ticket_id, req))
    except Exception as exc:
        logger.warning("Could not notify operator: %s", exc)

    return EscalationV1Response(
        ticketId=ticket_id,
        status="pending",
        message="A tutor will answer here. It may take until morning.",
        operator_url=f"/operator/index.html?ticket={ticket_id}",
    )


# ─── 4. POST /sms/inbound ─────────────────────────────────────────────────────

@router.post("/sms/inbound", response_class=PlainTextResponse, summary="Text/SMS route (Level 2 Technical Guide Contract)")
async def sms_inbound_v1(request: Request) -> Response:
    """
    Data contract:
      POST /sms/inbound { from, text } -> plain text reply of at most 160 characters.
      Accepts both JSON and form-urlencoded payloads.
    """
    content_type = request.headers.get("content-type", "")
    from_number = "unknown"
    text_content = ""

    if "application/json" in content_type:
        try:
            body = await request.json()
            from_number = body.get("from", "unknown")
            text_content = body.get("text", "")
        except Exception:
            pass
    else:
        form = await request.form()
        from_number = form.get("from", "unknown")
        text_content = form.get("text", "")

    if not text_content:
        return PlainTextResponse("No question received. Text HELP for commands.", media_type="text/plain")

    reply = await process_sms_message(from_number, text_content)

    # reply is already truncated by _job_summary or _chat_reply
    return PlainTextResponse(reply, media_type="text/plain")
