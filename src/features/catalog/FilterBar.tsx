import { RotateCcw, Search, X } from "lucide-react";
import {
  STATUS_META,
  STORE_META,
  getStoreLabel,
  type GameStatus,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  onTogglePlatform: (platform: string) => void;
  onToggleGenre: (genre: string) => void;
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
  onClearAll: () => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedPlatforms,
  selectedGenres,
  selectedStores,
  selectedStatuses,
  onTogglePlatform,
  onToggleGenre,
  onToggleStore,
  onToggleStatus,
  onClearAll,
}: FilterBarProps) {
  const hasSearch = searchTerm.trim().length > 0;
  const hasFilters =
    hasSearch ||
    selectedPlatforms.length > 0 ||
    selectedGenres.length > 0 ||
    selectedStores.length > 0 ||
    selectedStatuses.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-0.5">
      <span className="text-xs font-semibold text-ink-muted">Active:</span>

      {hasSearch && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:bg-surface-muted"
        >
          <Search className="size-3 text-ink-muted" />
          <span>&ldquo;{searchTerm.trim()}&rdquo;</span>
          <X className="size-3 text-ink-muted" />
        </button>
      )}

      {selectedPlatforms.map((platform) => (
        <button
          key={`p-${platform}`}
          type="button"
          onClick={() => onTogglePlatform(platform)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-soft-ink ring-1 ring-inset ring-primary/25 transition-opacity hover:opacity-80"
        >
          <span>{platform}</span>
          <X className="size-3" />
        </button>
      ))}

      {selectedGenres.map((genre) => (
        <button
          key={`g-${genre}`}
          type="button"
          onClick={() => onToggleGenre(genre)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-ink-secondary ring-1 ring-inset ring-border-strong transition-colors hover:text-ink"
        >
          <span>{genre}</span>
          <X className="size-3" />
        </button>
      ))}

      {selectedStores.map((store) => (
        <button
          key={`s-${store}`}
          type="button"
          onClick={() => onToggleStore(store)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80",
            store === "no_store"
              ? "bg-surface-muted text-ink-secondary ring-1 ring-inset ring-border-strong"
              : STORE_META[store].badgeClass,
          )}
        >
          <span>{getStoreLabel(store)}</span>
          <X className="size-3" />
        </button>
      ))}

      {selectedStatuses.map((status) => (
        <button
          key={`st-${status}`}
          type="button"
          onClick={() => onToggleStatus(status)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80",
            STATUS_META[status].badgeClass,
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", STATUS_META[status].dotClass)}
          />
          <span>{STATUS_META[status].label}</span>
          <X className="size-3" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      >
        <RotateCcw className="size-3" />
        Reset all
      </button>
    </div>
  );
}
