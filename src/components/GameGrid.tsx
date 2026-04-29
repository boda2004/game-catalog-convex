import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ComboBox } from "./shared/ComboBox";
import { GameDetailModal } from "./GameDetailModal";

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

const sortLabelMap: Record<string, string> = {
  userAddedAt: "Date Added",
  name: "Name",
  rating: "Rating",
  metacritic: "Metacritic",
  released: "Release Date",
};

const storeLabels: Record<string, string> = {
  steam: "Steam",
  epic: "Epic Games",
  gog: "GOG",
  no_store: "No store",
};

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-4 text-[#767682] transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
    </svg>
  );
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
  const [platformQuery, setPlatformQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const allPlatformsQuery = useQuery(api.games.getAllPlatforms);
  const allGenresQuery = useQuery(api.games.getAllGenres);
  const allStoresQuery = useQuery(api.games.getAllStores);

  const allPlatforms = useMemo(() => {
    if (allPlatformsQuery && Array.isArray(allPlatformsQuery)) {
      return [...new Set(allPlatformsQuery)].sort();
    }
    const values = new Set<string>();
    games.forEach((game) => game.platforms.forEach((platform) => values.add(platform)));
    return Array.from(values).sort();
  }, [allPlatformsQuery, games]);

  const allGenres = useMemo(() => {
    if (allGenresQuery && Array.isArray(allGenresQuery)) {
      return [...new Set(allGenresQuery)].sort();
    }
    const values = new Set<string>();
    games.forEach((game) => game.genres.forEach((genre) => values.add(genre)));
    return Array.from(values).sort();
  }, [allGenresQuery, games]);

  const allStores = useMemo(() => {
    if (allStoresQuery && Array.isArray(allStoresQuery)) {
      return allStoresQuery;
    }
    const values = new Set<string>();
    games.forEach((game) => {
      if (game.ownedOnSteam) values.add("steam");
      if (game.ownedOnEpic) values.add("epic");
      if (game.ownedOnGog) values.add("gog");
    });
    return Array.from(values).sort();
  }, [allStoresQuery, games]);

  const filteredPlatforms = useMemo(
    () => allPlatforms.filter((platform) => platform.toLowerCase().includes(platformQuery.toLowerCase())),
    [allPlatforms, platformQuery],
  );
  const filteredGenres = useMemo(
    () => allGenres.filter((genre) => genre.toLowerCase().includes(genreQuery.toLowerCase())),
    [allGenres, genreQuery],
  );
  const filteredStores = useMemo(
    () => allStores.filter((store) => store.toLowerCase().includes(storeQuery.toLowerCase())),
    [allStores, storeQuery],
  );

  const platformRef = useRef<HTMLDivElement | null>(null);
  const genreRef = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (platformOpen && platformRef.current && !platformRef.current.contains(target)) setPlatformOpen(false);
      if (genreOpen && genreRef.current && !genreRef.current.contains(target)) setGenreOpen(false);
      if (storeOpen && storeRef.current && !storeRef.current.contains(target)) setStoreOpen(false);
      if (sortOpen && sortRef.current && !sortRef.current.contains(target)) setSortOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [genreOpen, platformOpen, sortOpen, storeOpen]);

  const clearPlatforms = () => {
    selectedPlatforms.forEach((platform) => onPlatformToggle(platform));
    setPlatformQuery("");
  };

  const clearGenres = () => {
    selectedGenres.forEach((genre) => onGenreToggle(genre));
    setGenreQuery("");
  };

  const clearStores = () => {
    selectedStores.forEach((store) => onStoreToggle(store));
    setStoreQuery("");
  };

  return (
    <>
      <div className="rounded-lg border border-[#dbd9e1] bg-white p-3">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-[#c6c5d3] bg-white p-0.5">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/30 ${
                  viewMode === "grid" ? "bg-primary text-white" : "text-[#454651] hover:bg-[#f5f2fa]"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => onViewModeChange("table")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/30 ${
                  viewMode === "table" ? "bg-primary text-white" : "text-[#454651] hover:bg-[#f5f2fa]"
                }`}
              >
                Table
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#454651]">Per page</span>
              <div className="w-24">
                <ComboBox
                  value={itemsPerPage}
                  onChange={(value) => onItemsPerPageChange(Number(value))}
                  options={[12, 24, 48].map((count) => ({ label: String(count), value: count }))}
                  buttonClassName="h-9 rounded-lg border-[#c6c5d3] text-sm"
                  align="left"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#454651]">Sort</span>
              <div className="relative w-48" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((value) => !value)}
                  className="flex h-9 w-full items-center justify-between rounded-lg border border-[#c6c5d3] bg-white px-3 text-sm text-[#1b1b21]"
                >
                  <span>{sortLabelMap[sortBy] ?? sortBy}</span>
                  <Caret open={sortOpen} />
                </button>
                {sortOpen && (
                  <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-[#dbd9e1] bg-white shadow-sm">
                    <div className="max-h-48 overflow-auto py-1">
                      {Object.entries(sortLabelMap).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSortOpen(false);
                            if (value !== sortBy) onSortChange(value, sortOrder);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-[#f5f2fa] ${
                            sortBy === value ? "bg-[#dfe0ff] text-[#333f91]" : "text-[#1b1b21]"
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
                className="h-9 rounded-lg border border-[#c6c5d3] px-3 text-sm font-semibold text-[#454651] hover:bg-[#f5f2fa] focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              >
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterMenu
              label="Platforms"
              open={platformOpen}
              setOpen={setPlatformOpen}
              query={platformQuery}
              setQuery={setPlatformQuery}
              items={filteredPlatforms}
              selectedItems={selectedPlatforms}
              onToggle={onPlatformToggle}
              onClear={clearPlatforms}
              itemLabel={(item) => item}
              menuRef={platformRef}
            />
            <FilterMenu
              label="Genres"
              open={genreOpen}
              setOpen={setGenreOpen}
              query={genreQuery}
              setQuery={setGenreQuery}
              items={filteredGenres}
              selectedItems={selectedGenres}
              onToggle={onGenreToggle}
              onClear={clearGenres}
              itemLabel={(item) => item}
              menuRef={genreRef}
            />
            <FilterMenu
              label="Stores"
              open={storeOpen}
              setOpen={setStoreOpen}
              query={storeQuery}
              setQuery={setStoreQuery}
              items={filteredStores}
              selectedItems={selectedStores}
              onToggle={onStoreToggle}
              onClear={clearStores}
              itemLabel={(item) => storeLabels[item] ?? item}
              menuRef={storeRef}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {games.map((game) => (
          <button
            key={game._id}
            type="button"
            className="group overflow-hidden rounded-lg border border-[#dbd9e1] bg-white text-left transition-colors hover:border-[#767682]"
            onClick={() => setSelectedGameId(game._id)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#efedf4]">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#767682]">
                  <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {game.rating && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-[#1b1b21] ring-1 ring-inset ring-[#dbd9e1]">
                  <svg className="size-3 text-[#6d3200]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {game.rating.toFixed(1)}
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#1b1b21]">
                  {game.name}
                </h3>
                {game.released && (
                  <span className="shrink-0 rounded-md bg-[#f5f2fa] px-2 py-1 text-xs font-semibold text-[#454651]">
                    {new Date(game.released).getFullYear()}
                  </span>
                )}
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                {game.platforms.slice(0, 3).map((platform) => (
                  <span
                    key={platform}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      selectedPlatforms.includes(platform)
                        ? "bg-primary text-white"
                        : "bg-[#dfe0ff] text-[#333f91]"
                    }`}
                  >
                    {platform}
                  </span>
                ))}
                {game.platforms.length > 3 && (
                  <span className="rounded-md bg-[#f5f2fa] px-2 py-1 text-xs font-semibold text-[#454651]">
                    +{game.platforms.length - 3}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {game.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      selectedGenres.includes(genre)
                        ? "bg-[#454651] text-white"
                        : "bg-[#f5f2fa] text-[#454651] ring-1 ring-inset ring-[#dbd9e1]"
                    }`}
                  >
                    {genre}
                  </span>
                ))}
                {game.genres.length > 2 && (
                  <span className="rounded-md bg-[#f5f2fa] px-2 py-1 text-xs font-semibold text-[#454651]">
                    +{game.genres.length - 2}
                  </span>
                )}
              </div>

              {(game.ownedOnSteam || game.ownedOnEpic || game.ownedOnGog) && (
                <div className="mt-3 border-t border-[#efedf4] pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {game.ownedOnSteam && (
                      <span className="rounded-md bg-[#ffdbc7] px-2 py-1 text-xs font-semibold text-[#723603]">
                        Steam
                      </span>
                    )}
                    {game.ownedOnEpic && (
                      <span className="rounded-md bg-[#f5f2fa] px-2 py-1 text-xs font-semibold text-[#454651] ring-1 ring-inset ring-[#dbd9e1]">
                        Epic Games
                      </span>
                    )}
                    {game.ownedOnGog && (
                      <span className="rounded-md bg-[#efedf4] px-2 py-1 text-xs font-semibold text-[#454651]">
                        GOG
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedGameId && (
        <GameDetailModal gameId={selectedGameId} onClose={() => setSelectedGameId(null)} />
      )}
    </>
  );
}

interface FilterMenuProps {
  label: string;
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  query: string;
  setQuery: (query: string) => void;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
  itemLabel: (item: string) => string;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function FilterMenu({
  label,
  open,
  setOpen,
  query,
  setQuery,
  items,
  selectedItems,
  onToggle,
  onClear,
  itemLabel,
  menuRef,
}: FilterMenuProps) {
  return (
    <div className="relative w-full sm:w-56" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-[#c6c5d3] bg-white px-3 text-sm text-[#1b1b21]"
      >
        <span>{selectedItems.length ? `${label} (${selectedItems.length})` : label}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-[#dbd9e1] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#efedf4] p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Filter ${label.toLowerCase()}...`}
              className="w-full rounded-md border border-[#c6c5d3] px-2 py-1 text-sm focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-[#c6c5d3] px-2 py-1 text-xs font-semibold hover:bg-[#f5f2fa]"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-auto py-1">
            {items.length === 0 && <div className="px-3 py-2 text-xs text-[#767682]">No results</div>}
            {items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(item);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#f5f2fa] ${
                  selectedItems.includes(item) ? "bg-[#dfe0ff] text-[#333f91]" : "text-[#1b1b21]"
                }`}
              >
                {itemLabel(item)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
