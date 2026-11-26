import { Search, X } from "lucide-react";
import {
  STATUS_META,
  getStoreLabel,
  type GameStatus,
  type StoreFilter,
} from "@/lib/catalog";

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
  const hasFilters =
    selectedPlatforms.length > 0 ||
    selectedGenres.length > 0 ||
    selectedStores.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-[400px]">
          <label htmlFor="catalog-search" className="sr-only">
            Search library
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="catalog-search"
            type="text"
            placeholder="Search by title, genre, platform, or developer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field h-10 pl-9 pr-9"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:bg-surface-subtle hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {hasFilters ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedPlatforms.map((platform) => (
              <button
                key={`p-${platform}`}
                type="button"
                onClick={() => onTogglePlatform(platform)}
                className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-soft-ink hover:opacity-85"
              >
                {platform}
                <X className="size-3" />
              </button>
            ))}
            {selectedGenres.map((genre) => (
              <button
                key={`g-${genre}`}
                type="button"
                onClick={() => onToggleGenre(genre)}
                className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-1 text-xs font-semibold text-ink-secondary ring-1 ring-inset ring-border-subtle hover:bg-surface-muted"
              >
                {genre}
                <X className="size-3" />
              </button>
            ))}
            {selectedStores.map((store) => (
              <button
                key={`s-${store}`}
                type="button"
                onClick={() => onToggleStore(store)}
                className="inline-flex items-center gap-1 rounded-md bg-[#ffdbc7] px-2 py-1 text-xs font-semibold text-[#723603] hover:opacity-85"
              >
                {getStoreLabel(store)}
                <X className="size-3" />
              </button>
            ))}
            {selectedStatuses.map((status) => (
              <button
                key={`st-${status}`}
                type="button"
                onClick={() => onToggleStatus(status)}
                className="inline-flex items-center gap-1 rounded-md bg-[#dbeafe] px-2 py-1 text-xs font-semibold text-[#1d4ed8] hover:opacity-85"
              >
                {STATUS_META[status].label}
                <X className="size-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-md border border-border-strong px-2 py-1 text-xs font-semibold text-ink-secondary hover:bg-surface-subtle"
            >
              Clear all
            </button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            Instant search &amp; filtering across your entire collection.
          </p>
        )}
      </div>
    </div>
  );
}
