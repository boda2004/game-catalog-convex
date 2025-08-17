import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not found");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export const getUserGames = query({
  args: {
    searchTerm: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    stores: v.optional(v.array(v.union(v.literal("steam"), v.literal("epic"), v.literal("gog")))),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.string()),
    page: v.optional(v.number()),
    itemsPerPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);
    
    // Get user's games through the userGames relationship
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (userGameRelations.length === 0) {
      return {
        games: [],
        totalCount: 0,
        hasMore: false,
      };
    }

    // Get the actual game documents
    const gameIds = userGameRelations.map(rel => rel.gameId);
    const allGames = await Promise.all(
      gameIds.map(async (gameId) => {
        const game = await ctx.db.get(gameId);
        const userGameRel = userGameRelations.find(rel => rel.gameId === gameId);
        return game ? { 
          ...game, 
          userAddedAt: userGameRel?.addedAt,
          ownedOnSteam: userGameRel?.ownedOnSteam || false,
          ownedOnEpic: userGameRel?.ownedOnEpic || false,
          ownedOnGog: userGameRel?.ownedOnGog || false,
        } : null;
      })
    );

    let games = allGames.filter(game => game !== null);

    // Apply search filter
    if (args.searchTerm) {
      const searchTerm = args.searchTerm.toLowerCase();
      games = games.filter(game => 
        game.name.toLowerCase().includes(searchTerm) ||
        game.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
        game.platforms.some(platform => platform.toLowerCase().includes(searchTerm))
      );
    }

    // Apply platform filter
    if (args.platforms && args.platforms.length > 0) {
      games = games.filter(game =>
        args.platforms!.some(platform =>
          game.platforms.some(gamePlatform =>
            gamePlatform.toLowerCase().includes(platform.toLowerCase())
          )
        )
      );
    }

    // Apply genre filter
    if (args.genres && args.genres.length > 0) {
      games = games.filter(game =>
        args.genres!.some(genre =>
          game.genres.some(gameGenre =>
            gameGenre.toLowerCase().includes(genre.toLowerCase())
          )
        )
      );
    }

    // Apply store filter
    if (args.stores && args.stores.length > 0) {
      games = games.filter(game => {
        if (args.stores!.includes("steam") && game.ownedOnSteam) return true;
        if (args.stores!.includes("epic") && game.ownedOnEpic) return true;
        if (args.stores!.includes("gog") && game.ownedOnGog) return true;
        return false;
      });
    }

    // Apply sorting
    const sortBy = args.sortBy || "userAddedAt";
    const sortOrder = args.sortOrder || "desc";
    
    games.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "released":
          aValue = a.released || "";
          bValue = b.released || "";
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "metacritic":
          aValue = a.metacritic || 0;
          bValue = b.metacritic || 0;
          break;
        case "userAddedAt":
        default:
          aValue = a.userAddedAt || 0;
          bValue = b.userAddedAt || 0;
          break;
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    const totalCount = games.length;
    
    // Apply pagination
    const page = args.page || 1;
    const itemsPerPage = args.itemsPerPage || 12;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedGames = games.slice(startIndex, endIndex);
    const hasMore = endIndex < totalCount;

    return {
      games: paginatedGames,
      totalCount,
      hasMore,
    };
  },
});

export const getOwnedRawgIds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (userGameRelations.length === 0) return [] as number[];

    const gameIds = userGameRelations.map((rel) => rel.gameId);
    const games = await Promise.all(gameIds.map((id) => ctx.db.get(id)));
    const rawgIds = games
      .filter((g) => g && typeof g.rawgId === "number")
      .map((g: any) => g.rawgId as number);

    // Deduplicate just in case
    return Array.from(new Set(rawgIds));
  },
});

export const getGameById = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);
    
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      return null;
    }

    // Check if user owns this game
    const userGameRel = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) => 
        q.eq("userId", user._id).eq("gameId", args.gameId)
      )
      .unique();

    return {
      ...game,
      isOwned: !!userGameRel,
      userAddedAt: userGameRel?.addedAt,
      ownedOnSteam: userGameRel?.ownedOnSteam || false,
      ownedOnEpic: userGameRel?.ownedOnEpic || false,
      ownedOnGog: userGameRel?.ownedOnGog || false,
    };
  },
});

export const addGameToUser = mutation({
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
    ownedOnSteam: v.optional(v.boolean()),
    ownedOnEpic: v.optional(v.boolean()),
    ownedOnGog: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);

    // Check if game already exists in the games table
    let existingGame = await ctx.db
      .query("games")
      .withIndex("by_rawg_id", (q) => q.eq("rawgId", args.rawgId))
      .unique();

    let gameId;
    if (existingGame) {
      gameId = existingGame._id;
    } else {
      // Create new game entry
      gameId = await ctx.db.insert("games", {
        ...args,
        addedAt: Date.now(),
      });
    }

    // Check if user already owns this game
    const existingUserGame = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) => 
        q.eq("userId", user._id).eq("gameId", gameId)
      )
      .unique();

    if (existingUserGame) {
      // Update existing ownership with new store flags
      const updatedOwnedOnSteam = existingUserGame.ownedOnSteam || args.ownedOnSteam || false;
      const updatedOwnedOnEpic = existingUserGame.ownedOnEpic || args.ownedOnEpic || false;
      const updatedOwnedOnGog = existingUserGame.ownedOnGog || args.ownedOnGog || false;
      
      await ctx.db.patch(existingUserGame._id, {
        ownedOnSteam: updatedOwnedOnSteam,
        ownedOnEpic: updatedOwnedOnEpic,
        ownedOnGog: updatedOwnedOnGog,
      });
      
      return gameId;
    }

    // Add game to user's collection with store ownership
    await ctx.db.insert("userGames", {
      userId: user._id,
      gameId,
      addedAt: Date.now(),
      ownedOnSteam: args.ownedOnSteam || false,
      ownedOnEpic: args.ownedOnEpic || false,
      ownedOnGog: args.ownedOnGog || false,
    });

    return gameId;
  },
});

export const removeGameFromUser = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);

    const userGame = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) => 
        q.eq("userId", user._id).eq("gameId", args.gameId)
      )
      .unique();

    if (!userGame) {
      throw new Error("Game not found in your collection");
    }

    await ctx.db.delete(userGame._id);
  },
});

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return preferences || {
      viewMode: "grid" as const,
      visibleFields: ["name", "platforms", "genres", "rating", "released"],
      itemsPerPage: 12,
    };
  },
});

// Realtime progress: fetch an import job by id for live UI subscription
export const getImportJob = query({
  args: { jobId: v.optional(v.id("importJobs")) },
  handler: async (ctx, args) => {
    if (!args.jobId) return null;
    const user = await getLoggedInUser(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      return null;
    }
    return job;
  },
});

export const updateUserPreferences = mutation({
  args: {
    viewMode: v.optional(v.union(v.literal("grid"), v.literal("table"))),
    visibleFields: v.optional(v.array(v.string())),
    itemsPerPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);
    
    const existingPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingPreferences) {
      await ctx.db.patch(existingPreferences._id, {
        ...(args.viewMode && { viewMode: args.viewMode }),
        ...(args.visibleFields && { visibleFields: args.visibleFields }),
        ...(args.itemsPerPage && { itemsPerPage: args.itemsPerPage }),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        viewMode: args.viewMode || "grid",
        visibleFields: args.visibleFields || ["name", "platforms", "genres", "rating", "released"],
        itemsPerPage: args.itemsPerPage || 12,
      });
    }
  },
});

export const getAllPlatforms = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    
    // Get user's games
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const gameIds = userGameRelations.map(rel => rel.gameId);
    const games = await Promise.all(
      gameIds.map(gameId => ctx.db.get(gameId))
    );

    const platformSet = new Set<string>();
    games.forEach(game => {
      if (game) {
        game.platforms.forEach(platform => platformSet.add(platform));
      }
    });

    return Array.from(platformSet).sort();
  },
});

export const getAllGenres = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    
    // Get user's games
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const gameIds = userGameRelations.map(rel => rel.gameId);
    const games = await Promise.all(
      gameIds.map(gameId => ctx.db.get(gameId))
    );

    const genreSet = new Set<string>();
    games.forEach(game => {
      if (game) {
        game.genres.forEach(genre => genreSet.add(genre));
      }
    });

    return Array.from(genreSet).sort();
  },
});

export const getAllStores = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    
    // Get user's games
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const storeSet = new Set<string>();
    userGameRelations.forEach(rel => {
      if (rel.ownedOnSteam) storeSet.add("steam");
      if (rel.ownedOnEpic) storeSet.add("epic");
      if (rel.ownedOnGog) storeSet.add("gog");
    });

    return Array.from(storeSet).sort();
  },
});

export const debugUserGames = query({
  args: {},
  handler: async (ctx) => {
    const user = await getLoggedInUser(ctx);
    
    const userGameRelations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const gameIds = userGameRelations.map(rel => rel.gameId);
    const games = await Promise.all(
      gameIds.map(gameId => ctx.db.get(gameId))
    );

    return {
      userId: user._id,
      userGameCount: userGameRelations.length,
      gameIds,
      userGameNames: games.filter(g => g !== null).map(g => g!.name),
    };
  },
});

// Create an import job for progress tracking
export const createImportJob = mutation({
  args: {
    type: v.union(v.literal("bulk"), v.literal("steam")),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getLoggedInUser(ctx);
    const now = Date.now();
    const jobId = await ctx.db.insert("importJobs", {
      userId: user._id,
      type: args.type,
      status: "running",
      total: args.total,
      completed: 0,
      createdAt: now,
      updatedAt: now,
    });
    return jobId;
  },
});

// Internal helpers for actions to update progress
export const updateImportJob = internalMutation({
  args: {
    jobId: v.id("importJobs"),
    completed: v.optional(v.number()),
    total: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;
    await ctx.db.patch(args.jobId, {
      ...(args.completed !== undefined ? { completed: args.completed } : {}),
      ...(args.total !== undefined ? { total: args.total } : {}),
      ...(args.status ? { status: args.status } : {}),
      ...(args.error ? { error: args.error } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const completeImportJob = internalMutation({
  args: { jobId: v.id("importJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;
    await ctx.db.patch(args.jobId, {
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});

export const failImportJob = internalMutation({
  args: { jobId: v.id("importJobs"), error: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;
    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});
