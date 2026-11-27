import { describe, expect, it } from "vitest";
import type { Id } from "../../convex/_generated/dataModel";
import {
  computeFacetCounts,
  filterAndSortGames,
  formatPlaytime,
  getDefaultSortOrder,
  type LibraryGame,
} from "./catalog";
import { parseCatalogUrl, serializeCatalogUrl } from "./urlState";

const sampleGames: LibraryGame[] = [
  {
    _id: "g1" as Id<"games">,
    rawgId: 1,
    name: "Hades",
    slug: "hades",
    released: "2020-09-17",
    rating: 4.6,
    metacritic: 93,
    platforms: ["PC", "Nintendo Switch"],
    genres: ["Action", "Indie"],
    developers: ["Supergiant Games"],
    publishers: ["Supergiant Games"],
    userAddedAt: 2000,
    stores: ["steam", "nintendo"],
    status: "completed",
    userRating: 5,
    playtimeMinutes: 4200,
  },
  {
    _id: "g2" as Id<"games">,
    rawgId: 2,
    name: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    released: "2020-12-10",
    rating: 4.2,
    metacritic: 86,
    platforms: ["PC", "PlayStation 5"],
    genres: ["RPG", "Action"],
    developers: ["CD PROJEKT RED"],
    publishers: ["CD PROJEKT RED"],
    userAddedAt: 3000,
    stores: ["gog"],
    status: "playing",
    userRating: 4,
    playtimeMinutes: 1800,
  },
  {
    _id: "g3" as Id<"games">,
    rawgId: 3,
    name: "Hollow Knight",
    slug: "hollow-knight",
    released: "2017-02-24",
    rating: 4.5,
    metacritic: 90,
    platforms: ["PC"],
    genres: ["Platformer", "Indie"],
    developers: ["Team Cherry"],
    publishers: ["Team Cherry"],
    userAddedAt: 1000,
    stores: [],
  },
];

describe("filterAndSortGames", () => {
  it("filters by search across name, developer, genre, and platform", () => {
    const byDev = filterAndSortGames(sampleGames, {
      search: "supergiant",
      platforms: [],
      genres: [],
      stores: [],
      statuses: [],
      sortBy: "userAddedAt",
      sortOrder: "desc",
    });
    expect(byDev.map((g) => g.name)).toEqual(["Hades"]);
  });

  it("filters by store including no_store", () => {
    const noStore = filterAndSortGames(sampleGames, {
      search: "",
      platforms: [],
      genres: [],
      stores: ["no_store"],
      statuses: [],
      sortBy: "name",
      sortOrder: "asc",
    });
    expect(noStore.map((g) => g.name)).toEqual(["Hollow Knight"]);

    const gogOrSteam = filterAndSortGames(sampleGames, {
      search: "",
      platforms: [],
      genres: [],
      stores: ["gog", "steam"],
      statuses: [],
      sortBy: "name",
      sortOrder: "asc",
    });
    expect(gogOrSteam.map((g) => g.name)).toEqual(["Cyberpunk 2077", "Hades"]);
  });

  it("filters by status and sorts by playtime descending", () => {
    const result = filterAndSortGames(sampleGames, {
      search: "",
      platforms: [],
      genres: [],
      stores: [],
      statuses: ["completed", "playing"],
      sortBy: "playtimeMinutes",
      sortOrder: "desc",
    });
    expect(result.map((g) => g.name)).toEqual(["Hades", "Cyberpunk 2077"]);
  });
});

describe("computeFacetCounts", () => {
  it("computes disjunctive counts across facets", () => {
    const counts = computeFacetCounts(sampleGames, {
      search: "",
      platforms: [],
      genres: ["RPG"],
      stores: [],
      statuses: [],
    });

    // Other facets are narrowed by RPG (only Cyberpunk 2077)
    expect(counts.platforms).toEqual({ PC: 1, "PlayStation 5": 1 });
    expect(counts.stores).toEqual({ gog: 1 });
    expect(counts.statuses).toEqual({ playing: 1 });
    // Genre itself retains OR semantics across all unfiltered genres
    expect(counts.genres).toEqual({
      Action: 2,
      Indie: 2,
      RPG: 1,
      Platformer: 1,
    });
  });

  it("narrows all facets when search is active", () => {
    const counts = computeFacetCounts(sampleGames, {
      search: "hollow",
      platforms: [],
      genres: [],
      stores: [],
      statuses: [],
    });

    expect(counts.platforms).toEqual({ PC: 1 });
    expect(counts.genres).toEqual({ Platformer: 1, Indie: 1 });
    expect(counts.stores).toEqual({ no_store: 1 });
    expect(counts.statuses).toEqual({});
  });
});

describe("getDefaultSortOrder", () => {
  it("uses ascending for name and descending for numeric/date fields", () => {
    expect(getDefaultSortOrder("name")).toBe("asc");
    expect(getDefaultSortOrder("rating")).toBe("desc");
    expect(getDefaultSortOrder("userAddedAt")).toBe("desc");
  });
});

describe("formatPlaytime", () => {
  it("formats minutes and hours cleanly", () => {
    expect(formatPlaytime(undefined)).toBeNull();
    expect(formatPlaytime(0)).toBeNull();
    expect(formatPlaytime(45)).toBe("45m");
    expect(formatPlaytime(90)).toBe("1.5h");
    expect(formatPlaytime(1200)).toBe("20h");
  });
});

describe("URL catalog state serialization", () => {
  it("round-trips filters, sort, page, and selected game cleanly", () => {
    const original = {
      q: "witcher",
      platforms: ["PC", "PlayStation 5"],
      genres: ["RPG"],
      stores: ["steam", "gog"] as const,
      statuses: ["playing"] as const,
      sortBy: "rating" as const,
      sortOrder: "asc" as const,
      page: 3,
      gameId: "abc123",
    };

    const qs = serializeCatalogUrl({
      ...original,
      stores: [...original.stores],
      statuses: [...original.statuses],
    });
    const parsed = parseCatalogUrl(qs);
    expect(parsed).toEqual({
      ...original,
      stores: [...original.stores],
      statuses: [...original.statuses],
    });
  });

  it("ignores invalid stores, statuses, sort fields, and page numbers", () => {
    const parsed = parseCatalogUrl(
      "?stores=steam,invalid_store&status=bad&sort=nope&dir=weird&page=-2",
    );
    expect(parsed.stores).toEqual(["steam"]);
    expect(parsed.statuses).toEqual([]);
    expect(parsed.sortBy).toBe("userAddedAt");
    expect(parsed.sortOrder).toBe("desc");
    expect(parsed.page).toBe(1);
  });
});
