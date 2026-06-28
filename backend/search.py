"""
AltRx · Fuzzy Search Engine
Uses PostgreSQL pg_trgm for typo-tolerant brand/salt name matching
"""

from __future__ import annotations

from .database import db
from .schemas import SearchResultItem


# ─────────────────────────────────────────────
# Core fuzzy search
# ─────────────────────────────────────────────
async def fuzzy_search(
    query: str,
    limit: int = 10,
    dosage_form: str | None = None,
) -> list[SearchResultItem]:
    """
    Searches medicines by brand name AND salt name simultaneously.
    Uses pg_trgm similarity scoring + word_similarity for prefix matching.
    Falls back to ILIKE if trgm score is too low.
    """
    params: list = [query, limit]
    form_clause = ""
    if dosage_form:
        form_clause = "AND m.dosage_form = $3"
        params.append(dosage_form)

    # Count how many alternatives each medicine has for enrichment
    sql = f"""
        WITH scored AS (
            SELECT
                m.id,
                m.brand_name,
                m.manufacturer,
                m.dosage_form,
                m.strength,
                m.price,
                m.price_per_unit,
                m.is_generic,
                s.chemical_name AS salt_name,
                s.id AS salt_id,
                GREATEST(
                    similarity(lower(m.brand_name), lower($1)),
                    similarity(lower(s.chemical_name), lower($1)),
                    word_similarity(lower($1), lower(m.brand_name)),
                    word_similarity(lower($1), lower(s.chemical_name))
                ) AS match_score
            FROM medicines m
            JOIN salts s ON s.id = m.salt_id
            WHERE
                m.discontinued = FALSE
                {form_clause}
                AND (
                    lower(m.brand_name)      % lower($1)
                    OR lower(s.chemical_name) % lower($1)
                    OR lower(m.brand_name)    ILIKE '%' || lower($1) || '%'
                    OR lower(s.chemical_name) ILIKE '%' || lower($1) || '%'
                )
        ),
        alt_counts AS (
            SELECT salt_id, COUNT(*) - 1 AS alternatives_count
            FROM medicines
            WHERE discontinued = FALSE
            GROUP BY salt_id
        )
        SELECT
            sc.*,
            COALESCE(ac.alternatives_count, 0) AS alternatives_count
        FROM scored sc
        LEFT JOIN alt_counts ac ON ac.salt_id = sc.salt_id
        ORDER BY match_score DESC, sc.price_per_unit ASC
        LIMIT $2
    """

    rows = await db.pool.fetch(sql, *params)
    return [
        SearchResultItem(
            id=r["id"],
            brand_name=r["brand_name"],
            manufacturer=r["manufacturer"],
            dosage_form=r["dosage_form"],
            strength=r["strength"],
            price=float(r["price"]),
            price_per_unit=float(r["price_per_unit"] or 0),
            salt_name=r["salt_name"],
            is_generic=r["is_generic"],
            match_score=round(float(r["match_score"]), 3),
            alternatives_count=int(r["alternatives_count"]),
        )
        for r in rows
    ]


# ─────────────────────────────────────────────
# Search logging
# ─────────────────────────────────────────────
async def log_search(
    query: str,
    results_count: int,
    session: str = "",
    ip_hash: str = "",
) -> None:
    """Persist search query for analytics. Detects query type automatically."""
    # Determine query type heuristically
    query_type = "brand"
    if any(
        kw in query.lower()
        for kw in ["pain", "fever", "diabetes", "infection", "pressure", "cholesterol"]
    ):
        query_type = "condition"
    elif any(
        kw in query.lower()
        for kw in ["mg", "ml", "mcg", "iu", "paracetamol", "ibuprofen", "amoxicillin",
                   "metformin", "atorvastatin"]
    ):
        query_type = "salt"

    try:
        await db.pool.execute(
            """
            INSERT INTO search_logs (query, query_type, results_count, user_session, ip_hash)
            VALUES ($1, $2, $3, $4, $5)
            """,
            query, query_type, results_count, session or None, ip_hash or None,
        )
    except Exception:
        # Non-critical — never let logging crash the request
        pass
