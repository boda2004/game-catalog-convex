import { Id } from "../../convex/_generated/dataModel";
import { GameDetailModal } from "./GameDetailModal";
import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dropdown } from "./shared/Dropdown";
import { ComboBox } from "./shared/ComboBox";

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
  onToggleFieldVisibility: (field: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  onViewModeChange: (mode: "grid" | "table") => void;
  viewMode: "grid" | "table";
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
  onToggleFieldVisibility,
  itemsPerPage,
  onItemsPerPageChange,
  onViewModeChange,
  viewMode,
}: GameTableProps) {
  const [selectedGameId, setSelectedGameId] = useState<Id<"games"> | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnsQuery, setColumnsQuery] = useState("");

  // Ensure dropdown open states are declared before using them in effects
  const [platformOpen, setPlatformOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);

  // Queries for dropdowns
  const [platformQuery, setPlatformQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");

  const columnsRef = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLDivElement | null>(null);
  const genreRef = useRef<HTMLDivElement | null>(null);

  // Track latest open states via refs to avoid stale closures
  const columnsOpenRef = useRef(columnsOpen);
  const platformOpenRef = useRef(platformOpen);
  const genreOpenRef = useRef(genreOpen);
  useEffect(() => { columnsOpenRef.current = columnsOpen; }, [columnsOpen]);
  useEffect(() => { platformOpenRef.current = platformOpen; }, [platformOpen]);
  useEffect(() => { genreOpenRef.current = genreOpen; }, [genreOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (columnsOpenRef.current && columnsRef.current && !columnsRef.current.contains(target)) {
        setColumnsOpen(false);
      }
      if (platformOpenRef.current && platformRef.current && !platformRef.current.contains(target)) {
        setPlatformOpen(false);
      }
      if (genreOpenRef.current && genreRef.current && !genreRef.current.contains(target)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allTableFields = [
    { key: "name", label: "Name" },
    { key: "platforms", label: "Platforms" },
    { key: "genres", label: "Genres" },
    { key: "rating", label: "Rating" },
    { key: "metacritic", label: "Metacritic" },
    { key: "released", label: "Released" },
    { key: "developers", label: "Developer" },
    { key: "publishers", label: "Publisher" },
    { key: "userAddedAt", label: "Added" },
  ];
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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left controls: View & Per page */}
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
                align="left"
              />
            </div>
          </div>
        </div>
        {/* Right controls: Column visibility dropdown */}
        <div className="relative">
          <Dropdown
            label="Columns"
            isOpen={columnsOpen}
            count={visibleFields.length}
            query={columnsQuery}
            setOpen={setColumnsOpen}
            setQuery={setColumnsQuery}
            items={allTableFields
              .filter(f => f.label.toLowerCase().includes(columnsQuery.toLowerCase()))
              .map(f => f.label)}
            onToggle={(label) => {
              const field = allTableFields.find(f => f.label === label);
              if (!field || field.key === "name") return; // keep Name always visible
              onToggleFieldVisibility(field.key);
            }}
            selected={allTableFields
              .filter(f => visibleFields.includes(f.key))
              .map(f => f.label)}
            placeholder="Search columns..."
            align="right"
            showSearch={true}
          />
        </div>
      </div>

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
                        {!isFilterableCombo && (
                          <>
                            <span>{fieldLabels[field] || field}</span>
                            {sortBy === field && !isFilterableCombo && (
                              <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </>
                        )}
                      </div>
                      {isFilterableCombo && (
                        <div className="flex items-center h-5">
                          {field === 'platforms' ? (
                            <Dropdown
                              label="Platforms"
                              isOpen={platformOpen}
                              count={selectedPlatforms.length}
                              query={platformQuery}
                              setOpen={setPlatformOpen}
                              setQuery={setPlatformQuery}
                              items={filteredPlatforms}
                              onToggle={onPlatformToggle}
                              selected={selectedPlatforms}
                              placeholder="Filter platforms..."
                            />
                          ) : (
                            <Dropdown
                              label="Genres"
                              isOpen={genreOpen}
                              count={selectedGenres.length}
                              query={genreQuery}
                              setOpen={setGenreOpen}
                              setQuery={setGenreQuery}
                              items={filteredGenres}
                              onToggle={onGenreToggle}
                              selected={selectedGenres}
                              placeholder="Filter genres..."
                            />
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
