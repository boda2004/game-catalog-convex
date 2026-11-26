/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("Convex backend games & migrations", () => {
  it("upserts games, consolidates legacy duplicates, and matches local cache by steamAppId and normalizedName", async () => {
    const t = convexTest(schema, modules);

    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    });

    const first = await t.mutation(
      internal.gamesInternal.upsertGameForUserInternal,
      {
        userId,
        game: {
          rawgId: 3328,
          name: "The Witcher® 3: Wild Hunt",
          slug: "the-witcher-3-wild-hunt",
          steamAppId: 292030,
          platforms: ["PC"],
          genres: ["RPG"],
          developers: ["CD PROJEKT RED"],
          publishers: ["CD PROJEKT RED"],
          tags: ["Open World"],
        },
        stores: ["steam"],
        playtimeMinutes: 120,
      },
    );

    expect(first.alreadyOwned).toBe(false);

    // Local cache hit by steamAppId
    const bySteam = await t.query(internal.gamesInternal.findLocalGameMatch, {
      name: "Unrelated Name",
      steamAppId: 292030,
    });
    expect(bySteam?._id).toBe(first.gameId);

    // Local cache hit by normalizedName (stripped trademark symbol)
    const byName = await t.query(internal.gamesInternal.findLocalGameMatch, {
      name: "The Witcher 3: Wild Hunt",
    });
    expect(byName?._id).toBe(first.gameId);

    // Second import merges stores and keeps max playtime
    const second = await t.mutation(
      internal.gamesInternal.linkExistingGameForUserInternal,
      {
        userId,
        gameId: first.gameId,
        stores: ["gog"],
        storeMergeMode: "merge",
        playtimeMinutes: 300,
      },
    );

    expect(second.alreadyOwned).toBe(true);

    const userGame = await t.run(async (ctx) => {
      return await ctx.db
        .query("userGames")
        .withIndex("by_user_and_game", (q) =>
          q.eq("userId", userId).eq("gameId", first.gameId),
        )
        .unique();
    });

    expect(userGame?.stores).toEqual(["steam", "gog"]);
    expect(userGame?.playtimeMinutes).toBe(300);
  });

  it("backfills legacy ownedOn* flags and games.normalizedName non-destructively", async () => {
    const t = convexTest(schema, modules);

    const { gameId, userGameId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const gId = await ctx.db.insert("games", {
        rawgId: 99,
        name: "Hades™",
        slug: "hades",
        platforms: ["PC"],
        genres: ["Indie"],
        developers: ["Supergiant Games"],
        publishers: ["Supergiant Games"],
        tags: [],
        addedAt: Date.now(),
      });
      const ugId = await ctx.db.insert("userGames", {
        userId,
        gameId: gId,
        addedAt: Date.now(),
        ownedOnSteam: true,
        ownedOnEpic: false,
        ownedOnGog: true,
      });
      return { gameId: gId, userGameId: ugId };
    });

    const gameMigration = await t.mutation(
      internal.migrations.backfillGamesNormalizedName,
      { cursor: null },
    );
    expect(gameMigration.updated).toBe(1);
    expect(gameMigration.isDone).toBe(true);

    const storeMigration = await t.mutation(
      internal.migrations.backfillUserGameStores,
      { cursor: null },
    );
    expect(storeMigration.updated).toBe(1);
    expect(storeMigration.isDone).toBe(true);

    const migrated = await t.run(async (ctx) => {
      const game = await ctx.db.get(gameId);
      const userGame = await ctx.db.get(userGameId);
      return { game, userGame };
    });

    expect(migrated.game?.normalizedName).toBe("hades");
    expect(migrated.userGame?.stores).toEqual(["steam", "gog"]);
    expect(migrated.userGame?.ownedOnSteam).toBeUndefined();
    expect(migrated.userGame?.ownedOnEpic).toBeUndefined();
    expect(migrated.userGame?.ownedOnGog).toBeUndefined();
  });
});
