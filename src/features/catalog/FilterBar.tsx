import { X } from "lucide-react";
import {
  STATUS_META,
  STORE_META,
  getStoreLabel,
  type GameStatus,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  onTogglePlatform: (platform: string) => void;
  onToggleGenre: (genre: string) => void;
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
}

const INLINE_LIMIT = 2;

/**
 * Only renders individual dismissible chips for facets whose selection exceeds
 * the toolbar pill's inline badge limit, keeping the default bar single-row.
 */
export function FilterBar({
  selectedPlatforms,
  selectedGenres,
  selectedStores,
  selectedStatuses,
  onTogglePlatform,
  onToggleGenre,
  onToggleStore,
  onToggleStatus,
}: FilterBarProps) {
  const showPlatforms = selectedPlatforms.length > INLINE_LIMIT;
  const showGenres = selectedGenres.length > INLINE_LIMIT;
  const showStores = selectedStores.length > INLINE_LIMIT;
  const showStatuses = selectedStatuses.length > INLINE_LIMIT;

  if (!showPlatforms && !showGenres && !showStores && !showStatuses) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showStatuses &&
        selectedStatuses.map((status) => (
          <button
            key={`st-${status}`}
            type="button"
            onClick={() => onToggleStatus(status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
              STATUS_META[status].badgeClass,
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                STATUS_META[status].dotClass,
              )}
            />
            <span>{STATUS_META[status].label}</span>
            <X className="size-3 opacity-75" />
          </button>
        ))}

      {showStores &&
        selectedStores.map((store) => (
          <button
            key={`s-${store}`}
            type="button"
            onClick={() => onToggleStore(store)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
              store === "no_store"
                ? "bg-surface-muted text-ink-secondary ring-1 ring-inset ring-border-strong"
                : STORE_META[store].badgeClass,
            )}
          >
            <span>{getStoreLabel(store)}</span>
            <X className="size-3 opacity-75" />
          </button>
        ))}

      {showPlatforms &&
        selectedPlatforms.map((platform) => (
          <button
            key={`p-${platform}`}
            type="button"
            onClick={() => onTogglePlatform(platform)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-soft-ink ring-1 ring-inset ring-primary/25 transition-opacity hover:opacity-80"
          >
            <span>{platform}</span>
            <X className="size-3 opacity-75" />
          </button>
        ))}

      {showGenres &&
        selectedGenres.map((genre) => (
          <button
            key={`g-${genre}`}
            type="button"
            onClick={() => onToggleGenre(genre)}
            className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium text-ink-secondary ring-1 ring-inset ring-border-strong transition-colors hover:text-ink"
          >
            <span>{genre}</span>
            <X className="size-3 opacity-75" />
          </button>
        ))}
    </div>
  );
}
