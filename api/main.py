"""FastAPI application factory."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings, get_docs_path
from routers import chat, escalate, jobs, accommodate, lti, sms as sms_router, teacher, vision, speech, translate, v1_contract

logging.basicConfig(level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

settings = get_settings()


def is_low_memory_environment() -> bool:
    """Detect if running in a memory-constrained container (e.g. Render free tier 512MB)."""
    import os
    if os.getenv("DISABLE_DENSE_EMBEDDINGS", "").lower() in ("true", "1", "yes"):
        return True
    if os.getenv("RENDER"):  # Render automatically sets RENDER=true
        return True
    for path in ['/sys/fs/cgroup/memory.max', '/sys/fs/cgroup/memory/memory.limit_in_bytes']:
        try:
            with open(path) as f:
                val = f.read().strip()
                if val != 'max' and int(val) < 1024 * 1024 * 1024:
                    return True
        except Exception:
            pass
    return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize RAG corpus."""
    logger.info("Starting Savanna Multilingual Assistant API …")
    if is_low_memory_environment():
        logger.info("Operating in lightweight mode (<= 512MB RAM): using pure-Python BM25 semantic retrieval.")
    else:
        try:
            from rag.ingest import ensure_ingested
            await ensure_ingested(get_docs_path(), settings.chroma_path)
            logger.info("Dense vector RAG corpus ready.")
        except Exception as exc:
            logger.warning("Dense RAG ingest skipped: %s", exc)
    yield
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Savanna Multilingual Assistant",
        version="1.0.0",
        description=(
            "Voice and text AI tutor in Amharic and English. "
            "Answers questions from course content, escalates to humans, "
            "and surfaces career opportunities."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],           # Permissive for pluggable cross-origin host sites
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(chat.router,        prefix="/chat",        tags=["Chat"])
    app.include_router(escalate.router,    prefix="/escalate",    tags=["Escalation"])
    app.include_router(jobs.router,        prefix="/jobs",        tags=["Career Gateway"])
    app.include_router(jobs.alert_router,  prefix="/job-alert",   tags=["Career Gateway"])
    app.include_router(accommodate.router, prefix="/accommodate", tags=["Accommodation"])
    app.include_router(lti.router,         prefix="/lti",         tags=["LTI 1.3"])
    app.include_router(sms_router.router,  prefix="/webhook",     tags=["SMS Webhook"])
    app.include_router(teacher.router,     prefix="/teacher",     tags=["Teacher Analytics"])
    app.include_router(vision.router,                             tags=["Vision & Image Accessibility"])
    app.include_router(speech.router,                             tags=["Speech & Voice Accessibility"])
    app.include_router(speech.router,    prefix="/api",           tags=["Speech & Voice Accessibility"])
    app.include_router(translate.router,                          tags=["Translation"])
    app.include_router(translate.router, prefix="/api",           tags=["Translation"])

    # ── Level 2 Technical Guide Contract ─────────────────────────────────────
    app.include_router(v1_contract.router, prefix="/api/v1",      tags=["Level 2 Contract"])
    app.include_router(v1_contract.router, prefix="/v1",          tags=["Level 2 Contract"])
    app.include_router(v1_contract.router, prefix="",             tags=["Level 2 Contract"])

    # ── Health ────────────────────────────────────────────────────────────────
    from models import HealthResponse

    @app.get("/health", response_model=HealthResponse, tags=["Health"])
    async def health():
        return HealthResponse(
            status="ok",
            version="1.0.0",
            ai_provider=settings.ai_provider,
        )

    @app.get("/content.json", tags=["Level 1 Contract"], summary="Sample course content JSON")
    async def get_sample_content():
        import json
        for candidate in [
            os.path.join(base_dir, "content.json"),
            os.path.join(base_dir, "..", "content.json"),
            "/app/content.json",
        ]:
            if os.path.isfile(candidate):
                try:
                    with open(candidate, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
        return {
            "lessons": [
                {
                    "id": "concept-va-future",
                    "title": "What is Shaping the Future of VA Work?",
                    "url": "/pages/concept-with-navigation.html#what-is-shaping-the-future-of-va-work",
                    "text": "Artificial intelligence and automation are redefining virtual assistance in Ethiopia and across Africa."
                }
            ]
        }

    # ── Widget script (Level 1 drop-in) ───────────────────────────────────────
    import os
    from fastapi.staticfiles import StaticFiles
    base_dir = os.path.dirname(__file__)
    widget_dir = os.path.join(base_dir, "widget")
    if not os.path.isdir(widget_dir):
        widget_dir = os.path.join(base_dir, "..", "widget")
    if os.path.isdir(widget_dir):
        app.mount("/widget", StaticFiles(directory=widget_dir, html=True), name="widget")

    operator_dir = os.path.join(base_dir, "operator")
    if not os.path.isdir(operator_dir):
        operator_dir = os.path.join(base_dir, "..", "operator")
    if os.path.isdir(operator_dir):
        app.mount("/operator", StaticFiles(directory=operator_dir, html=True), name="operator")

    teacher_dir = os.path.join(base_dir, "teacher")
    if not os.path.isdir(teacher_dir):
        teacher_dir = os.path.join(base_dir, "..", "teacher")
    if os.path.isdir(teacher_dir):
        app.mount("/teacher-ui", StaticFiles(directory=teacher_dir, html=True), name="teacher-ui")

    pages_dir = os.path.join(base_dir, "pages")
    if not os.path.isdir(pages_dir):
        pages_dir = os.path.join(base_dir, "..", "pages")
    if os.path.isdir(pages_dir):
        app.mount("/pages", StaticFiles(directory=pages_dir, html=True), name="pages")

    assets_dir = os.path.join(base_dir, "assets")
    if not os.path.isdir(assets_dir):
        assets_dir = os.path.join(base_dir, "..", "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir, html=True), name="assets")

    demo_dir = os.path.join(base_dir, "demo")
    if not os.path.isdir(demo_dir):
        demo_dir = os.path.join(base_dir, "..", "demo")
    if os.path.isdir(demo_dir):
        app.mount("/demo", StaticFiles(directory=demo_dir, html=True), name="demo")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
