import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CircleDot,
  Columns3,
  LayoutGrid,
  Monitor,
  Store,
  Table2,
  Tag,
  X,
} from "lucide-react";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { Select } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  GAME_STATUSES,
  SORT_OPTIONS,
  STATUS_META,
  STORE_META,
  TABLE_COLUMNS,
  getDefaultSortOrder,
  getStoreLabel,
  type FacetCounts,
  type GameStatus,
  type SortField,
  type SortOrder,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CatalogToolbarProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  platforms: string[];
  genres: string[];
  stores: StoreFilter[];
  facetCounts: FacetCounts;
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  hasActiveFilters: boolean;
  onTogglePlatform: (platform: string) => void;
  onToggleGenre: (genre: string) => void;
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
  onClearPlatforms: () => void;
  onClearGenres: () => void;
  onClearStores: () => void;
  onClearStatuses: () => void;
  onClearAllFilters: () => void;
  visibleFields: string[];
  onToggleFieldVisibility: (field: string) => void;
}

export function CatalogToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  platforms,
  genres,
  stores,
  facetCounts,
  selectedPlatforms,
  selectedGenres,
  selectedStores,
  selectedStatuses,
  hasActiveFilters,
  onTogglePlatform,
  onToggleGenre,
  onToggleStore,
  onToggleStatus,
  onClearPlatforms,
  onClearGenres,
  onClearStores,
  onClearStatuses,
  onClearAllFilters,
  visibleFields,
  onToggleFieldVisibility,
}: CatalogToolbarProps) {
  const sortDirectionLabel =
    sortOrder === "asc"
      ? "Sorted ascending — click for descending"
      : "Sorted descending — click for ascending";

  return (
    <div className="flex flex-col gap-2.5 border-b border-border-subtle/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Composable Faceted Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Status"
          icon={<CircleDot className="size-3.5" />}
          options={GAME_STATUSES.map((s) => ({
            value: s,
            label: STATUS_META[s].label,
            count: facetCounts.statuses[s] ?? 0,
            dotClass: STATUS_META[s].dotClass,
          }))}
          selected={selectedStatuses}
          onToggle={onToggleStatus}
          onClear={onClearStatuses}
          searchable={false}
        />

        <MultiSelectFilter
          label="Store"
          icon={<Store className="size-3.5" />}
          options={stores.map((s) => ({
            value: s,
            label: getStoreLabel(s),
            count: facetCounts.stores[s] ?? 0,
            dotClass:
              s === "no_store" ? "bg-ink-muted/60" : STORE_META[s].dotClass,
          }))}
          selected={selectedStores}
          onToggle={onToggleStore}
          onClear={onClearStores}
          searchable={stores.length > 6}
          sortByCount
        />

        <MultiSelectFilter
          label="Platform"
          icon={<Monitor className="size-3.5" />}
          options={platforms.map((p) => ({
            value: p,
            label: p,
            count: facetCounts.platforms[p] ?? 0,
          }))}
          selected={selectedPlatforms}
          onToggle={onTogglePlatform}
          onClear={onClearPlatforms}
          sortByCount
        />

        <MultiSelectFilter
          label="Genre"
          icon={<Tag className="size-3.5" />}
          options={genres.map((g) => ({
            value: g,
            label: g,
            count: facetCounts.genres[g] ?? 0,
          }))}
          selected={selectedGenres}
          onToggle={onToggleGenre}
          onClear={onClearGenres}
          sortByCount
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <span>Reset</span>
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Right: Unified Sort Control, Columns, Mobile View Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Fused Sort field + direction control */}
        <div className="inline-flex items-center rounded-lg border border-border-strong/80 bg-surface-elevated">
          <Select
            size="sm"
            value={sortBy}
            onValueChange={(nextField) =>
              onSortChange(nextField, getDefaultSortOrder(nextField))
            }
            ariaLabel="Sort by"
            align="end"
            prefix={<ArrowUpDown className="size-3.5" />}
            className="h-8 rounded-none rounded-l-lg border-0 bg-transparent pr-2 hover:bg-surface-muted/70 focus:ring-inset"
            contentClassName="min-w-[164px]"
            options={SORT_OPTIONS}
          />
          <span className="h-4 w-px bg-border-subtle" aria-hidden="true" />
          <Tooltip content={sortDirectionLabel}>
            <button
              type="button"
              onClick={() =>
                onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")
              }
              aria-label={sortDirectionLabel}
              className="inline-flex size-8 items-center justify-center rounded-r-lg text-ink-secondary transition-colors hover:bg-surface-muted/70 hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="size-3.5" />
              ) : (
                <ArrowDown className="size-3.5" />
              )}
            </button>
          </Tooltip>
        </div>

        {viewMode === "table" && (
          <MultiSelectFilter
            variant="control"
            label="Columns"
            icon={<Columns3 className="size-3.5" />}
            align="end"
            options={TABLE_COLUMNS.map((col) => ({
              value: col.key,
              label: col.label,
              disabled: col.locked,
            }))}
            selected={visibleFields}
            onToggle={(field) => {
              if (field === "name") return;
              onToggleFieldVisibility(field);
            }}
            searchable={false}
          />
        )}

        {/* Mobile view mode toggle */}
        <div
          role="group"
          aria-label="View mode"
          className="ml-auto inline-flex items-center rounded-lg border border-border-strong/80 bg-surface-subtle p-0.5 sm:hidden"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary text-white"
                : "text-ink-secondary",
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            aria-label="Table view"
            aria-pressed={viewMode === "table"}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              viewMode === "table"
                ? "bg-primary text-white"
                : "text-ink-secondary",
            )}
          >
            <Table2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
