"""Tests for the dynamic batch translation endpoint /translate."""
import json
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from main import create_app
from routers.translate import TRANSLATION_CACHE, _get_cache_key


class TestTranslateEndpoint(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = TestClient(self.app)

    def test_translate_identical_source_target_returns_identity(self):
        res = self.client.post("/translate", json={
            "strings": ["Dashboard", "Analytics", "Reports"],
            "target_lang": "en",
            "source_lang": "en"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["provider"], "identity")
        self.assertEqual(data["translations"]["Dashboard"], "Dashboard")
        self.assertEqual(data["cached_count"], 3)

    def test_translate_cached_hit(self):
        # Pre-seed cache
        key = _get_cache_key("am", "Unique Test Phrase")
        TRANSLATION_CACHE[key] = "ልዩ የሙከራ ሐረግ"

        res = self.client.post("/translate", json={
            "strings": ["Unique Test Phrase"],
            "target_lang": "am",
            "source_lang": "en"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["translations"]["Unique Test Phrase"], "ልዩ የሙከራ ሐረግ")
        self.assertEqual(data["cached_count"], 1)

    def test_translate_cache_stats(self):
        res = self.client.get("/translate/cache/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_cached_strings", data)
        self.assertIn("supported_languages", data)
        self.assertIn("am", data["supported_languages"])

    def test_translate_empty_list(self):
        res = self.client.post("/translate", json={
            "strings": [],
            "target_lang": "am",
            "source_lang": "en"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["translations"], {})

    @patch("routers.translate._translate_with_gemini", new_callable=AsyncMock)
    def test_translate_with_mocked_provider(self, mock_gemini):
        mock_gemini.return_value = {
            "Enroll now": "አሁን ይመዝገቡ",
            "Free Certificate": "ነጻ የምስክር ወረቀት"
        }

        # Clear any prior cache for these strings
        k1 = _get_cache_key("am", "Enroll now")
        k2 = _get_cache_key("am", "Free Certificate")
        TRANSLATION_CACHE.pop(k1, None)
        TRANSLATION_CACHE.pop(k2, None)

        with patch("routers.translate.settings.gemini_api_key", "mock-key"):
            res = self.client.post("/translate", json={
                "strings": ["Enroll now", "Free Certificate"],
                "target_lang": "am",
                "source_lang": "en"
            })
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["translations"]["Enroll now"], "አሁን ይመዝገቡ")
            self.assertEqual(data["translations"]["Free Certificate"], "ነጻ የምስክር ወረቀት")
            self.assertEqual(data["translated_count"], 2)


if __name__ == "__main__":
    unittest.main()
