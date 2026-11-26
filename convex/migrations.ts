import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { getEffectiveStores, normalizeGameName } from "./lib/domain";

const BATCH_SIZE = 100;

/**
 * Idempotent paginated migration that:
 * 1. Backfills `games.normalizedName` for fast local cache matching.
 * 2. Migrates legacy `userGames.ownedOnSteam/Epic/Gog` booleans into `stores[]`.
 */
export const backfillGamesNormalizedName = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.object({ updated: v.number(), isDone: v.boolean() }),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("games")
      .paginate({ numItems: BATCH_SIZE, cursor: cursor ?? null });

    let updated = 0;
    for (const game of page.page) {
      if (!game.normalizedName) {
        await ctx.db.patch(game._id, {
          normalizedName: normalizeGameName(game.name),
        });
        updated += 1;
      }
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.backfillGamesNormalizedName,
        { cursor: page.continueCursor },
      );
    }

    return { updated, isDone: page.isDone };
  },
});

export const backfillUserGameStores = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.object({ updated: v.number(), isDone: v.boolean() }),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("userGames")
      .paginate({ numItems: BATCH_SIZE, cursor: cursor ?? null });

    let updated = 0;
    for (const row of page.page) {
      const hasLegacyFields =
        row.ownedOnSteam !== undefined ||
        row.ownedOnEpic !== undefined ||
        row.ownedOnGog !== undefined;

      if (row.stores === undefined || hasLegacyFields) {
        await ctx.db.patch(row._id, {
          stores: getEffectiveStores(row),
          ownedOnSteam: undefined,
          ownedOnEpic: undefined,
          ownedOnGog: undefined,
        });
        updated += 1;
      }
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.backfillUserGameStores,
        { cursor: page.continueCursor },
      );
    }

    return { updated, isDone: page.isDone };
  },
});

/**
 * Convenience entrypoint to schedule both non-destructive backfills.
 */
export const runCatalogBackfill = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(
      0,
      internal.migrations.backfillGamesNormalizedName,
      { cursor: null },
    );
    await ctx.scheduler.runAfter(
      0,
      internal.migrations.backfillUserGameStores,
      { cursor: null },
    );
    return null;
  },
});
