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
      });
    }
    
    return { updated: userGames.length };
  },
});
