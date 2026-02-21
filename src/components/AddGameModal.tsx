import { useState, useMemo, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
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
}

export function AddGameModal({ onClose, onGameAdded }: AddGameModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [ownedOnSteam, setOwnedOnSteam] = useState(false);
  const [ownedOnEpic, setOwnedOnEpic] = useState(false);
  const [ownedOnGog, setOwnedOnGog] = useState(false);

  const searchGames = useAction(api.rawg.searchGamesPublic);
  const addGame = useAction(api.rawg.addGame);
  const updateGame = useMutation(api.games.updateOwnedGameStores);
  const ownedGamesInfo = useQuery(api.games.getOwnedGamesInfo);

  const ownedGamesMap = useMemo(() => {
    if (!ownedGamesInfo) return new Map();
    return new Map(ownedGamesInfo.map(g => [g.rawgId, g]));
  }, [ownedGamesInfo]);

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

  const handleGameAction = async (gameId: number) => {
    setIsSubmitting(true);
    const isUpdating = ownedGamesMap.has(gameId);
    try {
      if (isUpdating) {
        await updateGame({
          rawgId: gameId,
          ownedOnSteam,
          ownedOnEpic,
          ownedOnGog,
        });
        toast.success("Game updated successfully");
      } else {
        await addGame({
          rawgId: gameId,
          ownedOnSteam,
          ownedOnEpic,
          ownedOnGog,
        });
        toast.success("Game added to collection");
      }
      onGameAdded?.();
      onClose();
    } catch (error) {
      toast.error(isUpdating ? "Failed to update game" : "Failed to add game");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    const existingGame = ownedGamesMap.get(game.id);
    if (existingGame) {
      setOwnedOnSteam(existingGame.ownedOnSteam);
      setOwnedOnEpic(existingGame.ownedOnEpic);
      setOwnedOnGog(existingGame.ownedOnGog);
    } else {
      setOwnedOnSteam(false);
      setOwnedOnEpic(false);
      setOwnedOnGog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add or Edit Game</h2>
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                const alreadyAdded = ownedGamesMap.has(game.id);
                return (
                  <div
                    key={game.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${selectedGame?.id === game.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {game.background_image && (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-16 h-16 object-cover rounded-sm"
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
                      
                      {selectedGame?.id === game.id && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Owned on:</p>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={ownedOnSteam}
                                onChange={(e) => setOwnedOnSteam(e.target.checked)}
                                className="rounded-sm border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">Steam</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={ownedOnEpic}
                                onChange={(e) => setOwnedOnEpic(e.target.checked)}
                                className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Epic Games</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={ownedOnGog}
                                onChange={(e) => setOwnedOnGog(e.target.checked)}
                                className="rounded-sm border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">GOG</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleGameSelect(game)}
                        className={`w-24 text-center px-3 py-1 text-sm rounded border ${
                          selectedGame?.id === game.id
                            ? 'border-blue-500 bg-blue-100 text-blue-800'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {selectedGame?.id === game.id ? 'Selected' : 'Select'}
                      </button>
                      <button
                        onClick={() => handleGameAction(game.id)}
                        disabled={isSubmitting || !selectedGame || selectedGame.id !== game.id}
                        className={`w-24 text-center px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                          alreadyAdded
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting ? "Saving..." : (alreadyAdded ? "Update" : "Add")}
                      </button>
                    </div>
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
