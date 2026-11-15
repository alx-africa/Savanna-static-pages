"""
Unit tests for Savanna Speech Architecture:
- Addis AI Hosted STT Provider (with mock responses, timeouts, rate limits, secret redactions)
- Addis AI Hosted TTS Provider
- OpenAI Whisper STT Provider
- Microsoft Edge-TTS Neural TTS Provider
- SpeechService Coordinator & in-memory caching
- FastAPI /speech endpoints integration
"""
import asyncio
import io
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from config import Settings
from main import app
from speech.addis_provider import AddisAISTTProvider, AddisAITTSProvider
from speech.base import TranscribeResult, TTSResult
from speech.edgetts_provider import EdgeTTSProvider
from speech.offline_provider import OfflineSTTProvider, OfflineTTSProvider
from speech.service import SpeechService, sanitize_secrets
from speech.whisper_provider import WhisperSTTProvider


class TestAddisAISTTProvider(unittest.IsolatedAsyncioTestCase):
    """Test the Addis AI hosted STT provider adapter."""

    async def test_transcribe_missing_key_raises_runtime_error(self):
        provider = AddisAISTTProvider(api_key="")
        with self.assertRaises(RuntimeError) as ctx:
            await provider.transcribe(b"fake audio", filename="test.webm", language_hint="am")
        self.assertIn("API key is not configured", str(ctx.exception))

    @patch("httpx.AsyncClient.post")
    async def test_transcribe_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "text": "እንደምን አደሩ፣ ዛሬ ስለ ጤና ጥበቃ ማወቅ እፈልጋለሁ",
            "language": "am",
            "duration": 3.8
        }
        mock_post.return_value = mock_resp

        provider = AddisAISTTProvider(api_key="test-key-12345")
        result = await provider.transcribe(b"fake-audio-bytes", filename="test.webm", language_hint="am")

        self.assertIsInstance(result, TranscribeResult)
        self.assertEqual(result.text, "እንደምን አደሩ፣ ዛሬ ስለ ጤና ጥበቃ ማወቅ እፈልጋለሁ")
        self.assertEqual(result.language, "am")
        self.assertEqual(result.provider, "addisai")

    @patch("httpx.AsyncClient.post")
    async def test_transcribe_401_invalid_key(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_resp.text = "Unauthorized: Invalid API key test-key-12345"
        mock_post.return_value = mock_resp

        provider = AddisAISTTProvider(api_key="test-key-12345")
        with self.assertRaises(RuntimeError) as ctx:
            await provider.transcribe(b"fake-audio-bytes", filename="test.webm", language_hint="am")
        self.assertIn("authentication failed", str(ctx.exception).lower())

    @patch("httpx.AsyncClient.post")
    async def test_transcribe_429_rate_limit(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.text = "Rate limit exceeded"
        mock_post.return_value = mock_resp

        provider = AddisAISTTProvider(api_key="test-key-12345")
        with self.assertRaises(RuntimeError) as ctx:
            await provider.transcribe(b"fake-audio-bytes", filename="test.webm", language_hint="om")
        self.assertIn("rate limit exceeded", str(ctx.exception).lower())

    @patch("httpx.AsyncClient.post", side_effect=asyncio.TimeoutError)
    async def test_transcribe_timeout(self, mock_post):
        provider = AddisAISTTProvider(api_key="test-key-12345")
        with self.assertRaises(TimeoutError) as ctx:
            await provider.transcribe(b"fake-audio-bytes", filename="test.webm", language_hint="ti")
        self.assertIn("timed out", str(ctx.exception).lower())

    def test_supported_languages_includes_ethiopian(self):
        provider = AddisAISTTProvider(api_key="")
        langs = provider.supported_languages()
        for code in ["am", "om", "ti", "en", "sw", "so"]:
            self.assertIn(code, langs)


class TestAddisAITTSProvider(unittest.IsolatedAsyncioTestCase):
    """Test the Addis AI hosted TTS provider adapter."""

    async def test_synthesize_missing_key_raises(self):
        provider = AddisAITTSProvider(api_key="")
        with self.assertRaises(RuntimeError) as ctx:
            await provider.synthesize("ሰላም", language="am")
        self.assertIn("API key is not configured", str(ctx.exception))

    async def test_synthesize_unsupported_language_raises_not_implemented(self):
        provider = AddisAITTSProvider(api_key="test-key-123")
        with self.assertRaises(NotImplementedError):
            await provider.synthesize("Hello", language="unsupported_lang")

    @patch("httpx.AsyncClient.post")
    async def test_synthesize_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = b"ID3\x03\x00\x00\x00" + b"\x00" * 300
        mock_post.return_value = mock_resp

        provider = AddisAITTSProvider(api_key="test-key-123")
        res = await provider.synthesize("ሰላም ለሁሉም", language="am")
        self.assertEqual(res.audio_bytes, b"ID3\x03\x00\x00\x00" + b"\x00" * 300)
        self.assertEqual(res.media_type, "audio/mpeg")
        self.assertEqual(res.provider, "addisai")


class TestEdgeTTSProvider(unittest.IsolatedAsyncioTestCase):
    """Test Edge-TTS neural voice provider and honest voice boundaries."""

    def test_voice_listing_has_no_fake_voices(self):
        provider = EdgeTTSProvider()
        voices = provider.get_voices()

        self.assertIn("am", voices)
        self.assertIn("en", voices)
        self.assertIn("ar", voices)
        # om and ti must NOT have fake Edge-TTS voices
        self.assertNotIn("om", voices)
        self.assertNotIn("ti", voices)

    async def test_synthesize_unsupported_language_raises_501(self):
        provider = EdgeTTSProvider()
        with self.assertRaises(NotImplementedError):
            await provider.synthesize("Afaan Oromoo test", language="om")
        with self.assertRaises(NotImplementedError):
            await provider.synthesize("Tigrigna test", language="ti")

    def test_prepare_natural_speech_utterance(self):
        import re
        from speech.edgetts_provider import _prepare_natural_speech_utterance

        # 1. Pure Latin in Amharic session routes directly to JennyNeural
        synth_text, voice = _prepare_natural_speech_utterance("Virtual Assistant", "am", "am-ET-MekdesNeural")
        self.assertEqual(voice, "en-US-JennyNeural")
        self.assertEqual(synth_text, "Virtual Assistant")

        # 2. Pure Ethiopic routes to MekdesNeural
        synth_text, voice = _prepare_natural_speech_utterance("ሰላም እንደምን አላችሁ", "am", "am-ET-MekdesNeural")
        self.assertEqual(voice, "am-ET-MekdesNeural")
        self.assertEqual(synth_text, "ሰላም እንደምን አላችሁ")

        # 3. Mixed bilingual with acronyms algorithmically expands via 26-letter Latin G2P (zero hardcoding)
        synth_text, voice = _prepare_natural_speech_utterance("የ AI እና API ኮርስ", "am", "am-ET-MekdesNeural")
        self.assertEqual(voice, "am-ET-MekdesNeural")
        self.assertIn("ኤአይ", synth_text)
        self.assertIn("ኤፒአይ", synth_text)
        self.assertNotIn("AI", synth_text)
        self.assertNotIn("API", synth_text)

        # 4. Mixed bilingual with arbitrary English words algorithmically rewritten into Ethiopic syllables
        synth_text, voice = _prepare_natural_speech_utterance("ይህ testing ትምህርት ነው።", "am", "am-ET-MekdesNeural")
        self.assertEqual(voice, "am-ET-MekdesNeural")
        self.assertNotIn("testing", synth_text)
        # Verify no Latin letters remain in the synthesized text so Mekdes doesn't skip or pause
        self.assertFalse(bool(re.search(r"[a-zA-Z]", synth_text)))


class TestSpeechServiceCoordinator(unittest.IsolatedAsyncioTestCase):
    """Test provider resolution, caching, and secret sanitization in SpeechService."""

    def test_sanitize_secrets_redacts_keys(self):
        msg = "Error contacting https://api.addisassistant.com with secret-addis-key-999 and sk-openai-secret-888"
        sanitized = sanitize_secrets(msg, "secret-addis-key-999", "sk-openai-secret-888")
        self.assertNotIn("secret-addis-key-999", sanitized)
        self.assertNotIn("sk-openai-secret-888", sanitized)
        self.assertIn("[REDACTED_API_KEY]", sanitized)

    async def test_tts_cache_prevents_duplicate_network_calls(self):
        import tempfile
        from pathlib import Path
        settings = Settings()
        with tempfile.TemporaryDirectory() as tmp_dir:
            service = SpeechService(settings, cache_dir=Path(tmp_dir))

            # Mock the active TTS provider
            mock_tts = AsyncMock()
            mock_tts.synthesize.return_value = TTSResult(
                audio_bytes=b"cached-audio-content",
                media_type="audio/mpeg",
                voice_name="test-voice",
                language="en",
                provider="mock"
            )
            service.tts_provider = mock_tts

            # First call -> hits provider
            res1 = await service.synthesize("Hello world", language="en")
            self.assertEqual(res1.audio_bytes, b"cached-audio-content")
            self.assertEqual(mock_tts.synthesize.call_count, 1)

            # Second call with same text and lang -> served from LRU cache
            res2 = await service.synthesize("Hello world", language="en")
            self.assertEqual(res2.audio_bytes, b"cached-audio-content")
            self.assertEqual(mock_tts.synthesize.call_count, 1, "Cache hit must not invoke TTS provider a second time")

    def test_stt_provider_resolution(self):
        # Addis AI
        service_addis = SpeechService(Settings(stt_provider="addisai", addis_api_key="valid-key"))
        self.assertIsInstance(service_addis.stt_provider, AddisAISTTProvider)

        # Whisper
        service_whisper = SpeechService(Settings(stt_provider="whisper", openai_api_key="valid-key"))
        self.assertIsInstance(service_whisper.stt_provider, WhisperSTTProvider)

        # Offline
        service_offline = SpeechService(Settings(stt_provider="offline"))
        self.assertIsInstance(service_offline.stt_provider, OfflineSTTProvider)


class TestSpeechAPIEndpoints(unittest.TestCase):
    """Test FastAPI router integration for speech endpoints."""

    def setUp(self):
        self.client = TestClient(app)

    @patch("routers.speech.speech_service.transcribe")
    def test_transcribe_endpoint_success(self, mock_transcribe):
        mock_transcribe.return_value = TranscribeResult(
            text="Gargaarsa argachuu nan barbaada",
            language="om",
            duration_seconds=2.1,
            provider="addisai"
        )

        files = {"file": ("question.webm", b"webm-audio-data", "audio/webm")}
        data = {"language": "om"}
        resp = self.client.post("/speech/transcribe", files=files, data=data)

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["text"], "Gargaarsa argachuu nan barbaada")
        self.assertEqual(body["language"], "om")
        self.assertEqual(body["provider"], "addisai")

    @patch("routers.speech.speech_service.synthesize")
    def test_synthesize_endpoint_success(self, mock_synthesize):
        mock_synthesize.return_value = TTSResult(
            audio_bytes=b"synthesized-audio-bytes",
            media_type="audio/mpeg",
            voice_name="am-ET-AmehaNeural",
            language="am",
            provider="edgetts"
        )

        payload = {"text": "ሰላም ጤና ይስጥልኝ", "language": "am"}
        resp = self.client.post("/speech/synthesize", json=payload)

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.content, b"synthesized-audio-bytes")
        self.assertIn("Cache-Control", resp.headers)
        self.assertEqual(resp.headers["Cache-Control"], "public, max-age=86400")


if __name__ == "__main__":
    unittest.main()
