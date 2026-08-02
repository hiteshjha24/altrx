import json
import os
import re
from typing import Any

import httpx

try:
    from .schemas import HomeRemedyChatRequest, HomeRemedyItem, HomeRemedyResponse
except ImportError:  # pragma: no cover - allows running chatbot.py directly
    from schemas import HomeRemedyChatRequest, HomeRemedyItem, HomeRemedyResponse


DEFAULT_DISCLAIMER = (
    "This chatbot cannot diagnose disease. These remedies are intended only for temporary symptom relief. "
    "Please consult a qualified healthcare professional for an accurate diagnosis and appropriate treatment. "
    "If symptoms are severe, rapidly worsening, or include emergency warning signs such as difficulty breathing, "
    "chest pain, severe allergic reactions, loss of consciousness, or uncontrolled bleeding, seek immediate emergency care."
)


def extract_json_payload(raw_text: str) -> dict[str, Any] | None:
    """Extracts a JSON object from LLM output, including fenced code blocks."""
    if not raw_text:
        return None

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    candidate = cleaned[start : end + 1]
    try:
        payload = json.loads(candidate)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def build_safe_default_response(symptoms: str, region: str) -> HomeRemedyResponse:
    return HomeRemedyResponse(
        possible_condition="Possible mild symptom cluster that may need professional review",
        explanation=(
            f"I can offer general, low-risk home-care suggestions for {symptoms or 'your symptoms'} "
            f"while you arrange proper medical care in {region or 'your region'}."
        ),
        remedies=[
            HomeRemedyItem(
                name="Rest and stay hydrated",
                instructions="Drink fluids regularly and rest in a calm, comfortable space.",
                why_it_may_help="Hydration and rest can reduce fatigue and support recovery while symptoms are being assessed.",
                precautions="Avoid overexertion and monitor for worsening symptoms.",
                who_should_avoid="People who feel very weak, dizzy, or unable to keep fluids down should seek medical care promptly.",
                scientific_explanation="Adequate hydration and rest are foundational recovery measures for many common mild illnesses.",
                evidence_summary="These measures are commonly recommended by health authorities for mild illness support.",
                sources=[
                    "https://www.cdc.gov/respiratory-viruses/about/index.html",
                    "https://www.nhs.uk/conditions/common-cold/",
                ],
            )
        ],
        disclaimer=DEFAULT_DISCLAIMER,
    )


def build_chat_prompt(payload: HomeRemedyChatRequest) -> str:
    return f"""
You are AltRx's supportive health guidance assistant.
Your job is to provide temporary, low-risk home-care suggestions only.
You must never diagnose disease, prescribe medication, or tell the user to ignore professional medical care.

User details:
- Symptoms: {payload.symptoms}
- Region: {payload.region}

Guidelines:
- Clearly say the response is not a diagnosis.
- Provide a short, general explanation of the symptom cluster.
- Suggest only generally accepted, low-risk home remedies.
- Do not recommend prescription medicines.
- Avoid unsafe or unverified treatments.
- Encourage professional medical evaluation.
- Include evidence-backed explanations and citations whenever possible.
- Include a medical disclaimer at the end.

Return ONLY valid JSON with this exact structure:
{{
  "possible_condition": "A concise phrase that is clearly not a diagnosis",
  "explanation": "A short, supportive explanation of the possible symptom cluster",
  "remedies": [
    {{
      "name": "Remedy name",
      "instructions": "How to use it clearly",
      "why_it_may_help": "Why it may help",
      "precautions": "Safety precautions",
      "who_should_avoid": "People for whom it is not appropriate",
      "scientific_explanation": "Brief scientific explanation",
      "evidence_summary": "Evidence summary with trusted sources in mind",
      "sources": ["https://www.who.int/", "https://www.nhs.uk/", "https://www.mayoclinic.org/", "https://pubmed.ncbi.nlm.nih.gov/"]
    }}
  ],
  "disclaimer": "A clear medical disclaimer that says you cannot diagnose disease, these remedies are temporary relief only, and professional medical evaluation is important"
}}
"""


async def generate_home_remedy_response(payload: HomeRemedyChatRequest) -> HomeRemedyResponse:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    prompt = build_chat_prompt(payload)

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a careful medical support assistant. Never provide a diagnosis. "
                            "Always include a disclaimer and use only evidence-based, low-risk suggestions."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,
                "max_tokens": 900,
            },
        )
        response.raise_for_status()
        payload_body = response.json()

    content = payload_body["choices"][0]["message"]["content"]
    parsed = extract_json_payload(content)
    if parsed is None:
        raise ValueError("The model did not return valid JSON")

    return HomeRemedyResponse.model_validate(parsed)
