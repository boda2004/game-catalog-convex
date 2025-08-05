import { Id } from "../../convex/_generated/dataModel";
import { GameDetailModal } from "./GameDetailModal";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Game {
  _id: Id<"games">;
  name: string;
  backgroundImage?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  userAddedAt?: number;
}

interface GameTableProps {
  games: Game[];
  visibleFields: string[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string, order: "asc" | "desc") => void;
}

export function GameTable({ 
  games, 
  visibleFields, 
  selectedPlatforms, 
  selectedGenres, 
  onPlatformToggle, 
  onGenreToggle,
  sortBy,
  sortOrder,
  onSortChange,
}: GameTableProps) {
  const [selectedGameId, setSelectedGameId] = useState<Id<"games"> | null>(null);

  const fieldLabels: Record<string, string> = {
    name: "Name",
    platforms: "Platforms",
    genres: "Genres",
    rating: "Rating",
    metacritic: "Metacritic",
    released: "Released",
    developers: "Developer",
    publishers: "Publisher",
    userAddedAt: "Added",
  };

  const sortableFields = ["name", "released", "rating", "metacritic", "userAddedAt"];

  const handleHeaderClick = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const renderCell = (game: Game, field: string) => {
    switch (field) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <span className="font-medium text-gray-900">{game.name}</span>
          </div>
        );
      case "platforms":
        return (
          <div className="flex flex-wrap gap-1">
            {game.platforms.slice(0, 2).map((platform) => {
              const isSelected = selectedPlatforms.includes(platform);
              return (
                <button
                  key={platform}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlatformToggle(platform);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {platform}
                </button>
              );
            })}
            {game.platforms.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{game.platforms.length - 2}
              </span>
            )}
          </div>
        );
      case "genres":
        return (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 2).map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenreToggle(genre);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
            {game.genres.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{game.genres.length - 2}
              </span>
            )}
          </div>
        );
      case "rating":
        return game.rating ? (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{game.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      case "metacritic":
        return game.metacritic ? (
          <div className="inline-flex items-center px-2 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">
            {game.metacritic}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      case "released":
        return game.released ? (
          <span>{new Date(game.released).toLocaleDateString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      case "developers":
        return (
          <span className="text-sm text-gray-600">
            {game.developers.slice(0, 2).join(", ")}
            {game.developers.length > 2 && ` +${game.developers.length - 2}`}
          </span>
        );
      case "publishers":
        return (
          <span className="text-sm text-gray-600">
            {game.publishers.slice(0, 2).join(", ")}
            {game.publishers.length > 2 && ` +${game.publishers.length - 2}`}
          </span>
        );
      case "userAddedAt":
        return game.userAddedAt ? (
          <span className="text-sm text-gray-600">
            {new Date(game.userAddedAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      default:
        return null;
    }
  };

  const [platformQuery, setPlatformQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);

  const allPlatformsQuery = useQuery(api.games.getAllPlatforms);
  const allGenresQuery = useQuery(api.games.getAllGenres);

  const allPlatforms = useMemo(() => {
    if (allPlatformsQuery && Array.isArray(allPlatformsQuery)) {
      return [...new Set(allPlatformsQuery)].sort();
    }
    const s = new Set<string>();
    games.forEach(g => g.platforms.forEach(p => s.add(p)));
    return Array.from(s).sort();
  }, [allPlatformsQuery, games]);

  const allGenres = useMemo(() => {
    if (allGenresQuery && Array.isArray(allGenresQuery)) {
      return [...new Set(allGenresQuery)].sort();
    }
    const s = new Set<string>();
    games.forEach(g => g.genres.forEach(x => s.add(x)));
    return Array.from(s).sort();
  }, [allGenresQuery, games]);

  const filteredPlatforms = useMemo(() => allPlatforms.filter(p => p.toLowerCase().includes(platformQuery.toLowerCase())), [allPlatforms, platformQuery]);
  const filteredGenres = useMemo(() => allGenres.filter(g => g.toLowerCase().includes(genreQuery.toLowerCase())), [allGenres, genreQuery]);

  const clearPlatforms = () => {
    selectedPlatforms.forEach(p => onPlatformToggle(p));
    setPlatformQuery("");
  };
  const clearGenres = () => {
    selectedGenres.forEach(g => onGenreToggle(g));
    setGenreQuery("");
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {visibleFields.map((field) => {
                  const isSortable = sortableFields.includes(field);
                  const isFilterableCombo = field === 'platforms' || field === 'genres';
                  return (
                    <th
                      key={field}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        isSortable ? "cursor-pointer hover:bg-gray-100" : ""
                      }`}
                      onClick={() => isSortable && handleHeaderClick(field)}
                    >
                      <div className="flex items-center">
                        <span>{fieldLabels[field] || field}</span>
                        {sortBy === field && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                      {isFilterableCombo && (
                        <div className="mt-2">
                          {field === 'platforms' ? (
                            <div className="relative">
                              <button type="button" onClick={() => setPlatformOpen(v => !v)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded flex items-center justify-between bg-white">
                                <span>{selectedPlatforms.length ? `Platforms (${selectedPlatforms.length})` : "Platforms"}</span>
                                <span className="text-[10px] text-gray-500">{platformOpen ? "▲" : "▼"}</span>
                              </button>
                              {platformOpen && (
                                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow z-20">
                                  <div className="p-2 border-b border-gray-100 flex gap-2 items-center">
                                    <input
                                      value={platformQuery}
                                      onChange={(e) => setPlatformQuery(e.target.value)}
                                      placeholder="Filter platforms..."
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <button type="button" onClick={clearPlatforms} className="text-[10px] px-2 py-1 border rounded hover:bg-gray-50">Clear</button>
                                  </div>
                                  <div className="max-h-48 overflow-auto">
                                    {filteredPlatforms.length === 0 && (
                                      <div className="px-2 py-2 text-[11px] text-gray-500">No results</div>
                                    )}
                                    {filteredPlatforms.map(p => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onPlatformToggle(p); }}
                                        className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-100 ${selectedPlatforms.includes(p) ? 'bg-blue-50 text-blue-700' : ''}`}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <button type="button" onClick={() => setGenreOpen(v => !v)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded flex items-center justify-between bg-white">
                                <span>{selectedGenres.length ? `Genres (${selectedGenres.length})` : "Genres"}</span>
                                <span className="text-[10px] text-gray-500">{genreOpen ? "▲" : "▼"}</span>
                              </button>
                              {genreOpen && (
                                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow z-20">
                                  <div className="p-2 border-b border-gray-100 flex gap-2 items-center">
                                    <input
                                      value={genreQuery}
                                      onChange={(e) => setGenreQuery(e.target.value)}
                                      placeholder="Filter genres..."
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <button type="button" onClick={clearGenres} className="text-[10px] px-2 py-1 border rounded hover:bg-gray-50">Clear</button>
                                  </div>
                                  <div className="max-h-48 overflow-auto">
                                    {filteredGenres.length === 0 && (
                                      <div className="px-2 py-2 text-[11px] text-gray-500">No results</div>
                                    )}
                                    {filteredGenres.map(g => (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onGenreToggle(g); }}
                                        className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-100 ${selectedGenres.includes(g) ? 'bg-purple-50 text-purple-700' : ''}`}
                                      >
                                        {g}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr
                  key={game._id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedGameId(game._id)}
                >
                  {visibleFields.map((field) => (
                    <td key={field} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(game, field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGameId && (
        <GameDetailModal
          gameId={selectedGameId}
          onClose={() => setSelectedGameId(null)}
        />
      )}
    </>
  );
}
