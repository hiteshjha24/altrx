import unittest

from backend.prescription import (
    PrescriptionError,
    normalize_medicine_name,
    normalize_medicine_names,
    parse_groq_medicines,
    validate_prescription_image,
)


class PrescriptionHelpersTests(unittest.TestCase):
    def test_normalizes_strength_and_punctuation(self):
        self.assertEqual(normalize_medicine_name(" Paracetamol-500mg "), "paracetamol 500")

    def test_deduplicates_normalized_medicine_names(self):
        self.assertEqual(
            normalize_medicine_names(["Dolo 650mg", "dolo-650", "Azithromycin"]),
            ["dolo 650", "azithromycin"],
        )

    def test_parses_json_medicine_list(self):
        self.assertEqual(
            parse_groq_medicines('{"medicines":["Paracetamol 500mg", "Pantoprazole"]}'),
            ["paracetamol 500", "pantoprazole"],
        )

    def test_rejects_an_empty_upload(self):
        with self.assertRaises(PrescriptionError) as error:
            validate_prescription_image(b"", "image/jpeg")
        self.assertEqual(error.exception.status_code, 422)

    def test_rejects_a_mismatched_mime_type(self):
        png = b"\x89PNG\r\n\x1a\nrest-of-image"
        with self.assertRaises(PrescriptionError) as error:
            validate_prescription_image(png, "image/jpeg")
        self.assertEqual(error.exception.status_code, 415)


if __name__ == "__main__":
    unittest.main()