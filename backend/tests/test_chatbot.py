import unittest

from backend.chatbot import extract_json_payload


class ChatbotHelpersTest(unittest.TestCase):
    def test_extract_json_payload_from_fenced_block(self) -> None:
        text = '''```json
{"possible_condition":"Possible mild irritation","explanation":"This is a general explanation.","remedies":[],"disclaimer":"Please seek medical care if symptoms persist."}
```'''

        payload = extract_json_payload(text)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["possible_condition"], "Possible mild irritation")


if __name__ == "__main__":
    unittest.main()
