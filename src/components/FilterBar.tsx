import React from "react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

const FilterBarInternal = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  
}: FilterBarProps) => {
  const hasActiveFilters = searchTerm.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-2 border-t">
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export const FilterBar = React.memo(FilterBarInternal);
