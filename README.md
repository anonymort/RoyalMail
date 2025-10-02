# Royal Mail Delivery Times Tracker

Minimal Next.js 15 app that crowdsources Royal Mail delivery times per postcode sector. Designed for Railway deployment with managed Postgres (SQLite remains available for local development).

## Stack
- Next.js 15 (App Router + TypeScript)
- TailwindCSS with Catppuccin palette
- SQLite via `better-sqlite3` by default; `pg` fallback when `DATABASE_URL` is Postgres
- Recharts histogram for delivery time distribution

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
   (Peer deps are relaxed via `.npmrc` so React 19 RC works with Recharts.)
2. (Optional) Copy environment defaults and adjust if needed:
   ```bash
   cp .env.example .env.local
   ```
   Leave `DATABASE_URL` blank for local SQLite; populate it to test against Postgres.
3. Run the strict lint/typecheck suite:
   ```bash
   npm run lint && npm run typecheck
   ```
   (Next.js also runs these during `npm run build`.)
4. Run the dev server (creates `data/delivery.sqlite` automatically when `DATABASE_URL` is unset):
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000`.

## Environment variables
| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (`postgresql://…`). Required in production; leave unset locally to use SQLite (`data/delivery.sqlite`). |
| `SQLITE_PATH` | Optional override for the SQLite file location. Leave unset to use Postgres when `DATABASE_URL` is present. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional. Google Analytics v4 ID; when provided the tracking snippet is injected. |

## API endpoints
- `POST /api/report` – body `{ postcode, deliveryDate (YYYY-MM-DD), deliveryTime (HH:mm), deliveryType, note? }`
- `GET /api/postcode/[postcode]` – returns sector/full-postcode aggregates, 15-minute histogram, confidence level, and last update timestamp.

## Railway deployment
1. Create a Railway project and provision a web service from this repo.
2. Provision the managed Postgres service (e.g., `Mail-Postgres`) and copy its `DATABASE_URL`.
3. In the web service, add the `DATABASE_URL` variable (use the internal hostname `postgres.railway.internal:5432` for best performance). Keep `.env.local` for local overrides.
4. (Optional) Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
5. Redeploy. On first boot the app will create the `delivery_reports` table automatically.

> Tip: For local development you can stay on SQLite—simply leave `DATABASE_URL` unset and the app will write to `data/delivery.sqlite`.

## Scripts
- `npm run dev` – start Next.js in development
- `npm run build` – production build
- `npm run start` – launch production server
- `npm run lint` – basic lint checks via `eslint-config-next`
- `npm run typecheck` – strict TypeScript check (`tsc --noEmit`)

## Notes
- Delivery stats aggregate the last 30 days of reports.
- Full postcode breakdown unlocks after 7 submissions; otherwise only the sector view is shown.
- Histogram buckets are 15 minutes to keep the UI legible.
