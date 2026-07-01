# AltRx — Affordable Medicine Alternative Finder

> **Your Prescription, Our Priority.**  
> Find cost-effective generic alternatives with identical active chemical ingredients (salts).

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Backend | Python 3.12 · FastAPI · asyncpg |
| Database | PostgreSQL 16 + `pg_trgm` extension |
| Search | Trigram fuzzy matching (tolerates typos) |
| Deployment | Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose  
- Node.js ≥ 18  
- Python 3.12+

### 1. Clone & configure
```bash
git clone https://github.com/hiteshjha24/altrx.git
cd altrx
cp .env.example .env   # edit DATABASE_URL, CORS_ORIGINS if needed
```

### 2. Start everything
```bash
docker compose up -d
```

This will:
- Start PostgreSQL and run `database/schema.sql` (schema + seed data)
- Start the FastAPI backend on **http://localhost:8000**
- Start the Next.js frontend on **http://localhost:3000**

### 3. Without Docker (local dev)
```bash
# Terminal 1 — Database (PostgreSQL must be running)
psql -U postgres -c "CREATE DATABASE altrx_db;"
psql -U postgres -d altrx_db -f database/schema.sql

# Terminal 2 — Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
altrx/
├── database/
│   └── schema.sql          # DDL + seed data (PostgreSQL)
│
├── backend/
│   ├── main.py             # FastAPI app + all the routes
│   ├── database.py         # asyncpg connection pool {PostbresSQL}
│   ├── schemas.py          # Pydantic v2 request/response models
│   ├── search.py           # Fuzzy search + pg_trgm logic
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── AltRxApp.jsx        # Complete React/Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (medicines)/
│   │       ├── search/page.tsx
│   │       ├── [id]/page.tsx
│   │       └── [id]/alternatives/page.tsx
│   └── components/
│       ├── Navbar.tsx
│       ├── SearchBar.tsx
│       ├── MedicineCard.tsx
│       ├── AlternativeCard.tsx
│       ├── SavingsCalculator.tsx
│       ├── SafetyWarnings.tsx
│       └── DisclaimerFooter.tsx
│
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Database Schema

### Core Design Pattern
```
salts (chemical_name, primary_uses, side_effects, safety_warnings_json)
  │
  └── medicines (brand_name, manufacturer, price, pack_size, salt_id)
                                                           │
                               Computed: price_per_unit = price / pack_size
```

**Key insight:** `price_per_unit` is a PostgreSQL `GENERATED ALWAYS` column — it's computed automatically from `price ÷ pack_size`, eliminating all the sync bugs.

Fuzzy search uses the `pg_trgm` extension with GIN indexes for sub-millisecond typo-tolerant lookups.

---

## ⚙️ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=crocin` | Fuzzy search by brand or salt name |
| `GET` | `/api/medicines/{id}` | Full medicine detail + safety data |
| `GET` | `/api/medicines/{id}/alternatives` | **Core:** cheapest alternatives sorted by price/unit |
| `GET` | `/api/salts/{id}` | Salt/chemical detail |
| `GET` | `/api/popular` | Popular searches for homepage |
| `GET` | `/health` | Health check |

### Example: Find alternatives
```bash
curl http://localhost:8000/api/medicines/1/alternatives
```
```json
{
  "target": { "brand_name": "Crocin", "price": 22.00, "price_per_unit": 1.4667, ... },
  "alternatives_count": 5,
  "max_savings_percentage": 72.7,
  "alternatives": [
    { "brand_name": "P-500 (Generic)", "price": 12.00, "savings_percentage": 72.7, "is_generic": true },
    { "brand_name": "Pacimol", "price": 18.50, "savings_percentage": 15.9 },
    ...
  ]
}
```

---

## 🎨 Design System — Soft Neo-Brutalism

The UI uses a dark Soft Neo-Brutalism aesthetic:
- **2px solid borders** on all cards with `box-shadow: 4px 4px 0 0 #000`
- **Teal (#14B8A6)** primary accent matching the logo's green-blue gradient
- **High contrast** savings badges in green
- **Flat safety warning cards** color-coded red/amber/green by risk level
- **Trigram autocomplete** with instant fuzzy matching in the search bar

---


## 📊 Adding More Medicines

Use the seed pattern in `database/schema.sql`:

```sql
-- 1. Add the salt if new
INSERT INTO salts (chemical_name, primary_uses, side_effects, safety_warnings_json, drug_class, schedule)
VALUES ('Cetirizine 10mg', ARRAY['Allergies','Hay fever'], ARRAY['Drowsiness'], '...json...', 'Antihistamine', 'OTC');

-- 2. Add the brand medicine
INSERT INTO medicines (brand_name, manufacturer, dosage_form, strength, pack_size, pack_unit, price, salt_id)
VALUES ('Cetzine', 'Dr Reddy', 'Tablet', '10mg', 10, 'tablets', 35.00, <salt_id>);

-- 3. Refresh the materialised view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_medicine_full;
```

---

## 🔒 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://altrx_user:...` | Full PostgreSQL DSN |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL for Next.js |

---

## ⚠️ Disclaimer

AltRx is purely informational. It is not a licensed pharmacy, does not sell medicines, and the information provided is not a substitute for professional medical advice. Always consult a qualified healthcare provider before changing medication.
