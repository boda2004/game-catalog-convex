import { useState, useRef, useEffect } from "react";

interface ViewControlsProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string, order: "asc" | "desc") => void;
  visibleFields: string[];
  onToggleFieldVisibility: (field: string) => void;
}

const sortOptions = [
  { key: "userAddedAt", label: "Date Added" },
  { key: "name", label: "Name" },
  { key: "rating", label: "Rating" },
  { key: "metacritic", label: "Metacritic" },
  { key: "released", label: "Release Date" },
];

const allTableFields = [
  { key: "name", label: "Name" },
  { key: "platforms", label: "Platforms" },
  { key: "genres", label: "Genres" },
  { key: "rating", label: "Rating" },
  { key: "metacritic", label: "Metacritic" },
  { key: "released", label: "Released" },
  { key: "developers", label: "Developer" },
  { key: "publishers", label: "Publisher" },
  { key: "userAddedAt", label: "Added" },
];

export function ViewControls({
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  visibleFields,
  onToggleFieldVisibility,
}: ViewControlsProps) {
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const columnSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSelectorRef.current &&
        !columnSelectorRef.current.contains(event.target as Node)
      ) {
        setIsColumnSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* View Mode Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex rounded-md border border-gray-300">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-3 py-1 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1 text-sm rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, sortOrder)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Items Per Page Controls */}
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

      {/* Column Visibility Controls (only for table view) */}
      {viewMode === "table" && (
        <div className="relative" ref={columnSelectorRef}>
          <button
            onClick={() => setIsColumnSelectorOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Columns</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isColumnSelectorOpen && (
            <div className="absolute z-20 top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="p-2 text-sm font-medium text-gray-800 border-b">
                Visible Columns
              </div>
              <div className="py-1">
                {allTableFields.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      checked={visibleFields.includes(field.key)}
                      onChange={() => onToggleFieldVisibility(field.key)}
                      disabled={field.key === 'name'}
                    />
                    <span className="text-sm text-gray-700">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
