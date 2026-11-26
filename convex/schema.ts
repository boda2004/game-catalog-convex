import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { gameStatusValidator, storeIdValidator } from "./lib/domain";

const applicationTables = {
  // Users table - owned by the app in Convex Auth v2
  users: defineTable({}),

  // Shared game metadata catalog (cached across users)
  games: defineTable({
    rawgId: v.number(),
    name: v.string(),
    slug: v.string(),
    normalizedName: v.optional(v.string()),
    steamAppId: v.optional(v.number()),
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
    metadataUpdatedAt: v.optional(v.number()),
  })
    .index("by_rawg_id", ["rawgId"])
    .index("by_steam_app_id", ["steamAppId"])
    .index("by_normalized_name", ["normalizedName"])
    .searchIndex("search_games", {
      searchField: "name",
    }),

  // User library entries (many-to-many with user-specific metadata)
  userGames: defineTable({
    userId: v.id("users"),
    gameId: v.id("games"),
    addedAt: v.number(),
    // Extensible store ownership list
    stores: v.optional(v.array(storeIdValidator)),
    // Optional personal tracking metadata
    status: v.optional(gameStatusValidator),
    userRating: v.optional(v.number()),
    notes: v.optional(v.string()),
    playtimeMinutes: v.optional(v.number()),
    // Legacy store flags retained as optional for zero-downtime data compatibility
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
    ownedOnGog: v.optional(v.boolean()),
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

  // Durable import job progress tracking
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
    addedCount: v.optional(v.number()),
    updatedCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    sourceLabel: v.optional(v.string()),
    defaultStores: v.optional(v.array(storeIdValidator)),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Per-item persisted import outcomes
  importJobItems: defineTable({
    jobId: v.id("importJobs"),
    userId: v.id("users"),
    queryName: v.string(),
    steamAppId: v.optional(v.number()),
    status: v.union(
      v.literal("added"),
      v.literal("updated"),
      v.literal("not_found"),
      v.literal("failed"),
    ),
    matchedGameId: v.optional(v.id("games")),
    matchedGameName: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_job", ["jobId"]),
};

export default defineSchema({
  ...applicationTables,
});
