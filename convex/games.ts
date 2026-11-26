import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import {
  GAME_STATUSES,
  STORE_IDS,
  gameStatusValidator,
  getEffectiveStores,
  mergeStores,
  normalizeStores,
  storeIdValidator,
  type GameStatus,
  type StoreId,
} from "./lib/domain";
import { linkExistingGameToUser } from "./lib/userGames";

const DEFAULT_VISIBLE_FIELDS = [
  "name",
  "platforms",
  "genres",
  "stores",
  "status",
  "rating",
  "released",
];

const libraryItemValidator = v.object({
  _id: v.id("games"),
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
  userAddedAt: v.number(),
  stores: v.array(storeIdValidator),
  status: v.optional(gameStatusValidator),
  userRating: v.optional(v.number()),
  playtimeMinutes: v.optional(v.number()),
});

/**
 * Single reactive subscription powering the entire catalog view:
 * eliminates the previous 5x N+1 queries (getUserGames + getOwnedGamesInfo + getAllPlatforms/Genres/Stores).
 */
export const getLibrary = query({
  args: {},
  returns: v.object({
    games: v.array(libraryItemValidator),
    facets: v.object({
      platforms: v.array(v.string()),
      genres: v.array(v.string()),
      stores: v.array(v.union(storeIdValidator, v.literal("no_store"))),
      statuses: v.array(gameStatusValidator),
    }),
    stats: v.object({
      total: v.number(),
      noStore: v.number(),
      byStore: v.record(v.string(), v.number()),
      byStatus: v.record(v.string(), v.number()),
    }),
  }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const relations = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (relations.length === 0) {
      return {
        games: [],
        facets: { platforms: [], genres: [], stores: [], statuses: [] },
        stats: { total: 0, noStore: 0, byStore: {}, byStatus: {} },
      };
    }

    // Deduplicate relations in-memory if any legacy duplicates exist for the same gameId
    const relByGameId = new Map<
      string,
      {
        gameId: (typeof relations)[number]["gameId"];
        addedAt: number;
        stores: StoreId[];
        status?: GameStatus;
        userRating?: number;
        playtimeMinutes?: number;
      }
    >();

    for (const rel of relations) {
      const key = rel.gameId;
      const effectiveStores = getEffectiveStores(rel);
      const existing = relByGameId.get(key);
      if (existing) {
        existing.stores = mergeStores(existing.stores, effectiveStores);
        existing.addedAt = Math.min(existing.addedAt, rel.addedAt);
        existing.status = existing.status ?? rel.status;
        existing.userRating = existing.userRating ?? rel.userRating;
        if (rel.playtimeMinutes !== undefined) {
          existing.playtimeMinutes = Math.max(
            existing.playtimeMinutes ?? 0,
            rel.playtimeMinutes,
          );
        }
      } else {
        relByGameId.set(key, {
          gameId: rel.gameId,
          addedAt: rel.addedAt,
          stores: effectiveStores,
          status: rel.status,
          userRating: rel.userRating,
          playtimeMinutes: rel.playtimeMinutes,
        });
      }
    }

    const entries = Array.from(relByGameId.values());
    const gameDocs = await Promise.all(
      entries.map((entry) => ctx.db.get(entry.gameId)),
    );

    const platformSet = new Set<string>();
    const genreSet = new Set<string>();
    const storeSet = new Set<StoreId | "no_store">();
    const statusSet = new Set<GameStatus>();
    const byStore: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let noStore = 0;

    const games = [];

    for (let i = 0; i < entries.length; i += 1) {
      const rel = entries[i];
      const game = gameDocs[i];
      if (!game) continue;

      for (const platform of game.platforms) platformSet.add(platform);
      for (const genre of game.genres) genreSet.add(genre);

      if (rel.stores.length === 0) {
        noStore += 1;
        storeSet.add("no_store");
      } else {
        for (const store of rel.stores) {
          storeSet.add(store);
          byStore[store] = (byStore[store] ?? 0) + 1;
        }
      }

      if (rel.status) {
        statusSet.add(rel.status);
        byStatus[rel.status] = (byStatus[rel.status] ?? 0) + 1;
      }

      games.push({
        _id: game._id,
        rawgId: game.rawgId,
        name: game.name,
        slug: game.slug,
        backgroundImage: game.backgroundImage,
        released: game.released,
        rating: game.rating,
        metacritic: game.metacritic,
        platforms: game.platforms,
        genres: game.genres,
        developers: game.developers,
        publishers: game.publishers,
        userAddedAt: rel.addedAt,
        stores: rel.stores,
        status: rel.status,
        userRating: rel.userRating,
        playtimeMinutes: rel.playtimeMinutes,
      });
    }

    const orderedStores: Array<StoreId | "no_store"> = [
      ...STORE_IDS.filter((id) => storeSet.has(id)),
      ...(storeSet.has("no_store") ? (["no_store"] as const) : []),
    ];

    const orderedStatuses = GAME_STATUSES.filter((status) =>
      statusSet.has(status),
    );

    return {
      games,
      facets: {
        platforms: Array.from(platformSet).sort((a, b) => a.localeCompare(b)),
        genres: Array.from(genreSet).sort((a, b) => a.localeCompare(b)),
        stores: orderedStores,
        statuses: orderedStatuses,
      },
      stats: {
        total: games.length,
        noStore,
        byStore,
        byStatus,
      },
    };
  },
});

export const getGameDetail = query({
  args: { gameId: v.id("games") },
  returns: v.union(
    v.object({
      _id: v.id("games"),
      rawgId: v.number(),
      steamAppId: v.optional(v.number()),
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
      metadataUpdatedAt: v.optional(v.number()),
      isOwned: v.boolean(),
      userAddedAt: v.optional(v.number()),
      stores: v.array(storeIdValidator),
      status: v.optional(gameStatusValidator),
      userRating: v.optional(v.number()),
      notes: v.optional(v.string()),
      playtimeMinutes: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, { gameId }) => {
    const userId = await requireUserId(ctx);
    const game = await ctx.db.get(gameId);
    if (!game) return null;

    const relations = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", gameId),
      )
      .collect();

    const primary = relations[0];
    let stores: StoreId[] = [];
    for (const rel of relations) {
      stores = mergeStores(stores, getEffectiveStores(rel));
    }

    return {
      _id: game._id,
      rawgId: game.rawgId,
      steamAppId: game.steamAppId,
      name: game.name,
      slug: game.slug,
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
      metadataUpdatedAt: game.metadataUpdatedAt,
      isOwned: relations.length > 0,
      userAddedAt: primary?.addedAt,
      stores,
      status: primary?.status,
      userRating: primary?.userRating,
      notes: primary?.notes,
      playtimeMinutes: primary?.playtimeMinutes,
    };
  },
});

export const updateUserGame = mutation({
  args: {
    gameId: v.id("games"),
    stores: v.optional(v.array(storeIdValidator)),
    status: v.optional(v.union(gameStatusValidator, v.null())),
    userRating: v.optional(v.union(v.number(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (
      args.userRating !== undefined &&
      args.userRating !== null &&
      (args.userRating < 1 || args.userRating > 5)
    ) {
      throw new Error("Personal rating must be between 1 and 5.");
    }

    const relations = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", args.gameId),
      )
      .collect();

    if (relations.length === 0) {
      throw new Error("Game not found in your collection.");
    }

    const [primary, ...duplicates] = relations;
    let currentStores = getEffectiveStores(primary);
    for (const dup of duplicates) {
      currentStores = mergeStores(currentStores, getEffectiveStores(dup));
      await ctx.db.delete(dup._id);
    }

    const nextStores =
      args.stores !== undefined ? normalizeStores(args.stores) : currentStores;

    await ctx.db.patch(primary._id, {
      stores: nextStores,
      ownedOnSteam: undefined,
      ownedOnEpic: undefined,
      ownedOnGog: undefined,
      ...(args.status !== undefined
        ? { status: args.status ?? undefined }
        : {}),
      ...(args.userRating !== undefined
        ? { userRating: args.userRating ?? undefined }
        : {}),
      ...(args.notes !== undefined
        ? { notes: args.notes?.trim() ? args.notes.trim() : undefined }
        : {}),
    });

    return null;
  },
});

export const updateOwnedGameByRawgId = mutation({
  args: {
    rawgId: v.number(),
    stores: v.array(storeIdValidator),
    status: v.optional(gameStatusValidator),
  },
  returns: v.object({
    gameId: v.id("games"),
    alreadyOwned: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const game = await ctx.db
      .query("games")
      .withIndex("by_rawg_id", (q) => q.eq("rawgId", args.rawgId))
      .unique();

    if (!game) {
      throw new Error("Game not found in catalog.");
    }

    return await linkExistingGameToUser(ctx, {
      userId,
      gameId: game._id,
      stores: args.stores,
      storeMergeMode: "replace",
      status: args.status,
    });
  },
});

export const removeFromLibrary = mutation({
  args: { gameId: v.id("games") },
  returns: v.null(),
  handler: async (ctx, { gameId }) => {
    const userId = await requireUserId(ctx);
    const relations = await ctx.db
      .query("userGames")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", gameId),
      )
      .collect();

    if (relations.length === 0) {
      throw new Error("Game not found in your collection.");
    }

    for (const rel of relations) {
      await ctx.db.delete(rel._id);
    }
    return null;
  },
});

export const getPreferences = query({
  args: {},
  returns: v.object({
    viewMode: v.union(v.literal("grid"), v.literal("table")),
    visibleFields: v.array(v.string()),
    itemsPerPage: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const pref = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!pref) {
      return {
        viewMode: "grid" as const,
        visibleFields: DEFAULT_VISIBLE_FIELDS,
        itemsPerPage: 24,
      };
    }

    return {
      viewMode: pref.viewMode,
      visibleFields: pref.visibleFields,
      itemsPerPage: pref.itemsPerPage,
    };
  },
});

export const updatePreferences = mutation({
  args: {
    viewMode: v.optional(v.union(v.literal("grid"), v.literal("table"))),
    visibleFields: v.optional(v.array(v.string())),
    itemsPerPage: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const safeItemsPerPage =
      args.itemsPerPage !== undefined
        ? Math.min(96, Math.max(12, Math.floor(args.itemsPerPage)))
        : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.viewMode !== undefined ? { viewMode: args.viewMode } : {}),
        ...(args.visibleFields !== undefined
          ? { visibleFields: args.visibleFields }
          : {}),
        ...(safeItemsPerPage !== undefined
          ? { itemsPerPage: safeItemsPerPage }
          : {}),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        viewMode: args.viewMode ?? "grid",
        visibleFields: args.visibleFields ?? DEFAULT_VISIBLE_FIELDS,
        itemsPerPage: safeItemsPerPage ?? 24,
      });
    }

    return null;
  },
});
