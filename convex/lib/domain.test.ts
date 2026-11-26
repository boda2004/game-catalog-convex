import { describe, expect, it } from "vitest";
import {
  getEffectiveStores,
  mergeStores,
  normalizeGameName,
  normalizeStores,
} from "./domain";

describe("normalizeGameName", () => {
  it("strips trademark symbols, punctuation, accents, and collapses whitespace", () => {
    expect(normalizeGameName("The Witcher® 3: Wild Hunt™")).toBe(
      "the witcher 3 wild hunt",
    );
    expect(normalizeGameName("Pokémon: Legends — Arceus")).toBe(
      "pokemon legends arceus",
    );
    expect(normalizeGameName("  Half-Life  2  ")).toBe("half life 2");
  });
});

describe("store helpers", () => {
  it("derives stores from legacy ownedOn* booleans when stores array is absent", () => {
    expect(
      getEffectiveStores({
        ownedOnSteam: true,
        ownedOnEpic: false,
        ownedOnGog: true,
      }),
    ).toEqual(["steam", "gog"]);
  });

  it("prefers the canonical stores array even when empty", () => {
    expect(
      getEffectiveStores({
        stores: [],
        ownedOnSteam: true,
      }),
    ).toEqual([]);

    expect(
      getEffectiveStores({
        stores: ["gog", "steam", "gog"],
      }),
    ).toEqual(["steam", "gog"]);
  });

  it("merges and canonically orders stores without duplicates", () => {
    expect(mergeStores(["gog", "playstation"], ["steam", "gog"])).toEqual([
      "steam",
      "gog",
      "playstation",
    ]);
    expect(normalizeStores(["other", "steam", "epic", "steam"])).toEqual([
      "steam",
      "epic",
      "other",
    ]);
  });
});
