# Royal Mail Delivery Times Tracker

Minimal Next.js 15 app that crowdsources Royal Mail delivery times per postcode sector. Built for simple deployment on Railway using a single SQLite table (with optional Postgres fallback).

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
2. Run the strict lint/typecheck suite:
   ```bash
   npm run lint && npm run typecheck
   ```
   (Next.js also runs these during `npm run build`.)
3. Run the dev server (creates `data/delivery.sqlite` automatically):
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`.

## Environment variables
| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Optional. Set to a Postgres connection string to switch from SQLite. Leave unset for local SQLite (`data/delivery.sqlite`). |
| `SQLITE_PATH` | Optional override for the SQLite file location. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional. Google Analytics v4 ID; when provided the tracking snippet is injected. |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` | Optional. Adds a 300×250 AdSense slot bottom-right on large screens. |

## API endpoints
- `POST /api/report` – body `{ postcode, deliveryDate (YYYY-MM-DD), deliveryTime (HH:mm), deliveryType, note? }`
- `GET /api/postcode/[postcode]` – returns sector/full-postcode aggregates, 15-minute histogram, confidence level, and last update timestamp.

## Railway deployment
1. Create a Railway project and provision a web service from this repo.
2. Add a persistent volume (1GB is plenty) and mount it to `/app/data`.
3. Set `SQLITE_PATH=/app/data/delivery.sqlite` as an environment variable.
4. (Optional) Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` and/or `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT`.
5. Deploy. The app will create the table automatically on first start.

### Postgres fallback
If Railway volumes are unavailable, attach a Postgres add-on and set its connection string as `DATABASE_URL`. The single table is created automatically with identical columns.

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
