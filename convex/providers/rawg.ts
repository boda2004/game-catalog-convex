import { normalizeGameName, type NormalizedGameInput } from "../lib/domain";

export interface RawgSearchResult {
  rawgId: number;
  name: string;
  slug: string;
  backgroundImage?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
  platforms: string[];
  genres: string[];
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(retryAfterHeader: string | null): number | null {
  if (!retryAfterHeader) return null;
  const seconds = Number(retryAfterHeader);
  if (!Number.isNaN(seconds)) return Math.max(0, Math.floor(seconds * 1000));
  const dateMs = Date.parse(retryAfterHeader);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
}

export async function rawgFetchWithRetry(
  url: string,
  init?: RequestInit,
  opts?: RetryOptions,
): Promise<Response> {
  const maxRetries = opts?.maxRetries ?? 4;
  const initialDelayMs = opts?.initialDelayMs ?? 500;
  const maxDelayMs = opts?.maxDelayMs ?? 8_000;
  const timeoutMs = opts?.timeoutMs ?? 15_000;

  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return response;

      const status = response.status;
      if (status === 429 || status === 502 || status === 503 || status === 504) {
        if (attempt >= maxRetries) return response;
        const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
        const backoff = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
        const jitter = Math.floor(Math.random() * 250);
        await sleep(retryAfterMs ?? backoff + jitter);
        attempt += 1;
        continue;
      }

      return response;
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      const backoff = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * 250);
      await sleep(backoff + jitter);
      attempt += 1;
    }
  }
}

interface RawgNamedEntity {
  name?: string;
}

interface RawgPlatformEntry {
  platform?: { name?: string };
}

interface RawgApiGame {
  id: number;
  name: string;
  slug: string;
  background_image?: string | null;
  released?: string | null;
  rating?: number | null;
  metacritic?: number | null;
  platforms?: RawgPlatformEntry[] | null;
  genres?: RawgNamedEntity[] | null;
  developers?: RawgNamedEntity[] | null;
  publishers?: RawgNamedEntity[] | null;
  esrb_rating?: RawgNamedEntity | null;
  playtime?: number | null;
  description_raw?: string | null;
  website?: string | null;
  tags?: RawgNamedEntity[] | null;
}

function extractNames(items?: RawgNamedEntity[] | null): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => item?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

function extractPlatformNames(items?: RawgPlatformEntry[] | null): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((entry) => entry?.platform?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

export function normalizeRawgGame(
  raw: RawgApiGame,
  extra?: { steamAppId?: number },
): NormalizedGameInput {
  return {
    rawgId: raw.id,
    name: raw.name,
    slug: raw.slug,
    normalizedName: normalizeGameName(raw.name),
    steamAppId: extra?.steamAppId,
    backgroundImage: raw.background_image ?? undefined,
    released: raw.released ?? undefined,
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    metacritic: typeof raw.metacritic === "number" ? raw.metacritic : undefined,
    platforms: extractPlatformNames(raw.platforms),
    genres: extractNames(raw.genres),
    developers: extractNames(raw.developers),
    publishers: extractNames(raw.publishers),
    esrbRating: raw.esrb_rating?.name ?? undefined,
    playtime: typeof raw.playtime === "number" ? raw.playtime : undefined,
    description: raw.description_raw ?? undefined,
    website: raw.website ?? undefined,
    tags: extractNames(raw.tags),
  };
}

export function normalizeRawgSearchItem(raw: RawgApiGame): RawgSearchResult {
  return {
    rawgId: raw.id,
    name: raw.name,
    slug: raw.slug,
    backgroundImage: raw.background_image ?? undefined,
    released: raw.released ?? undefined,
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    metacritic: typeof raw.metacritic === "number" ? raw.metacritic : undefined,
    platforms: extractPlatformNames(raw.platforms),
    genres: extractNames(raw.genres),
  };
}

export async function searchRawgGames(
  query: string,
  apiKey: string,
  pageSize = 10,
): Promise<RawgSearchResult[]> {
  const response = await rawgFetchWithRetry(
    `https://api.rawg.io/api/games?key=${encodeURIComponent(apiKey)}&search=${encodeURIComponent(query)}&page_size=${pageSize}`,
  );
  if (!response.ok) {
    throw new Error(`RAWG search failed (HTTP ${response.status})`);
  }
  const data = (await response.json()) as { results?: RawgApiGame[] };
  return (data.results ?? []).map(normalizeRawgSearchItem);
}

export async function fetchRawgGameDetails(
  rawgId: number,
  apiKey: string,
  extra?: { steamAppId?: number },
): Promise<NormalizedGameInput> {
  const response = await rawgFetchWithRetry(
    `https://api.rawg.io/api/games/${rawgId}?key=${encodeURIComponent(apiKey)}`,
  );
  if (!response.ok) {
    throw new Error(`RAWG detail fetch failed (HTTP ${response.status})`);
  }
  const data = (await response.json()) as RawgApiGame;
  return normalizeRawgGame(data, extra);
}

export async function searchAndFetchBestRawgGame(
  gameName: string,
  apiKey: string,
  extra?: { steamAppId?: number },
): Promise<NormalizedGameInput | null> {
  const results = await searchRawgGames(gameName, apiKey, 5);
  if (results.length === 0) return null;

  const target = normalizeGameName(gameName);
  const exact = results.find((item) => normalizeGameName(item.name) === target);
  const chosen = exact ?? results[0];
  return await fetchRawgGameDetails(chosen.rawgId, apiKey, extra);
}
