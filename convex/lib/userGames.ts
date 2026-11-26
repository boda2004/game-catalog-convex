import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  getEffectiveStores,
  mergeStores,
  normalizeGameName,
  normalizeStores,
  type GameStatus,
  type NormalizedGameInput,
  type StoreId,
} from "./domain";

export interface UpsertGameForUserParams {
  userId: Id<"users">;
  game: NormalizedGameInput;
  stores?: StoreId[];
  storeMergeMode?: "merge" | "replace";
  status?: GameStatus;
  playtimeMinutes?: number;
}

export async function ensureGameDocument(
  ctx: MutationCtx,
  game: NormalizedGameInput,
): Promise<Id<"games">> {
  const normalizedName = game.normalizedName ?? normalizeGameName(game.name);
  const existing = await ctx.db
    .query("games")
    .withIndex("by_rawg_id", (q) => q.eq("rawgId", game.rawgId))
    .unique();

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.normalizedName) {
      patch.normalizedName = normalizedName;
    }
    if (game.steamAppId !== undefined && existing.steamAppId === undefined) {
      patch.steamAppId = game.steamAppId;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
    }
    return existing._id;
  }

  const now = Date.now();
  return await ctx.db.insert("games", {
    rawgId: game.rawgId,
    name: game.name,
    slug: game.slug,
    normalizedName,
    steamAppId: game.steamAppId,
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
    addedAt: now,
    metadataUpdatedAt: now,
  });
}

export async function linkExistingGameToUser(
  ctx: MutationCtx,
  params: {
    userId: Id<"users">;
    gameId: Id<"games">;
    stores?: StoreId[];
    storeMergeMode?: "merge" | "replace";
    status?: GameStatus;
    playtimeMinutes?: number;
  },
): Promise<{ gameId: Id<"games">; alreadyOwned: boolean }> {
  const existingRows = await ctx.db
    .query("userGames")
    .withIndex("by_user_and_game", (q) =>
      q.eq("userId", params.userId).eq("gameId", params.gameId),
    )
    .collect();

  const incomingStores = normalizeStores(params.stores ?? []);

  if (existingRows.length > 0) {
    const [primary, ...duplicates] = existingRows;
    // Consolidate any legacy duplicate rows cleanly
    let mergedExisting = getEffectiveStores(primary);
    for (const dup of duplicates) {
      mergedExisting = mergeStores(mergedExisting, getEffectiveStores(dup));
      await ctx.db.delete(dup._id);
    }

    const nextStores =
      params.storeMergeMode === "replace"
        ? incomingStores
        : mergeStores(mergedExisting, incomingStores);

    await ctx.db.patch(primary._id, {
      stores: nextStores,
      ownedOnSteam: undefined,
      ownedOnEpic: undefined,
      ownedOnGog: undefined,
      ...(params.status !== undefined ? { status: params.status } : {}),
      ...(params.playtimeMinutes !== undefined
        ? {
            playtimeMinutes: Math.max(
              primary.playtimeMinutes ?? 0,
              params.playtimeMinutes,
            ),
          }
        : {}),
    });

    return { gameId: params.gameId, alreadyOwned: true };
  }

  await ctx.db.insert("userGames", {
    userId: params.userId,
    gameId: params.gameId,
    addedAt: Date.now(),
    stores: incomingStores,
    ...(params.status !== undefined ? { status: params.status } : {}),
    ...(params.playtimeMinutes !== undefined
      ? { playtimeMinutes: params.playtimeMinutes }
      : {}),
  });

  return { gameId: params.gameId, alreadyOwned: false };
}

export async function upsertGameForUser(
  ctx: MutationCtx,
  params: UpsertGameForUserParams,
): Promise<{ gameId: Id<"games">; alreadyOwned: boolean }> {
  const gameId = await ensureGameDocument(ctx, params.game);
  return await linkExistingGameToUser(ctx, {
    userId: params.userId,
    gameId,
    stores: params.stores,
    storeMergeMode: params.storeMergeMode,
    status: params.status,
    playtimeMinutes: params.playtimeMinutes,
  });
}
