import React from "react";

export interface ComboBoxOption<V extends string | number = string | number> {
  label: string;
  value: V;
}

interface ComboBoxProps<V extends string | number = string | number> {
  value: V;
  options: ComboBoxOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

export function ComboBox<V extends string | number = string | number>({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
}: ComboBoxProps<V>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const panelAlignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded flex items-center justify-between bg-white ${buttonClassName}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-xs text-gray-500 ml-2">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className={`absolute ${panelAlignClass} z-20 mt-1 min-w-full bg-white border border-gray-200 rounded shadow ${menuClassName}`}>
          <div className="max-h-48 overflow-auto py-1">
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (opt.value !== value) onChange(opt.value);
                }}
                className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                  opt.value === value ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComboBox;


