// Utility client for RAWG API with retry and backoff handling

// Simple sleep helper
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(retryAfterHeader: string | null): number | null {
  if (!retryAfterHeader) return null;
  // Retry-After can be seconds or an HTTP-date
  const seconds = Number(retryAfterHeader);
  if (!Number.isNaN(seconds)) return Math.max(0, Math.floor(seconds * 1000));
  const dateMs = Date.parse(retryAfterHeader);
  if (!Number.isNaN(dateMs)) {
    const delta = dateMs - Date.now();
    return delta > 0 ? delta : 0;
  }
  return null;
}

export type RetryOptions = {
  maxRetries?: number; // number of retries after the initial attempt
  initialDelayMs?: number; // base backoff delay
  maxDelayMs?: number; // cap for backoff delay
};

/**
 * Fetch wrapper tailored for RAWG that retries on 429 and transient 5xx errors.
 * Respects the `Retry-After` header when provided.
 */
export async function rawgFetchWithRetry(
  url: string,
  init?: RequestInit,
  opts?: RetryOptions,
): Promise<Response> {
  const maxRetries = opts?.maxRetries ?? 5;
  const initialDelayMs = opts?.initialDelayMs ?? 500;
  const maxDelayMs = opts?.maxDelayMs ?? 10_000;

  let attempt = 0;
  // First attempt + retries
  while (true) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;

      const status = response.status;
      // Retry on rate limit and transient server errors
      if (status === 429 || status === 502 || status === 503 || status === 504) {
        if (attempt >= maxRetries) return response; // give up and let caller handle

        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterMs = parseRetryAfterMs(retryAfterHeader);
        const backoffBase = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
        const jitter = Math.floor(Math.random() * 250);
        const delay = retryAfterMs != null ? retryAfterMs : backoffBase + jitter;
        await sleep(delay);
        attempt += 1;
        continue;
      }

      // Non-retryable error; return as-is
      return response;
    } catch (error) {
      // Network errors: retry with backoff
      if (attempt >= maxRetries) throw error;
      const backoffBase = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * 250);
      await sleep(backoffBase + jitter);
      attempt += 1;
      continue;
    }
  }
}

export function normalizeRawgData(gameData: any) {
  return {
    rawgId: gameData.id as number,
    name: gameData.name as string,
    slug: gameData.slug as string,
    backgroundImage: (gameData.background_image ?? undefined) as string | undefined,
    released: (gameData.released ?? undefined) as string | undefined,
    rating: (typeof gameData.rating === "number" ? gameData.rating : undefined) as number | undefined,
    metacritic: (typeof gameData.metacritic === "number" ? gameData.metacritic : undefined) as number | undefined,
    platforms: (gameData.platforms?.map((p: any) => p.platform.name) as Array<string>) || [],
    genres: (gameData.genres?.map((g: any) => g.name) as Array<string>) || [],
    developers: (gameData.developers?.map((d: any) => d.name) as Array<string>) || [],
    publishers: (gameData.publishers?.map((p: any) => p.name) as Array<string>) || [],
    esrbRating: ((gameData.esrb_rating?.name ?? undefined) as string | undefined),
    playtime: ((typeof gameData.playtime === "number" ? gameData.playtime : undefined) as number | undefined),
    description: (gameData.description_raw ?? undefined) as string | undefined,
    website: (gameData.website ?? undefined) as string | undefined,
    tags: (gameData.tags?.map((t: any) => t.name) as Array<string>) || [],
  };
}

export async function fetchAndNormalizeRawgGame(rawgId: number, apiKey: string) {
  const detailResponse = await rawgFetchWithRetry(`https://api.rawg.io/api/games/${rawgId}?key=${apiKey}`);
  if (!detailResponse.ok) {
    throw new Error("Failed to get details");
  }
  const gameData = await detailResponse.json();
  return normalizeRawgData(gameData);
}

export async function searchAndNormalizeRawgGame(gameName: string, apiKey: string) {
  const searchResponse = await rawgFetchWithRetry(
    `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(gameName)}&page_size=1`
  );
  if (!searchResponse.ok) {
    throw new Error("Search failed");
  }
  const searchData = await searchResponse.json();
  const game = searchData.results?.[0];
  if (!game) {
    throw new Error("Game not found");
  }
  return await fetchAndNormalizeRawgGame(game.id, apiKey);
}


