import React from "react";

export interface DropdownProps {
  label: string;
  isOpen: boolean;
  count: number;
  query?: string;
  setOpen: (updater: (v: boolean) => boolean) => void;
  setQuery?: (v: string) => void;
  items: string[];
  onToggle: (v: string) => void;
  selected: string[];
  placeholder?: string;
  align?: "left" | "right";
  showSearch?: boolean;
  buttonClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  isOpen,
  count,
  query = "",
  setOpen,
  setQuery,
  items,
  onToggle,
  selected,
  placeholder = "Search...",
  align = "left",
  showSearch = true,
  buttonClassName = "",
}) => {
  const panelAlignClass = align === "right" ? "right-0" : "left-0";
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(() => false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white ${buttonClassName}`}
      >
        <span>{count ? `${label} (${count})` : label}</span>
        <span className="ml-1.5 text-[10px] text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className={`absolute ${panelAlignClass} mt-1 w-56 bg-white border border-gray-200 rounded shadow z-20`}>
          <div className="p-2 border-b border-gray-100 flex gap-2 items-center text-sm">
            {showSearch && (
              <input
                value={query}
                onChange={(e) => setQuery && setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            )}
            <button
              type="button"
              onClick={() => {
                selected.forEach((v) => onToggle(v));
                setQuery && setQuery("");
              }}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-auto text-sm">
            {items.length === 0 && (
              <div className="px-2 py-2 text-xs text-gray-500">No results</div>
            )}
            {items.map((v) => (
              <button
                key={v}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(v);
                }}
                className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                  selected.includes(v) ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};