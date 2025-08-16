import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Games table - shared across all users
  games: defineTable({
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
    addedAt: v.number(),
  })
    .index("by_rawg_id", ["rawgId"])
    .searchIndex("search_games", {
      searchField: "name",
    }),

  // User game ownership - many-to-many relationship
  userGames: defineTable({
    userId: v.id("users"),
    gameId: v.id("games"),
    addedAt: v.number(),
    // Store ownership flags
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_game", ["gameId"])
    .index("by_user_and_game", ["userId", "gameId"]),

  userPreferences: defineTable({
    userId: v.id("users"),
    viewMode: v.union(v.literal("grid"), v.literal("table")),
    visibleFields: v.array(v.string()),
    itemsPerPage: v.number(),
  }).index("by_user", ["userId"]),

  // Import job progress tracking for realtime UI updates
  importJobs: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("bulk"), v.literal("steam")),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    total: v.number(),
    completed: v.number(),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
