"""Prescription image validation, Hugging Face extraction, and medicine matching helpers."""

from __future__ import annotations

import base64
import json
import logging
import os
import re
import unicodedata
from collections.abc import Iterable

import httpx

logger = logging.getLogger(__name__)

MAX_PRESCRIPTION_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Hugging Face OpenAI-compatible Chat Completions Router URL
HF_CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions"
DEFAULT_HF_VISION_MODEL ="Qwen/Qwen2.5-VL-72B-Instruct"

EXTRACTION_PROMPT = """You extract medicine names from prescription images.
Read both handwritten and printed prescriptions. Return exactly one JSON object in
this shape: {"medicines": ["medicine name 1", "medicine name 2"]}.

Include only medicine names and an available strength. Ignore dosage schedules,
doctor and patient information, addresses, phone numbers, diagnoses, dates, and
instructions. If handwriting is unclear, return only the closest readable medicine
name; never invent a medicine. Return an empty medicines array when none are
readable."""


class PrescriptionError(Exception):
    """A safe, user-facing prescription-recognition error."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def detect_image_type(contents: bytes) -> str | None:
    """Identify accepted image formats by signature instead of trusting MIME headers."""
    if contents.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if contents.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if contents.startswith(b"RIFF") and len(contents) >= 12 and contents[8:12] == b"WEBP":
        return "image/webp"
    return None


def validate_prescription_image(contents: bytes, declared_content_type: str | None) -> str:
    """Validate an uploaded image and return its signature-derived MIME type."""
    if not contents:
        raise PrescriptionError("Please choose a non-empty prescription image.", 422)
    if len(contents) > MAX_PRESCRIPTION_BYTES:
        raise PrescriptionError("Prescription images must be 10 MB or smaller.", 413)

    image_type = detect_image_type(contents)
    if image_type not in ALLOWED_IMAGE_TYPES:
        raise PrescriptionError("Upload a JPG, JPEG, PNG, or WebP prescription image.", 415)
    if declared_content_type and declared_content_type.lower() != image_type:
        raise PrescriptionError("The uploaded file type does not match its image contents.", 415)
    return image_type


def normalize_medicine_name(value: str) -> str:
    """Create a stable, searchable medicine name while retaining numeric strength."""
    normalized = unicodedata.normalize("NFKC", value).lower().strip()
    normalized = re.sub(r"[\-_/,;:()[\]{}]+", " ", normalized)
    normalized = re.sub(r"(\d+)\s*(?:mg|mcg|g|ml|iu|units?)\b", r"\1", normalized)
    normalized = re.sub(r"[^a-z0-9+\s]", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def normalize_medicine_names(values: Iterable[object]) -> list[str]:
    """Normalize, bound, and de-duplicate model output without accepting arbitrary data."""
    medicines: list[str] = []
    seen: set[str] = set()
    for value in values:
        if not isinstance(value, str):
            continue
        normalized = normalize_medicine_name(value)
        if len(normalized) < 2 or len(normalized) > 120 or normalized in seen:
            continue
        seen.add(normalized)
        medicines.append(normalized)
        if len(medicines) == 30:
            break
    return medicines


def parse_hf_medicines(content: str) -> list[str]:
    """Parse a JSON response defensively and normalize its medicine list."""
    # Strip markdown code fencing if returned by the model
    clean_content = content.strip()
    if clean_content.startswith("```"):
        clean_content = re.sub(r"^```(?:json)?\n?", "", clean_content)
        clean_content = re.sub(r"\n?```$", "", clean_content).strip()

    try:
        payload = json.loads(clean_content)
    except (TypeError, json.JSONDecodeError) as exc:
        raise PrescriptionError("We could not read medicine names from this prescription. Please try a clearer image.", 422) from exc

    medicines = payload.get("medicines") if isinstance(payload, dict) else None
    if not isinstance(medicines, list):
        raise PrescriptionError("We could not read medicine names from this prescription. Please try a clearer image.", 422)
    return normalize_medicine_names(medicines)


async def extract_medicine_names(contents: bytes, image_type: str) -> list[str]:
    """Send the image to Hugging Face Inference Router; uploaded prescriptions are never persisted."""
    api_key = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
    if not api_key:
        logger.error("Prescription recognition is not configured: HF_TOKEN is missing")
        raise PrescriptionError("Prescription recognition is not configured yet. Please try again later.", 503)

    image_data = base64.b64encode(contents).decode("ascii")
    model_name = os.getenv("HF_VISION_MODEL", DEFAULT_HF_VISION_MODEL)

    payload = {
        "model": model_name,
        "temperature": 0.01,
        "max_tokens": 500,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": EXTRACTION_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract the medicine names from this prescription image."},
                    {"type": "image_url", "image_url": {"url": f"data:{image_type};base64,{image_data}"}},
                ],
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=10.0)) as client:
            response = await client.post(
                os.getenv("HF_API_URL", HF_CHAT_COMPLETIONS_URL),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.TimeoutException as exc:
        logger.warning("Hugging Face prescription recognition timed out")
        raise PrescriptionError("Prescription analysis timed out. Please try again.", 504) from exc
    except httpx.HTTPError as exc:
        logger.exception("Hugging Face prescription recognition request failed")
        raise PrescriptionError("Prescription analysis is temporarily unavailable. Please try again.", 502) from exc

    if response.status_code >= 400:
        logger.warning("Hugging Face prescription recognition failed with status %s: %s", response.status_code, response.text)
        raise PrescriptionError("Prescription analysis is temporarily unavailable. Please try again.", 502)

    try:
        response_payload = response.json()
        content = response_payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        logger.warning("Hugging Face returned an unexpected prescription recognition payload")
        raise PrescriptionError("We could not read medicine names from this prescription. Please try a clearer image.", 422) from exc

    return parse_hf_medicines(content)