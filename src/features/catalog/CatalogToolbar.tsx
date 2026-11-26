import {
  ArrowDown,
  ArrowUp,
  Columns3,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { Select } from "@/components/ui/Select";
import {
  GAME_STATUSES,
  SORT_OPTIONS,
  STATUS_META,
  TABLE_COLUMNS,
  getStoreLabel,
  type GameStatus,
  type SortField,
  type SortOrder,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CatalogToolbarProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  platforms: string[];
  genres: string[];
  stores: StoreFilter[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  onTogglePlatform: (platform: string) => void;
  onToggleGenre: (genre: string) => void;
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
  onClearPlatforms: () => void;
  onClearGenres: () => void;
  onClearStores: () => void;
  onClearStatuses: () => void;
  visibleFields: string[];
  onToggleFieldVisibility: (field: string) => void;
}

export function CatalogToolbar({
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  platforms,
  genres,
  stores,
  selectedPlatforms,
  selectedGenres,
  selectedStores,
  selectedStatuses,
  onTogglePlatform,
  onToggleGenre,
  onToggleStore,
  onToggleStatus,
  onClearPlatforms,
  onClearGenres,
  onClearStores,
  onClearStatuses,
  visibleFields,
  onToggleFieldVisibility,
}: CatalogToolbarProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-3">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        {/* Left: View mode, per-page, sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="View mode"
            className="inline-flex rounded-lg border border-border-strong bg-surface p-0.5"
          >
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-ink-secondary hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <LayoutGrid className="size-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-primary text-white"
                  : "text-ink-secondary hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <Table2 className="size-3.5" />
              Table
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-secondary">
              Per page
            </span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => onItemsPerPageChange(Number(v))}
              ariaLabel="Items per page"
              className="w-20"
              options={[12, 24, 48, 96].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-secondary">
              Sort
            </span>
            <Select
              value={sortBy}
              onValueChange={(v) => onSortChange(v, sortOrder)}
              ariaLabel="Sort field"
              className="w-40"
              options={SORT_OPTIONS}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")
              }
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Right: Facet filters + table columns */}
        <div className="flex flex-wrap items-center gap-2">
          <MultiSelectFilter
            label="Platforms"
            options={platforms.map((p) => ({ value: p, label: p }))}
            selected={selectedPlatforms}
            onToggle={onTogglePlatform}
            onClear={onClearPlatforms}
          />
          <MultiSelectFilter
            label="Genres"
            options={genres.map((g) => ({ value: g, label: g }))}
            selected={selectedGenres}
            onToggle={onToggleGenre}
            onClear={onClearGenres}
          />
          <MultiSelectFilter
            label="Stores"
            options={stores.map((s) => ({
              value: s,
              label: getStoreLabel(s),
            }))}
            selected={selectedStores}
            onToggle={onToggleStore}
            onClear={onClearStores}
            searchable={false}
          />
          <MultiSelectFilter
            label="Status"
            options={GAME_STATUSES.map((s) => ({
              value: s,
              label: STATUS_META[s].label,
            }))}
            selected={selectedStatuses}
            onToggle={onToggleStatus}
            onClear={onClearStatuses}
            searchable={false}
          />
          {viewMode === "table" && (
            <MultiSelectFilter
              label="Columns"
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
              triggerClassName="gap-1.5"
            />
          )}
          {viewMode === "table" && (
            <span className="sr-only">
              <Columns3 />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
