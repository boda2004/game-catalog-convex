import { useAuthActions } from "@convex-dev/auth/react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  CloudDownload,
  Gamepad2,
  History,
  LayoutGrid,
  ListPlus,
  Loader2,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Table2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";
import { AddGameDialog } from "@/features/imports/AddGameDialog";
import { BulkImportDialog } from "@/features/imports/BulkImportDialog";
import { ImportHistoryDialog } from "@/features/imports/ImportHistoryDialog";
import { SteamImportDialog } from "@/features/imports/SteamImportDialog";
import { filterAndSortGames, type LibraryGame } from "@/lib/catalog";
import { useDebounce } from "@/lib/hooks";
import { useTheme } from "@/lib/themeContext";
import { useCatalogUrlState } from "@/lib/urlState";
import { cn } from "@/lib/utils";
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

export function CatalogPage({
  onOpenAccount,
}: {
  onOpenAccount: () => void;
}) {
  const { signOut } = useAuthActions();
  const { theme, toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const debouncedSearch = useDebounce(urlState.q, 140);

  // Global keyboard shortcut: Cmd/Ctrl+K or "/" focuses search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  const totalPlaytimeMinutes = useMemo(
    () =>
      (library?.games ?? []).reduce(
        (acc, g) => acc + (g.playtimeMinutes ?? 0),
        0,
      ),
    [library?.games],
  );

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

  const activeFilterCount =
    urlState.platforms.length +
    urlState.genres.length +
    urlState.stores.length +
    urlState.statuses.length +
    (urlState.q.trim() ? 1 : 0);

  const sidebarProps = {
    totalGames: library?.stats.total ?? 0,
    byStore: library?.stats.byStore ?? {},
    noStoreCount: library?.stats.noStore ?? 0,
    byStatus: library?.stats.byStatus ?? {},
    availableStores: library?.facets.stores ?? [],
    selectedStores: urlState.stores,
    selectedStatuses: urlState.statuses,
    activeFilterCount,
    activeImportCount: runningJobs.length,
    onClearAll: () => {
      clearAllFilters();
      setMobileNavOpen(false);
    },
    onToggleStore: (store: (typeof urlState.stores)[number]) => {
      toggleStore(store);
    },
    onToggleStatus: (status: (typeof urlState.statuses)[number]) => {
      toggleStatus(status);
    },
    onOpenSteamImport: () => {
      setMobileNavOpen(false);
      setShowSteamDialog(true);
    },
    onOpenAddGame: () => {
      setMobileNavOpen(false);
      setShowAddDialog(true);
    },
    onOpenBulkImport: () => {
      setMobileNavOpen(false);
      setShowBulkDialog(true);
    },
    onOpenImportHistory: () => {
      setMobileNavOpen(false);
      setShowImportHistory(true);
    },
    onOpenAccount: () => {
      setMobileNavOpen(false);
      onOpenAccount();
    },
    onSignOut: () => void signOut(),
  };

  const startIndex =
    filteredGames.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endIndex =
    filteredGames.length === 0 ? 0 : startIndex + pageGames.length - 1;

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop persistent left rail */}
      <aside className="hidden w-[264px] shrink-0 border-r border-border-subtle/80 bg-surface/65 backdrop-blur-md lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <CatalogSidebar {...sidebarProps} />
        </div>
      </aside>

      {/* Mobile slide-over drawer */}
      <RadixDialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs lg:hidden" />
          <RadixDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-border-strong bg-surface shadow-2xl focus:outline-hidden lg:hidden">
            <RadixDialog.Title className="sr-only">
              Library Navigation
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              Filter by store or status, manage imports, and access account
              settings.
            </RadixDialog.Description>
            <CatalogSidebar
              {...sidebarProps}
              onCloseMobile={() => setMobileNavOpen(false)}
            />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      {/* Main workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky top command header */}
        <header className="sticky top-0 z-30 border-b border-border-subtle/80 bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-[1520px] items-center gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Spotlight Search */}
            <div className="relative flex-1 max-w-xl">
              <label htmlFor="catalog-search" className="sr-only">
                Search library
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                ref={searchInputRef}
                id="catalog-search"
                type="text"
                placeholder="Search title, developer, genre, or platform..."
                value={urlState.q}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (urlState.q) setSearch("");
                    searchInputRef.current?.blur();
                  }
                }}
                className="h-10 w-full rounded-xl border border-border-strong/75 bg-surface/90 pl-10 pr-14 text-sm text-ink placeholder:text-ink-muted transition-all focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/25"
              />
              {urlState.q.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border-subtle bg-surface-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-muted sm:inline-block">
                  /
                </kbd>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* View mode segmented pill */}
              <div
                role="group"
                aria-label="View mode"
                className="hidden items-center rounded-xl border border-border-strong/75 bg-surface p-1 sm:inline-flex"
              >
                <Tooltip content="Grid view">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all",
                      viewMode === "grid"
                        ? "bg-primary text-white shadow-xs"
                        : "text-ink-secondary hover:text-ink",
                    )}
                  >
                    <LayoutGrid className="size-3.5" />
                    <span className="hidden md:inline">Grid</span>
                  </button>
                </Tooltip>
                <Tooltip content="Table view">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange("table")}
                    aria-label="Table view"
                    aria-pressed={viewMode === "table"}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all",
                      viewMode === "table"
                        ? "bg-primary text-white shadow-xs"
                        : "text-ink-secondary hover:text-ink",
                    )}
                  >
                    <Table2 className="size-3.5" />
                    <span className="hidden md:inline">Table</span>
                  </button>
                </Tooltip>
              </div>

              {/* Add / Import primary dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="primary" size="md" className="gap-1.5">
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Add Games</span>
                    <ChevronDown className="size-3.5 opacity-80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Add to Library</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setShowAddDialog(true)}>
                    <Plus className="size-4 text-primary" />
                    <div>
                      <div className="text-sm font-semibold">Search RAWG</div>
                      <div className="text-[11px] text-ink-muted">
                        Add or update a single title
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowSteamDialog(true)}>
                    <CloudDownload className="size-4 text-sky-400" />
                    <div>
                      <div className="text-sm font-semibold">
                        Import from Steam
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        Sync games &amp; playtime
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowBulkDialog(true)}>
                    <ListPlus className="size-4 text-violet-400" />
                    <div>
                      <div className="text-sm font-semibold">Bulk Import</div>
                      <div className="text-[11px] text-ink-muted">
                        Paste a list of game titles
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setShowImportHistory(true)}>
                    <History className="size-4 text-ink-secondary" />
                    <span className="flex-1">Import History</span>
                    {runningJobs.length > 0 && (
                      <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-soft-ink">
                        {runningJobs.length} live
                      </span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme toggle */}
              <Tooltip
                content={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="mx-auto flex w-full max-w-[1520px] flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
          {/* Active background import banner */}
          {runningJobs.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-primary/35 bg-primary-soft/55 px-4 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {runningJobs.length === 1
                        ? `${runningJobs[0].type === "steam" ? "Steam" : "Bulk"} import in progress`
                        : `${runningJobs.length} background imports running`}
                    </div>
                    {runningJobs.length === 1 && (
                      <div className="text-xs text-ink-secondary">
                        Processed {runningJobs[0].completed} of{" "}
                        {runningJobs[0].total} titles
                        {runningJobs[0].total > 0
                          ? ` (${Math.round((runningJobs[0].completed / runningJobs[0].total) * 100)}%)`
                          : ""}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowImportHistory(true)}
                >
                  View progress
                </Button>
              </div>
              {runningJobs.length === 1 && runningJobs[0].total > 0 && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface/60">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round((runningJobs[0].completed / runningJobs[0].total) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {library === undefined || preferences === undefined ? (
            <CatalogSkeleton />
          ) : (
            <>
              <CatalogStatsHeader
                totalGames={library.stats.total}
                filteredCount={filteredGames.length}
                startIndex={startIndex}
                endIndex={endIndex}
                totalPlaytimeMinutes={totalPlaytimeMinutes}
                byStore={library.stats.byStore}
                byStatus={library.stats.byStatus}
                noStoreCount={library.stats.noStore}
                selectedStores={urlState.stores}
                selectedStatuses={urlState.statuses}
                onToggleStore={toggleStore}
                onToggleStatus={toggleStatus}
              />

              <div className="space-y-3">
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
                  byStore={library.stats.byStore}
                  noStoreCount={library.stats.noStore}
                  byStatus={library.stats.byStatus}
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
              </div>

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
                      ? "Import your Steam library, paste a list of titles, or search RAWG to start building your collection."
                      : "No titles match your current search or filter combination. Try loosening or clearing your filters."
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
                        <Button
                          variant="secondary"
                          onClick={() => setShowBulkDialog(true)}
                        >
                          <ListPlus className="size-4" />
                          Bulk import
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" onClick={clearAllFilters}>
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
            </>
          )}
        </main>

        <footer className="mt-auto border-t border-border-subtle/60 px-4 py-3.5 text-xs text-ink-muted sm:px-6">
          <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between">
            <span>© {new Date().getFullYear()} Game Catalog</span>
            <span className="font-mono text-[11px]">v{__APP_VERSION__}</span>
          </div>
        </footer>
      </div>

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

function CatalogSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-border-subtle bg-surface p-4"
          >
            <div className="skeleton-shimmer h-3 w-20 rounded" />
            <div className="skeleton-shimmer mt-3 h-7 w-24 rounded-md" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border-subtle bg-surface"
          >
            <div className="skeleton-shimmer aspect-[16/10] w-full" />
            <div className="space-y-2.5 p-4">
              <div className="skeleton-shimmer h-4 w-3/4 rounded" />
              <div className="skeleton-shimmer h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
