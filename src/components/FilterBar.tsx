import React from "react";
import type { FilterStore } from "../lib/useGameFilters";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: FilterStore[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
  onStoreToggle: (store: FilterStore) => void;
}

const storeLabels: Record<FilterStore, string> = {
  steam: "Steam",
  epic: "Epic Games",
  gog: "GOG",
  no_store: "No store",
};

const FilterBarInternal = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  selectedPlatforms,
  selectedGenres,
  selectedStores,
  onPlatformToggle,
  onGenreToggle,
  onStoreToggle,
}: FilterBarProps) => {
  const hasActiveFilters =
    selectedPlatforms.length > 0 || selectedGenres.length > 0 || selectedStores.length > 0;

  return (
    <div className="rounded-lg border border-[#dbd9e1] bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative">
          <label htmlFor="search" className="sr-only">
            Search games
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="size-4 text-[#767682]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block h-10 w-full rounded-lg border border-[#c6c5d3] bg-white py-2 pl-9 pr-9 text-sm leading-5 placeholder:text-[#767682] focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary lg:w-[420px]"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#767682] hover:text-[#454651]"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {hasActiveFilters ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {selectedPlatforms.map((p) => (
              <button
                key={`p-${p}`}
                onClick={() => onPlatformToggle(p)}
                className="inline-flex items-center gap-1 rounded-md bg-[#dfe0ff] px-2 py-1 text-xs font-medium text-[#333f91] hover:bg-[#bcc3ff]"
                title="Remove platform filter"
              >
                {p}
                <span className="ml-0.5">✕</span>
              </button>
            ))}
            {selectedGenres.map((g) => (
              <button
                key={`g-${g}`}
                onClick={() => onGenreToggle(g)}
                className="inline-flex items-center gap-1 rounded-md bg-[#f5f2fa] px-2 py-1 text-xs font-medium text-[#454651] ring-1 ring-inset ring-[#dbd9e1] hover:bg-[#efedf4]"
                title="Remove genre filter"
              >
                {g}
                <span className="ml-0.5">✕</span>
              </button>
            ))}
            {selectedStores.map((s) => (
              <button
                key={`s-${s}`}
                onClick={() => onStoreToggle(s)}
                className="inline-flex items-center gap-1 rounded-md bg-[#ffdbc7] px-2 py-1 text-xs font-medium text-[#723603] hover:bg-[#ffb689]"
                title="Remove store filter"
              >
                {storeLabels[s]}
                <span className="ml-0.5">✕</span>
              </button>
            ))}
            <button
              onClick={onClearFilters}
              className="rounded-md border border-[#c6c5d3] px-2 py-1 text-xs font-semibold text-[#454651] hover:bg-[#f5f2fa]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <p className="text-sm text-[#767682]">Search your saved games or use the filters below.</p>
        )}
      </div>
    </div>
  );
};

export const FilterBar = React.memo(FilterBarInternal);
