import React from "react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  selectedPlatforms: string[];
  selectedGenres: string[];
  selectedStores: ("steam" | "epic" | "gog")[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
  onStoreToggle: (store: "steam" | "epic" | "gog") => void;
}

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
    <div className="bg-white rounded-lg shadow-xs border p-4 sm:p-5 space-y-3">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5">
          Search Games
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-9 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-hidden focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-col gap-2 pt-2 border-t">
          <div className="flex flex-wrap items-center gap-2">
            {selectedPlatforms.map((p) => (
              <button
                key={`p-${p}`}
                onClick={() => onPlatformToggle(p)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
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
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 hover:bg-purple-200"
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
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 hover:bg-green-200"
                title="Remove store filter"
              >
                {s}
                <span className="ml-0.5">✕</span>
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterBar = React.memo(FilterBarInternal);
