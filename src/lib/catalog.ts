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
}

export const STORE_META: Record<StoreId, StoreMeta> = {
  steam: {
    id: "steam",
    label: "Steam",
    shortLabel: "Steam",
    badgeClass: "bg-[#ffdbc7] text-[#723603]",
  },
  epic: {
    id: "epic",
    label: "Epic Games",
    shortLabel: "Epic",
    badgeClass: "bg-surface-subtle text-ink-secondary ring-1 ring-inset ring-border-subtle",
  },
  gog: {
    id: "gog",
    label: "GOG",
    shortLabel: "GOG",
    badgeClass: "bg-[#efe6ff] text-[#4c1d95]",
  },
  playstation: {
    id: "playstation",
    label: "PlayStation",
    shortLabel: "PS",
    badgeClass: "bg-[#dbeafe] text-[#1e40af]",
  },
  xbox: {
    id: "xbox",
    label: "Xbox",
    shortLabel: "Xbox",
    badgeClass: "bg-[#dcfce7] text-[#166534]",
  },
  nintendo: {
    id: "nintendo",
    label: "Nintendo",
    shortLabel: "Nintendo",
    badgeClass: "bg-[#fee2e2] text-[#991b1b]",
  },
  itch: {
    id: "itch",
    label: "itch.io",
    shortLabel: "itch.io",
    badgeClass: "bg-[#fce7f3] text-[#9d174d]",
  },
  ea: {
    id: "ea",
    label: "EA App",
    shortLabel: "EA",
    badgeClass: "bg-[#ffedd5] text-[#9a3412]",
  },
  ubisoft: {
    id: "ubisoft",
    label: "Ubisoft Connect",
    shortLabel: "Ubisoft",
    badgeClass: "bg-[#e0e7ff] text-[#3730a3]",
  },
  other: {
    id: "other",
    label: "Other / Physical",
    shortLabel: "Other",
    badgeClass: "bg-surface-muted text-ink-secondary",
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
}

export const STATUS_META: Record<GameStatus, StatusMeta> = {
  playing: {
    id: "playing",
    label: "Playing",
    badgeClass: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  backlog: {
    id: "backlog",
    label: "Backlog",
    badgeClass: "bg-surface-subtle text-ink-secondary ring-1 ring-inset ring-border-subtle",
  },
  completed: {
    id: "completed",
    label: "Completed",
    badgeClass: "bg-[#dcfce7] text-[#166534]",
  },
  wishlist: {
    id: "wishlist",
    label: "Wishlist",
    badgeClass: "bg-[#fef3c7] text-[#92400e]",
  },
  dropped: {
    id: "dropped",
    label: "Dropped",
    badgeClass: "bg-[#fee2e2] text-[#991b1b]",
  },
};

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
  return parsed.toLocaleDateString();
}
