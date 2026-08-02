"""
AltRx · Pydantic v2 Schemas
Request validation and response serialisation
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


# ─────────────────────────────────────────────
# Shared base
# ─────────────────────────────────────────────
class SafetyWarning(BaseModel):
    safe: bool | None = None
    note: str = ""


class SafetyWarnings(BaseModel):
    pregnancy:  SafetyWarning = SafetyWarning()
    alcohol:    SafetyWarning = SafetyWarning()
    driving:    SafetyWarning = SafetyWarning()
    kidneys:    SafetyWarning | None = None
    liver:      SafetyWarning | None = None
    breastfeed: SafetyWarning | None = None

    model_config = {"extra": "allow"}  # allow any additional keys


class HomeRemedyChatRequest(BaseModel):
    symptoms: str = Field(..., min_length=3, max_length=800)
    region: str = Field(..., min_length=2, max_length=200)


class HomeRemedyItem(BaseModel):
    name: str
    instructions: str
    why_it_may_help: str
    precautions: str
    who_should_avoid: str
    scientific_explanation: str
    evidence_summary: str
    sources: list[str] = []


class HomeRemedyResponse(BaseModel):
    possible_condition: str
    explanation: str
    remedies: list[HomeRemedyItem]
    disclaimer: str


# ─────────────────────────────────────────────
# Medicine summary (used in search results & alternatives list)
# ─────────────────────────────────────────────
class MedicineSummary(BaseModel):
    id: int
    brand_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    pack_size: int
    pack_unit: str = "units"
    price: float = Field(ge=0)
    price_per_unit: float = Field(ge=0)
    is_generic: bool
    is_otc: bool
    salt_name: str
    drug_class: str | None = None
    savings_percentage: float = 0.0
    is_cheaper: bool = False

    @field_validator("price", "price_per_unit", mode="before")
    @classmethod
    def coerce_decimal(cls, v):
        return float(v) if v is not None else 0.0


# ─────────────────────────────────────────────
# Medicine full detail (single medicine page)
# ─────────────────────────────────────────────
class MedicineDetail(BaseModel):
    id: int
    brand_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    pack_size: int
    pack_unit: str = "units"
    price: float
    price_per_unit: float
    is_generic: bool
    is_otc: bool
    prescription_required: bool
    salt_id: int
    salt_name: str
    iupac_name: str | None = None
    primary_uses: list[str] = []
    mechanism: str | None = None
    side_effects: list[str] = []
    safety_warnings: dict[str, Any] = {}
    drug_class: str | None = None
    schedule: str | None = None

    @field_validator("price", "price_per_unit", mode="before")
    @classmethod
    def coerce_decimal(cls, v):
        return float(v) if v is not None else 0.0


# ─────────────────────────────────────────────
# Search response
# ─────────────────────────────────────────────
class SearchResultItem(BaseModel):
    id: int
    brand_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    price: float
    price_per_unit: float
    salt_name: str
    is_generic: bool
    match_score: float = 0.0   # trigram similarity score
    alternatives_count: int = 0


class SearchResponse(BaseModel):
    query: str
    results_count: int
    results: list[SearchResultItem]


# Alias — main.py imports both names
MedicineSearchResult = SearchResultItem


# ─────────────────────────────────────────────
# Alternatives response
# ─────────────────────────────────────────────
class AlternativeResponse(BaseModel):
    target: MedicineDetail
    alternatives_count: int
    max_savings_percentage: float
    alternatives: list[MedicineSummary]


# ─────────────────────────────────────────────
# Prescription recognition response
# ─────────────────────────────────────────────
class PrescriptionRecognitionResponse(BaseModel):
    success: bool
    recognized_medicines: list[str] = Field(serialization_alias="recognizedMedicines")
    matched_medicines: list[SearchResultItem] = Field(serialization_alias="matchedMedicines")
    unmatched_medicines: list[str] = Field(serialization_alias="unmatchedMedicines")