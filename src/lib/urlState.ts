import { useCallback, useEffect, useState } from "react";
import {
  GAME_STATUSES,
  SORT_OPTIONS,
  STORE_IDS,
  type GameStatus,
  type SortField,
  type SortOrder,
  type StoreFilter,
} from "./catalog";

export type AuthLinkRoute =
  | { kind: "validate-email"; emailCode: string }
  | { kind: "reset-password"; emailCode: string }
  | { kind: "confirm-email-change"; emailCode: string };

export function getAuthLinkRoute(): AuthLinkRoute | null {
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  let pathname = window.location.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const emailCode =
    new URLSearchParams(window.location.search).get("code") ?? "";

  if (normalizedPath === "/validate-email") {
    return { kind: "validate-email", emailCode };
  }
  if (normalizedPath === "/reset-password") {
    return { kind: "reset-password", emailCode };
  }
  if (normalizedPath === "/confirm-email-change") {
    return { kind: "confirm-email-change", emailCode };
  }
  return null;
}

export interface CatalogUrlState {
  q: string;
  platforms: string[];
  genres: string[];
  stores: StoreFilter[];
  statuses: GameStatus[];
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  gameId: string | null;
}

const VALID_STORE_FILTERS = new Set<string>([...STORE_IDS, "no_store"]);
const VALID_STATUSES = new Set<string>(GAME_STATUSES);
const VALID_SORT_FIELDS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

function parseList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseCatalogUrl(search: string): CatalogUrlState {
  const params = new URLSearchParams(search);
  const q = params.get("q") ?? "";
  const platforms = parseList(params, "platforms");
  const genres = parseList(params, "genres");
  const stores = parseList(params, "stores").filter((s): s is StoreFilter =>
    VALID_STORE_FILTERS.has(s),
  );
  const statuses = parseList(params, "status").filter((s): s is GameStatus =>
    VALID_STATUSES.has(s),
  );

  const rawSort = params.get("sort") ?? "userAddedAt";
  const sortBy: SortField = VALID_SORT_FIELDS.has(rawSort)
    ? (rawSort as SortField)
    : "userAddedAt";

  const rawDir = params.get("dir");
  const sortOrder: SortOrder = rawDir === "asc" ? "asc" : "desc";

  const rawPage = Number(params.get("page"));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const gameId = params.get("game") || null;

  return {
    q,
    platforms,
    genres,
    stores,
    statuses,
    sortBy,
    sortOrder,
    page,
    gameId,
  };
}

export function serializeCatalogUrl(state: CatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.platforms.length > 0)
    params.set("platforms", state.platforms.join(","));
  if (state.genres.length > 0) params.set("genres", state.genres.join(","));
  if (state.stores.length > 0) params.set("stores", state.stores.join(","));
  if (state.statuses.length > 0) params.set("status", state.statuses.join(","));
  if (state.sortBy !== "userAddedAt") params.set("sort", state.sortBy);
  if (state.sortOrder !== "desc") params.set("dir", state.sortOrder);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.gameId) params.set("game", state.gameId);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function writeUrl(next: CatalogUrlState, mode: "replace" | "push" = "replace") {
  const qs = serializeCatalogUrl(next);
  const target = `${window.location.pathname}${qs}`;
  if (`${window.location.pathname}${window.location.search}` === target) return;
  if (mode === "push") {
    window.history.pushState(null, "", target);
  } else {
    window.history.replaceState(null, "", target);
  }
}

export function useCatalogUrlState() {
  const [state, setState] = useState<CatalogUrlState>(() =>
    parseCatalogUrl(window.location.search),
  );

  useEffect(() => {
    const onPopState = () => {
      setState(parseCatalogUrl(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = useCallback(
    (
      updater: (prev: CatalogUrlState) => CatalogUrlState,
      historyMode: "replace" | "push" = "replace",
    ) => {
      setState((prev) => {
        const next = updater(prev);
        writeUrl(next, historyMode);
        return next;
      });
    },
    [],
  );

  const setSearch = useCallback(
    (q: string) => update((prev) => ({ ...prev, q, page: 1 })),
    [update],
  );

  const togglePlatform = useCallback(
    (platform: string) =>
      update((prev) => ({
        ...prev,
        page: 1,
        platforms: prev.platforms.includes(platform)
          ? prev.platforms.filter((p) => p !== platform)
          : [...prev.platforms, platform],
      })),
    [update],
  );

  const toggleGenre = useCallback(
    (genre: string) =>
      update((prev) => ({
        ...prev,
        page: 1,
        genres: prev.genres.includes(genre)
          ? prev.genres.filter((g) => g !== genre)
          : [...prev.genres, genre],
      })),
    [update],
  );

  const toggleStore = useCallback(
    (store: StoreFilter) =>
      update((prev) => ({
        ...prev,
        page: 1,
        stores: prev.stores.includes(store)
          ? prev.stores.filter((s) => s !== store)
          : [...prev.stores, store],
      })),
    [update],
  );

  const toggleStatus = useCallback(
    (status: GameStatus) =>
      update((prev) => ({
        ...prev,
        page: 1,
        statuses: prev.statuses.includes(status)
          ? prev.statuses.filter((s) => s !== status)
          : [...prev.statuses, status],
      })),
    [update],
  );

  const clearPlatforms = useCallback(
    () => update((prev) => ({ ...prev, platforms: [], page: 1 })),
    [update],
  );

  const clearGenres = useCallback(
    () => update((prev) => ({ ...prev, genres: [], page: 1 })),
    [update],
  );

  const clearStores = useCallback(
    () => update((prev) => ({ ...prev, stores: [], page: 1 })),
    [update],
  );

  const clearStatuses = useCallback(
    () => update((prev) => ({ ...prev, statuses: [], page: 1 })),
    [update],
  );

  const clearAllFilters = useCallback(
    () =>
      update((prev) => ({
        ...prev,
        q: "",
        platforms: [],
        genres: [],
        stores: [],
        statuses: [],
        page: 1,
      })),
    [update],
  );

  const setSort = useCallback(
    (sortBy: SortField, sortOrder: SortOrder) =>
      update((prev) => ({ ...prev, sortBy, sortOrder, page: 1 })),
    [update],
  );

  const setPage = useCallback(
    (page: number) =>
      update((prev) => ({ ...prev, page: Math.max(1, page) }), "push"),
    [update],
  );

  const setSelectedGameId = useCallback(
    (gameId: string | null) =>
      update(
        (prev) => ({ ...prev, gameId }),
        gameId ? "push" : "replace",
      ),
    [update],
  );

  return {
    state,
    setSearch,
    togglePlatform,
    toggleGenre,
    toggleStore,
    toggleStatus,
    clearPlatforms,
    clearGenres,
    clearStores,
    clearStatuses,
    clearAllFilters,
    setSort,
    setPage,
    setSelectedGameId,
  };
}
