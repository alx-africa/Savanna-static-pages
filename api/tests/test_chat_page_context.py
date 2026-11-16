"""Test Chat with live page_context."""
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from main import app
from models import Citation

client = TestClient(app)


class TestChatPageContext(unittest.TestCase):
    @patch("routers.chat._get_redis", return_value=None)
    @patch("rag.retriever.retrieve", new_callable=AsyncMock)
    @patch("ai.factory.get_provider")
    def test_chat_with_page_context(self, mock_get_provider, mock_retrieve, mock_redis):
        mock_provider = AsyncMock()
        mock_provider.name = "mock_provider"
        mock_provider.chat.return_value = (
            "A Virtual Assistant is a remote professional who assists businesses.",
            [Citation(id="chunk1", source="lesson", excerpt="Virtual Assistant definition")]
        )
        mock_get_provider.return_value = mock_provider
        mock_retrieve.return_value = []

        payload = {
            "message": "Explain this concept",
            "language": "en",
            "page_context": {
                "title": "Virtual Assistant Course",
                "active_heading": "What is a Virtual Assistant?",
                "selected_text": "The Virtual Assistant profession is evolving.",
                "summary": "This module explains the role of virtual assistants in modern workplaces."
            }
        }

        resp = client.post("/chat", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("Virtual Assistant", data["text"])

        # Verify page_context was passed to provider.chat
        mock_provider.chat.assert_called_once()
        _, kwargs = mock_provider.chat.call_args
        self.assertIn("page_context", kwargs)
        self.assertEqual(kwargs["page_context"]["title"], "Virtual Assistant Course")
        self.assertEqual(kwargs["page_context"]["active_heading"], "What is a Virtual Assistant?")


if __name__ == "__main__":
    unittest.main()
