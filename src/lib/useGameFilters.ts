import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "./hooks";

export type FilterStore = "steam" | "epic" | "gog";
export type SortOrder = "asc" | "desc";

export function useGameFilters(preferencesItemsPerPage?: number) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<FilterStore[]>([]);
  const [sortBy, setSortBy] = useState("userAddedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    JSON.stringify(selectedPlatforms),
    JSON.stringify(selectedGenres),
    JSON.stringify(selectedStores),
    sortBy,
    sortOrder,
    preferencesItemsPerPage,
  ]);

  const handlePlatformToggle = useCallback((platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }, []);

  const handleGenreToggle = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }, []);

  const handleStoreToggle = useCallback((store: string) => {
    setSelectedStores((prev) =>
      prev.includes(store as FilterStore)
        ? prev.filter((s) => s !== store)
        : [...prev, store as FilterStore]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setSelectedStores([]);
  }, []);

  const handleSortChange = useCallback((field: string, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedPlatforms,
    selectedGenres,
    selectedStores,
    sortBy,
    sortOrder,
    currentPage,
    setCurrentPage,
    handlePlatformToggle,
    handleGenreToggle,
    handleStoreToggle,
    handleClearFilters,
    handleSortChange,
  };
}
