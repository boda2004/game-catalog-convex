import React from "react";
import { createPortal } from "react-dom";

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
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [menuStyles, setMenuStyles] = React.useState<React.CSSProperties | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current) return;
      const clickedInsideContainer = containerRef.current.contains(target);
      const clickedInsideMenu = menuRef.current ? menuRef.current.contains(target) : false;
      if (!clickedInsideContainer && !clickedInsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const updateMenuPosition = React.useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const verticalGap = 4; // 4px gap similar to mt-1

    // Decide whether to open upwards based on available space rather than estimated height
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceAbove > spaceBelow; // prefer opening up when there's more space above

    // Horizontal alignment
    let left = rect.left;
    if (align === "right") {
      left = Math.max(0, rect.right - rect.width);
    }
    left = Math.min(left, viewportWidth - rect.width);

    // For drop-up we anchor the top edge to the trigger's top and shift the menu by its full height using translateY(-100%)
    const top = openUp ? rect.top - verticalGap : rect.bottom + verticalGap;

    setMenuStyles({
      position: "fixed",
      top,
      left,
      minWidth: rect.width,
      zIndex: 50,
      transform: openUp ? "translateY(-100%)" : undefined,
    });
  }, [align]);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    const onScroll = () => updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, updateMenuPosition]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        ref={buttonRef}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-sm flex items-center justify-between bg-white ${buttonClassName}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-xs text-gray-500 ml-2">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && menuStyles && createPortal(
        <div
          ref={menuRef}
          style={menuStyles}
          className={`bg-white border border-gray-200 rounded-sm shadow-sm ${menuClassName}`}
        >
          <div className="max-h-48 overflow-auto py-1 min-w-(--trigger-width,auto)">
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
        </div>,
        document.body
      )}
    </div>
  );
}

export default ComboBox;


