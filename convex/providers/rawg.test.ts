import { describe, expect, it } from "vitest";
import { normalizeRawgGame, normalizeRawgSearchItem } from "./rawg";

describe("normalizeRawgGame", () => {
  it("normalizes a complete RAWG game payload with steamAppId and normalizedName", () => {
    const result = normalizeRawgGame(
      {
        id: 123,
        name: "The Witcher® 3: Wild Hunt",
        slug: "the-witcher-3-wild-hunt",
        background_image: "https://example.com/image.jpg",
        released: "2015-05-18",
        rating: 4.7,
        metacritic: 93,
        platforms: [
          { platform: { name: "PC" } },
          { platform: { name: "PlayStation 5" } },
        ],
        genres: [{ name: "Action" }, { name: "RPG" }],
        developers: [{ name: "CD PROJEKT RED" }],
        publishers: [{ name: "CD PROJEKT RED" }],
        esrb_rating: { name: "Mature" },
        playtime: 46,
        description_raw: "An open-world RPG.",
        website: "https://thewitcher.com",
        tags: [{ name: "Singleplayer" }],
      },
      { steamAppId: 292030 },
    );

    expect(result).toEqual({
      rawgId: 123,
      name: "The Witcher® 3: Wild Hunt",
      slug: "the-witcher-3-wild-hunt",
      normalizedName: "the witcher 3 wild hunt",
      steamAppId: 292030,
      backgroundImage: "https://example.com/image.jpg",
      released: "2015-05-18",
      rating: 4.7,
      metacritic: 93,
      platforms: ["PC", "PlayStation 5"],
      genres: ["Action", "RPG"],
      developers: ["CD PROJEKT RED"],
      publishers: ["CD PROJEKT RED"],
      esrbRating: "Mature",
      playtime: 46,
      description: "An open-world RPG.",
      website: "https://thewitcher.com",
      tags: ["Singleplayer"],
    });
  });

  it("handles missing and null optional fields safely", () => {
    const result = normalizeRawgGame({
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
    });

    expect(result).toEqual({
      rawgId: 456,
      name: "Incomplete Game",
      slug: "incomplete-game",
      normalizedName: "incomplete game",
      steamAppId: undefined,
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
    });
  });

  it("normalizes RAWG search preview items", () => {
    expect(
      normalizeRawgSearchItem({
        id: 10,
        name: "Hades",
        slug: "hades",
        background_image: null,
        rating: 4.6,
        platforms: [{ platform: { name: "PC" } }],
        genres: [{ name: "Indie" }],
      }),
    ).toEqual({
      rawgId: 10,
      name: "Hades",
      slug: "hades",
      backgroundImage: undefined,
      released: undefined,
      rating: 4.6,
      metacritic: undefined,
      platforms: ["PC"],
      genres: ["Indie"],
    });
  });
});
