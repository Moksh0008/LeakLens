# LeakLens — Procurement Spend Intelligence

LeakLens is a procurement spend-leakage detection platform built for FINATHON 2026 (problem statement FIN-04). Upload a procurement CSV and LeakLens flags overpayments, duplicate payments and other leakage patterns — then lets you drill into every finding with full evidence and an AI-assisted document review.

- **Frontend:** https://leaklens-mmra.vercel.app
- **Backend health:** https://leaklens-backend-zhqo.onrender.com/api/health

## What it does

1. **Upload** a procurement CSV (transaction ID, date, product, category, supplier, quantity, unit price…). Dates are normalized (DD-MM-YYYY / DD-MM-YYYY → ISO) and rows are stored in Supabase.
2. **Detect** leakage: every row is scored against benchmark prices and checked for duplicates, with severity assigned by impact.
3. **Investigate:** KPI dashboard, filterable transaction ledger, a leakage alert feed, and a per-finding investigation view with evidence (benchmark vs paid, overpay amount, why it was flagged).
4. **Analyze documents:** upload a contract/invoice PDF and get an AI summary of risk clauses and overpayment exposure via the Nova API.

## Detection rules

- **Price anomaly** — unit price ≥ 15% above the lowest price paid for the same product in the batch.
- **Duplicate payment** — same supplier + product + quantity + unit price + date appearing more than once.
- **Severity** — HIGH at ≥ 50% overpayment or ₹500K impact, MEDIUM at ≥ 30% or ₹100K, LOW otherwise.

The rules ship in two interchangeable forms: a standalone Python engine (`detection-engine/`, pandas + NumPy + pytest) and a built-in detector inside the Express backend so the app runs with a single Node process. The Python engine is the reference implementation; the backend fallback mirrors it.

## Architecture

```
React 19 SPA (Vite, Tailwind 4, Recharts)
        │  REST
        ▼
Express 5 API (Node) ──► Supabase (Postgres + Auth)
        │
        ├──► Detection (built-in rules or Python engine)
        └──► Nova AI (document analysis)
```

## Repository layout

| Path | Contents |
| --- | --- |
| `frontend/` | React SPA — pages, charts, shared UI, API layer, mock-data mode |
| `backend/` | Express API — routes, controllers, services, `schema.sql` for Supabase |
| `detection-engine/` | Standalone Python rule engine with pytest suite |

## Getting started

Prerequisites: Node 18+, and a Supabase project (optional — the frontend demo mode works without any backend).

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # set SUPABASE_URL and SUPABASE_KEY
npm run dev             # http://localhost:5000
```

Create the tables by running `backend/schema.sql` in the Supabase SQL editor.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env    # see below
npm run dev             # http://localhost:5173
```

Frontend environment:

- `VITE_USE_MOCK=true` — demo mode, generated data in the browser, no backend needed.
- `VITE_USE_MOCK=false` + `VITE_API_URL=http://localhost:5000/api` — real mode against the local backend.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/upload` | Upload a procurement CSV (multipart field `file`) |
| GET | `/api/transactions` | Transaction ledger |
| GET | `/api/leakage` | Findings feed; `GET /api/leakage/:transactionId` for detail |
| GET | `/api/dashboard` | KPI rollups (spend, leakage, flagged counts) |
| POST | `/api/auth/signup` · `/api/auth/login` | Email/password auth via Supabase |
| GET | `/api/documents/status` | AI document-analysis availability |
| POST | `/api/documents/analyze` | Analyze a document (multipart field `file`) |
| GET | `/api/health` | Health check |

## Deployment

- **Frontend — Vercel:** SPA rewrite handled by `frontend/vercel.json`. Set `VITE_USE_MOCK=false` and `VITE_API_URL` to the deployed backend.
- **Backend — Render:** blueprint in `render.yaml`. Required env: `SUPABASE_URL`, `SUPABASE_KEY`, `CORS_ORIGIN`, `MOCK_DETECTION`; optional: `NOVA_API_KEY`, `NOVA_API_BASE_URL`.

## Tech stack

React 19 · Vite · Tailwind CSS 4 · Recharts · Framer Motion · React Router · Express 5 · Supabase (Postgres + Auth) · Python (pandas, NumPy, pytest)
