# Repository Guidelines

## Project Structure & Module Organization
- `app/` – Next.js App Router routes (`page.tsx`, API handlers, layouts) and global styles in `app/globals.css`.
- `components/` – Client and server React components (e.g., `ReportForm`, `PostcodeSearch`).
- `lib/` – Shared utilities for data access, postcode parsing, and domain types.
- `data/` – Local SQLite storage during development (Git-ignored WAL/SHM files).
- `tests/e2e/` – Playwright end-to-end specs. Add new tests close to related features.

## Build, Test, and Development Commands
```bash
npm run dev          # Start Next.js locally at http://localhost:3000
npm run lint         # Run eslint via next lint
npm run typecheck    # Run TypeScript in noEmit mode
npm run build        # Production bundle (runs lint+typecheck first)
npm run test:e2e     # Playwright chromium suite with auto-started dev server
```

## Coding Style & Naming Conventions
- Use TypeScript, React 19 RC, and Tailwind classes. Prefer server components unless client APIs are required.
- Maintain strict TypeScript (`tsconfig.json`) and obey ESLint rules; fix warnings before pushing.
- Components: PascalCase filenames; utility modules: camelCase. Keep Catppuccin color tokens hyphenated (e.g., `text-cat-sky`).
- Format strings and SQL with template literals; avoid default exports unless a file exposes a single component/page.

## Testing Guidelines
- Playwright tests live in `tests/e2e`. Name specs with the feature area (`basic.spec.ts`) and group scenarios with `test.describe`.
- Ensure new routes or flows include at least one e2e assertion showing happy-path navigation and key UI states.
- Before merging, run `npm run test:e2e`; CI mode retries twice, local runs do not.

## Commit & Pull Request Guidelines
- Follow conventional, present-tense subjects (e.g., `Add postcode parser`, `Fix histogram spacing`). Keep lines ≤72 chars.
- Commits should bundle one logical change set and include updated tests or docs when relevant.
- PRs must summarize the change, list testing evidence (`npm run build`, `npm run test:e2e`), and link to tracking issues. Add screenshots/GIFs for UI tweaks.

## Environment & Deployment Notes
- Node 24+ is supported; ensure `npm install` completes without `--ignore-scripts` to build native deps (`better-sqlite3`).
- Local dev defaults to SQLite under `data/delivery.sqlite`; set `DATABASE_URL` for Postgres deployments and `SQLITE_PATH` for Railway volumes.
- Keep optional analytics/ad IDs (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT`) in `.env.local`, never in source control.
