export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtimeMinutes: number;
}

interface SteamVanityResponse {
  response?: {
    success?: number;
    steamid?: string;
    message?: string;
  };
}

interface SteamOwnedGamesResponse {
  response?: {
    game_count?: number;
    games?: Array<{
      appid: number;
      name?: string;
      playtime_forever?: number;
    }>;
  };
}

async function resolveVanity(vanity: string, apiKey: string): Promise<string> {
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${encodeURIComponent(apiKey)}&vanityurl=${encodeURIComponent(vanity)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`Steam vanity lookup failed (HTTP ${res.status})`);
  }
  const data = (await res.json()) as SteamVanityResponse;
  if (data.response?.success === 1 && data.response.steamid) {
    return data.response.steamid;
  }
  throw new Error(
    "Could not resolve Steam vanity URL. Check that the profile name is correct.",
  );
}

export async function resolveSteamId(
  steamIdOrUrl: string,
  apiKey: string,
): Promise<string> {
  const trimmed = steamIdOrUrl.trim();
  if (!trimmed) {
    throw new Error("Please enter a Steam ID or profile URL.");
  }

  const profilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch) return profilesMatch[1];

  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (vanityMatch) {
    return await resolveVanity(vanityMatch[1], apiKey);
  }

  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }

  return await resolveVanity(trimmed, apiKey);
}

export async function fetchSteamOwnedGames(
  steamId: string,
  apiKey: string,
): Promise<SteamOwnedGame[]> {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamId)}&include_appinfo=1&include_played_free_games=1&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });

  if (!res.ok) {
    // Never log URL since it includes the API key
    throw new Error(
      `Failed to fetch Steam library (HTTP ${res.status}). Ensure your Steam profile game details are set to Public.`,
    );
  }

  const json = (await res.json()) as SteamOwnedGamesResponse;
  const rawGames = json.response?.games ?? [];

  const seenAppIds = new Set<number>();
  const games: SteamOwnedGame[] = [];

  for (const entry of rawGames) {
    const name = entry.name?.trim();
    if (!name || seenAppIds.has(entry.appid)) continue;
    seenAppIds.add(entry.appid);
    games.push({
      appid: entry.appid,
      name,
      playtimeMinutes:
        typeof entry.playtime_forever === "number" ? entry.playtime_forever : 0,
    });
  }

  return games;
}
