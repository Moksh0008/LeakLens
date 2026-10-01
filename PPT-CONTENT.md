# LeakLens — PPT Content (A-to-Z)

Everything used in the project, organized slide-by-slide. Copy any section straight into your deck.

---

## Slide 1 — Title

**LeakLens — Procurement Spend Intelligence**
- Find where procurement spend leaks: price anomalies, missed discounts, fragmented purchasing, contract exceptions
- FINATHON 2026 · FIN-04 — Procurement Spend Leakage
- Team: Member 1 (Frontend Lead) · Member 2 (Upload/Investigation) · Member 3 (Backend) · Member 4 (Detection Engine)

---

## Slide 2 — The Problem

- Procurement leakage rarely appears in a single transaction
- Same product bought at wildly different prices across teams/suppliers
- Negotiated discounts and contract terms silently missed
- Purchasing fragmented across too many suppliers — volume leverage lost
- Spreadsheets can't catch these patterns at scale

---

## Slide 3 — Our Solution

One platform that:
1. **Imports** historical procurement transactions (CSV)
2. **Normalizes** suppliers and products for like-for-like comparison
3. **Analyzes** prices, contracts, suppliers and patterns against benchmarks
4. **Investigates** — surfaces leakage with transaction-level evidence, severity and impact math

---

## Slide 4 — Tech Stack (at a glance)

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7, Framer Motion 13, Recharts 3 |
| Linting/Quality | oxlint (0 errors), Vite build |
| Backend | Node.js, Express 5, Multer (uploads), csv-parser, Axios |
| Database | Supabase (PostgreSQL) + Supabase Auth |
| Detection Engine | Python, pandas, numpy, pytest |
| Deployment | Vercel (frontend), local/cloud backend, Supabase cloud DB |

---

## Slide 5 — System Architecture

```
Browser (React SPA on Vercel)
   │  REST / JSON
   ▼
Express API (Node.js, :5000)
   │                        │
   │ axios POST /analyze    │ supabase-js
   ▼                        ▼
Detection Engine        Supabase (Postgres + Auth)
(Python/pandas, :8000)  ├── procurement_transactions
                        └── leakage_results
```

- Frontend never talks to the DB directly — everything flows through the API
- One stable frontend service layer (`api.js`) switches between **Mock mode** (demo) and **Real API mode** via `VITE_USE_MOCK`

---

## Slide 6 — Frontend (A-to-Z)

**Core:** React 19 · Vite 8 (build ~300ms) · Tailwind CSS v4 (design tokens, dark premium theme) · React Router 7 (SPA routing) · Framer Motion (animations, reduced-motion aware) · Recharts (charts) · oxlint

**Pages (12 routes):**
- `/` Landing (hero, problem, how-it-works, intelligence, insights, investigation preview, CTA, footer)
- `/login`, `/signup` (shared AuthLayout, watermark background, centered composition)
- `/home` (role-aware greeting, quick snapshot, primary actions, recent activity, requires attention)
- `/dashboard` (KPI cards, spend-vs-leakage chart, high-impact table)
- `/transactions` (searchable, flagged rows link to investigation)
- `/upload` + `/import` (CSV dropzone, column schema hint, processing state)
- `/investigation` (finding evidence, impact math)
- `/profile` (account details, change email, logout)
- `/price-benchmarking`, `/supplier-analysis`, `/contracts`, `/leakage` (module slots)
- `/styleguide` (design system reference)

**Services layer (the integration backbone):**
- `api.js` — single stable interface: `getDashboard`, `getTransactions`, `getLeakage`, `getLeakageById`, analytics builders, `uploadProcurementFile`; env-switchable Mock ⇄ Real; real-mode JOIN adapter merges transactions + leakage by transactionId
- `auth.js` — `signIn`, `signUp`, `changeEmail`, session/profile storage, `isSignedIn()`
- `mockData.js` — illustrative dataset + builders (accept real data too)
- `format.js` — null-safe `formatINR`, `formatCompactINR`, `formatNumber`, `formatPercent`, `formatDate`

**UX features shipped:**
- Auth-aware landing (signed-in users see "Open Workspace" + avatar menu, not "Log in")
- Avatar dropdown: Profile / Change Email / Log out (shared component, works on landing too)
- Empty workspace state for new accounts: "Upload your CSV file to get analysis" — no fake data
- Per-account mock workspace: data appears only after an upload; logout resets it
- Inline server-error banners on all auth forms
- Watermark background system shared by landing + auth pages
- 1440px landing container, centered 1280px auth composition
- localStorage session + profile persistence

---

## Slide 7 — Backend (A-to-Z)

**Stack:** Node.js · Express 5 · @supabase/supabase-js · Multer · csv-parser · Axios · dotenv · CORS

**REST API (all under `/api`):**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/auth/signup` | Create user (Supabase Auth, profile in metadata) |
| POST | `/auth/login` | Verify credentials → session tokens |
| POST | `/auth/change-email` | Bearer token + current password → email update |
| GET | `/dashboard` | 4 KPIs: total spend, potential leakage, transactions analyzed, flagged |
| GET | `/transactions` | All transactions (snake_case → camelCase mapping) |
| GET | `/leakage` | Findings sorted by potential leakage |
| GET | `/leakage/:txId` | Single finding with evidence |
| POST | `/upload` | Multipart CSV (10 MB limit) → validate → store → detect → store findings |

**Services:** `transactionService`, `leakageService`, `dashboardService`, `uploadService` (duplicate-ID guard → row validation → insert → detect → insert findings), `csvService` (header validation: transactionId, date, product, category, supplier, quantity, unitPrice, totalAmount), `detectionService` (engine HTTP call, 30 s timeout), `supabase.js` (fail-fast env guard)

**Config:** port 5000 · `SUPABASE_URL`, `SUPABASE_KEY`, `DETECTION_ENGINE_URL`, `MOCK_DETECTION` (all in git-ignored `.env`)

---

## Slide 8 — Database (Supabase / PostgreSQL)

**`procurement_transactions`** — transaction_id (unique), date, product, category, supplier, quantity, unit_price, total_amount, created_at

**`leakage_results`** — transaction_id (FK, cascade), product, supplier, quantity, actual_price, benchmark_price, potential_leakage, severity (HIGH/MEDIUM/LOW), detection_type, reason, created_at

- Row Level Security **enabled** (backend uses service key; public access locked)
- Indexes on transaction_id, severity, date
- Auth users live in Supabase Auth (managed) — no custom users table needed

---

## Slide 9 — Detection Engine (Member 4)

**Stack:** Python · pandas · numpy · pytest

**Input:** array of `{ transactionId, date, product, category, supplier, quantity, unitPrice, totalAmount }`

**Detection types (5):**
- PRICE_ANOMALY — unit price far above product benchmark
- SUPPLIER_PRICE_VARIANCE — same product, different supplier prices
- PRICE_SPIKE — sudden price jump vs history
- POSSIBLE_DUPLICATE — same product/supplier/qty/price/date repeated
- UNUSUAL_QUANTITY — quantity far outside normal range

**Severity rules:** deviation ≥50% or impact ≥₹500K → HIGH · ≥30% or ≥₹100K → MEDIUM · else LOW

**Leakage formula:** `potentialLeakage = max(actualPrice − benchmarkPrice, 0) × quantity` — the SAME formula is shown with evidence on Investigation/Home, and the same values flow to Dashboard/Leakage (single source of truth: engine → DB → API → UI)

**Planned interface:** HTTP `POST /analyze { transactions }` → `{ findings: [...] }` on port 8000 (backend client is ready and waiting)

---

## Slide 10 — Authentication (real, database-backed)

1. User signs up → Express → Supabase Auth → user stored (password hashed by Supabase), profile (name, org, role) in `user_metadata`
2. Login → Supabase verifies → returns **access + refresh tokens** (JWT)
3. Frontend stores session in localStorage; header shows real user initials + first name
4. Change email → current password re-verified + Bearer token check → Supabase admin update
5. Logout → session + profile cleared, landing flips back to public state

---

## Slide 11 — End-to-End Data Flow (CSV journey)

```
Import CSV → validate columns & rows → reject duplicates
  → insert into procurement_transactions
  → run detection engine on the batch
  → insert findings into leakage_results
  → Dashboard / Transactions / Home / Leakage read via API
```

- New accounts start with an **empty workspace** and an "Upload your CSV" prompt
- Every page reads through the same API layer — consistent numbers everywhere

---

## Slide 12 — Deployment

- **Frontend:** Vercel, auto-deploys on push to `main`; `vercel.json` SPA rewrites (no 404s on refresh/deep links)
- **Backend:** runs on :5000 locally; cloud-ready (Railway/Render) — needs the same env vars
- **Database/Auth:** Supabase cloud project; schema provisioned via `schema.sql`
- **Secrets:** `.env` files git-ignored (verified with `git check-ignore`); service key never reaches the frontend

---

## Slide 13 — Quality & Verification

- `npm run build` ✅ (~300 ms) · `npm run lint` ✅ 0 errors (oxlint, 61 files)
- Backend unit test: CSV validation (`node --test`) ✅
- Live API tests: signup → user created in Supabase; login → JWT session; wrong password → 401; email change round-trip ✅
- Browser E2E journeys: landing → login → home → dashboard → upload → transactions → investigation (mock + real modes)
- Deep-link/refresh fix verified on production URL

---

## Slide 14 — Integration Challenges We Solved

1. Four team branches, one app — merged without deleting anyone's work
2. Two frontend API implementations → single env-switchable service layer
3. Backend served snake_case, UI expected camelCase → adapter in `api.js`
4. Missing analytics endpoints → derived client-side from live data
5. Detection engine had no HTTP server → documented contract + ready backend client
6. Vercel SPA 404s on refresh → `vercel.json` rewrites
7. Stub auth → real Supabase Auth with sessions, profile, email change
8. Fresh accounts showed demo data → true empty workspace states

---

## Slide 15 — Future Roadmap

- Deploy detection engine as HTTP service (FastAPI `/analyze`)
- Deploy backend to Railway/Render → the Vercel site goes fully live
- Real analytics endpoints on the backend (`/api/analytics/*`)
- Route guards + token refresh
- Editable profile (organization, role)
- Charts on more pages; export findings to PDF/Excel

---

## Slide 16 — Team Contribution

- **Member 1 (Frontend Lead):** design system, landing + all pages, API integration layer, auth UI, Vercel deploy, integration fixes
- **Member 2:** upload/investigation UX, mock API patterns (restored & merged)
- **Member 3:** Express API, Supabase services, upload pipeline
- **Member 4:** pandas detection engine, severity rules, test suite
