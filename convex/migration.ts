import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to add store ownership fields to existing userGames records
export const addStoreOwnershipFields = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all existing userGames records
    const userGames = await ctx.db.query("userGames").collect();
    
    // Update each record to add the new fields with default values
    for (const userGame of userGames) {
      await ctx.db.patch(userGame._id, {
        ownedOnSteam: false,
        ownedOnEpic: false,
        ownedOnGog: false,
      });
    }
    
    return { updated: userGames.length };
  },
});

// Relink userGames, userPreferences, and importJobs from a legacy v1 user to a v2 user
export const relinkUserData = internalMutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
  },
  handler: async (ctx, { fromUserId, toUserId }) => {
    if (fromUserId === toUserId) {
      return { userGames: 0, userPreferences: 0, importJobs: 0 };
    }

    const fromGames = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();

    const existingToGames = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", toUserId))
      .collect();
    const existingGameIds = new Set(existingToGames.map((g) => g.gameId));

    let movedGames = 0;
    for (const row of fromGames) {
      if (existingGameIds.has(row.gameId)) {
        await ctx.db.delete(row._id);
      } else {
        await ctx.db.patch(row._id, { userId: toUserId });
        movedGames++;
      }
    }

    const fromPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    const existingToPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", toUserId))
      .collect();

    let movedPrefs = 0;
    if (fromPrefs.length > 0) {
      for (const existing of existingToPrefs) {
        await ctx.db.delete(existing._id);
      }
      for (const pref of fromPrefs) {
        await ctx.db.patch(pref._id, { userId: toUserId });
        movedPrefs++;
      }
    }

    const fromJobs = await ctx.db
      .query("importJobs")
      .withIndex("by_user", (q) => q.eq("userId", fromUserId))
      .collect();
    for (const job of fromJobs) {
      await ctx.db.patch(job._id, { userId: toUserId });
    }

    return {
      userGames: movedGames,
      userPreferences: movedPrefs,
      importJobs: fromJobs.length,
    };
  },
});
