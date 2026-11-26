# Game Catalog Project - AI Agent Instructions

## Project Overview
Full-stack personal video game catalog built with **React 19 + TypeScript + Vite + Tailwind CSS v4** on the frontend and **Convex** (database, serverless functions, scheduled jobs, and **Convex Auth v2**) on the backend. Integrates with the **RAWG** and **Steam Web API** for game metadata and library imports.

## Technology Stack
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@theme` semantic tokens in `src/index.css`)
- **UI Primitives:** Radix UI (`@radix-ui/react-dialog`, `react-popover`, `react-select`), `lucide-react`, `sonner`
- **Backend & Database:** Convex (`convex/`)
- **Authentication:** Convex Auth v2 (`@convex-dev/auth`) with Email + Password and `@convex-dev/resend`
- **External APIs:** RAWG Video Games Database API, Steam Web API

## Directory Structure
- `/convex/` — Serverless backend
  - `schema.ts` — Database schema (`users`, `games`, `userGames`, `userPreferences`, `importJobs`, `importJobItems`)
  - `lib/` — Shared domain validators & types (`domain.ts`), typed auth helpers (`auth.ts`), upsert helpers (`userGames.ts`)
  - `providers/` — External API adapters (`rawg.ts`, `steam.ts`)
  - `games.ts` — Core user library queries & mutations (`getLibrary`, `getGameDetail`, `updateUserGame`, `removeFromLibrary`, preferences)
  - `gamesInternal.ts` — Internal queries/mutations for cache lookups and upserts
  - `catalogActions.ts` — Authenticated external API actions (`searchExternalGames`, `addGameByRawgId`, `refreshGameMetadata`)
  - `imports.ts` — Durable chunked background imports (`startBulkImport`, `startSteamImport`, `processImportChunk`, job history)
  - `migrations.ts` — Non-destructive, idempotent paginated schema backfills
  - `auth.ts`, `auth.config.ts`, `convex.config.ts`, `users.ts`, `http.ts`, `router.ts` — Auth & HTTP routing
- `/src/` — Frontend
  - `app/` — `App.tsx`, `ErrorBoundary.tsx`
  - `components/ui/` — Accessible reusable UI primitives (`Button`, `Badge`, `Dialog`, `Popover`, `Select`, `MultiSelectFilter`, `Spinner`, `EmptyState`)
  - `features/auth/` — `SignInForm`, `AuthLinkViews`, `AccountDialog`, `authErrors`
  - `features/catalog/` — `CatalogPage`, `CatalogSidebar`, `CatalogStatsHeader`, `CatalogToolbar`, `FilterBar`, `GameGrid`, `GameTable`, `GameDetailDialog`, `PaginationControls`
  - `features/imports/` — `AddGameDialog`, `BulkImportDialog`, `SteamImportDialog`, `ImportHistoryDialog`
  - `lib/` — Store/status metadata & filtering (`catalog.ts`), URL-synced filter/modal state (`urlState.ts`), `hooks.ts`, `utils.ts`

## Coding Guidelines
1. **Single source of truth for stores & statuses:** Add new storefronts or play statuses in `convex/lib/domain.ts` and `src/lib/catalog.ts`. Never add per-store boolean columns.
2. **Convex best practices:**
   - Include `args` and `returns` validators on all public and internal Convex functions.
   - Use plain TypeScript helpers in `convex/lib/` instead of calling `ctx.runMutation` from inside a mutation.
   - Always authenticate actions that call paid/rate-limited external APIs (RAWG/Steam), and never log URLs containing API keys.
   - Run long-running imports via scheduled chunked actions (`convex/imports.ts`), never single unbounded loops.
   - Define user HTTP routes in `convex/router.ts`.
3. **Frontend best practices:**
   - Use semantic Tailwind v4 theme tokens (`bg-surface`, `text-ink`, `border-border-subtle`, `bg-primary`, etc.) and Radix primitives in `src/components/ui/`.
   - Never use `dangerouslySetInnerHTML` for third-party API descriptions.
   - Keep catalog query subscriptions lean (`api.games.getLibrary` powers filtering/sorting/facets in one reactive query).

## Commands
- Dev server (Frontend + Backend): `npm run dev`
- Production build: `npm run build`
- Typecheck, lint & build: `npm run lint`
- Tests: `npm test -- --run`
