import { useState, useMemo } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Game {
  id: number;
  name: string;
  background_image?: string;
  released?: string;
  rating?: number;
  platforms?: Array<{ platform: { name: string } }>;
}

interface AddGameModalProps {
  onClose: () => void;
  onGameAdded?: () => void;
  existingRawgIds?: number[];
}

export function AddGameModal({ onClose, onGameAdded, existingRawgIds = [] }: AddGameModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const searchGames = useAction(api.rawg.searchGamesPublic);
  const addGame = useAction(api.rawg.addGame);

  const existingIdsSet = useMemo(() => new Set(existingRawgIds), [existingRawgIds]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchGames({ query: searchQuery });
      setSearchResults(results);
    } catch (error) {
      toast.error("Failed to search games");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddGame = async (gameId: number) => {
    if (existingIdsSet.has(gameId)) return;
    setIsAdding(true);
    try {
      await addGame({ rawgId: gameId });
      toast.success("Game added to collection");
      onGameAdded?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already in catalog") || errorMessage.includes("already in your collection")) {
        toast.error("Game is already in your catalog");
      } else {
        toast.error("Failed to add game");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Game to Catalog</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for a game..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((game) => {
                const alreadyAdded = existingIdsSet.has(game.id);
                return (
                  <div
                    key={game.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {game.background_image && (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{game.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {game.released && <p>Released: {game.released}</p>}
                        {game.rating && <p>Rating: {game.rating}/5</p>}
                        {game.platforms && (
                          <p>
                            Platforms: {game.platforms.map(p => p.platform.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddGame(game.id)}
                      disabled={isAdding || alreadyAdded}
                      className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${alreadyAdded ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {alreadyAdded ? "Added" : (isAdding ? "Adding..." : "Add")}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : searchQuery && !isSearching ? (
            <p className="text-center text-gray-500 py-8">
              No games found. Try a different search term.
            </p>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Search for games to add to your catalog
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
