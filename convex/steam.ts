import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { rawgFetchWithRetry } from "./rawgClient";

type SteamOwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number; // minutes
};

async function resolveSteamId(steamIdOrUrl: string, apiKey: string): Promise<string> {
  const trimmed = steamIdOrUrl.trim();

  // If it's a full profiles URL: https://steamcommunity.com/profiles/<steamid>
  const profilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch) return profilesMatch[1];

  // If it's a vanity URL: https://steamcommunity.com/id/<vanity>
  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^\/?#]+)/i);
  if (vanityMatch) {
    const vanity = vanityMatch[1];
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(
        vanity,
      )}`,
    );
    const data = await res.json();
    if (data?.response?.success === 1 && data.response.steamid) return data.response.steamid as string;
    throw new Error("Failed to resolve Steam vanity URL");
  }

  // If it's a 17-digit SteamID64
  if (/^\d{17}$/.test(trimmed)) return trimmed;

  // Otherwise try resolving as raw vanity
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(
      trimmed,
    )}`,
  );
  const data = await res.json();
  if (data?.response?.success === 1 && data.response.steamid) return data.response.steamid as string;

  throw new Error("Could not parse Steam ID or profile URL");
}

export const importOwnedGames = action({
  args: {
    steamIdOrProfileUrl: v.string(),
    minPlaytimeMinutes: v.optional(v.number()),
    limit: v.optional(v.number()),
    jobId: v.optional(v.id("importJobs")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const steamApiKey = process.env.STEAM_API_KEY;
    const rawgApiKey = process.env.RAWG_API_KEY;
    if (!steamApiKey) throw new Error("STEAM API key not configured");
    if (!rawgApiKey) throw new Error("RAWG API key not configured");

    const steamId = await resolveSteamId(args.steamIdOrProfileUrl, steamApiKey);

    // Fetch owned games from Steam
    const ownedRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`,
    );
    if (!ownedRes.ok) {
      console.error(`Failed to fetch owned games from Steam. URL: ${ownedRes.url}`);
      const errorText = await ownedRes.text();
      throw new Error(`Failed to fetch owned games from Steam. Error: ${errorText}`);
    }
    const ownedJson = await ownedRes.json();
    const ownedGames: Array<SteamOwnedGame> = ownedJson?.response?.games || [];

    let filtered = ownedGames
      .filter((g) => g.name && g.name.trim().length > 0)
      .filter((g) => (args.minPlaytimeMinutes ? (g.playtime_forever || 0) >= args.minPlaytimeMinutes! : true));

    // Optional limit to avoid exceeding RAWG rate limits
    if (args.limit && args.limit > 0) {
      filtered = filtered.slice(0, args.limit);
    }

    // Deduplicate by name
    const seen = new Set<string>();
    const gameNames: Array<string> = [];
    for (const g of filtered) {
      const name = (g.name || "").trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        gameNames.push(name);
      }
    }

    const results: Array<{ name: string; success: boolean; addedName?: string; error?: string; alreadyOwned?: boolean }> = [];

    // Use provided job id if present, otherwise create a new one
    let jobId: Id<"importJobs">;
    if (!args.jobId) {
      jobId = await ctx.runMutation(api.games.createImportJob, {
        type: "steam",
        total: gameNames.length,
      });
    } else {
      jobId = args.jobId;
      await ctx.runMutation(internal.games.updateImportJob, {
        jobId,
        total: gameNames.length,
        status: "running",
      });
    }

    let completed = 0;
    for (const gameName of gameNames) {
      try {
        // RAWG search
        const searchResponse = await rawgFetchWithRetry(
          `https://api.rawg.io/api/games?key=${rawgApiKey}&search=${encodeURIComponent(gameName)}&page_size=1`,
        );
        if (!searchResponse.ok) {
          results.push({ name: gameName, success: false, error: "Search failed" });
          continue;
        }
        const searchData = await searchResponse.json();
        const game = searchData.results?.[0];
        if (!game) {
          results.push({ name: gameName, success: false, error: "Game not found" });
          continue;
        }

        const detailResponse = await rawgFetchWithRetry(`https://api.rawg.io/api/games/${game.id}?key=${rawgApiKey}`);
        if (!detailResponse.ok) {
          results.push({ name: gameName, success: false, error: "Failed to get details" });
          continue;
        }
        const gameData = await detailResponse.json();

        const gameInfo = {
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

        const outcome = await ctx.runMutation(internal.gamesInternal.addGameToUserInternal, {
          ...gameInfo,
          userId,
        });
        results.push({ name: gameName, success: true, addedName: gameData.name, alreadyOwned: Boolean(outcome?.alreadyOwned) });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ name: gameName, success: false, error: errorMessage });
      }
      completed += 1;
      await ctx.runMutation(internal.games.updateImportJob, { jobId, completed });
    }

    await ctx.runMutation(internal.games.completeImportJob, { jobId });
    return results;
  },
});


