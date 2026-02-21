# Game Catalog Project - AI Agent Instructions

## Project Overview
This project is a full-stack web application designed for browsing and managing a video game catalog. It is built using **React** (via Vite) for the frontend and **Convex** for the serverless backend, database, and authentication. The project interacts with external APIs such as RAWG and Steam to fetch game data.

## Technology Stack
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, custom UI components (Shadcn logic using `clsx` and `tailwind-merge`)
- **Backend & Database:** Convex
- **Authentication:** Convex Auth (`@convex-dev/auth`) utilizing both Anonymous auth and Password-based auth (with Resend for email resets).
- **External APIs:** RAWG Video Games Database API, Steam Store API

## Directory Structure
- `/src/` - Frontend directory
  - `components/` - Reusable UI components.
  - `lib/` - Utility functions (e.g., Shadcn's `cn` utility).
  - `App.tsx`, `main.tsx` - App entry points.
- `/convex/` - Backend directory
  - `schema.ts` - Convex database schema definitions.
  - `games.ts`, `gamesInternal.ts` - Core queries and mutations for game data.
  - `rawg.ts`, `rawgClient.ts` - Logic for fetching and normalizing data from the RAWG API.
  - `steam.ts` - Logic for fetching data from the Steam API.
  - `auth.ts`, `auth.config.ts` - Convex Auth configuration.
  - `http.ts`, `router.ts` - HTTP endpoints setup (User-defined routes should go into `router.ts`).

## Development & Coding Guidelines

### 1. Frontend Rules
- **Modern React:** Use functional components, React hooks, and strict TypeScript typing.
- **Styling:** Rely entirely on Tailwind CSS utility classes. Avoid creating custom CSS unless absolutely necessary (modifications usually go into `index.css`).
- **Data Fetching:** Always use Convex hooks (`useQuery`, `useMutation`, `useAction`) to interact with the backend. Do not perform direct `fetch` calls from the client unless accessing public APIs directly (though external API calls like RAWG/Steam are preferably securely proxied through Convex Actions).

### 2. Backend Rules (Convex)
- **Functions:** Separate logical roles appropriately. Use `query` for read operations, `mutation` for writing data, and `action` for calling third-party APIs (like RAWG and Steam).
- **Internal Functions:** Suffix or place logic meant strictly for internal backend orchestration in internally-scoped functions (e.g., `*Internal.ts` or wrapping with `internalQuery`/`internalMutation`).
- **HTTP Routing:** Define user-facing HTTP hooks in `convex/router.ts` specifically, as `convex/http.ts` is predominantly used for Convex Auth routing handling.
- **Database Schema:** Keep `convex/schema.ts` strictly updated with accurate types matching the document structures you store.

### 3. Authentication Flow
- Rely exclusively on Convex Auth functionality.
- For testing out new restricted areas, keep in mind there is support for Anonymous and Email/Password resets. Resend API configurations are needed for email features to completely function.

### 4. General Commands
- Development server (Frontend + Backend): `npm run dev`
- Build for production: `npm run build`
- Typechecking & Linting: `npm run lint`
