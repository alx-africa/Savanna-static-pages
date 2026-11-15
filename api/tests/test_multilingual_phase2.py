"""
Unit & Integration tests for Track 3 Multilingual Phase 2:
- Cross-lingual RAG query expansion
- Technical terminology preservation in AI system prompts
- 8-language Offline FAQ provider matching
- 8-language localized Jobs catalog and search
- 8-language localized Accommodation request confirmations
"""
import asyncio
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from ai.offline_provider import OfflineProvider
from ai.openai_provider import get_system_prompt as get_openai_system_prompt
from ai.ollama_provider import get_system_prompt as get_ollama_system_prompt
from main import app
from rag.retriever import expand_cross_lingual_query


class TestCrossLingualRAG(unittest.TestCase):
    """Verify cross-lingual query expansion bridges English index and native languages."""

    def test_expansion_amharic(self):
        query = "የምረቃ ውጤት ምን ያህል ነው?"
        expanded = expand_cross_lingual_query(query, "am")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "threshold" in expanded or "passing" in expanded)

    def test_expansion_oromo(self):
        query = "Qabxiin eebbaa meeqa?"
        expanded = expand_cross_lingual_query(query, "om")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "passing score" in expanded)

    def test_expansion_tigrinya(self):
        query = "ናይ ምረቓ ነጥቢ ክንደይ እዩ?"
        expanded = expand_cross_lingual_query(query, "ti")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "score" in expanded)

    def test_expansion_somali(self):
        query = "Waa maxay buundada qalin-jabinta?"
        expanded = expand_cross_lingual_query(query, "so")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "threshold" in expanded)

    def test_expansion_arabic(self):
        query = "ما هي نسبة التخرج المطلوبة؟"
        expanded = expand_cross_lingual_query(query, "ar")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "passing score" in expanded)

    def test_expansion_kiswahili(self):
        query = "Alama ya kufuzu mahafali ni ngapi?"
        expanded = expand_cross_lingual_query(query, "sw")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "threshold" in expanded)

    def test_expansion_french(self):
        query = "Quel est le seuil pour obtenir le diplôme?"
        expanded = expand_cross_lingual_query(query, "fr")
        self.assertIn(query, expanded)
        self.assertTrue("graduation" in expanded or "diploma" in expanded)


class TestTerminologyPreservationPrompts(unittest.TestCase):
    """Verify AI provider system prompts contain technical terminology locks."""

    def test_openai_system_prompt_terminology_rules(self):
        prompt = get_openai_system_prompt("am")
        self.assertIn("CRITICAL TERMINOLOGY & ENTITY PRESERVATION RULES", prompt)
        self.assertIn("Virtual Assistant", prompt)
        self.assertIn("Pull Request", prompt)
        self.assertIn("70%", prompt)

    def test_ollama_system_prompt_terminology_rules(self):
        prompt = get_ollama_system_prompt("om")
        self.assertIn("CRITICAL TERMINOLOGY & ENTITY PRESERVATION RULES", prompt)
        self.assertIn("GitHub", prompt)
        self.assertIn("70%", prompt)


class TestMultilingualOfflineFAQ(unittest.TestCase):
    """Verify offline FAQ matching operates accurately across all 8 languages."""

    def setUp(self):
        class MockSettings:
            ai_provider = "offline"
            docs_path = str(Path(__file__).parent.parent.parent / "docs")
        self.settings = MockSettings()
        self.provider = OfflineProvider(self.settings)

    def _query_offline(self, message: str, language: str):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(
                self.provider.chat(
                    message=message,
                    language=language,
                    context_chunks=[],
                    history=[]
                )
            )
        finally:
            loop.close()

    def test_faq_all_8_languages(self):
        test_cases = [
            ("en", "What is the graduation score threshold?", "70%"),
            ("am", "የኮርስ ማጠናቀቂያ ውጤት ምን ያህል ነው?", "70%"),
            ("om", "Qabxiin eebbaa yookan xumura koorsii meeqa?", "70%"),
            ("ti", "ናይ ምረቓ መመዘኒ ነጥቢ ክንደይ እዩ?", "70%"),
            ("so", "Waa maxay buundada looga baahan yahay qalin-jabinta?", "70%"),
            ("ar", "ما هي درجة التخرج المطلوبة لاجتياز الدورة؟", "70%"),
            ("sw", "Kiwango cha ufaulu wa kuhitimu kozi ni kipi?", "70%"),
            ("fr", "Quel est le score minimum requis pour obtenir le diplôme?", "70%"),
        ]

        for lang, query, expected_text in test_cases:
            with self.subTest(lang=lang):
                reply, citations = self._query_offline(query, lang)
                self.assertIn("⚠️", reply)
                self.assertIn(expected_text, reply)
                self.assertTrue(len(citations) > 0, f"Expected citation for lang={lang}")


class TestMultilingualJobsAPI(unittest.TestCase):
    """Verify the /jobs API delivers localized job listings and supports localized search."""

    def setUp(self):
        self.client = TestClient(app)

    def test_list_jobs_oromo(self):
        resp = self.client.get("/jobs?language=om")
        self.assertEqual(resp.status_code, 200)
        jobs = resp.json()
        self.assertGreater(len(jobs), 0)
        job1 = next(j for j in jobs if j["id"] == "job-001")
        self.assertEqual(job1["title"], "Gargaaraa Dijitaalaa — Deeggarsa Hojii-raawwachiiftuu")
        self.assertIn("deeggarsa", job1["description"].lower())

    def test_list_jobs_tigrinya(self):
        resp = self.client.get("/jobs?language=ti")
        self.assertEqual(resp.status_code, 200)
        jobs = resp.json()
        job1 = next(j for j in jobs if j["id"] == "job-001")
        self.assertEqual(job1["title"], "ቨርቹዋል ሓጋዚ — ናይ ኣመራርሓ ደገፍ")

    def test_list_jobs_arabic(self):
        resp = self.client.get("/jobs?language=ar")
        self.assertEqual(resp.status_code, 200)
        jobs = resp.json()
        job1 = next(j for j in jobs if j["id"] == "job-001")
        self.assertEqual(job1["title"], "مساعد افتراضي — دعم تنفيذي")

    def test_get_single_job_localized(self):
        resp = self.client.get("/jobs/job-001?language=fr")
        self.assertEqual(resp.status_code, 200)
        job = resp.json()
        self.assertEqual(job["title"], "Assistant Virtuel — Support Exécutif")

    def test_keyword_search_native_language(self):
        # Searching for Oromo word "Gargaaraa" should find the matching jobs
        resp = self.client.get("/jobs?keyword=Gargaaraa&language=om")
        self.assertEqual(resp.status_code, 200)
        jobs = resp.json()
        self.assertGreater(len(jobs), 0)
        job_ids = [j["id"] for j in jobs]
        self.assertIn("job-001", job_ids)


class TestMultilingualAccommodateAPI(unittest.TestCase):
    """Verify /accommodate returns localized confirmation messages and next steps."""

    def setUp(self):
        self.client = TestClient(app)

    def test_accommodate_all_languages(self):
        test_payloads = [
            ("en", "Thank you, John", "Your request has been received"),
            ("am", "አመሰግናለሁ፣ John", "ጥያቄዎ ተቀብሏል"),
            ("om", "Galatoomaa, John", "Gaaffiin keessan nu ga'eera"),
            ("ti", "የቐንየልና፣ John", "ሕቶኹም ተቐቢልናዮ ኣለና"),
            ("so", "Mahadsanid, John", "Codsigaaga waa la helay"),
            ("ar", "شكرًا لك، John", "تم استلام طلبك بنجاح"),
            ("sw", "Asante, John", "Ombi lako limepokelewa"),
            ("fr", "Merci, John", "Votre demande a été bien reçue"),
        ]

        for lang, expected_msg_part, expected_step_part in test_payloads:
            with self.subTest(lang=lang):
                payload = {
                    "name": "John",
                    "email": "john@example.com",
                    "accommodation_type": "Screen Reader",
                    "language": lang
                }
                resp = self.client.post("/accommodate", json=payload)
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertTrue(data["reference"].startswith("ACC-202"))
                self.assertIn(expected_msg_part, data["message"])
                self.assertTrue(any(expected_step_part in step for step in data["next_steps"]))

                # Ethiopic script date format check for am and ti
                if lang in ("am", "ti"):
                    self.assertIn("ዓ.ም.", data["ethiopian_date"])
                else:
                    self.assertIn("E.C.", data["ethiopian_date"])


if __name__ == "__main__":
    unittest.main()
