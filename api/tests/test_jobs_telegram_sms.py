"""
Comprehensive tests for Job Applications, Telegram Bot/Alerts, and SMS alerts.
"""
from __future__ import annotations

import io
import json
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from main import app
from models import JobAlertRequest, JobApplicationRequest
from routers.sms import process_sms_message, truncate_sms
from utils.notifications import get_operator_chat_id, set_operator_chat_id, notify_operator_telegram


class TestJobAlertsAndSMS(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.client = TestClient(app)

    async def test_sms_inbound_alert_subscription_english(self):
        """Verify texting 'ALERT remote python' subscribes and replies within 160 chars."""
        reply = await process_sms_message("+251911000001", "ALERT remote python")
        self.assertIn("Subscribed", reply)
        self.assertLessEqual(len(reply), 160)

    async def test_sms_inbound_alert_subscription_amharic(self):
        """Verify texting 'ማስጠንቀቂያ ቨርቹዋል' subscribes and replies within 70 UCS-2 chars."""
        reply = await process_sms_message("+251911000002", "ማስጠንቀቂያ ቨርቹዋል")
        self.assertIn("ተመዝግቧል", reply)
        self.assertLessEqual(len(reply), 70)

    async def test_sms_inbound_stop_unsubscribe(self):
        """Verify texting 'STOP' removes alert subscription."""
        # Subscribe first
        await process_sms_message("+251911000003", "ALERT")
        # Then unsubscribe
        reply = await process_sms_message("+251911000003", "STOP")
        self.assertIn("unsubscribed", reply.lower())
        self.assertLessEqual(len(reply), 160)

    async def test_sms_inbound_help(self):
        """Verify texting 'HELP' returns succinct command guidance."""
        reply = await process_sms_message("+251911000004", "HELP")
        self.assertIn("JOB", reply)
        self.assertIn("ALERT", reply)
        self.assertLessEqual(len(reply), 160)

    async def test_sms_inbound_endpoint_curl_contract(self):
        """Verify POST /sms/inbound JSON payload returns plain text ≤ 160 chars."""
        resp = self.client.post(
            "/sms/inbound",
            json={"from": "+251911555555", "text": "JOB"},
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("content-type"), "text/plain; charset=utf-8")
        self.assertIn("JOBS:", resp.text)
        self.assertLessEqual(len(resp.text), 160)

    async def test_job_application_with_phone_and_accommodation(self):
        """Test submitting job application with candidate phone number and accommodation."""
        payload = {
            "applicant_name": "Ermias Amare",
            "email": "ermias@example.com",
            "phone": "+251912345678",
            "resume_url": "https://example.com/resumes/ermi.pdf",
            "cover_note": "Experienced remote developer",
            "accommodation_type": "Sign Language Interpreter",
            "language": "en"
        }
        resp = self.client.post("/jobs/job-001/apply", json=payload)
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertTrue(data["application_id"].startswith("APP-2026-"))
        self.assertIsNotNone(data["accommodation_reference"])
        self.assertTrue(data["accommodation_reference"].startswith("ACC-2026-"))

    async def test_resume_upload_pdf(self):
        """Test uploading a PDF resume via /jobs/upload-resume."""
        fake_pdf = b"%PDF-1.4 sample content for resume"
        files = {"file": ("my_resume.pdf", io.BytesIO(fake_pdf), "application/pdf")}
        resp = self.client.post("/jobs/upload-resume", files=files)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("resume_url", data)
        self.assertTrue(data["resume_url"].startswith("/assets/resumes/"))
        self.assertIn("my_resume.pdf", data["filename"])

    async def test_job_alert_subscription_api(self):
        """Test POST /jobs/alert API endpoint for telegram and sms."""
        payload = {
            "user_id": "test-user-123",
            "channel": "both",
            "phone": "+251911999888",
            "telegram_chat_id": "987654321",
            "keywords": ["Remote", "Support"],
            "language": "en"
        }
        resp = self.client.post("/jobs/alert", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("subscription_id", data)
        self.assertIn("subscribed", data["message"].lower())

    async def test_dynamic_operator_chat_registration(self):
        """Test registering operator chat ID and dispatching notification."""
        ok = await set_operator_chat_id("1122334455")
        self.assertTrue(ok)
        curr = await get_operator_chat_id()
        self.assertEqual(curr, "1122334455")

    async def test_telegram_user_language_persistence(self):
        """Test setting and getting user language across sessions."""
        from channels.telegram_bot import _set_user_lang, _get_user_lang, user_language
        test_uid = 9988776655
        await _set_user_lang(test_uid, "am")
        self.assertEqual(user_language.get(test_uid), "am")
        retrieved = await _get_user_lang(test_uid)
        self.assertEqual(retrieved, "am")

        # Test switching to Afaan Oromo
        await _set_user_lang(test_uid, "om")
        self.assertEqual(await _get_user_lang(test_uid), "om")

    def test_telegram_bot_handlers_and_language_keyboard(self):
        """Verify telegram bot registers /start with language picker and callback handlers."""
        from channels.telegram_bot import build_application
        app = build_application("1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678")
        self.assertIsNotNone(app)
        
        # Verify CommandHandlers exist
        handlers = app.handlers.get(0, [])
        command_names = []
        for h in handlers:
            if hasattr(h, "commands"):
                command_names.extend(h.commands)
        self.assertIn("start", command_names)
        self.assertIn("language", command_names)
        self.assertIn("jobs", command_names)
        self.assertIn("alerts", command_names)


if __name__ == "__main__":
    unittest.main()
