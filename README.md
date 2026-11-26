# Game Catalog

Personal video game library manager built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Convex**.

## Features
- **Unified reactive library:** Single-query library sync with instant search, multi-select filtering (platforms, genres, stores, play status), sorting, pagination, and URL-synced state.
- **Extensible multi-store tracking:** Track ownership across Steam, Epic Games, GOG, PlayStation, Xbox, Nintendo, itch.io, EA App, Ubisoft Connect, and physical/other copies—plus play status, personal 1–5 rating, playtime, and notes.
- **Durable background imports:** Import from Steam (preserving Steam App IDs and playtime) or bulk-paste game titles. Imports run in chunked background jobs on Convex with local catalog cache matching and persisted per-game import history.
- **Authentication & account security:** Powered by Convex Auth v2 (email/password sign-up verification, password recovery, change password, and change email via Resend).

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables (Convex deployment)
Configure these on your Convex deployment (dev and prod):
- `RAWG_API_KEY`: RAWG API key from https://rawg.io/apidocs
- `STEAM_API_KEY`: Steam Web API key from https://steamcommunity.com/dev/apikey
- `RESEND_API_KEY`: Resend API key from https://resend.com/
- `EMAIL_FROM`: Verified sender address (e.g. `"Game Catalog <no-reply@example.com>"`)
- `SITE_URL`: Public frontend base URL for emailed links (defaults to `http://localhost:5173`)

### Existing Data Compatibility & Backfill
Existing `games` and `userGames` rows (including legacy `ownedOnSteam` / `ownedOnEpic` / `ownedOnGog` flags) are read transparently with zero downtime. To backfill existing rows into the new `stores[]` and `games.normalizedName` fields in batches, run:

```bash
npx convex run migrations:runCatalogBackfill
```

## Scripts
- `npm run dev` — Start Vite frontend + Convex dev backend
- `npm run lint` — Typecheck backend & frontend, run ESLint, and build
- `npm test -- --run` — Run Vitest suite
- `npm run build` — Production Vite bundle
