"""
Unit & Integration tests for Track 3 Multilingual Phase 3 & Phase 4:
- Speech-to-Text (STT) transcription and Spoken Language Identification (LID)
- Text-to-Speech (TTS) natural speech synthesis across all 8 languages
- Multi-lingual voice directory
- Resilient audio generation and fallbacks
"""
import io
import unittest
import wave

from fastapi.testclient import TestClient

from main import app
from routers.speech import _generate_fallback_wav


class TestMultilingualSpeech(unittest.TestCase):
    """Verify speech synthesis and transcription across all 8 supported languages."""

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

    def test_list_voices_covers_all_languages(self):
        resp = self.client.get("/speech/voices")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        expected_languages = ["en", "am", "om", "ti", "so", "ar", "sw", "fr"]
        for lang in expected_languages:
            self.assertIn(lang, data, f"Language {lang} missing from voice catalog")
            voices = data[lang]
            self.assertGreater(len(voices), 0)
            first = voices[0]
            self.assertIn("id", first)
            self.assertIn("name", first)
            self.assertIn("gender", first)
            self.assertIn("locale", first)
            self.assertIn("provider", first)

    def test_synthesize_all_8_languages(self):
        test_phrases = [
            ("en", "Welcome to Savanna learning assistant."),
            ("am", "እንኳን ወደ ሳቫና የትምህርት ረዳት በደህና መጡ።"),
            ("om", "Baga gara gargaaraa barumsaa Savanna dhuftan."),
            ("ti", "ናብ ሳቫና ናይ ትምህርቲ ሓጋዚ ብደሓን መጻእኹም።"),
            ("so", "Ku soo dhawoow kaaliyaha waxbarashada Savanna."),
            ("ar", "مرحبًا بكم في مساعد التعلم سافانا."),
            ("sw", "Karibu kwenye msaidizi wa mafunzo wa Savanna."),
            ("fr", "Bienvenue sur l'assistant d'apprentissage Savanna."),
        ]

        for lang, text in test_phrases:
            with self.subTest(lang=lang):
                payload = {
                    "text": text,
                    "language": lang
                }
                resp = self.client.post("/speech/synthesize", json=payload)
                self.assertEqual(resp.status_code, 200)
                self.assertTrue(
                    resp.headers["content-type"].startswith("audio/"),
                    f"Expected audio content type for {lang}, got {resp.headers.get('content-type')}"
                )
                self.assertGreater(len(resp.content), 100, f"Audio content too small for {lang}")

    def test_fallback_wav_generator(self):
        wav_bytes = _generate_fallback_wav("Test pedagogical speech cadence for Oromo", "om")
        self.assertGreater(len(wav_bytes), 1000)
        self.assertTrue(wav_bytes.startswith(b"RIFF"))
        self.assertIn(b"WAVE", wav_bytes[:12])

    def test_transcribe_audio_supported_languages(self):
        dummy_wav = self._create_dummy_wav()
        test_languages = ["en", "am", "om", "ti", "so", "ar", "sw", "fr"]

        for lang in test_languages:
            with self.subTest(lang=lang):
                files = {"file": ("audio.wav", dummy_wav, "audio/wav")}
                data = {"language": lang}
                resp = self.client.post("/speech/transcribe", files=files, data=data)
                self.assertEqual(resp.status_code, 200)
                body = resp.json()
                self.assertIn("text", body)
                self.assertEqual(body["language"], lang)
                self.assertGreater(body["confidence"], 0.8)
                self.assertGreater(body["duration_seconds"], 0.0)

    def test_transcribe_zero_shot_auto(self):
        dummy_wav = self._create_dummy_wav()
        files = {"file": ("audio.wav", dummy_wav, "audio/wav")}
        data = {"language": "auto"}
        resp = self.client.post("/speech/transcribe", files=files, data=data)
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn("text", body)
        self.assertIn("language", body)

    def test_transcribe_empty_file_rejected(self):
        files = {"file": ("empty.wav", b"", "audio/wav")}
        resp = self.client.post("/speech/transcribe", files=files)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("empty", resp.json()["detail"].lower())


if __name__ == "__main__":
    unittest.main()
