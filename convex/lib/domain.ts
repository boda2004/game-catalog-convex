import { v, type Infer } from "convex/values";

export const STORE_IDS = [
  "steam",
  "epic",
  "gog",
  "playstation",
  "xbox",
  "nintendo",
  "itch",
  "ea",
  "ubisoft",
  "other",
] as const;

export const storeIdValidator = v.union(
  v.literal("steam"),
  v.literal("epic"),
  v.literal("gog"),
  v.literal("playstation"),
  v.literal("xbox"),
  v.literal("nintendo"),
  v.literal("itch"),
  v.literal("ea"),
  v.literal("ubisoft"),
  v.literal("other"),
);

export type StoreId = Infer<typeof storeIdValidator>;

export const GAME_STATUSES = [
  "backlog",
  "playing",
  "completed",
  "dropped",
  "wishlist",
] as const;

export const gameStatusValidator = v.union(
  v.literal("backlog"),
  v.literal("playing"),
  v.literal("completed"),
  v.literal("dropped"),
  v.literal("wishlist"),
);

export type GameStatus = Infer<typeof gameStatusValidator>;

export const normalizedGameValidator = v.object({
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
});

export type NormalizedGameInput = Infer<typeof normalizedGameValidator>;

/**
 * Normalizes a game title for cache matching across providers (e.g. Steam -> RAWG).
 * Strips trademark/copyright marks and collapses punctuation/whitespace.
 */
export function normalizeGameName(name: string): string {
  return name
    .replace(/[™®©]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeStores(stores: readonly StoreId[]): StoreId[] {
  const unique = new Set<StoreId>(stores);
  return STORE_IDS.filter((id) => unique.has(id));
}

export function mergeStores(
  existing: readonly StoreId[],
  incoming: readonly StoreId[],
): StoreId[] {
  return normalizeStores([...existing, ...incoming]);
}

export type LegacyStoreFields = {
  stores?: StoreId[];
  ownedOnSteam?: boolean;
  ownedOnEpic?: boolean;
  ownedOnGog?: boolean;
};

/**
 * Resolves effective stores for a userGames row, transparently supporting
 * both the new `stores` array and legacy `ownedOn*` boolean flags.
 */
export function getEffectiveStores(row: LegacyStoreFields): StoreId[] {
  if (row.stores !== undefined) {
    return normalizeStores(row.stores);
  }
  const derived: StoreId[] = [];
  if (row.ownedOnSteam) derived.push("steam");
  if (row.ownedOnEpic) derived.push("epic");
  if (row.ownedOnGog) derived.push("gog");
  return derived;
}
