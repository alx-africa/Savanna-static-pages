"""
Unit tests for LinguisticValidator Quality Gate
Verifies cross-lingual bleed detection, script fidelity, and mojibake prevention.
"""
import unittest
from utils.linguistic_validator import LinguisticValidator


class TestLinguisticValidator(unittest.TestCase):
    def test_geez_script_requirement(self):
        # Missing Ge'ez in Amharic / Tigrinya
        res = LinguisticValidator.validate("Hello World", "ti")
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "EXPECTED_GEEZ_SCRIPT")

        res_am = LinguisticValidator.validate("Hello World", "am")
        self.assertFalse(res_am.is_valid)
        self.assertEqual(res_am.error_code, "EXPECTED_GEEZ_SCRIPT")

    def test_arabic_script_requirement(self):
        res = LinguisticValidator.validate("Software Engineering", "ar")
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "EXPECTED_ARABIC_SCRIPT")

        res_ok = LinguisticValidator.validate("هندسة البرمجيات", "ar")
        self.assertTrue(res_ok.is_valid)

    def test_latin_script_requirement(self):
        # Non-Latin script in Swahili / Oromo / French
        res_sw = LinguisticValidator.validate("ሰላም ለሁላችሁ", "sw")
        self.assertFalse(res_sw.is_valid)
        self.assertEqual(res_sw.error_code, "UNEXPECTED_NON_LATIN_SCRIPT")

        res_ok = LinguisticValidator.validate("Karibu kwenye kozi yetu", "sw")
        self.assertTrue(res_ok.is_valid)

    def test_tigrinya_rejects_amharic_copula_and_conjunction(self):
        # "Where do they work?" in Amharic
        res = LinguisticValidator.validate("ቨርቹዋል ረዳቶች የት ነው የሚሰሩት?", "ti")
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "AMHARIC_LEAK_INTO_TIGRINYA")
        self.assertIn("ነው", res.detected_markers)

        # "What does it mean?" in Amharic
        res2 = LinguisticValidator.validate("ሞጁል 2፡ ቨርቹዋል ረዳት ማለት ምን ማለት ነው", "ti")
        self.assertFalse(res2.is_valid)
        self.assertEqual(res2.error_code, "AMHARIC_LEAK_INTO_TIGRINYA")

    def test_tigrinya_rejects_amharic_possessive_prefix(self):
        res = LinguisticValidator.validate("የቨርቹዋል ረዳት ሚና እድገትና ለውጥ", "ti")
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "AMHARIC_LEAK_INTO_TIGRINYA")

    def test_tigrinya_accepts_pure_tigrinya(self):
        res1 = LinguisticValidator.validate("ቨርቹዋል ረዳእቲ ኣብ ኣበይ ይዓይዩ?", "ti")
        self.assertTrue(res1.is_valid)

        res2 = LinguisticValidator.validate("ክፍሊ 2፦ ቨርቹዋል ረዳኢ (VA) ማለት እንታይ እዩ?", "ti")
        self.assertTrue(res2.is_valid)

        res3 = LinguisticValidator.validate("መጻኢ ናይ ቨርቹዋል ረዳኢ ኢንዱስትሪ", "ti")
        self.assertTrue(res3.is_valid)

        res4 = LinguisticValidator.validate("ተራ ቨርቹዋል ረዳኢ መብርሂ፦ ዕማማትን ፍሉይ ክእለታትን", "ti")
        self.assertTrue(res4.is_valid)

    def test_mojibake_rejection(self):
        res = LinguisticValidator.validate("Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ÙƒÙˆØ¯", "ar")
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "MOJIBAKE")

    def test_untranslated_echo_rejection(self):
        source = "Mastering asynchronous messaging patterns ensures scalability"
        res = LinguisticValidator.validate(source, "sw", source_text=source)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.error_code, "VERBATIM_COPY")


if __name__ == "__main__":
    unittest.main()
