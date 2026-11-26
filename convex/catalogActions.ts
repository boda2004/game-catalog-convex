import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { gameStatusValidator, storeIdValidator } from "./lib/domain";
import { fetchRawgGameDetails, searchRawgGames } from "./providers/rawg";

function getRawgApiKey(): string {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error("RAWG API key is not configured on the server.");
  }
  return apiKey;
}

export const searchExternalGames = action({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      rawgId: v.number(),
      name: v.string(),
      slug: v.string(),
      backgroundImage: v.optional(v.string()),
      released: v.optional(v.string()),
      rating: v.optional(v.number()),
      metacritic: v.optional(v.number()),
      platforms: v.array(v.string()),
      genres: v.array(v.string()),
    }),
  ),
  handler: async (ctx, { query }) => {
    const userId = await ctx.runQuery(internal.auth.getCurrentUserId, {});
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const trimmed = query.trim();
    if (!trimmed) return [];

    return await searchRawgGames(trimmed, getRawgApiKey(), 10);
  },
});

export const addGameByRawgId = action({
  args: {
    rawgId: v.number(),
    stores: v.optional(v.array(storeIdValidator)),
    status: v.optional(gameStatusValidator),
  },
  returns: v.object({
    gameId: v.id("games"),
    alreadyOwned: v.boolean(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{ gameId: Id<"games">; alreadyOwned: boolean }> => {
    const userId = await ctx.runQuery(internal.auth.getCurrentUserId, {});
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check shared local games cache before calling RAWG
    const cached = await ctx.runQuery(internal.gamesInternal.getGameByRawgId, {
      rawgId: args.rawgId,
    });

    if (cached) {
      return await ctx.runMutation(
        internal.gamesInternal.linkExistingGameForUserInternal,
        {
          userId,
          gameId: cached._id,
          stores: args.stores ?? [],
          storeMergeMode: "replace",
          status: args.status,
        },
      );
    }

    const game = await fetchRawgGameDetails(args.rawgId, getRawgApiKey());
    return await ctx.runMutation(
      internal.gamesInternal.upsertGameForUserInternal,
      {
        userId,
        game,
        stores: args.stores ?? [],
        storeMergeMode: "replace",
        status: args.status,
      },
    );
  },
});

export const refreshGameMetadata = action({
  args: { gameId: v.id("games") },
  returns: v.null(),
  handler: async (ctx, { gameId }) => {
    const userId = await ctx.runQuery(internal.auth.getCurrentUserId, {});
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const meta = await ctx.runQuery(
      internal.gamesInternal.getGameMetaForRefresh,
      { gameId },
    );
    if (!meta) {
      throw new Error("Game not found.");
    }

    const fresh = await fetchRawgGameDetails(meta.rawgId, getRawgApiKey(), {
      steamAppId: meta.steamAppId,
    });

    await ctx.runMutation(internal.gamesInternal.patchGameMetadataInternal, {
      gameId,
      game: fresh,
    });
    return null;
  },
});
