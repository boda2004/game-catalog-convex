import {
  ArrowDown,
  ArrowUp,
  Columns3,
  LayoutGrid,
  SlidersHorizontal,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { Select } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  GAME_STATUSES,
  SORT_OPTIONS,
  STATUS_META,
  STORE_META,
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
  byStore: Record<string, number>;
  noStoreCount: number;
  byStatus: Record<string, number>;
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
  byStore,
  noStoreCount,
  byStatus,
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
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface/90 p-3 xl:flex-row xl:items-center xl:justify-between">
      {/* Left: Facet Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold text-ink-muted sm:inline-flex">
          <SlidersHorizontal className="size-3.5" />
          Filter
        </span>

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
            count: s === "no_store" ? noStoreCount : (byStore[s] ?? 0),
            dotClass:
              s === "no_store" ? "bg-ink-muted/60" : STORE_META[s].dotClass,
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
            count: byStatus[s] ?? 0,
            dotClass: STATUS_META[s].dotClass,
          }))}
          selected={selectedStatuses}
          onToggle={onToggleStatus}
          onClear={onClearStatuses}
          searchable={false}
        />
      </div>

      {/* Right: Sort, Per-page, Columns, mobile view switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Select
            value={sortBy}
            onValueChange={(v) => onSortChange(v, sortOrder)}
            ariaLabel="Sort field"
            className="w-36 text-xs"
            options={SORT_OPTIONS}
          />
          <Tooltip
            content={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")
              }
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </Button>
          </Tooltip>
        </div>

        <Select
          value={String(itemsPerPage)}
          onValueChange={(v) => onItemsPerPageChange(Number(v))}
          ariaLabel="Items per page"
          className="w-[88px] text-xs"
          options={[12, 24, 48, 96].map((n) => ({
            value: String(n),
            label: `${n} / pg`,
          }))}
        />

        {viewMode === "table" && (
          <MultiSelectFilter
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
          className="ml-auto inline-flex items-center rounded-xl border border-border-strong/80 bg-surface-subtle p-0.5 sm:hidden"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
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
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
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
