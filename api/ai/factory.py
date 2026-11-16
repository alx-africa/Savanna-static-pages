"""Factory for selecting the active AI provider from configuration."""
from ai.provider import AIProvider
from config import get_settings


def get_provider() -> AIProvider:
    """Return the configured AI provider instance."""
    settings = get_settings()
    prov_name = (settings.ai_provider or "gemini").lower()

    if prov_name == "gemini" or (settings.gemini_api_key and not settings.openai_api_key and prov_name != "ollama" and prov_name != "offline"):
        from ai.gemini_provider import GeminiProvider  # noqa: PLC0415
        return GeminiProvider(settings)
    elif prov_name == "ollama":
        from ai.ollama_provider import OllamaProvider  # noqa: PLC0415
        return OllamaProvider(settings)
    elif prov_name == "openai" and settings.openai_api_key:
        from ai.openai_provider import OpenAIProvider  # noqa: PLC0415
        return OpenAIProvider(settings)
    else:
        from ai.offline_provider import OfflineProvider  # noqa: PLC0415
        return OfflineProvider(settings)
