-- ============================================================
--  AltRx · PostgreSQL Database Schema
--  Medicine alternative finder with salt-based matching
-- ============================================================

-- Enable fuzzy search extension for partial/typo matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─────────────────────────────────────────────
-- 1. SALTS  (Active chemical components table)
--    Central reference table; medicines FK here
-- ─────────────────────────────────────────────
CREATE TABLE salts (
    id                  SERIAL PRIMARY KEY,
    chemical_name       TEXT NOT NULL,          -- e.g. "Paracetamol 500mg"
    iupac_name          TEXT,                   -- full IUPAC name if available
    primary_uses        TEXT[],                 -- e.g. ARRAY['Fever','Pain relief']
    mechanism           TEXT,                   -- how it works (patient-friendly)
    side_effects        TEXT[],                 -- e.g. ARRAY['Nausea','Drowsiness']
    safety_warnings_json JSONB DEFAULT '{}',   -- structured safety flags
    -- JSON shape:
    -- {
    --   "pregnancy":  {"safe": false, "note": "Consult doctor"},
    --   "alcohol":    {"safe": false, "note": "Avoid alcohol"},
    --   "driving":    {"safe": true,  "note": "Generally safe"},
    --   "kidneys":    {"safe": null,  "note": "Use with caution"},
    --   "liver":      {"safe": false, "note": "Avoid in liver disease"},
    --   "breastfeed": {"safe": null,  "note": "Consult doctor"}
    -- }
    drug_class          TEXT,                   -- e.g. "NSAID", "Antibiotic"
    schedule            TEXT,                   -- OTC / Schedule H / Schedule H1
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salts_chemical_name      ON salts USING GIN (chemical_name gin_trgm_ops);
CREATE INDEX idx_salts_primary_uses       ON salts USING GIN (primary_uses);

-- ─────────────────────────────────────────────
-- 2. MEDICINES  (Brand medicines table)
--    References salts for grouping alternatives
-- ─────────────────────────────────────────────
CREATE TABLE medicines (
    id              SERIAL PRIMARY KEY,
    brand_name      TEXT NOT NULL,
    manufacturer    TEXT NOT NULL,
    dosage_form     TEXT NOT NULL CHECK (
                        dosage_form IN (
                            'Tablet','Capsule','Syrup','Injection',
                            'Cream','Drops','Inhaler','Suspension',
                            'Gel','Powder','Patch','Suppository'
                        )
                    ),
    strength        TEXT NOT NULL,      -- e.g. "500mg", "10mg/5ml"
    pack_size       INTEGER NOT NULL,   -- units per pack (tablets, ml, etc.)
    pack_unit       TEXT NOT NULL DEFAULT 'units',  -- 'tablets', 'ml', 'capsules'
    price           NUMERIC(10,2) NOT NULL,         -- MRP in INR
    price_per_unit  NUMERIC(10,4) GENERATED ALWAYS AS (
                        CASE
                            WHEN pack_size > 0 THEN price / pack_size
                            ELSE NULL
                        END
                    ) STORED,           -- auto-computed; no manual sync needed
    salt_id         INTEGER NOT NULL REFERENCES salts(id) ON DELETE RESTRICT,
    is_generic      BOOLEAN DEFAULT FALSE,  -- true = Jan Aushadhi / generic
    is_otc          BOOLEAN DEFAULT TRUE,   -- over the counter
    prescription_required BOOLEAN DEFAULT FALSE,
    discontinued    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medicines_brand_name  ON medicines USING GIN (brand_name gin_trgm_ops);
CREATE INDEX idx_medicines_salt_id     ON medicines (salt_id);
CREATE INDEX idx_medicines_price_per_u ON medicines (salt_id, price_per_unit);
CREATE INDEX idx_medicines_dosage_form ON medicines (dosage_form);
CREATE INDEX idx_medicines_active      ON medicines (discontinued) WHERE discontinued = FALSE;

-- ─────────────────────────────────────────────
-- 3. SEARCH_LOGS  (Analytics & audit)
-- ─────────────────────────────────────────────
CREATE TABLE search_logs (
    id              BIGSERIAL PRIMARY KEY,
    query           TEXT NOT NULL,
    query_type      TEXT NOT NULL CHECK (query_type IN ('brand','salt','condition')),
    results_count   INTEGER DEFAULT 0,
    selected_id     INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
    user_session    TEXT,               -- anonymous session fingerprint
    ip_hash         TEXT,               -- hashed, never raw IP
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_query      ON search_logs USING GIN (query gin_trgm_ops);
CREATE INDEX idx_search_logs_created_at ON search_logs (created_at DESC);
CREATE INDEX idx_search_logs_session    ON search_logs (user_session);

-- ─────────────────────────────────────────────
-- 4. ALTERNATIVE_VIEWS  (Materialised for perf)
--    Pre-joins for the most common query pattern
-- ─────────────────────────────────────────────
CREATE MATERIALIZED VIEW mv_medicine_full AS
    SELECT
        m.id,
        m.brand_name,
        m.manufacturer,
        m.dosage_form,
        m.strength,
        m.pack_size,
        m.pack_unit,
        m.price,
        m.price_per_unit,
        m.is_generic,
        m.is_otc,
        m.prescription_required,
        m.discontinued,
        s.id            AS salt_id,
        s.chemical_name AS salt_name,
        s.drug_class,
        s.primary_uses,
        s.side_effects,
        s.safety_warnings_json,
        s.schedule
    FROM medicines m
    JOIN salts s ON s.id = m.salt_id
    WHERE m.discontinued = FALSE
WITH DATA;

CREATE UNIQUE INDEX idx_mv_medicine_full_id ON mv_medicine_full (id);
CREATE INDEX idx_mv_medicine_full_salt  ON mv_medicine_full (salt_id, price_per_unit);
CREATE INDEX idx_mv_medicine_full_brand ON mv_medicine_full USING GIN (brand_name gin_trgm_ops);
CREATE INDEX idx_mv_medicine_full_salt_name ON mv_medicine_full USING GIN (salt_name gin_trgm_ops);

-- Refresh periodically (call from cron or after bulk imports)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_medicine_full;

-- ─────────────────────────────────────────────
-- 5. TRIGGERS  (auto-update updated_at)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_salts_updated_at
    BEFORE UPDATE ON salts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_medicines_updated_at
    BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- 6. SEED DATA  (Representative examples)
-- ─────────────────────────────────────────────
INSERT INTO salts (chemical_name, iupac_name, primary_uses, mechanism, side_effects, safety_warnings_json, drug_class, schedule) VALUES
(
    'Paracetamol 500mg',
    'N-(4-hydroxyphenyl)acetamide',
    ARRAY['Fever','Mild to moderate pain','Headache'],
    'Reduces fever by acting on the hypothalamus and relieves pain by inhibiting prostaglandin synthesis in the CNS.',
    ARRAY['Nausea','Rash','Liver damage (overdose)'],
    '{"pregnancy":{"safe":true,"note":"Safe in all trimesters at recommended doses"},"alcohol":{"safe":false,"note":"Avoid — increases liver damage risk"},"driving":{"safe":true,"note":"No impairment"},"liver":{"safe":false,"note":"Avoid in severe liver disease"},"breastfeed":{"safe":true,"note":"Safe to use"}}',
    'Analgesic / Antipyretic',
    'OTC'
),
(
    'Ibuprofen 400mg',
    '(RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid',
    ARRAY['Pain','Inflammation','Fever','Arthritis'],
    'Non-selective COX-1/COX-2 inhibitor — blocks prostaglandin synthesis to reduce pain and inflammation.',
    ARRAY['Stomach upset','Nausea','Increased bleeding risk','Kidney strain'],
    '{"pregnancy":{"safe":false,"note":"Avoid in 3rd trimester; use with caution in 1st/2nd"},"alcohol":{"safe":false,"note":"Increases GI bleed risk"},"driving":{"safe":true,"note":"Generally safe"},"kidneys":{"safe":false,"note":"Use with caution; avoid in kidney disease"},"liver":{"safe":false,"note":"Avoid in liver failure"},"breastfeed":{"safe":true,"note":"Low risk; short-term use OK"}}',
    'NSAID',
    'OTC'
),
(
    'Amoxicillin 500mg',
    '(2S,5R,6R)-6-[(2R)-2-amino-2-(4-hydroxyphenyl)acetamido]-3,3-dimethyl-7-oxo-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid',
    ARRAY['Bacterial infections','Ear infection','Urinary tract infection','Pneumonia'],
    'Beta-lactam antibiotic that inhibits bacterial cell-wall synthesis by binding to penicillin-binding proteins.',
    ARRAY['Diarrhoea','Rash','Nausea','Allergic reaction'],
    '{"pregnancy":{"safe":true,"note":"Generally considered safe"},"alcohol":{"safe":true,"note":"No major interaction; avoid excess"},"driving":{"safe":true,"note":"No impairment"},"breastfeed":{"safe":true,"note":"Small amounts pass into milk; generally OK"}}',
    'Penicillin Antibiotic',
    'Schedule H'
),
(
    'Atorvastatin 10mg',
    '(3R,5R)-7-[2-(4-fluorophenyl)-3-phenyl-4-(phenylcarbamoyl)-5-propan-2-ylpyrrol-1-yl]-3,5-dihydroxyheptanoic acid',
    ARRAY['High cholesterol','Cardiovascular risk reduction','Heart attack prevention'],
    'HMG-CoA reductase inhibitor — reduces liver cholesterol synthesis, increasing LDL receptor activity.',
    ARRAY['Muscle pain (myopathy)','Headache','Nausea','Liver enzyme elevation'],
    '{"pregnancy":{"safe":false,"note":"Contraindicated — stop before conception"},"alcohol":{"safe":false,"note":"Increases liver stress"},"driving":{"safe":true,"note":"No impairment"},"liver":{"safe":false,"note":"Contraindicated in active liver disease"},"breastfeed":{"safe":false,"note":"Do not use — passes into milk"}}',
    'Statin',
    'Schedule H'
),
(
    'Metformin 500mg',
    '1,1-dimethylbiguanide',
    ARRAY['Type 2 Diabetes','Pre-diabetes','PCOS'],
    'Reduces hepatic glucose production, improves insulin sensitivity, and decreases intestinal glucose absorption.',
    ARRAY['Nausea','Diarrhoea','Stomach upset','Lactic acidosis (rare)'],
    '{"pregnancy":{"safe":true,"note":"Used in gestational diabetes under supervision"},"alcohol":{"safe":false,"note":"Increases lactic acidosis risk"},"driving":{"safe":true,"note":"No impairment; watch for hypoglycaemia with other drugs"},"kidneys":{"safe":false,"note":"Reduce dose or avoid in renal impairment"},"breastfeed":{"safe":true,"note":"Passes into milk in small amounts; generally OK"}}',
    'Biguanide / Antidiabetic',
    'Schedule H'
);

INSERT INTO medicines (brand_name, manufacturer, dosage_form, strength, pack_size, pack_unit, price, salt_id, is_generic, is_otc, prescription_required) VALUES
-- Paracetamol brands
('Crocin','GSK Consumer Healthcare','Tablet','500mg',15,'tablets',22.00,1,FALSE,TRUE,FALSE),
('Dolo 650','Micro Labs','Tablet','650mg',15,'tablets',30.00,1,FALSE,TRUE,FALSE),
('Calpol','Haleon','Tablet','500mg',20,'tablets',35.00,1,FALSE,TRUE,FALSE),
('P-500 (Generic)','Jan Aushadhi','Tablet','500mg',30,'tablets',12.00,1,TRUE,TRUE,FALSE),
('Pacimol','Ipca Laboratories','Tablet','500mg',15,'tablets',18.50,1,FALSE,TRUE,FALSE),
('Metacin','Pfizer','Tablet','500mg',20,'tablets',28.00,1,FALSE,TRUE,FALSE),

-- Ibuprofen brands
('Brufen','Abbott','Tablet','400mg',15,'tablets',42.00,2,FALSE,TRUE,FALSE),
('Combiflam','Sanofi','Tablet','400mg',20,'tablets',48.00,2,FALSE,TRUE,FALSE),
('Advil','Pfizer','Tablet','400mg',10,'tablets',55.00,2,FALSE,TRUE,FALSE),
('Ibugesic','Cipla','Tablet','400mg',15,'tablets',38.00,2,FALSE,TRUE,FALSE),
('IBU-400 (Generic)','Jan Aushadhi','Tablet','400mg',30,'tablets',16.00,2,TRUE,TRUE,FALSE),

-- Amoxicillin brands
('Amoxil','GSK','Capsule','500mg',10,'capsules',85.00,3,FALSE,FALSE,TRUE),
('Mox','Ranbaxy','Capsule','500mg',10,'capsules',78.00,3,FALSE,FALSE,TRUE),
('Novamox','Cipla','Capsule','500mg',10,'capsules',72.00,3,FALSE,FALSE,TRUE),
('AMX-500 (Generic)','Jan Aushadhi','Capsule','500mg',10,'capsules',35.00,3,TRUE,FALSE,TRUE),
('Wymox','Pfizer','Capsule','500mg',10,'capsules',92.00,3,FALSE,FALSE,TRUE),

-- Atorvastatin brands
('Lipitor','Pfizer','Tablet','10mg',10,'tablets',165.00,4,FALSE,FALSE,TRUE),
('Atorva','Zydus','Tablet','10mg',10,'tablets',98.00,4,FALSE,FALSE,TRUE),
('Storvas','Sun Pharma','Tablet','10mg',10,'tablets',88.00,4,FALSE,FALSE,TRUE),
('ATV-10 (Generic)','Jan Aushadhi','Tablet','10mg',10,'tablets',32.00,4,TRUE,FALSE,TRUE),
('Tonact','Lupin','Tablet','10mg',10,'tablets',95.00,4,FALSE,FALSE,TRUE),

-- Metformin brands
('Glucophage','Merck','Tablet','500mg',20,'tablets',55.00,5,FALSE,FALSE,TRUE),
('Glycomet','USV','Tablet','500mg',20,'tablets',42.00,5,FALSE,FALSE,TRUE),
('Obimet','Micro Labs','Tablet','500mg',20,'tablets',38.00,5,FALSE,FALSE,TRUE),
('MET-500 (Generic)','Jan Aushadhi','Tablet','500mg',20,'tablets',18.00,5,TRUE,FALSE,TRUE),
('Riomet','Sun Pharma','Tablet','500mg',20,'tablets',45.00,5,FALSE,FALSE,TRUE);
