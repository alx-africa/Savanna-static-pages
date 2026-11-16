"""Application settings — loaded from environment / .env file."""
import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    # AI
    ai_provider: str = "openai"          # openai | gemini | ollama | offline
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # Speech Providers (STT & TTS)
    stt_provider: str = "addisai"        # addisai | whisper | offline
    tts_provider: str = "edgetts"        # edgetts | addisai | offline
    addis_api_key: str = ""
    addis_api_base_url: str = "https://api.addisassistant.com"

    # Telegram
    telegram_bot_token: str = ""

    # SMS / Africa's Talking
    at_username: str = "sandbox"
    at_api_key: str = ""
    at_sender_id: str = "SAVANNA"
    at_shortcode: str = "12345"

    # App
    secret_key: str = "change-me"
    api_base_url: str = "http://localhost:8000"
    widget_origin: str = "*"

    # LTI
    lti_tool_private_key_path: str = "/app/lti_private.pem"
    lti_tool_public_key_path: str = "/app/lti_public.pem"

    # Storage
    redis_url: str = "redis://localhost:6379"
    chroma_path: str = "./chroma_data"
    docs_path: str = "./docs"

    # Escalation
    escalation_webhook_url: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_docs_path() -> Path:
    """Return the resolved Path to the docs directory across host, Docker, and Cloud Run."""
    env_docs = os.getenv("DOCS_PATH")
    if env_docs and Path(env_docs).exists():
        return Path(env_docs).resolve()

    candidates = [
        Path("/app/docs"),
        Path(__file__).resolve().parent.parent / "docs",
        Path(__file__).resolve().parent.parent.parent / "docs",
        Path(__file__).resolve().parent / "docs",
        Path.cwd() / "docs",
        Path.cwd().parent / "docs",
    ]
    for c in candidates:
        if c.exists() and (c / "translations_cache.json").exists():
            return c.resolve()
        if c.exists():
            return c.resolve()
    return Path(__file__).resolve().parent.parent / "docs"

