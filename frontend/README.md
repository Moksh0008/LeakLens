# LeakLens — Frontend

React 19 + Vite + Tailwind CSS 4 single-page app for LeakLens.

## Scripts

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

## Environment

Copy `.env.example` to `.env`:

- `VITE_USE_MOCK=true` — demo mode: generated data in the browser, no backend required (default).
- `VITE_USE_MOCK=false` + `VITE_API_URL=http://localhost:5000/api` — real mode against the Express backend.

On Vercel, set `VITE_USE_MOCK=false` and `VITE_API_URL` to the deployed backend URL (see the root README).

## Structure

- `src/pages/` — routes: Landing, Home, Dashboard, Upload, Transactions, LeakageAnalysis, Investigation, Analytics, Profile
- `src/components/` — app layout, landing sections, charts (Recharts), shared UI primitives
- `src/services/` — API client (`api.js`), auth (`auth.js`), demo data (`mockData.js`)
- `src/styles/globals.css` — Tailwind theme tokens
