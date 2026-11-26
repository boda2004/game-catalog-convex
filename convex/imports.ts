import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { requireUserId } from "./lib/auth";
import {
  normalizeGameName,
  normalizeStores,
  storeIdValidator,
  type StoreId,
} from "./lib/domain";
import { searchAndFetchBestRawgGame } from "./providers/rawg";
import { fetchSteamOwnedGames, resolveSteamId } from "./providers/steam";

const CHUNK_SIZE = 5;
const MAX_CONCURRENCY = 2;

const importQueueItemValidator = v.object({
  queryName: v.string(),
  steamAppId: v.optional(v.number()),
  playtimeMinutes: v.optional(v.number()),
});

const importJobSummaryValidator = v.object({
  _id: v.id("importJobs"),
  type: v.union(v.literal("bulk"), v.literal("steam")),
  status: v.union(
    v.literal("pending"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
  ),
  total: v.number(),
  completed: v.number(),
  addedCount: v.number(),
  updatedCount: v.number(),
  failedCount: v.number(),
  sourceLabel: v.optional(v.string()),
  error: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const importJobItemValidator = v.object({
  _id: v.id("importJobItems"),
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
});

export const listImportJobs = query({
  args: {},
  returns: v.array(importJobSummaryValidator),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const jobs = await ctx.db
      .query("importJobs")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    return jobs.map((job) => ({
      _id: job._id,
      type: job.type,
      status: job.status,
      total: job.total,
      completed: job.completed,
      addedCount: job.addedCount ?? 0,
      updatedCount: job.updatedCount ?? 0,
      failedCount: job.failedCount ?? 0,
      sourceLabel: job.sourceLabel,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  },
});

export const getImportJobDetail = query({
  args: { jobId: v.id("importJobs") },
  returns: v.union(
    v.object({
      job: importJobSummaryValidator,
      items: v.array(importJobItemValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, { jobId }) => {
    const userId = await requireUserId(ctx);
    const job = await ctx.db.get(jobId);
    if (!job || job.userId !== userId) return null;

    const items = await ctx.db
      .query("importJobItems")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();

    return {
      job: {
        _id: job._id,
        type: job.type,
        status: job.status,
        total: job.total,
        completed: job.completed,
        addedCount: job.addedCount ?? 0,
        updatedCount: job.updatedCount ?? 0,
        failedCount: job.failedCount ?? 0,
        sourceLabel: job.sourceLabel,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
      items: items.map((item) => ({
        _id: item._id,
        queryName: item.queryName,
        steamAppId: item.steamAppId,
        status: item.status,
        matchedGameId: item.matchedGameId,
        matchedGameName: item.matchedGameName,
        error: item.error,
        createdAt: item.createdAt,
      })),
    };
  },
});

export const createImportJobInternal = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("bulk"), v.literal("steam")),
    total: v.number(),
    sourceLabel: v.optional(v.string()),
    defaultStores: v.optional(v.array(storeIdValidator)),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  returns: v.id("importJobs"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("importJobs", {
      userId: args.userId,
      type: args.type,
      status: args.status ?? (args.total === 0 ? "completed" : "running"),
      total: args.total,
      completed: 0,
      addedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      sourceLabel: args.sourceLabel,
      defaultStores: args.defaultStores
        ? normalizeStores(args.defaultStores)
        : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recordChunkResultsInternal = internalMutation({
  args: {
    jobId: v.id("importJobs"),
    userId: v.id("users"),
    items: v.array(
      v.object({
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
      }),
    ),
    isFinalChunk: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const now = Date.now();
    let addedDelta = 0;
    let updatedDelta = 0;
    let failedDelta = 0;

    for (const item of args.items) {
      await ctx.db.insert("importJobItems", {
        jobId: args.jobId,
        userId: args.userId,
        queryName: item.queryName,
        steamAppId: item.steamAppId,
        status: item.status,
        matchedGameId: item.matchedGameId,
        matchedGameName: item.matchedGameName,
        error: item.error,
        createdAt: now,
      });

      if (item.status === "added") addedDelta += 1;
      else if (item.status === "updated") updatedDelta += 1;
      else failedDelta += 1;
    }

    await ctx.db.patch(args.jobId, {
      completed: job.completed + args.items.length,
      addedCount: (job.addedCount ?? 0) + addedDelta,
      updatedCount: (job.updatedCount ?? 0) + updatedDelta,
      failedCount: (job.failedCount ?? 0) + failedDelta,
      ...(args.isFinalChunk ? { status: "completed" as const } : {}),
      updatedAt: now,
    });
    return null;
  },
});

export const failImportJobInternal = internalMutation({
  args: {
    jobId: v.id("importJobs"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { jobId, error }) => {
    const job = await ctx.db.get(jobId);
    if (!job) return null;
    await ctx.db.patch(jobId, {
      status: "failed",
      error,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Starts a durable, chunked bulk import by game names.
 * Returns immediately with jobId so UI can track live progress or close the modal safely.
 */
export const startBulkImport = mutation({
  args: {
    gameNames: v.array(v.string()),
    stores: v.optional(v.array(storeIdValidator)),
  },
  returns: v.object({
    jobId: v.id("importJobs"),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const seen = new Set<string>();
    const queue: Array<{ queryName: string }> = [];

    for (const rawName of args.gameNames) {
      const trimmed = rawName.trim();
      if (!trimmed) continue;
      const key = normalizeGameName(trimmed) || trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ queryName: trimmed });
    }

    if (queue.length === 0) {
      throw new Error("Enter at least one game name to import.");
    }

    const stores = normalizeStores(args.stores ?? []);
    const now = Date.now();
    const jobId = await ctx.db.insert("importJobs", {
      userId,
      type: "bulk",
      status: "running",
      total: queue.length,
      completed: 0,
      addedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      sourceLabel: `${queue.length} ${queue.length === 1 ? "title" : "titles"}`,
      defaultStores: stores,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.imports.processImportChunk, {
      jobId,
      userId,
      stores,
      items: queue,
    });

    return { jobId, total: queue.length };
  },
});

/**
 * Fetches owned Steam library (preserving appid + playtime), then schedules durable chunked ingestion.
 */
export const startSteamImport = action({
  args: {
    steamIdOrProfileUrl: v.string(),
  },
  returns: v.object({
    jobId: v.id("importJobs"),
    total: v.number(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{ jobId: Id<"importJobs">; total: number }> => {
    const userId = await ctx.runQuery(internal.auth.getCurrentUserId, {});
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const steamApiKey = process.env.STEAM_API_KEY;
    if (!steamApiKey) {
      throw new Error("Steam API key is not configured on the server.");
    }
    if (!process.env.RAWG_API_KEY) {
      throw new Error("RAWG API key is not configured on the server.");
    }

    const steamId = await resolveSteamId(args.steamIdOrProfileUrl, steamApiKey);
    const ownedGames = await fetchSteamOwnedGames(steamId, steamApiKey);

    const queue = ownedGames.map((game) => ({
      queryName: game.name,
      steamAppId: game.appid,
      playtimeMinutes: game.playtimeMinutes,
    }));

    const stores: StoreId[] = ["steam"];
    const jobId = await ctx.runMutation(
      internal.imports.createImportJobInternal,
      {
        userId,
        type: "steam",
        total: queue.length,
        sourceLabel: `Steam ${steamId}`,
        defaultStores: stores,
      },
    );

    if (queue.length > 0) {
      await ctx.scheduler.runAfter(0, internal.imports.processImportChunk, {
        jobId,
        userId,
        stores,
        items: queue,
      });
    }

    return { jobId, total: queue.length };
  },
});

/**
 * Durable chunk worker: processes up to CHUNK_SIZE items with bounded concurrency,
 * checks local shared `games` cache first to save RAWG calls, then schedules the next chunk.
 */
export const processImportChunk = internalAction({
  args: {
    jobId: v.id("importJobs"),
    userId: v.id("users"),
    stores: v.array(storeIdValidator),
    items: v.array(importQueueItemValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const rawgApiKey = process.env.RAWG_API_KEY;
    if (!rawgApiKey) {
      await ctx.runMutation(internal.imports.failImportJobInternal, {
        jobId: args.jobId,
        error: "RAWG API key is not configured on the server.",
      });
      return null;
    }

    const currentChunk = args.items.slice(0, CHUNK_SIZE);
    const remaining = args.items.slice(CHUNK_SIZE);

    type ChunkOutcome = {
      queryName: string;
      steamAppId?: number;
      status: "added" | "updated" | "not_found" | "failed";
      matchedGameId?: Id<"games">;
      matchedGameName?: string;
      error?: string;
    };

    const outcomes: ChunkOutcome[] = new Array(currentChunk.length);
    let cursor = 0;

    async function runWorker(): Promise<void> {
      while (cursor < currentChunk.length) {
        const index = cursor;
        cursor += 1;
        const item = currentChunk[index];

        try {
          // 1. Check shared local catalog cache first (0 RAWG calls on hit)
          const cached = await ctx.runQuery(
            internal.gamesInternal.findLocalGameMatch,
            {
              name: item.queryName,
              steamAppId: item.steamAppId,
            },
          );

          if (cached) {
            const linkOutcome = await ctx.runMutation(
              internal.gamesInternal.linkExistingGameForUserInternal,
              {
                userId: args.userId,
                gameId: cached._id,
                steamAppId: item.steamAppId,
                stores: args.stores,
                storeMergeMode: "merge",
                playtimeMinutes: item.playtimeMinutes,
              },
            );
            outcomes[index] = {
              queryName: item.queryName,
              steamAppId: item.steamAppId,
              status: linkOutcome.alreadyOwned ? "updated" : "added",
              matchedGameId: cached._id,
              matchedGameName: cached.name,
            };
            continue;
          }

          // 2. Fallback to RAWG lookup + full detail fetch
          const fetched = await searchAndFetchBestRawgGame(
            item.queryName,
            rawgApiKey as string,
            { steamAppId: item.steamAppId },
          );

          if (!fetched) {
            outcomes[index] = {
              queryName: item.queryName,
              steamAppId: item.steamAppId,
              status: "not_found",
              error: "No matching game found on RAWG",
            };
            continue;
          }

          const upsertOutcome = await ctx.runMutation(
            internal.gamesInternal.upsertGameForUserInternal,
            {
              userId: args.userId,
              game: fetched,
              stores: args.stores,
              storeMergeMode: "merge",
              playtimeMinutes: item.playtimeMinutes,
            },
          );

          outcomes[index] = {
            queryName: item.queryName,
            steamAppId: item.steamAppId,
            status: upsertOutcome.alreadyOwned ? "updated" : "added",
            matchedGameId: upsertOutcome.gameId,
            matchedGameName: fetched.name,
          };
        } catch (error) {
          outcomes[index] = {
            queryName: item.queryName,
            steamAppId: item.steamAppId,
            status: "failed",
            error:
              error instanceof Error ? error.message : "Unexpected import error",
          };
        }
      }
    }

    try {
      const workerCount = Math.min(MAX_CONCURRENCY, currentChunk.length);
      await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

      await ctx.runMutation(internal.imports.recordChunkResultsInternal, {
        jobId: args.jobId,
        userId: args.userId,
        items: outcomes,
        isFinalChunk: remaining.length === 0,
      });

      if (remaining.length > 0) {
        await ctx.scheduler.runAfter(0, internal.imports.processImportChunk, {
          jobId: args.jobId,
          userId: args.userId,
          stores: args.stores,
          items: remaining,
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.imports.failImportJobInternal, {
        jobId: args.jobId,
        error:
          error instanceof Error ? error.message : "Import chunk failed",
      });
    }

    return null;
  },
});
