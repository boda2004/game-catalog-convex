import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// RAWG API integration actions
export const searchGamesPublic = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(args.query)}&page_size=10`
    );

    if (!response.ok) {
      throw new Error("Failed to search games");
    }

    const data = await response.json();
    return data.results || [];
  },
});

export const addGame = action({
  args: { rawgId: v.number() },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    // Fetch game details from RAWG
    const response = await fetch(
      `https://api.rawg.io/api/games/${args.rawgId}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch game details");
    }

    const gameData = await response.json();

    // Transform RAWG data to our format
    const gameInfo = {
      rawgId: gameData.id,
      name: gameData.name,
      slug: gameData.slug,
      backgroundImage: gameData.background_image,
      released: gameData.released,
      rating: gameData.rating,
      metacritic: gameData.metacritic,
      platforms: gameData.platforms?.map((p: any) => p.platform.name) || [],
      genres: gameData.genres?.map((g: any) => g.name) || [],
      developers: gameData.developers?.map((d: any) => d.name) || [],
      publishers: gameData.publishers?.map((p: any) => p.name) || [],
      esrbRating: gameData.esrb_rating?.name,
      playtime: gameData.playtime,
      description: gameData.description_raw,
      website: gameData.website,
      tags: gameData.tags?.map((t: any) => t.name) || [],
    };

    // Get the current user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Add game to user's collection
    return await ctx.runMutation(internal.gamesInternal.addGameToUserInternal, {
      ...gameInfo,
      userId,
    });
  },
});

export const addGamesByNames = action({
  args: { gameNames: v.array(v.string()) },
  handler: async (ctx, args) => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    // Get the current user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const results = [];

    for (const gameName of args.gameNames) {
      try {
        // Search for the game
        const searchResponse = await fetch(
          `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(gameName)}&page_size=1`
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

        // Get detailed game info
        const detailResponse = await fetch(
          `https://api.rawg.io/api/games/${game.id}?key=${apiKey}`
        );

        if (!detailResponse.ok) {
          results.push({ name: gameName, success: false, error: "Failed to get details" });
          continue;
        }

        const gameData = await detailResponse.json();

        // Transform and add game
        const gameInfo = {
          rawgId: gameData.id,
          name: gameData.name,
          slug: gameData.slug,
          backgroundImage: gameData.background_image,
          released: gameData.released,
          rating: gameData.rating,
          metacritic: gameData.metacritic,
          platforms: gameData.platforms?.map((p: any) => p.platform.name) || [],
          genres: gameData.genres?.map((g: any) => g.name) || [],
          developers: gameData.developers?.map((d: any) => d.name) || [],
          publishers: gameData.publishers?.map((p: any) => p.name) || [],
          esrbRating: gameData.esrb_rating?.name,
          playtime: gameData.playtime,
          description: gameData.description_raw,
          website: gameData.website,
          tags: gameData.tags?.map((t: any) => t.name) || [],
        };

        await ctx.runMutation(internal.gamesInternal.addGameToUserInternal, {
          ...gameInfo,
          userId,
        });
        results.push({ name: gameName, success: true, addedName: gameData.name });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ name: gameName, success: false, error: errorMessage });
      }
    }

    return results;
  },
});
