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
import { useGameFilters } from "../lib/useGameFilters";

export function GameCatalog() {
  const [isFetching, setIsFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showImportSteamModal, setShowImportSteamModal] = useState(false);

  const preferences = useQuery(api.games.getUserPreferences);
  const ownedGamesInfo = useQuery(api.games.getOwnedGamesInfo);
  const updateUserPreferences = useMutation(api.games.updateUserPreferences);
  const itemsPerPage = preferences?.itemsPerPage || 12;

  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedPlatforms,
    selectedGenres,
    selectedStores,
    sortBy,
    sortOrder,
    currentPage,
    setCurrentPage,
    handlePlatformToggle,
    handleGenreToggle,
    handleStoreToggle,
    handleClearFilters,
    handleSortChange
  } = useGameFilters(itemsPerPage);

  const gamesData = useQuery(api.games.getUserGames, {
    searchTerm: debouncedSearchTerm || undefined,
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    stores:
      selectedStores.length > 0 && selectedStores.length < 4
        ? selectedStores
        : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    itemsPerPage,
  });

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




  const handleViewModeChange = useCallback((mode: "grid" | "table") => {
    updateUserPreferences({ viewMode: mode });
  }, [updateUserPreferences]);

  const handleItemsPerPageChange = useCallback((count: number) => {
    updateUserPreferences({ itemsPerPage: count });
  }, [updateUserPreferences]);



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
  const activeFilterCount = selectedPlatforms.length + selectedGenres.length + selectedStores.length;
  const stats = (ownedGamesInfo ?? []).reduce(
    (counts, game) => {
      counts.total += 1;
      if (game.ownedOnSteam) counts.steam += 1;
      if (game.ownedOnEpic) counts.epic += 1;
      if (game.ownedOnGog) counts.gog += 1;
      if (!game.ownedOnSteam && !game.ownedOnEpic && !game.ownedOnGog) counts.noStore += 1;
      return counts;
    },
    { total: 0, steam: 0, epic: 0, gog: 0, noStore: 0 },
  );
  if (ownedGamesInfo === undefined) {
    stats.total = totalCount;
  }
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = totalCount === 0 ? 0 : startIndex + games.length - 1;
  const sourceFilters = [
    { key: "steam", label: "Steam", count: stats.steam },
    { key: "epic", label: "Epic Games", count: stats.epic },
    { key: "gog", label: "GOG", count: stats.gog },
    { key: "no_store", label: "No store", count: stats.noStore },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-[4.5rem] space-y-4">
          <div className="rounded-lg border border-[#dbd9e1] bg-white p-3">
            <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">
              Quick filters
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                activeFilterCount === 0
                  ? "bg-[#dfe0ff] text-[#333f91]"
                  : "text-[#454651] hover:bg-[#f5f2fa]"
              }`}
            >
              <span>All games</span>
              <span>{stats.total}</span>
            </button>
            {sourceFilters.map((source) => {
              const isSelected = selectedStores.includes(source.key as "steam" | "epic" | "gog" | "no_store");
              return (
                <button
                  key={source.key}
                  type="button"
                  onClick={() => handleStoreToggle(source.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-[#dfe0ff] text-[#333f91]"
                      : "text-[#454651] hover:bg-[#f5f2fa]"
                  }`}
                >
                  <span>{source.label}</span>
                  <span>{source.count}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-lg border border-[#dbd9e1] bg-white p-3">
            <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">
              Add games
            </div>
            <button
              onClick={() => setShowImportSteamModal(true)}
              className="mb-2 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Import from Steam
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="mb-2 w-full rounded-lg border border-[#c6c5d3] bg-white px-3 py-2 text-sm font-semibold text-[#1b1b21] transition-colors hover:bg-[#f5f2fa]"
            >
              Add game
            </button>
            <button
              onClick={() => setShowBulkAddModal(true)}
              className="w-full rounded-lg border border-[#c6c5d3] bg-white px-3 py-2 text-sm font-semibold text-[#1b1b21] transition-colors hover:bg-[#f5f2fa]"
            >
              Bulk add
            </button>
          </div>
        </div>
      </aside>

      <section className="min-w-0 space-y-4">
        <div className="rounded-lg border border-[#dbd9e1] bg-white p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold leading-8 tracking-normal text-[#1b1b21]">My Games</h1>
                {isFetching && (
                  <div className="size-4 animate-spin rounded-full border-2 border-[#bcc3ff] border-b-primary" aria-label="Loading"></div>
                )}
              </div>
              <p className="mt-1 text-sm text-[#454651]">
                {totalCount === 0
                  ? "No games in your collection yet"
                  : `Showing ${startIndex}-${endIndex} of ${totalCount} games`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:min-w-[650px]">
              <div className="rounded-lg border border-[#dbd9e1] bg-[#fbf8ff] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">Games</div>
                <div className="mt-1 text-xl font-bold text-[#1b1b21]">{stats.total}</div>
              </div>
              <div className="rounded-lg border border-[#dbd9e1] bg-[#fbf8ff] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">Steam</div>
                <div className="mt-1 text-xl font-bold text-[#1b1b21]">{stats.steam}</div>
              </div>
              <div className="rounded-lg border border-[#dbd9e1] bg-[#fbf8ff] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">Epic Games</div>
                <div className="mt-1 text-xl font-bold text-[#1b1b21]">{stats.epic}</div>
              </div>
              <div className="rounded-lg border border-[#dbd9e1] bg-[#fbf8ff] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">GOG</div>
                <div className="mt-1 text-xl font-bold text-[#1b1b21]">{stats.gog}</div>
              </div>
              <div className="rounded-lg border border-[#dbd9e1] bg-[#fbf8ff] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#767682]">No store</div>
                <div className="mt-1 text-xl font-bold text-[#1b1b21]">{stats.noStore}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            <button
              onClick={() => setShowImportSteamModal(true)}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Import from Steam
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg border border-[#c6c5d3] bg-white px-3 py-2 text-sm font-semibold text-[#1b1b21] transition-colors hover:bg-[#f5f2fa]"
            >
              Add game
            </button>
            <button
              onClick={() => setShowBulkAddModal(true)}
              className="rounded-lg border border-[#c6c5d3] bg-white px-3 py-2 text-sm font-semibold text-[#1b1b21] transition-colors hover:bg-[#f5f2fa]"
            >
              Bulk add
            </button>
          </div>
        </div>

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
          <div className="rounded-lg border border-[#dbd9e1] bg-white py-12 text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-lg bg-[#f5f2fa]">
              <svg className="size-10 text-[#767682]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#1b1b21]">No games found</h3>
            <p className="mb-6 text-[#454651]">
              {totalCount === 0
                ? "Start building your game collection by adding some games!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {totalCount === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Add your first game
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
      </section>

      {/* Modals */}
      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} />
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
