import { Id } from "../../convex/_generated/dataModel";
import { GameDetailModal } from "./GameDetailModal";
import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { ComboBox } from "./shared/ComboBox";
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
  userAddedAt?: number;
  ownedOnSteam?: boolean;
  ownedOnEpic?: boolean;
  ownedOnGog?: boolean;
}

interface GameGridProps {
  games: Game[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: string[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
  onStoreToggle: (store: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string, order: "asc" | "desc") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  onViewModeChange: (mode: "grid" | "table") => void;
  viewMode: "grid" | "table";
}

export function GameGrid({ 
  games, 
  selectedPlatforms, 
  selectedGenres, 
  selectedStores,
  onPlatformToggle, 
  onGenreToggle,
  onStoreToggle,
  sortBy,
  sortOrder,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  onViewModeChange,
  viewMode,
}: GameGridProps) {
  const [selectedGameId, setSelectedGameId] = useState<Id<"games"> | null>(null);

  const allPlatformsQuery = useQuery(api.games.getAllPlatforms);
  const allGenresQuery = useQuery(api.games.getAllGenres);
  const allStoresQuery = useQuery(api.games.getAllStores);

  const allPlatforms = useMemo(() => {
    if (allPlatformsQuery && Array.isArray(allPlatformsQuery)) {
      return [...new Set(allPlatformsQuery)].sort();
    }
    // fallback to current-page derived values if query not ready
    const s = new Set<string>();
    games.forEach(g => g.platforms.forEach(p => s.add(p)));
    return Array.from(s).sort();
  }, [allPlatformsQuery, games]);

  const allGenres = useMemo(() => {
    if (allGenresQuery && Array.isArray(allGenresQuery)) {
      return [...new Set(allGenresQuery)].sort();
    }
    // fallback to current-page derived values if query not ready
    const s = new Set<string>();
    games.forEach(g => g.genres.forEach(x => s.add(x)));
    return Array.from(s).sort();
  }, [allGenresQuery, games]);

  const allStores = useMemo(() => {
    if (allStoresQuery && Array.isArray(allStoresQuery)) {
      return allStoresQuery;
    }
    // fallback to current-page derived values if query not ready
    const s = new Set<string>();
    games.forEach(g => {
      if (g.ownedOnSteam) s.add("steam");
      if (g.ownedOnEpic) s.add("epic");
      if (g.ownedOnGog) s.add("gog");
    });
    return Array.from(s).sort();
  }, [allStoresQuery, games]);

  const [platformQuery, setPlatformQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filteredPlatforms = useMemo(() => allPlatforms.filter(p => p.toLowerCase().includes(platformQuery.toLowerCase())), [allPlatforms, platformQuery]);
  const filteredGenres = useMemo(() => allGenres.filter(g => g.toLowerCase().includes(genreQuery.toLowerCase())), [allGenres, genreQuery]);
  const filteredStores = useMemo(() => allStores.filter(s => s.toLowerCase().includes(storeQuery.toLowerCase())), [allStores, storeQuery]);

  const clearPlatforms = () => {
    selectedPlatforms.forEach(p => onPlatformToggle(p));
    setPlatformQuery("");
  };
  const clearGenres = () => {
    selectedGenres.forEach(g => onGenreToggle(g));
    setGenreQuery("");
  };
  const clearStores = () => {
    selectedStores.forEach(s => onStoreToggle(s));
    setStoreQuery("");
  };

  const platformRef = useRef<HTMLDivElement | null>(null);
  const genreRef = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (platformOpen && platformRef.current && !platformRef.current.contains(target)) {
        setPlatformOpen(false);
      }
      if (genreOpen && genreRef.current && !genreRef.current.contains(target)) {
        setGenreOpen(false);
      }
      if (storeOpen && storeRef.current && !storeRef.current.contains(target)) {
        setStoreOpen(false);
      }
      if (sortOpen && sortRef.current && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [platformOpen, genreOpen, storeOpen, sortOpen]);

  const sortLabelMap: Record<string, string> = {
    userAddedAt: "Date Added",
    name: "Name",
    rating: "Rating",
    metacritic: "Metacritic",
    released: "Release Date",
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left controls: View, Per page, Sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex rounded-md border border-gray-300">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`px-3 py-1 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => onViewModeChange("table")}
                className={`px-3 py-1 text-sm rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  viewMode === "table" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                Table
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm font-medium text-gray-700">Per page:</span>
            <div className="w-24">
              <ComboBox
                value={itemsPerPage}
                onChange={(v) => onItemsPerPageChange(Number(v))}
                options={[12, 24, 48].map((n) => ({ label: String(n), value: n }))}
                buttonClassName="text-sm"
                align="left"
              />
            </div>
          </div>
          {/* Sort controls */}
          <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="relative w-48" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white"
            >
              <span>{sortLabelMap[sortBy] ?? sortBy}</span>
              <span className="text-xs text-gray-500">{sortOpen ? "▲" : "▼"}</span>
            </button>
            {sortOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                <div className="max-h-48 overflow-auto py-1">
                  {Object.entries(sortLabelMap).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortOpen(false);
                        if (value !== sortBy) {
                          onSortChange(value, sortOrder);
                        }
                      }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                        sortBy === value ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          </div>
        </div>
        {/* Platforms and Genres controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64" ref={platformRef}>
            <button type="button" onClick={() => setPlatformOpen(v => !v)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white">
              <span>{selectedPlatforms.length ? `Platforms (${selectedPlatforms.length})` : "Platforms"}</span>
              <span className="text-xs text-gray-500">{platformOpen ? "▲" : "▼"}</span>
            </button>
            {platformOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                <div className="p-2 border-b border-gray-100 flex gap-2 items-center">
                  <input
                    value={platformQuery}
                    onChange={(e) => setPlatformQuery(e.target.value)}
                    placeholder="Filter platforms..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button type="button" onClick={clearPlatforms} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Clear</button>
                </div>
                <div className="max-h-48 overflow-auto">
                  {filteredPlatforms.length === 0 && (
                    <div className="px-2 py-2 text-xs text-gray-500">No results</div>
                  )}
                  {filteredPlatforms.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onPlatformToggle(p); }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${selectedPlatforms.includes(p) ? 'bg-blue-50 text-blue-700' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative w-64" ref={genreRef}>
            <button type="button" onClick={() => setGenreOpen(v => !v)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white">
              <span>{selectedGenres.length ? `Genres (${selectedGenres.length})` : "Genres"}</span>
              <span className="text-xs text-gray-500">{genreOpen ? "▲" : "▼"}</span>
            </button>
            {genreOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                <div className="p-2 border-b border-gray-100 flex gap-2 items-center">
                  <input
                    value={genreQuery}
                    onChange={(e) => setGenreQuery(e.target.value)}
                    placeholder="Filter genres..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button type="button" onClick={clearGenres} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Clear</button>
                </div>
                <div className="max-h-48 overflow-auto">
                  {filteredGenres.length === 0 && (
                    <div className="px-2 py-2 text-xs text-gray-500">No results</div>
                  )}
                  {filteredGenres.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onGenreToggle(g); }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${selectedGenres.includes(g) ? 'bg-purple-50 text-purple-700' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative w-64" ref={storeRef}>
            <button type="button" onClick={() => setStoreOpen(v => !v)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white">
              <span>{selectedStores.length ? `Stores (${selectedStores.length})` : "Stores"}</span>
              <span className="text-xs text-gray-500">{storeOpen ? "▲" : "▼"}</span>
            </button>
            {storeOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                <div className="p-2 border-b border-gray-100 flex gap-2 items-center">
                  <input
                    value={storeQuery}
                    onChange={(e) => setStoreQuery(e.target.value)}
                    placeholder="Filter stores..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button type="button" onClick={clearStores} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Clear</button>
                </div>
                <div className="max-h-48 overflow-auto">
                  {filteredStores.length === 0 && (
                    <div className="px-2 py-2 text-xs text-gray-500">No results</div>
                  )}
                  {filteredStores.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onStoreToggle(s); }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${selectedStores.includes(s) ? 'bg-green-50 text-green-700' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedGameId(game._id)}
          >
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {game.rating && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {game.rating.toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{game.name}</h3>
              
              {game.released && (
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(game.released).getFullYear()}
                </p>
              )}

              {/* Platforms */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {game.platforms.slice(0, 3).map((platform) => {
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
                  {game.platforms.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Genres */}
              <div>
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
              </div>

              {/* Store Ownership */}
              {(game.ownedOnSteam || game.ownedOnEpic || game.ownedOnGog) && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {game.ownedOnSteam && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        Steam
                      </span>
                    )}
                    {game.ownedOnEpic && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Epic Games
                      </span>
                    )}
                    {game.ownedOnGog && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        GOG
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
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
