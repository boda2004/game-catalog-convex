import { useMutation, useQuery } from "convex/react";
import { CloudDownload, Gamepad2, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { AddGameDialog } from "@/features/imports/AddGameDialog";
import { BulkImportDialog } from "@/features/imports/BulkImportDialog";
import { ImportHistoryDialog } from "@/features/imports/ImportHistoryDialog";
import { SteamImportDialog } from "@/features/imports/SteamImportDialog";
import { filterAndSortGames, type LibraryGame } from "@/lib/catalog";
import { useDebounce } from "@/lib/hooks";
import { useCatalogUrlState } from "@/lib/urlState";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogStatsHeader } from "./CatalogStatsHeader";
import { CatalogToolbar } from "./CatalogToolbar";
import { FilterBar } from "./FilterBar";
import { GameDetailDialog } from "./GameDetailDialog";
import { GameGrid } from "./GameGrid";
import { GameTable } from "./GameTable";
import { PaginationControls } from "./PaginationControls";

const DEFAULT_VISIBLE_FIELDS = [
  "name",
  "platforms",
  "genres",
  "stores",
  "status",
  "rating",
  "released",
];

export function CatalogPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showSteamDialog, setShowSteamDialog] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);

  const library = useQuery(api.games.getLibrary);
  const preferences = useQuery(api.games.getPreferences);
  const importJobs = useQuery(api.imports.listImportJobs);
  const updatePreferences = useMutation(api.games.updatePreferences);

  const {
    state: urlState,
    setSearch,
    togglePlatform,
    toggleGenre,
    toggleStore,
    toggleStatus,
    clearPlatforms,
    clearGenres,
    clearStores,
    clearStatuses,
    clearAllFilters,
    setSort,
    setPage,
    setSelectedGameId,
  } = useCatalogUrlState();

  const debouncedSearch = useDebounce(urlState.q, 150);

  const itemsPerPage = preferences?.itemsPerPage ?? 24;
  const viewMode = preferences?.viewMode ?? "grid";
  const visibleFields = preferences?.visibleFields ?? DEFAULT_VISIBLE_FIELDS;

  const ownedByRawgId = useMemo(() => {
    const map = new Map<number, LibraryGame>();
    for (const game of library?.games ?? []) {
      map.set(game.rawgId, game);
    }
    return map;
  }, [library?.games]);

  const filteredGames = useMemo(
    () =>
      filterAndSortGames(library?.games ?? [], {
        search: debouncedSearch,
        platforms: urlState.platforms,
        genres: urlState.genres,
        stores: urlState.stores,
        statuses: urlState.statuses,
        sortBy: urlState.sortBy,
        sortOrder: urlState.sortOrder,
      }),
    [
      library?.games,
      debouncedSearch,
      urlState.platforms,
      urlState.genres,
      urlState.stores,
      urlState.statuses,
      urlState.sortBy,
      urlState.sortOrder,
    ],
  );

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / itemsPerPage));
  const safePage = Math.min(urlState.page, totalPages);

  useEffect(() => {
    if (library && urlState.page > totalPages) {
      setPage(totalPages);
    }
  }, [library, setPage, totalPages, urlState.page]);

  const pageGames = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [filteredGames, itemsPerPage, safePage]);

  const handleViewModeChange = useCallback(
    (mode: "grid" | "table") => {
      void updatePreferences({ viewMode: mode });
    },
    [updatePreferences],
  );

  const handleItemsPerPageChange = useCallback(
    (count: number) => {
      void updatePreferences({ itemsPerPage: count });
      setPage(1);
    },
    [setPage, updatePreferences],
  );

  const handleToggleFieldVisibility = useCallback(
    (field: string) => {
      if (field === "name") return;
      const next = visibleFields.includes(field)
        ? visibleFields.filter((f) => f !== field)
        : [...visibleFields, field];
      void updatePreferences({ visibleFields: next });
    },
    [updatePreferences, visibleFields],
  );

  const runningJobs = useMemo(
    () => (importJobs ?? []).filter((job) => job.status === "running"),
    [importJobs],
  );

  if (library === undefined || preferences === undefined) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner className="size-8" label="Loading your game library" />
      </div>
    );
  }

  const startIndex =
    filteredGames.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endIndex =
    filteredGames.length === 0 ? 0 : startIndex + pageGames.length - 1;
  const activeFilterCount =
    urlState.platforms.length +
    urlState.genres.length +
    urlState.stores.length +
    urlState.statuses.length +
    (urlState.q.trim() ? 1 : 0);

  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[248px_minmax(0,1fr)]">
      <CatalogSidebar
        totalGames={library.stats.total}
        byStore={library.stats.byStore}
        noStoreCount={library.stats.noStore}
        byStatus={library.stats.byStatus}
        availableStores={library.facets.stores}
        selectedStores={urlState.stores}
        selectedStatuses={urlState.statuses}
        activeFilterCount={activeFilterCount}
        activeImportCount={runningJobs.length}
        onClearAll={clearAllFilters}
        onToggleStore={toggleStore}
        onToggleStatus={toggleStatus}
        onOpenSteamImport={() => setShowSteamDialog(true)}
        onOpenAddGame={() => setShowAddDialog(true)}
        onOpenBulkImport={() => setShowBulkDialog(true)}
        onOpenImportHistory={() => setShowImportHistory(true)}
      />

      <section className="min-w-0 space-y-4">
        {/* Active background import banner */}
        {runningJobs.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary-soft/45 px-4 py-3 text-sm">
            <div className="flex items-center gap-2.5 text-primary-soft-ink">
              <Loader2 className="size-4 animate-spin" />
              <span className="font-semibold">
                {runningJobs.length === 1
                  ? `${runningJobs[0].type === "steam" ? "Steam" : "Bulk"} import running (${runningJobs[0].completed}/${runningJobs[0].total})`
                  : `${runningJobs.length} background imports running`}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowImportHistory(true)}
            >
              View progress
            </Button>
          </div>
        )}

        <CatalogStatsHeader
          totalGames={library.stats.total}
          filteredCount={filteredGames.length}
          startIndex={startIndex}
          endIndex={endIndex}
          byStore={library.stats.byStore}
          noStoreCount={library.stats.noStore}
          onOpenSteamImport={() => setShowSteamDialog(true)}
          onOpenAddGame={() => setShowAddDialog(true)}
          onOpenBulkImport={() => setShowBulkDialog(true)}
          onOpenImportHistory={() => setShowImportHistory(true)}
        />

        <FilterBar
          searchTerm={urlState.q}
          onSearchChange={setSearch}
          selectedPlatforms={urlState.platforms}
          selectedGenres={urlState.genres}
          selectedStores={urlState.stores}
          selectedStatuses={urlState.statuses}
          onTogglePlatform={togglePlatform}
          onToggleGenre={toggleGenre}
          onToggleStore={toggleStore}
          onToggleStatus={toggleStatus}
          onClearAll={clearAllFilters}
        />

        <CatalogToolbar
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          sortBy={urlState.sortBy}
          sortOrder={urlState.sortOrder}
          onSortChange={setSort}
          platforms={library.facets.platforms}
          genres={library.facets.genres}
          stores={library.facets.stores}
          selectedPlatforms={urlState.platforms}
          selectedGenres={urlState.genres}
          selectedStores={urlState.stores}
          selectedStatuses={urlState.statuses}
          onTogglePlatform={togglePlatform}
          onToggleGenre={toggleGenre}
          onToggleStore={toggleStore}
          onToggleStatus={toggleStatus}
          onClearPlatforms={clearPlatforms}
          onClearGenres={clearGenres}
          onClearStores={clearStores}
          onClearStatuses={clearStatuses}
          visibleFields={visibleFields}
          onToggleFieldVisibility={handleToggleFieldVisibility}
        />

        {pageGames.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="size-7" />}
            title={
              library.stats.total === 0
                ? "Your catalog is empty"
                : "No matching games"
            }
            description={
              library.stats.total === 0
                ? "Import your Steam library or search RAWG to start organizing your games."
                : "Try clearing or loosening your search and filter criteria."
            }
            action={
              library.stats.total === 0 ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setShowSteamDialog(true)}
                  >
                    <CloudDownload className="size-4" />
                    Import from Steam
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="size-4" />
                    Add a game
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              )
            }
          />
        ) : viewMode === "grid" ? (
          <GameGrid
            games={pageGames}
            selectedPlatforms={urlState.platforms}
            selectedGenres={urlState.genres}
            onSelectGame={setSelectedGameId}
          />
        ) : (
          <GameTable
            games={pageGames}
            visibleFields={visibleFields}
            selectedPlatforms={urlState.platforms}
            selectedGenres={urlState.genres}
            sortBy={urlState.sortBy}
            sortOrder={urlState.sortOrder}
            onSortChange={setSort}
            onTogglePlatform={togglePlatform}
            onToggleGenre={toggleGenre}
            onSelectGame={setSelectedGameId}
          />
        )}

        <PaginationControls
          currentPage={safePage}
          totalItems={filteredGames.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      </section>

      {/* Modals */}
      <GameDetailDialog
        gameId={urlState.gameId as Id<"games"> | null}
        onClose={() => setSelectedGameId(null)}
      />
      <AddGameDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        ownedByRawgId={ownedByRawgId}
      />
      <BulkImportDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
      />
      <SteamImportDialog
        open={showSteamDialog}
        onOpenChange={setShowSteamDialog}
      />
      <ImportHistoryDialog
        open={showImportHistory}
        onOpenChange={setShowImportHistory}
      />
    </div>
  );
}
