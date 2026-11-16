"""FastAPI application factory."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

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

    def _find_dir(dir_name: str) -> str | None:
        file_dir = Path(__file__).resolve().parent
        for cand in [
            Path("/app") / dir_name,
            file_dir.parent / dir_name,
            Path.cwd() / dir_name,
            Path.cwd().parent / dir_name,
            file_dir / dir_name,
        ]:
            try:
                if cand.is_dir() and any(cand.iterdir()):
                    return str(cand.resolve())
            except Exception:
                pass
        return None

    @app.get("/content.json", tags=["Level 1 Contract"], summary="Sample course content JSON")
    async def get_sample_content():
        import json
        file_dir = Path(__file__).resolve().parent
        for candidate in [
            Path("/app/content.json"),
            file_dir / "content.json",
            file_dir.parent / "content.json",
            Path.cwd() / "content.json",
        ]:
            if candidate.is_file():
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

    # ── Widget script and static pages (Level 1 drop-in) ─────────────────────
    from fastapi.staticfiles import StaticFiles
    for prefix, name in [
        ("/widget", "widget"),
        ("/operator", "operator"),
        ("/teacher-ui", "teacher"),
        ("/pages", "pages"),
        ("/assets", "assets"),
        ("/demo", "demo"),
    ]:
        d = _find_dir(name)
        if d:
            logger.info("Mounting static %s from %s", prefix, d)
            app.mount(prefix, StaticFiles(directory=d, html=True), name=name)
        else:
            logger.warning("Static directory '%s' not found for prefix %s", name, prefix)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
