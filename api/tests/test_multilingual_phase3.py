"""
Unit & Integration tests for Track 3 Multilingual Speech & Voice Capabilities:
- Speech-to-Text (STT) honest availability boundaries (no fake mock transcripts)
- Text-to-Speech (TTS) verified voice directory (no fake voice IDs or sine-wave fallbacks)
- Accurate error responses for unsupported languages (501) and unconfigured providers (503)
"""
import io
import unittest
import wave

from fastapi.testclient import TestClient

from main import app


class TestMultilingualSpeech(unittest.TestCase):
    """Verify speech synthesis and transcription boundaries and honesty."""

    def setUp(self):
        self.client = TestClient(app)

    def _create_dummy_wav(self) -> bytes:
        """Helper to create a minimal valid WAV file for transcription testing."""
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(16000)
            wf.writeframes(b"\x00\x00" * 8000)  # 0.5s of silence
        return buf.getvalue()

    def test_list_voices_only_advertises_verified_genuine_voices(self):
        resp = self.client.get("/speech/voices")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Verified genuine voices exist for these languages
        verified_languages = ["en", "am", "so", "ar", "sw", "fr"]
        for lang in verified_languages:
            self.assertIn(lang, data, f"Language {lang} should be present in voice catalog")
            voices = data[lang]
            self.assertGreater(len(voices), 0)
            first = voices[0]
            self.assertIn("id", first)
            self.assertIn("name", first)
            self.assertIn("gender", first)
            self.assertIn("locale", first)
            self.assertEqual(first["provider"], "edge-tts")

        # Afaan Oromoo (om) and Tigrinya (ti) must NOT advertise fake savanna-tts neural voices
        self.assertNotIn("om", data, "om should not advertise non-existent neural voices")
        self.assertNotIn("ti", data, "ti should not advertise non-existent neural voices")

    def test_synthesize_unsupported_languages_returns_501(self):
        # Afaan Oromoo and Tigrinya must honestly report voice synthesis unavailable (501)
        for lang in ["om", "ti"]:
            with self.subTest(lang=lang):
                payload = {
                    "text": "Testing unsupported voice synthesis",
                    "language": lang
                }
                resp = self.client.post("/speech/synthesize", json=payload)
                self.assertEqual(resp.status_code, 501)
                detail = resp.json().get("detail", {})
                self.assertEqual(detail.get("error"), "voice_synthesis_unavailable")
                self.assertIn(lang, detail.get("message", ""))

    def test_transcribe_unconfigured_provider_returns_503(self):
        # When Whisper or genuine offline ASR is not configured, must return 503 instead of fake transcripts
        from unittest.mock import patch
        dummy_wav = self._create_dummy_wav()
        files = {"file": ("audio.wav", dummy_wav, "audio/wav")}
        data = {"language": "auto"}
        with patch("routers.speech.speech_service.stt_provider.is_configured", return_value=False):
            resp = self.client.post("/speech/transcribe", files=files, data=data)
            self.assertEqual(resp.status_code, 503)
            body = resp.json()
            detail = body.get("detail", {})
            self.assertEqual(detail.get("error"), "speech_transcription_unavailable")

    def test_transcribe_empty_file_rejected(self):
        files = {"file": ("empty.wav", b"", "audio/wav")}
        resp = self.client.post("/speech/transcribe", files=files)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("empty", resp.json()["detail"].lower())


if __name__ == "__main__":
    unittest.main()
