import { useState, useRef, useEffect } from "react";
import { Dropdown } from "./shared/Dropdown";

interface ViewControlsProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string, order: "asc" | "desc") => void;
  visibleFields: string[];
  onToggleFieldVisibility: (field: string) => void;
  viewMode: "grid" | "table";
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
  sortBy,
  sortOrder,
  onSortChange,
  visibleFields,
  onToggleFieldVisibility,
  viewMode,
}: ViewControlsProps) {
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [columnQuery, setColumnQuery] = useState("");
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

      {/* Column Visibility Controls (only for table view) */}
      {viewMode === "table" && (
        <div className="relative" ref={columnSelectorRef}>
          <Dropdown
            label="Columns"
            isOpen={isColumnSelectorOpen}
            count={visibleFields.length}
            query={columnQuery}
            setOpen={setIsColumnSelectorOpen}
            setQuery={setColumnQuery}
            items={allTableFields
              .filter(f => f.label.toLowerCase().includes(columnQuery.toLowerCase()))
              .map(f => f.label)}
            onToggle={(label) => {
              const field = allTableFields.find(f => f.label === label);
              if (!field || field.key === "name") return; // keep Name always visible
              onToggleFieldVisibility(field.key);
            }}
            selected={allTableFields
              .filter(f => visibleFields.includes(f.key))
              .map(f => f.label)}
            placeholder="Search columns..."
            align="right"
            showSearch={true}
          />
        </div>
      )}
    </div>
  );
}

// Replace Columns dropdown implementation below with shared Dropdown usage
