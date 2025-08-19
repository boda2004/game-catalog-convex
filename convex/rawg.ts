import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { rawgFetchWithRetry } from "./rawgClient";

// RAWG API integration actions
export const searchGamesPublic = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    const response = await rawgFetchWithRetry(
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
  args: { 
    rawgId: v.number(),
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
    ownedOnGog: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    // Fetch game details from RAWG
    const response = await rawgFetchWithRetry(
      `https://api.rawg.io/api/games/${args.rawgId}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch game details");
    }

    const gameData = await response.json();

    // Transform RAWG data to our format with null -> undefined normalization
    const gameInfo = {
      rawgId: gameData.id,
      name: gameData.name,
      slug: gameData.slug,
      backgroundImage: gameData.background_image ?? undefined,
      released: gameData.released ?? undefined,
      rating: typeof gameData.rating === "number" ? gameData.rating : undefined,
      metacritic: typeof gameData.metacritic === "number" ? gameData.metacritic : undefined,
      platforms: gameData.platforms?.map((p: any) => p.platform.name) || [],
      genres: gameData.genres?.map((g: any) => g.name) || [],
      developers: gameData.developers?.map((d: any) => d.name) || [],
      publishers: gameData.publishers?.map((p: any) => p.name) || [],
      esrbRating: gameData.esrb_rating?.name ?? undefined,
      playtime: typeof gameData.playtime === "number" ? gameData.playtime : undefined,
      description: gameData.description_raw ?? undefined,
      website: gameData.website ?? undefined,
      tags: gameData.tags?.map((t: any) => t.name) || [],
    };

    // Get the current user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Add game to user's collection with store ownership
    return await ctx.runMutation(internal.gamesInternal.addGameToUserInternal, {
      ...gameInfo,
      userId,
      ownedOnSteam: args.ownedOnSteam || false,
      ownedOnEpic: args.ownedOnEpic || false,
      ownedOnGog: args.ownedOnGog || false,
    });
  },
});

export const addGamesByNames = action({
  args: { 
    gameNames: v.array(v.string()), 
    jobId: v.optional(v.id("importJobs")),
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
    ownedOnGog: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      name: v.string(),
      success: v.boolean(),
      addedName: v.optional(v.string()),
      error: v.optional(v.string()),
      alreadyOwned: v.optional(v.boolean()),
    }),
  ),
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{
      name: string;
      success: boolean;
      addedName?: string;
      error?: string;
      alreadyOwned?: boolean;
    }>
  > => {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    // Get the current user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const results: Array<{
      name: string;
      success: boolean;
      addedName?: string;
      error?: string;
      alreadyOwned?: boolean;
    }> = [];

    // Use provided job if available, else create one
    let jobId: Id<"importJobs">;
    if (!args.jobId) {
      jobId = await ctx.runMutation(api.games.createImportJob, {
        type: "bulk",
        total: args.gameNames.length,
      });
    } else {
      jobId = args.jobId;
      await ctx.runMutation(internal.games.updateImportJob, {
        jobId,
        total: args.gameNames.length,
        status: "running",
      });
    }

    let completed = 0;

    for (const gameName of args.gameNames) {
      try {
        // Search for the game
        const searchResponse = await rawgFetchWithRetry(
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
        const detailResponse = await rawgFetchWithRetry(
          `https://api.rawg.io/api/games/${game.id}?key=${apiKey}`
        );

        if (!detailResponse.ok) {
          results.push({ name: gameName, success: false, error: "Failed to get details" });
          continue;
        }

        const gameData = await detailResponse.json();

        // Transform and add game with null -> undefined normalization
        const gameInfo = {
          rawgId: gameData.id,
          name: gameData.name,
          slug: gameData.slug,
          backgroundImage: gameData.background_image ?? undefined,
          released: gameData.released ?? undefined,
          rating: typeof gameData.rating === "number" ? gameData.rating : undefined,
          metacritic: typeof gameData.metacritic === "number" ? gameData.metacritic : undefined,
          platforms: gameData.platforms?.map((p: any) => p.platform.name) || [],
          genres: gameData.genres?.map((g: any) => g.name) || [],
          developers: gameData.developers?.map((d: any) => d.name) || [],
          publishers: gameData.publishers?.map((p: any) => p.name) || [],
          esrbRating: gameData.esrb_rating?.name ?? undefined,
          playtime: typeof gameData.playtime === "number" ? gameData.playtime : undefined,
          description: gameData.description_raw ?? undefined,
          website: gameData.website ?? undefined,
          tags: gameData.tags?.map((t: any) => t.name) || [],
        };

        const outcome: { gameId: Id<"games">; alreadyOwned: boolean } = await ctx.runMutation(
          internal.gamesInternal.addGameToUserInternal,
          {
          ...gameInfo,
          userId,
          ownedOnSteam: args.ownedOnSteam || false,
          ownedOnEpic: args.ownedOnEpic || false,
          ownedOnGog: args.ownedOnGog || false,
          },
        );
        results.push({
          name: gameName,
          success: true,
          addedName: gameData.name,
          alreadyOwned: Boolean(outcome?.alreadyOwned),
        });

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
