import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React from "react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedPlatforms: string[];
  selectedGenres: string[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
  onClearFilters: () => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
}

const FilterBarInternal = ({
  searchTerm,
  onSearchChange,
  selectedPlatforms,
  selectedGenres,
  onPlatformToggle,
  onGenreToggle,
  onClearFilters,
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
}: FilterBarProps) => {
  const allPlatforms = useQuery(api.games.getAllPlatforms) || [];
  const allGenres = useQuery(api.games.getAllGenres) || [];

  const hasActiveFilters = selectedPlatforms.length > 0 || selectedGenres.length > 0 || searchTerm.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      {/* View & Per-page Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-1 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`px-3 py-1 text-sm rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === "table" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              Table
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

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
            placeholder="Search by name, genre, or platform..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Platforms Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platforms ({selectedPlatforms.length} selected)
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {allPlatforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                onClick={() => onPlatformToggle(platform)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Genres ({selectedGenres.length} selected)
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {allGenres.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => onGenreToggle(genre)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                {genre}
              </button>
            );
          })}
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
