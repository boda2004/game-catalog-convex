import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GameGrid } from "./GameGrid";
import { GameTable } from "./GameTable";
import { FilterBar } from "./FilterBar";
// ViewControls removed; controls are now integrated in GameGrid and GameTable
import { PaginationControls } from "./PaginationControls";
import { AddGameModal } from "./AddGameModal";
import { BulkAddModal } from "./BulkAddModal";
import { ImportSteamModal } from "./ImportSteamModal";
import { useDebounce } from "../lib/hooks";

export function GameCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<("steam" | "epic" | "gog")[]>([]);
  const [sortBy, setSortBy] = useState("userAddedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showImportSteamModal, setShowImportSteamModal] = useState(false);

  const preferences = useQuery(api.games.getUserPreferences);
  const updateUserPreferences = useMutation(api.games.updateUserPreferences);

  const itemsPerPage = preferences?.itemsPerPage || 12;

  const gamesData = useQuery(api.games.getUserGames, {
    searchTerm: debouncedSearchTerm || undefined,
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    stores: selectedStores.length > 0 ? selectedStores : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    itemsPerPage,
  });

  // Fetch full list of owned RAWG IDs (not paginated)
  const ownedRawgIds = useQuery(api.games.getOwnedRawgIds) || [];

  const prevGamesData = useRef(gamesData);
  if (gamesData !== undefined) {
    prevGamesData.current = gamesData;
  }
  const dataToDisplay = gamesData ?? prevGamesData.current;

  useEffect(() => {
    setIsFetching(true);
  }, [debouncedSearchTerm, JSON.stringify(selectedPlatforms), JSON.stringify(selectedGenres), JSON.stringify(selectedStores), sortBy, sortOrder, currentPage, itemsPerPage]);

  useEffect(() => {
    if (gamesData !== undefined) {
      setIsFetching(false);
    }
  }, [gamesData]);


  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, JSON.stringify(selectedPlatforms), JSON.stringify(selectedGenres), JSON.stringify(selectedStores), sortBy, sortOrder, preferences?.itemsPerPage]);

  const handlePlatformToggle = useCallback((platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const handleGenreToggle = useCallback((genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const handleStoreToggle = useCallback((store: "steam" | "epic" | "gog") => {
    setSelectedStores(prev =>
      prev.includes(store)
        ? prev.filter(s => s !== store)
        : [...prev, store]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setSelectedStores([]);
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "table") => {
    updateUserPreferences({ viewMode: mode });
  }, [updateUserPreferences]);

  const handleItemsPerPageChange = useCallback((count: number) => {
    updateUserPreferences({ itemsPerPage: count });
  }, [updateUserPreferences]);

  const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  const handleToggleFieldVisibility = useCallback((field: string) => {
    if (!preferences) return;
    const currentFields = preferences.visibleFields;
    const newFields = currentFields.includes(field)
      ? currentFields.filter((f) => f !== field)
      : [...currentFields, field];
    updateUserPreferences({ visibleFields: newFields });
  }, [preferences, updateUserPreferences]);

  if (!preferences) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { games, totalCount, hasMore } = dataToDisplay ?? { games: [], totalCount: 0, hasMore: false };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">My Games</h2>
              {isFetching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" aria-label="Loading"></div>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {totalCount === 0
                ? "No games in your collection yet"
                : (() => {
                    const startIndex = (currentPage - 1) * itemsPerPage + 1;
                    const endIndex = startIndex + games.length - 1;
                    return `Showing ${startIndex}–${endIndex} of ${totalCount} games`;
                  })()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportSteamModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Add from Steam
            </button>
            <button
              onClick={() => setShowBulkAddModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Bulk Add Games
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Game
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearFilters={handleClearFilters}
        selectedPlatforms={selectedPlatforms}
        selectedGenres={selectedGenres}
        selectedStores={selectedStores}
        onPlatformToggle={handlePlatformToggle}
        onGenreToggle={handleGenreToggle}
        onStoreToggle={handleStoreToggle}
      />

      {/* Controls moved into GameGrid and GameTable top blocks */}
      {/* Games Display */}
      <div className="relative">
        {games.length === 0 && !isFetching ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600 mb-6">
              {totalCount === 0
                ? "Start building your game collection by adding some games!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {totalCount === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Game
              </button>
            )}
          </div>
        ) : preferences.viewMode === "grid" ? (
          <GameGrid
            games={games}
            selectedPlatforms={selectedPlatforms}
            selectedGenres={selectedGenres}
            selectedStores={selectedStores}
            onPlatformToggle={handlePlatformToggle}
            onGenreToggle={handleGenreToggle}
            onStoreToggle={handleStoreToggle}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            itemsPerPage={preferences.itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onViewModeChange={handleViewModeChange}
            viewMode={preferences.viewMode}
          />
        ) : (
          <GameTable
            games={games}
            visibleFields={preferences.visibleFields}
            selectedPlatforms={selectedPlatforms}
            selectedGenres={selectedGenres}
            selectedStores={selectedStores}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onToggleFieldVisibility={handleToggleFieldVisibility}
            onPlatformToggle={handlePlatformToggle}
            onGenreToggle={handleGenreToggle}
            onStoreToggle={handleStoreToggle}
            itemsPerPage={preferences.itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onViewModeChange={handleViewModeChange}
            viewMode={preferences.viewMode}
          />
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={preferences.itemsPerPage}
          hasMore={hasMore}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} existingRawgIds={ownedRawgIds as number[]} />
      )}

      {showBulkAddModal && (
        <BulkAddModal onClose={() => setShowBulkAddModal(false)} />
      )}

      {showImportSteamModal && (
        <ImportSteamModal onClose={() => setShowImportSteamModal(false)} />
      )}
    </div>
  );
}
