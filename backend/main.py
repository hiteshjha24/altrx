"""
AltRx Backend — FastAPI Application
Medicine alternative finder with salt-based matching
"""

from __future__ import annotations

import hashlib
import os
from contextlib import asynccontextmanager
from typing import Any
from dotenv import load_dotenv
load_dotenv("../.env.local")

import asyncpg
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from .database import db
    from .schemas import (
        AlternativeResponse,
        MedicineDetail,
        MedicineSearchResult,
        PrescriptionRecognitionResponse,
        SearchResponse,
    )
    from .prescription import (
        MAX_PRESCRIPTION_BYTES,
        PrescriptionError,
        extract_medicine_names,
        validate_prescription_image,
    )
    from .search import fuzzy_search, log_search
except ImportError:  # pragma: no cover - allows running main.py directly
    from database import db
    from schemas import (
        AlternativeResponse,
        MedicineDetail,
        MedicineSearchResult,
        PrescriptionRecognitionResponse,
        SearchResponse,
    )
    from prescription import (
        MAX_PRESCRIPTION_BYTES,
        PrescriptionError,
        extract_medicine_names,
        validate_prescription_image,
    )
    from search import fuzzy_search, log_search


# ─────────────────────────────────────────────
# App lifecycle
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title="AltRx API",
    description="Find affordable generic alternatives for branded medicines.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "service": "AltRx API"}


# ─────────────────────────────────────────────
# ROUTE: Search medicines
# GET /api/search?q=paracetamol&limit=10
# ─────────────────────────────────────────────
@app.get("/api/search", response_model=SearchResponse, tags=["Search"])
async def search_medicines(
    request: Request,
    q: str = Query(..., min_length=2, max_length=120, description="Brand name or active salt"),
    limit: int = Query(default=10, ge=1, le=50),
    form: str | None = Query(default=None, description="Filter by dosage form"),
):
    """
    Fuzzy search across brand names and salt names.
    Returns ranked list of matching medicines.
    """
    results = await fuzzy_search(q, limit=limit, dosage_form=form)

    # Log the search asynchronously (fire-and-forget style)
    session = request.headers.get("X-Session-ID", "")
    ip_raw = request.client.host if request.client else ""
    ip_hash = hashlib.sha256(ip_raw.encode()).hexdigest()[:16]
    await log_search(q, results_count=len(results), session=session, ip_hash=ip_hash)

    return SearchResponse(
        query=q,
        results_count=len(results),
        results=results,
    )


# ─────────────────────────────────────────────
# ROUTE: Medicine detail
# GET /api/medicines/{id}
# ─────────────────────────────────────────────
@app.get("/api/medicines/{medicine_id}", response_model=MedicineDetail, tags=["Medicines"])
async def get_medicine(medicine_id: int):
    """Return full detail for a single medicine including salt safety data."""
    row = await db.pool.fetchrow(
        """
        SELECT
            m.id, m.brand_name, m.manufacturer, m.dosage_form,
            m.strength, m.pack_size, m.pack_unit, m.price, m.price_per_unit,
            m.is_generic, m.is_otc, m.prescription_required,
            s.id AS salt_id, s.chemical_name AS salt_name,
            s.iupac_name, s.primary_uses, s.mechanism,
            s.side_effects, s.safety_warnings_json,
            s.drug_class, s.schedule
        FROM medicines m
        JOIN salts s ON s.id = m.salt_id
        WHERE m.id = $1 AND m.discontinued = FALSE
        """,
        medicine_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return _row_to_detail(dict(row))


# ─────────────────────────────────────────────
# ROUTE: Alternatives
# GET /api/medicines/{id}/alternatives
# ─────────────────────────────────────────────
@app.get(
    "/api/medicines/{medicine_id}/alternatives",
    response_model=AlternativeResponse,
    tags=["Medicines"],
)
async def get_alternatives(
    medicine_id: int,
    form: str | None = Query(default=None, description="Filter by dosage form"),
    include_otc_only: bool = Query(default=False),
):
    """
    Core endpoint. Finds all medicines sharing the same active salt,
    sorted cheapest-first, with savings percentage vs the target.
    """
    # 1. Fetch target medicine
    target_row = await db.pool.fetchrow(
        """
        SELECT m.*, s.chemical_name AS salt_name, s.primary_uses,
               s.side_effects, s.safety_warnings_json, s.drug_class,
               s.schedule, s.mechanism, s.iupac_name
        FROM medicines m
        JOIN salts s ON s.id = m.salt_id
        WHERE m.id = $1 AND m.discontinued = FALSE
        """,
        medicine_id,
    )
    if not target_row:
        raise HTTPException(status_code=404, detail="Medicine not found")

    target = dict(target_row)

    # 2. Build alternatives query
    query = """
        SELECT
            m.id, m.brand_name, m.manufacturer, m.dosage_form,
            m.strength, m.pack_size, m.pack_unit, m.price, m.price_per_unit,
            m.is_generic, m.is_otc, m.prescription_required,
            s.chemical_name AS salt_name, s.drug_class, s.schedule
        FROM medicines m
        JOIN salts s ON s.id = m.salt_id
        WHERE
            m.salt_id = $1
            AND m.id != $2
            AND m.discontinued = FALSE
    """
    params: list[Any] = [target["salt_id"], medicine_id]

    if form:
        query += f" AND m.dosage_form = ${len(params) + 1}"
        params.append(form)

    if include_otc_only:
        query += f" AND m.is_otc = TRUE"

    query += " ORDER BY m.price_per_unit ASC"

    alt_rows = await db.pool.fetch(query, *params)

    # 3. Compute savings percentage for each alternative
    target_ppu: float = float(target["price_per_unit"] or 0)
    alternatives = []
    for row in alt_rows:
        alt = dict(row)
        alt_ppu = float(alt["price_per_unit"] or 0)
        savings_pct = 0.0
        if target_ppu > 0 and alt_ppu < target_ppu:
            savings_pct = round(((target_ppu - alt_ppu) / target_ppu) * 100, 1)
        alt["savings_percentage"] = savings_pct
        alt["is_cheaper"] = alt_ppu < target_ppu
        alternatives.append(alt)

    cheapest_ppu = float(alternatives[0]["price_per_unit"]) if alternatives else target_ppu
    max_savings = (
        round(((target_ppu - cheapest_ppu) / target_ppu) * 100, 1)
        if target_ppu > 0 and cheapest_ppu < target_ppu
        else 0.0
    )

    return AlternativeResponse(
        target=_row_to_detail(target),
        alternatives_count=len(alternatives),
        max_savings_percentage=max_savings,
        alternatives=[_alt_to_summary(a) for a in alternatives],
    )


# ─────────────────────────────────────────────
# ROUTE: Salt detail
# GET /api/salts/{id}
# ─────────────────────────────────────────────
@app.get("/api/salts/{salt_id}", tags=["Salts"])
async def get_salt(salt_id: int):
    row = await db.pool.fetchrow("SELECT * FROM salts WHERE id = $1", salt_id)
    if not row:
        raise HTTPException(status_code=404, detail="Salt not found")
    return dict(row)


# ─────────────────────────────────────────────
# ROUTE: Popular/trending (for homepage)
# GET /api/popular
# ─────────────────────────────────────────────
@app.get("/api/popular", tags=["Search"])
async def get_popular():
    """Returns top 8 most-searched medicines for homepage suggestions."""
    rows = await db.pool.fetch(
        """
        SELECT sl.query, COUNT(*) AS search_count
        FROM search_logs sl
        GROUP BY sl.query
        ORDER BY search_count DESC
        LIMIT 8
        """
    )
    if not rows:
        # Fallback: return seeded brand names
        return {
            "suggestions": [
                "Crocin", "Dolo 650", "Brufen", "Combiflam",
                "Lipitor", "Glucophage", "Amoxil", "Atorva",
            ]
        }
    return {"suggestions": [r["query"] for r in rows]}


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def _row_to_detail(row: dict) -> dict:
    return {
        "id": row["id"],
        "brand_name": row["brand_name"],
        "manufacturer": row["manufacturer"],
        "dosage_form": row["dosage_form"],
        "strength": row["strength"],
        "pack_size": row["pack_size"],
        "pack_unit": row.get("pack_unit", "units"),
        "price": float(row["price"]),
        "price_per_unit": float(row["price_per_unit"] or 0),
        "is_generic": row["is_generic"],
        "is_otc": row["is_otc"],
        "prescription_required": row["prescription_required"],
        "salt_id": row["salt_id"],
        "salt_name": row["salt_name"],
        "iupac_name": row.get("iupac_name"),
        "primary_uses": list(row.get("primary_uses") or []),
        "mechanism": row.get("mechanism"),
        "side_effects": list(row.get("side_effects") or []),
        "safety_warnings": row.get("safety_warnings_json") or {},
        "drug_class": row.get("drug_class"),
        "schedule": row.get("schedule"),
    }


def _alt_to_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "brand_name": row["brand_name"],
        "manufacturer": row["manufacturer"],
        "dosage_form": row["dosage_form"],
        "strength": row["strength"],
        "pack_size": row["pack_size"],
        "pack_unit": row.get("pack_unit", "units"),
        "price": float(row["price"]),
        "price_per_unit": float(row["price_per_unit"] or 0),
        "is_generic": row["is_generic"],
        "is_otc": row["is_otc"],
        "salt_name": row["salt_name"],
        "drug_class": row.get("drug_class"),
        "savings_percentage": row.get("savings_percentage", 0.0),
        "is_cheaper": row.get("is_cheaper", False),
    }


# ─────────────────────────────────────────────
# ROUTE: Recognize medicines from a prescription image
# POST /api/prescriptions/recognize
# ─────────────────────────────────────────────
@app.post(
    "/api/prescriptions/recognize",
    response_model=PrescriptionRecognitionResponse,
    tags=["Prescriptions"],
)
async def recognize_prescription(file: UploadFile = File(...)):
    """Extract medicine names from an uploaded image and match them against the catalogue."""
    if not file.filename:
        raise HTTPException(status_code=422, detail="Please choose a prescription image to upload.")

    try:
        # The extra byte lets us enforce the limit before holding an arbitrary upload in memory.
        contents = await file.read(MAX_PRESCRIPTION_BYTES + 1)
        image_type = validate_prescription_image(contents, file.content_type)
        recognized_medicines = await extract_medicine_names(contents, image_type)
    except PrescriptionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    finally:
        await file.close()

    if not recognized_medicines:
        raise HTTPException(
            status_code=422,
            detail="No medicine names were detected. Please upload a clearer, well-lit prescription image.",
        )

    try:
        matched_by_id = {}
        unmatched_medicines = []
        for medicine_name in recognized_medicines:
            matches = await fuzzy_search(medicine_name, limit=50)
            if matches:
                for match in matches:
                    matched_by_id.setdefault(match.id, match)
            else:
                unmatched_medicines.append(medicine_name)
    except (asyncpg.PostgresError, AttributeError) as exc:
        # Do not leak database details, but preserve server-side context for operators.
        import logging

        logging.getLogger(__name__).exception("Prescription medicine lookup failed")
        raise HTTPException(
            status_code=503,
            detail="We recognized the prescription but could not search the medicine catalogue. Please try again.",
        ) from exc

    return PrescriptionRecognitionResponse(
        success=True,
        recognized_medicines=recognized_medicines,
        matched_medicines=list(matched_by_id.values()),
        unmatched_medicines=unmatched_medicines,
    )