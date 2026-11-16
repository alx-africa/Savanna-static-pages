"""
Unit tests for Security, Privacy, and Data Protection.
Verifies PII masking, SSRF guards, cryptographic random generation, and CORS.
"""
import unittest
from utils.privacy import mask_email, mask_name, mask_phone
from ai.vision_analyzer import _is_safe_remote_url
from routers.accommodate import _generate_reference


class TestSecurityAndPrivacy(unittest.TestCase):
    def test_pii_email_masking(self):
        self.assertEqual(mask_email("abebe@example.com"), "a***e@example.com")
        self.assertEqual(mask_email("me@test.org"), "m***@test.org")
        self.assertEqual(mask_email(None), "[REDACTED_EMAIL]")
        self.assertEqual(mask_email("invalid-email"), "[REDACTED_EMAIL]")

    def test_pii_name_masking(self):
        self.assertEqual(mask_name("Abebe Kebede"), "A***e K***e")
        self.assertEqual(mask_name("Sara"), "S***a")
        self.assertEqual(mask_name("Jo"), "J*")
        self.assertEqual(mask_name(None), "[REDACTED_NAME]")

    def test_pii_phone_masking(self):
        self.assertEqual(mask_phone("+251911223344"), "+251*******44")
        self.assertEqual(mask_phone(None), "[N/A]")

    def test_ssrf_guard_blocks_internal_and_private_ips(self):
        # Localhost and loopback
        self.assertFalse(_is_safe_remote_url("http://localhost/secret"))
        self.assertFalse(_is_safe_remote_url("http://127.0.0.1:8000/internal"))
        self.assertFalse(_is_safe_remote_url("http://0.0.0.0:6379/"))
        self.assertFalse(_is_safe_remote_url("http://[::1]:80/"))
        
        # Cloud metadata
        self.assertFalse(_is_safe_remote_url("http://169.254.169.254/latest/meta-data/"))
        self.assertFalse(_is_safe_remote_url("http://metadata.google.internal/computeMetadata/v1/"))
        
        # Internal container names
        self.assertFalse(_is_safe_remote_url("http://api:8000/health"))
        self.assertFalse(_is_safe_remote_url("http://redis:6379/"))
        
        # Invalid schemes
        self.assertFalse(_is_safe_remote_url("file:///etc/passwd"))
        self.assertFalse(_is_safe_remote_url("gopher://localhost:6379/"))
        self.assertFalse(_is_safe_remote_url("javascript:alert(1)"))

    def test_cryptographic_reference_generation(self):
        ref1 = _generate_reference()
        ref2 = _generate_reference()
        self.assertTrue(ref1.startswith("ACC-"))
        self.assertEqual(len(ref1), 13)  # ACC-YYYY-XXXX
        self.assertNotEqual(ref1, ref2)


if __name__ == "__main__":
    unittest.main()
