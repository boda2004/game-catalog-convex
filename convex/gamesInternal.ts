import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const addGameToUserInternal = internalMutation({
  args: {
    rawgId: v.number(),
    name: v.string(),
    slug: v.string(),
    backgroundImage: v.optional(v.string()),
    released: v.optional(v.string()),
    rating: v.optional(v.number()),
    metacritic: v.optional(v.number()),
    platforms: v.array(v.string()),
    genres: v.array(v.string()),
    developers: v.array(v.string()),
    publishers: v.array(v.string()),
    esrbRating: v.optional(v.string()),
    playtime: v.optional(v.number()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    tags: v.array(v.string()),
    userId: v.id("users"),
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...gameData } = args;

    let existingGame = await ctx.db
      .query("games")
      .withIndex("by_rawg_id", (q) => q.eq("rawgId", args.rawgId))
      .unique();

    let gameId;
    if (existingGame) {
      gameId = existingGame._id;
    } else {
      gameId = await ctx.db.insert("games", {
        ...gameData,
        addedAt: Date.now(),
      });
    }

    const existingUserGame = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) => 
        q.eq("userId", userId).eq("gameId", gameId)
      )
      .unique();

    // If the user already owns this game, update store ownership
    if (existingUserGame) {
      const updatedOwnedOnSteam = existingUserGame.ownedOnSteam || args.ownedOnSteam || false;
      const updatedOwnedOnEpic = existingUserGame.ownedOnEpic || args.ownedOnEpic || false;
      
      await ctx.db.patch(existingUserGame._id, {
        ownedOnSteam: updatedOwnedOnSteam,
        ownedOnEpic: updatedOwnedOnEpic,
      });
      
      return { gameId, alreadyOwned: true } as const;
    }

    await ctx.db.insert("userGames", {
      userId,
      gameId,
      addedAt: Date.now(),
      ownedOnSteam: args.ownedOnSteam || false,
      ownedOnEpic: args.ownedOnEpic || false,
    });

    return { gameId, alreadyOwned: false } as const;
  },
});
