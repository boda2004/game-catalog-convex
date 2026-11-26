import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import {
  gameStatusValidator,
  normalizeGameName,
  normalizedGameValidator,
  storeIdValidator,
} from "./lib/domain";
import { linkExistingGameToUser, upsertGameForUser } from "./lib/userGames";

export const getGameByRawgId = internalQuery({
  args: { rawgId: v.number() },
  returns: v.union(
    v.object({
      _id: v.id("games"),
      rawgId: v.number(),
      name: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, { rawgId }) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_rawg_id", (q) => q.eq("rawgId", rawgId))
      .unique();
    if (!game) return null;
    return { _id: game._id, rawgId: game.rawgId, name: game.name };
  },
});

export const getGameMetaForRefresh = internalQuery({
  args: { gameId: v.id("games") },
  returns: v.union(
    v.object({
      _id: v.id("games"),
      rawgId: v.number(),
      steamAppId: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return null;
    return {
      _id: game._id,
      rawgId: game.rawgId,
      steamAppId: game.steamAppId,
    };
  },
});

/**
 * Checks local cached `games` before hitting external APIs:
 * 1. Exact Steam App ID match (indexed)
 * 2. Exact normalized title match (indexed)
 */
export const findLocalGameMatch = internalQuery({
  args: {
    name: v.string(),
    steamAppId: v.optional(v.number()),
  },
  returns: v.union(
    v.object({
      _id: v.id("games"),
      name: v.string(),
      rawgId: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, { name, steamAppId }) => {
    if (steamAppId !== undefined) {
      const bySteam = await ctx.db
        .query("games")
        .withIndex("by_steam_app_id", (q) => q.eq("steamAppId", steamAppId))
        .first();
      if (bySteam) {
        return { _id: bySteam._id, name: bySteam.name, rawgId: bySteam.rawgId };
      }
    }

    const normalized = normalizeGameName(name);
    if (normalized) {
      const byNormalized = await ctx.db
        .query("games")
        .withIndex("by_normalized_name", (q) =>
          q.eq("normalizedName", normalized),
        )
        .first();
      if (byNormalized) {
        return {
          _id: byNormalized._id,
          name: byNormalized.name,
          rawgId: byNormalized.rawgId,
        };
      }
    }

    return null;
  },
});

export const upsertGameForUserInternal = internalMutation({
  args: {
    userId: v.id("users"),
    game: normalizedGameValidator,
    stores: v.optional(v.array(storeIdValidator)),
    storeMergeMode: v.optional(v.union(v.literal("merge"), v.literal("replace"))),
    status: v.optional(gameStatusValidator),
    playtimeMinutes: v.optional(v.number()),
  },
  returns: v.object({
    gameId: v.id("games"),
    alreadyOwned: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await upsertGameForUser(ctx, args);
  },
});

export const linkExistingGameForUserInternal = internalMutation({
  args: {
    userId: v.id("users"),
    gameId: v.id("games"),
    steamAppId: v.optional(v.number()),
    stores: v.optional(v.array(storeIdValidator)),
    storeMergeMode: v.optional(v.union(v.literal("merge"), v.literal("replace"))),
    status: v.optional(gameStatusValidator),
    playtimeMinutes: v.optional(v.number()),
  },
  returns: v.object({
    gameId: v.id("games"),
    alreadyOwned: v.boolean(),
  }),
  handler: async (ctx, args) => {
    if (args.steamAppId !== undefined) {
      const game = await ctx.db.get(args.gameId);
      if (game && game.steamAppId === undefined) {
        await ctx.db.patch(args.gameId, { steamAppId: args.steamAppId });
      }
    }
    return await linkExistingGameToUser(ctx, {
      userId: args.userId,
      gameId: args.gameId,
      stores: args.stores,
      storeMergeMode: args.storeMergeMode,
      status: args.status,
      playtimeMinutes: args.playtimeMinutes,
    });
  },
});

export const patchGameMetadataInternal = internalMutation({
  args: {
    gameId: v.id("games"),
    game: normalizedGameValidator,
  },
  returns: v.null(),
  handler: async (ctx, { gameId, game }) => {
    const existing = await ctx.db.get(gameId);
    if (!existing) return null;

    await ctx.db.patch(gameId, {
      name: game.name,
      slug: game.slug,
      normalizedName: game.normalizedName ?? normalizeGameName(game.name),
      ...(game.steamAppId !== undefined ? { steamAppId: game.steamAppId } : {}),
      backgroundImage: game.backgroundImage,
      released: game.released,
      rating: game.rating,
      metacritic: game.metacritic,
      platforms: game.platforms,
      genres: game.genres,
      developers: game.developers,
      publishers: game.publishers,
      esrbRating: game.esrbRating,
      playtime: game.playtime,
      description: game.description,
      website: game.website,
      tags: game.tags,
      metadataUpdatedAt: Date.now(),
    });
    return null;
  },
});
