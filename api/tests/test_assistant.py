"""Unit tests for the Savanna Multilingual Assistant."""
import asyncio
import json
import os
import unittest
from pathlib import Path


class TestOfflineProvider(unittest.TestCase):
    """Verify the offline FAQ AI provider operates completely without internet."""

    def setUp(self):
        # Mock settings
        class MockSettings:
            ai_provider = "offline"
            docs_path = str(Path(__file__).parent.parent.parent / "docs")
        self.settings = MockSettings()

    def test_offline_chat_english(self):
        from ai.offline_provider import OfflineProvider
        from models import ChatMessage

        provider = OfflineProvider(self.settings)
        self.assertEqual(provider.name, "offline")

        loop = asyncio.new_event_loop()
        try:
            # Query matching FAQ: "What is the overall score threshold for graduation?"
            reply, citations = loop.run_until_complete(
                provider.chat(
                    message="What is the overall score threshold for graduation?",
                    language="en",
                    context_chunks=[],
                    history=[]
                )
            )
            self.assertIn("⚠️ Offline mode", reply)
            self.assertTrue(len(reply) > 20)
            self.assertTrue(len(citations) > 0)
            self.assertIn("70%", reply)
        finally:
            loop.close()

    def test_offline_chat_amharic(self):
        from ai.offline_provider import OfflineProvider

        provider = OfflineProvider(self.settings)

        loop = asyncio.new_event_loop()
        try:
            reply, citations = loop.run_until_complete(
                provider.chat(
                    message="የኮርስ ማጠናቀቂያ ደረጃ ምን ያህል ነው?",
                    language="am",
                    context_chunks=[],
                    history=[]
                )
            )
            self.assertIn("⚠️", reply)
            self.assertTrue(len(citations) > 0)
        finally:
            loop.close()

    def test_offline_with_rag_chunks(self):
        from ai.offline_provider import OfflineProvider

        provider = OfflineProvider(self.settings)
        mock_chunks = [{
            "id": "chunk_mock_123",
            "text": "Virtual assistants often handle administrative tasks and email scheduling.",
            "source": "concept-va.html"
        }]

        loop = asyncio.new_event_loop()
        try:
            reply, citations = loop.run_until_complete(
                provider.chat(
                    message="What do VAs do?",
                    language="en",
                    context_chunks=mock_chunks,
                    history=[]
                )
            )
            self.assertIn("Virtual assistants often handle", reply)
            self.assertEqual(len(citations), 1)
            self.assertEqual(citations[0].id, "chunk_mock_123")
        finally:
            loop.close()


class TestSMSFormatting(unittest.TestCase):
    """Verify SMS 160-character pagination and command stripping."""

    def test_truncate_single_page(self):
        from routers.sms import truncate_sms
        short = "This is a brief announcement for students."
        res = truncate_sms(short, page=1)
        self.assertTrue(len(res) <= 160)
        self.assertTrue(res.startswith("(1/1)"))
        self.assertIn(short, res)

    def test_truncate_multi_page(self):
        from routers.sms import truncate_sms
        long_text = "Word " * 60  # 300 chars
        p1 = truncate_sms(long_text, page=1)
        p2 = truncate_sms(long_text, page=2)
        self.assertTrue(len(p1) <= 160)
        self.assertTrue(len(p2) <= 160)
        self.assertTrue(p1.startswith("(1/2)"))
        self.assertTrue(p2.startswith("(2/2)"))

    def test_truncate_ethiopic_ucs2(self):
        from routers.sms import truncate_sms, is_ucs2_script
        amharic_long = "የሳቫና የትምህርት ረዳት ለሁሉም ተማሪዎች ተደራሽ ነው። " * 5
        self.assertTrue(is_ucs2_script(amharic_long))
        p1 = truncate_sms(amharic_long, page=1)
        self.assertTrue(len(p1) <= 70, f"Ethiopic SMS chunk exceeded 70-char UCS-2 limit: {len(p1)}")
        self.assertTrue(p1.startswith("(1/"))

    def test_truncate_arabic_ucs2(self):
        from routers.sms import truncate_sms, is_ucs2_script
        arabic_long = "مساعد سافانا التعليمي يقدم الدعم لجميع الطلاب في كل مكان. " * 5
        self.assertTrue(is_ucs2_script(arabic_long))
        p1 = truncate_sms(arabic_long, page=1)
        self.assertTrue(len(p1) <= 70, f"Arabic SMS chunk exceeded 70-char UCS-2 limit: {len(p1)}")
        self.assertTrue(p1.startswith("(1/"))

    def test_strip_prefix(self):
        from routers.sms import _strip_prefix
        text, prefix = _strip_prefix("JOB virtual assistant")
        self.assertEqual(prefix, "JOB")
        self.assertEqual(text, "virtual assistant")

        text, prefix = _strip_prefix("HELP")
        self.assertEqual(prefix, "HELP")
        self.assertEqual(text, "")


class TestJobData(unittest.TestCase):
    """Verify seeded jobs.json has valid structure."""

    def test_jobs_file(self):
        jobs_path = Path(__file__).parent.parent.parent / "docs" / "jobs" / "jobs.json"
        self.assertTrue(jobs_path.exists())
        jobs = json.loads(jobs_path.read_text(encoding="utf-8"))
        self.assertTrue(len(jobs) >= 5)

        first = jobs[0]
        self.assertIn("id", first)
        self.assertIn("title", first)
        self.assertIn("company", first)
        self.assertIn("description", first)
        self.assertIn("skills", first)


class TestAccommodationReference(unittest.TestCase):
    """Verify accommodation reference format."""

    def test_generate_reference(self):
        from routers.accommodate import _generate_reference
        ref = _generate_reference()
        self.assertTrue(ref.startswith("ACC-202"))
        self.assertEqual(len(ref), 13)


class TestJobApplicationAPI(unittest.TestCase):
    """Verify production job application submission and accommodation linking."""

    def setUp(self):
        from fastapi.testclient import TestClient
        from main import app
        self.client = TestClient(app)

    def test_apply_success_with_accommodation(self):
        payload = {
            "applicant_name": "Abebe Kebede",
            "email": "abebe@example.com",
            "resume_url": "https://linkedin.com/in/abebe",
            "cover_note": "Expert Virtual Assistant",
            "accommodation_type": "Screen Reader",
            "language": "am"
        }
        res = self.client.post("/jobs/job-001/apply", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["application_id"].startswith("APP-202"))
        self.assertEqual(data["job_id"], "job-001")
        self.assertEqual(data["status"], "submitted")
        self.assertIsNotNone(data["accommodation_reference"])
        self.assertTrue(data["accommodation_reference"].startswith("ACC-202"))

    def test_apply_without_accommodation(self):
        payload = {
            "applicant_name": "Sara Ahmed",
            "email": "sara@example.com",
            "resume_url": "https://example.com/cv.pdf"
        }
        res = self.client.post("/jobs/job-002/apply", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["application_id"].startswith("APP-202"))
        self.assertIsNone(data["accommodation_reference"])

    def test_apply_nonexistent_job_returns_404(self):
        payload = {
            "applicant_name": "Nobody",
            "email": "nobody@example.com",
            "resume_url": "https://example.com/cv.pdf"
        }
        res = self.client.post("/jobs/non-existent-999/apply", json=payload)
        self.assertEqual(res.status_code, 404)


class TestAmharicMorphologicalRetriever(unittest.TestCase):
    """Verify Ethiopic morphological prefix stripping and character normalization in RAG."""

    def test_amharic_prefix_and_spelling_expansion(self):
        from rag.retriever import expand_cross_lingual_query
        # "ለቨርቹዋል" has preposition 'ለ-' prefix; "አርቴፊሻል" has 'ቴ' instead of 'ቲ'
        query = "አርቴፊሻል ኢንተለጀንስ ለቨርቹዋል አሲስታንት ስራ ምን ፋይዳ አለው?"
        expanded = expand_cross_lingual_query(query, "am")
        self.assertIn("artificial intelligence", expanded.lower())
        self.assertIn("virtual assistant", expanded.lower())


if __name__ == "__main__":
    unittest.main()
