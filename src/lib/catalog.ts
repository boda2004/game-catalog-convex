import type { Id } from "../../convex/_generated/dataModel";
import {
  GAME_STATUSES,
  STORE_IDS,
  type GameStatus,
  type StoreId,
} from "../../convex/lib/domain";

export { GAME_STATUSES, STORE_IDS };
export type { GameStatus, StoreId };

export type StoreFilter = StoreId | "no_store";
export type SortField =
  | "userAddedAt"
  | "name"
  | "rating"
  | "metacritic"
  | "released"
  | "playtimeMinutes"
  | "userRating";
export type SortOrder = "asc" | "desc";

export interface LibraryGame {
  _id: Id<"games">;
  rawgId: number;
  name: string;
  slug: string;
  backgroundImage?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  userAddedAt: number;
  stores: StoreId[];
  status?: GameStatus;
  userRating?: number;
  playtimeMinutes?: number;
}

export interface StoreMeta {
  id: StoreId;
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
  barClass: string;
}

export const STORE_META: Record<StoreId, StoreMeta> = {
  steam: {
    id: "steam",
    label: "Steam",
    shortLabel: "Steam",
    badgeClass:
      "bg-sky-500/15 text-sky-600 ring-1 ring-inset ring-sky-500/25 [html[data-theme='dark']_&]:text-sky-300",
    dotClass: "bg-sky-400",
    barClass: "bg-sky-500",
  },
  epic: {
    id: "epic",
    label: "Epic Games",
    shortLabel: "Epic",
    badgeClass:
      "bg-slate-500/15 text-slate-700 ring-1 ring-inset ring-slate-500/25 [html[data-theme='dark']_&]:text-slate-200",
    dotClass: "bg-slate-400",
    barClass: "bg-slate-400",
  },
  gog: {
    id: "gog",
    label: "GOG",
    shortLabel: "GOG",
    badgeClass:
      "bg-violet-500/15 text-violet-700 ring-1 ring-inset ring-violet-500/25 [html[data-theme='dark']_&]:text-violet-300",
    dotClass: "bg-violet-400",
    barClass: "bg-violet-500",
  },
  playstation: {
    id: "playstation",
    label: "PlayStation",
    shortLabel: "PS",
    badgeClass:
      "bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/25 [html[data-theme='dark']_&]:text-blue-300",
    dotClass: "bg-blue-500",
    barClass: "bg-blue-500",
  },
  xbox: {
    id: "xbox",
    label: "Xbox",
    shortLabel: "Xbox",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/25 [html[data-theme='dark']_&]:text-emerald-300",
    dotClass: "bg-emerald-400",
    barClass: "bg-emerald-500",
  },
  nintendo: {
    id: "nintendo",
    label: "Nintendo",
    shortLabel: "Nintendo",
    badgeClass:
      "bg-rose-500/15 text-rose-700 ring-1 ring-inset ring-rose-500/25 [html[data-theme='dark']_&]:text-rose-300",
    dotClass: "bg-rose-500",
    barClass: "bg-rose-500",
  },
  itch: {
    id: "itch",
    label: "itch.io",
    shortLabel: "itch.io",
    badgeClass:
      "bg-pink-500/15 text-pink-700 ring-1 ring-inset ring-pink-500/25 [html[data-theme='dark']_&]:text-pink-300",
    dotClass: "bg-pink-400",
    barClass: "bg-pink-500",
  },
  ea: {
    id: "ea",
    label: "EA App",
    shortLabel: "EA",
    badgeClass:
      "bg-orange-500/15 text-orange-700 ring-1 ring-inset ring-orange-500/25 [html[data-theme='dark']_&]:text-orange-300",
    dotClass: "bg-orange-400",
    barClass: "bg-orange-500",
  },
  ubisoft: {
    id: "ubisoft",
    label: "Ubisoft Connect",
    shortLabel: "Ubisoft",
    badgeClass:
      "bg-indigo-500/15 text-indigo-700 ring-1 ring-inset ring-indigo-500/25 [html[data-theme='dark']_&]:text-indigo-300",
    dotClass: "bg-indigo-400",
    barClass: "bg-indigo-500",
  },
  other: {
    id: "other",
    label: "Other / Physical",
    shortLabel: "Other",
    badgeClass:
      "bg-surface-muted text-ink-secondary ring-1 ring-inset ring-border-subtle",
    dotClass: "bg-ink-muted",
    barClass: "bg-ink-muted",
  },
};

export function getStoreLabel(store: StoreFilter): string {
  if (store === "no_store") return "No store";
  return STORE_META[store]?.label ?? store;
}

export interface StatusMeta {
  id: GameStatus;
  label: string;
  badgeClass: string;
  glassClass: string;
  dotClass: string;
}

export const STATUS_META: Record<GameStatus, StatusMeta> = {
  playing: {
    id: "playing",
    label: "Playing",
    badgeClass:
      "bg-sky-500/15 text-sky-700 ring-1 ring-inset ring-sky-500/30 [html[data-theme='dark']_&]:text-sky-300",
    glassClass: "bg-sky-950/80 text-sky-200 ring-1 ring-inset ring-sky-400/35",
    dotClass: "bg-sky-400",
  },
  backlog: {
    id: "backlog",
    label: "Backlog",
    badgeClass:
      "bg-violet-500/15 text-violet-700 ring-1 ring-inset ring-violet-500/30 [html[data-theme='dark']_&]:text-violet-300",
    glassClass:
      "bg-slate-950/80 text-slate-200 ring-1 ring-inset ring-white/15",
    dotClass: "bg-violet-400",
  },
  completed: {
    id: "completed",
    label: "Completed",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 [html[data-theme='dark']_&]:text-emerald-300",
    glassClass:
      "bg-emerald-950/80 text-emerald-200 ring-1 ring-inset ring-emerald-400/35",
    dotClass: "bg-emerald-400",
  },
  wishlist: {
    id: "wishlist",
    label: "Wishlist",
    badgeClass:
      "bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30 [html[data-theme='dark']_&]:text-amber-300",
    glassClass:
      "bg-amber-950/80 text-amber-200 ring-1 ring-inset ring-amber-400/35",
    dotClass: "bg-amber-400",
  },
  dropped: {
    id: "dropped",
    label: "Dropped",
    badgeClass:
      "bg-rose-500/15 text-rose-700 ring-1 ring-inset ring-rose-500/30 [html[data-theme='dark']_&]:text-rose-300",
    glassClass:
      "bg-rose-950/80 text-rose-200 ring-1 ring-inset ring-rose-400/35",
    dotClass: "bg-rose-400",
  },
};

export function getMetacriticClass(score: number): string {
  if (score >= 75) {
    return "bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-500/30 [html[data-theme='dark']_&]:text-emerald-300";
  }
  if (score >= 50) {
    return "bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30 [html[data-theme='dark']_&]:text-amber-300";
  }
  return "bg-rose-500/15 text-rose-700 ring-1 ring-inset ring-rose-500/30 [html[data-theme='dark']_&]:text-rose-300";
}

export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

export function getDefaultSortOrder(field: SortField): SortOrder {
  return field === "name" ? "asc" : "desc";
}

export const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: "userAddedAt", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "rating", label: "RAWG Rating" },
  { value: "metacritic", label: "Metacritic" },
  { value: "released", label: "Release Date" },
  { value: "userRating", label: "My Rating" },
  { value: "playtimeMinutes", label: "Playtime" },
];

export const TABLE_COLUMNS = [
  { key: "name", label: "Name", locked: true },
  { key: "platforms", label: "Platforms", locked: false },
  { key: "genres", label: "Genres", locked: false },
  { key: "stores", label: "Stores", locked: false },
  { key: "status", label: "Status", locked: false },
  { key: "rating", label: "Rating", locked: false },
  { key: "metacritic", label: "Metacritic", locked: false },
  { key: "userRating", label: "My Rating", locked: false },
  { key: "playtimeMinutes", label: "Playtime", locked: false },
  { key: "released", label: "Released", locked: false },
  { key: "developers", label: "Developer", locked: false },
  { key: "publishers", label: "Publisher", locked: false },
  { key: "userAddedAt", label: "Added", locked: false },
] as const;

export interface CatalogFilterCriteria {
  search: string;
  platforms: string[];
  genres: string[];
  stores: StoreFilter[];
  statuses: GameStatus[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface FacetCounts {
  platforms: Record<string, number>;
  genres: Record<string, number>;
  stores: Record<string, number>;
  statuses: Record<string, number>;
}

/**
 * Computes disjunctive facet counts in a single pass: each facet reflects all
 * other active filters while preserving OR semantics within the same facet.
 */
export function computeFacetCounts(
  games: readonly LibraryGame[],
  criteria: Pick<
    CatalogFilterCriteria,
    "search" | "platforms" | "genres" | "stores" | "statuses"
  >,
): FacetCounts {
  const query = criteria.search.trim().toLowerCase();
  const platformSet = new Set(criteria.platforms.map((p) => p.toLowerCase()));
  const genreSet = new Set(criteria.genres.map((g) => g.toLowerCase()));
  const storeSet = new Set(criteria.stores);
  const statusSet = new Set(criteria.statuses);

  const platforms: Record<string, number> = {};
  const genres: Record<string, number> = {};
  const stores: Record<string, number> = {};
  const statuses: Record<string, number> = {};

  for (const game of games) {
    if (query) {
      const matchesQuery =
        game.name.toLowerCase().includes(query) ||
        game.genres.some((g) => g.toLowerCase().includes(query)) ||
        game.platforms.some((p) => p.toLowerCase().includes(query)) ||
        game.developers.some((d) => d.toLowerCase().includes(query));
      if (!matchesQuery) continue;
    }

    const matchesPlatforms =
      platformSet.size === 0 ||
      game.platforms.some((p) => platformSet.has(p.toLowerCase()));
    const matchesGenres =
      genreSet.size === 0 ||
      game.genres.some((g) => genreSet.has(g.toLowerCase()));
    const matchesStores =
      storeSet.size === 0 ||
      (storeSet.has("no_store") && game.stores.length === 0) ||
      game.stores.some((s) => storeSet.has(s));
    const matchesStatuses =
      statusSet.size === 0 ||
      (game.status !== undefined && statusSet.has(game.status));

    if (matchesGenres && matchesStores && matchesStatuses) {
      for (const platform of game.platforms) {
        platforms[platform] = (platforms[platform] ?? 0) + 1;
      }
    }

    if (matchesPlatforms && matchesStores && matchesStatuses) {
      for (const genre of game.genres) {
        genres[genre] = (genres[genre] ?? 0) + 1;
      }
    }

    if (matchesPlatforms && matchesGenres && matchesStatuses) {
      if (game.stores.length === 0) {
        stores.no_store = (stores.no_store ?? 0) + 1;
      } else {
        for (const store of game.stores) {
          stores[store] = (stores[store] ?? 0) + 1;
        }
      }
    }

    if (matchesPlatforms && matchesGenres && matchesStores && game.status) {
      statuses[game.status] = (statuses[game.status] ?? 0) + 1;
    }
  }

  return { platforms, genres, stores, statuses };
}

export function filterAndSortGames(
  games: readonly LibraryGame[],
  criteria: CatalogFilterCriteria,
): LibraryGame[] {
  const query = criteria.search.trim().toLowerCase();
  const platformSet = new Set(criteria.platforms.map((p) => p.toLowerCase()));
  const genreSet = new Set(criteria.genres.map((g) => g.toLowerCase()));
  const storeSet = new Set(criteria.stores);
  const statusSet = new Set(criteria.statuses);

  const filtered = games.filter((game) => {
    if (query) {
      const matchesQuery =
        game.name.toLowerCase().includes(query) ||
        game.genres.some((g) => g.toLowerCase().includes(query)) ||
        game.platforms.some((p) => p.toLowerCase().includes(query)) ||
        game.developers.some((d) => d.toLowerCase().includes(query));
      if (!matchesQuery) return false;
    }

    if (platformSet.size > 0) {
      const matchesPlatform = game.platforms.some((p) =>
        platformSet.has(p.toLowerCase()),
      );
      if (!matchesPlatform) return false;
    }

    if (genreSet.size > 0) {
      const matchesGenre = game.genres.some((g) =>
        genreSet.has(g.toLowerCase()),
      );
      if (!matchesGenre) return false;
    }

    if (storeSet.size > 0) {
      const hasNoStore = game.stores.length === 0;
      const matchesStore =
        (storeSet.has("no_store") && hasNoStore) ||
        game.stores.some((s) => storeSet.has(s));
      if (!matchesStore) return false;
    }

    if (statusSet.size > 0) {
      if (!game.status || !statusSet.has(game.status)) return false;
    }

    return true;
  });

  const dir = criteria.sortOrder === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    let cmp: number;
    switch (criteria.sortBy) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "released":
        cmp = (a.released ?? "").localeCompare(b.released ?? "");
        break;
      case "rating":
        cmp = (a.rating ?? -1) - (b.rating ?? -1);
        break;
      case "metacritic":
        cmp = (a.metacritic ?? -1) - (b.metacritic ?? -1);
        break;
      case "userRating":
        cmp = (a.userRating ?? -1) - (b.userRating ?? -1);
        break;
      case "playtimeMinutes":
        cmp = (a.playtimeMinutes ?? -1) - (b.playtimeMinutes ?? -1);
        break;
      case "userAddedAt":
      default:
        cmp = a.userAddedAt - b.userAddedAt;
        break;
    }

    if (cmp !== 0) return cmp * dir;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function formatPlaytime(minutes?: number): string | null {
  if (minutes === undefined || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

export function formatTotalHours(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0h";
  const hours = Math.round(totalMinutes / 60);
  if (hours === 0) return `${totalMinutes}m`;
  return `${hours.toLocaleString()}h`;
}

export function formatReleaseYear(released?: string): string | null {
  if (!released) return null;
  const parsed = new Date(released);
  if (Number.isNaN(parsed.getTime())) return null;
  return String(parsed.getFullYear());
}

export function formatDate(value?: string | number): string | null {
  if (value === undefined || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
