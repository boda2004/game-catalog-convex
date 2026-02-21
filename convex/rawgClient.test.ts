import { describe, it, expect } from "vitest";
import { normalizeRawgData } from "./rawgClient";

describe("normalizeRawgData", () => {
  it("should normalize a complete game object correctly", () => {
    const rawData = {
      id: 123,
      name: "Test Game",
      slug: "test-game",
      background_image: "https://example.com/image.jpg",
      released: "2024-01-01",
      rating: 4.5,
      metacritic: 90,
      platforms: [{ platform: { name: "PC" } }, { platform: { name: "PlayStation 5" } }],
      genres: [{ name: "Action" }, { name: "RPG" }],
      developers: [{ name: "Test Dev" }],
      publishers: [{ name: "Test Pub" }],
      esrb_rating: { name: "Teen" },
      playtime: 10,
      description_raw: "This is a test game.",
      website: "https://example.com",
      tags: [{ name: "Singleplayer" }],
    };

    const expected = {
      rawgId: 123,
      name: "Test Game",
      slug: "test-game",
      backgroundImage: "https://example.com/image.jpg",
      released: "2024-01-01",
      rating: 4.5,
      metacritic: 90,
      platforms: ["PC", "PlayStation 5"],
      genres: ["Action", "RPG"],
      developers: ["Test Dev"],
      publishers: ["Test Pub"],
      esrbRating: "Teen",
      playtime: 10,
      description: "This is a test game.",
      website: "https://example.com",
      tags: ["Singleplayer"],
    };

    const result = normalizeRawgData(rawData);
    expect(result).toEqual(expected);
  });

  it("should handle missing optional fields and null values correctly", () => {
    const rawData = {
      id: 456,
      name: "Incomplete Game",
      slug: "incomplete-game",
      background_image: null,
      released: null,
      rating: null,
      metacritic: null,
      platforms: null,
      genres: undefined,
      developers: null,
      publishers: undefined,
      esrb_rating: null,
      playtime: null,
      description_raw: null,
      website: null,
      tags: [],
    };

    const expected = {
      rawgId: 456,
      name: "Incomplete Game",
      slug: "incomplete-game",
      backgroundImage: undefined,
      released: undefined,
      rating: undefined,
      metacritic: undefined,
      platforms: [],
      genres: [],
      developers: [],
      publishers: [],
      esrbRating: undefined,
      playtime: undefined,
      description: undefined,
      website: undefined,
      tags: [],
    };

    const result = normalizeRawgData(rawData);
    expect(result).toEqual(expected);
  });
});
