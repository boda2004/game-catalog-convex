import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface MultiSelectOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  dotClass?: string;
  disabled?: boolean;
}

export interface MultiSelectFilterProps<T extends string = string> {
  label: string;
  icon?: ReactNode;
  options: ReadonlyArray<MultiSelectOption<T>>;
  selected: ReadonlyArray<T>;
  onToggle: (value: T) => void;
  onClear?: () => void;
  clearLabel?: string;
  searchable?: boolean;
  sortByCount?: boolean;
  maxInlineBadges?: number;
  variant?: "facet" | "control";
  align?: "start" | "end";
  triggerClassName?: string;
}

export function MultiSelectFilter<T extends string = string>({
  label,
  icon,
  options,
  selected,
  onToggle,
  onClear,
  clearLabel = "Clear filter",
  searchable = true,
  sortByCount = false,
  maxInlineBadges = 2,
  variant = "facet",
  align = "start",
  triggerClassName,
}: MultiSelectFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const optionLabelMap = useMemo(() => {
    const map = new Map<T, MultiSelectOption<T>>();
    for (const opt of options) {
      map.set(opt.value, opt);
    }
    return map;
  }, [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter((opt) => opt.label.toLowerCase().includes(q))
      : [...options];

    if (!sortByCount) return matches;

    return [...matches].sort((a, b) => {
      const aSelected = selectedSet.has(a.value) ? 1 : 0;
      const bSelected = selectedSet.has(b.value) ? 1 : 0;
      if (aSelected !== bSelected) return bSelected - aSelected;

      const aCount = a.count ?? 0;
      const bCount = b.count ?? 0;
      if (aCount !== bCount) return bCount - aCount;

      return a.label.localeCompare(b.label);
    });
  }, [options, query, selectedSet, sortByCount]);

  // Keep activeIndex in bounds when filtered list changes
  const clampedActiveIndex =
    filtered.length === 0 ? -1 : Math.min(activeIndex, filtered.length - 1);

  useEffect(() => {
    if (!open) return;
    if (searchable) {
      // Focus search input after popover mounts
      const frame = requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open, searchable]);

  const scrollActiveIntoView = (index: number) => {
    const container = listRef.current;
    if (!container) return;
    const item = container.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (clampedActiveIndex + 1) % filtered.length;
      setActiveIndex(next);
      scrollActiveIntoView(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (clampedActiveIndex - 1 + filtered.length) % filtered.length;
      setActiveIndex(prev);
      scrollActiveIntoView(prev);
    } else if (e.key === "Enter" && clampedActiveIndex >= 0) {
      e.preventDefault();
      const target = filtered[clampedActiveIndex];
      if (target && !target.disabled) {
        onToggle(target.value);
      }
    }
  };

  const isFacet = variant === "facet";
  const hasSelection = selected.length > 0;
  const showInlineClear = isFacet && hasSelection && Boolean(onClear);

  const selectedOptions = useMemo(
    () =>
      selected.map(
        (val) => optionLabelMap.get(val) ?? { value: val, label: String(val) },
      ),
    [optionLabelMap, selected],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setActiveIndex(0);
        } else {
          setQuery("");
        }
      }}
    >
      <div className="inline-flex items-center">
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 border text-xs font-medium transition-all duration-150 focus-visible:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/25",
              showInlineClear ? "rounded-l-lg border-r-0 pl-2.5 pr-2" : "rounded-lg px-2.5",
              isFacet
                ? hasSelection
                  ? "border-primary/40 bg-primary-soft/65 text-primary-soft-ink hover:bg-primary-soft/90"
                  : "border-dashed border-border-strong/85 bg-transparent text-ink-secondary hover:border-border-strong hover:bg-surface-elevated/80 hover:text-ink"
                : "border-border-strong/80 bg-surface-elevated text-ink-secondary hover:border-border-strong hover:bg-surface-muted/80 hover:text-ink",
              open && !hasSelection && "border-primary/60 bg-surface-elevated text-ink",
              triggerClassName,
            )}
          >
            {isFacet ? (
              icon ? (
                <span className="shrink-0 opacity-80">{icon}</span>
              ) : (
                <Plus className="size-3.5 shrink-0 opacity-75" />
              )
            ) : (
              icon && <span className="shrink-0 opacity-80">{icon}</span>
            )}

            <span className="font-semibold">{label}</span>

            {isFacet && hasSelection && (
              <>
                <span className="mx-0.5 h-3.5 w-px bg-primary/25" aria-hidden="true" />
                {selectedOptions.length <= maxInlineBadges ? (
                  <span className="flex items-center gap-1">
                    {selectedOptions.map((opt) => (
                      <span
                        key={opt.value}
                        className="inline-flex max-w-[96px] items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary-soft-ink"
                      >
                        {opt.dotClass && (
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              opt.dotClass,
                            )}
                          />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-primary-soft-ink">
                    {selectedOptions.length} selected
                  </span>
                )}
              </>
            )}

            {!isFacet && hasSelection && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-surface-muted px-1 font-mono text-[10px] font-semibold tabular-nums text-ink-secondary">
                {selected.length}
              </span>
            )}

            {!showInlineClear && (
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 opacity-65 transition-transform duration-150",
                  open && "rotate-180",
                )}
              />
            )}
          </button>
        </PopoverTrigger>

        {showInlineClear && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label.toLowerCase()} filter`}
            className="inline-flex h-8 items-center justify-center rounded-r-lg border border-primary/40 border-l-primary/20 bg-primary-soft/65 px-1.5 text-primary-soft-ink/80 transition-colors hover:bg-primary-soft hover:text-primary-soft-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <PopoverContent
        align={align}
        className="w-64"
        onKeyDown={handleKeyDown}
      >
        {searchable && (
          <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
            <Search className="size-3.5 shrink-0 text-ink-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder={`Search ${label.toLowerCase()}...`}
              aria-label={`Search ${label.toLowerCase()}`}
              className="w-full bg-transparent text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveIndex(0);
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="rounded p-0.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          className="max-h-64 overflow-y-auto p-1"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-ink-muted">
              No {label.toLowerCase()} found
            </p>
          ) : (
            filtered.map((opt, index) => {
              const isSelected = selectedSet.has(opt.value);
              const isHighlighted = index === clampedActiveIndex;
              const isZeroCount =
                opt.count !== undefined && opt.count === 0 && !isSelected;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => onToggle(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-45",
                    isHighlighted
                      ? "bg-surface-muted text-ink"
                      : "text-ink",
                    isSelected && "font-medium",
                    isZeroCount && "opacity-45 hover:opacity-75",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border-strong bg-surface",
                      )}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </span>
                    {opt.dotClass && (
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          opt.dotClass,
                        )}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {opt.count !== undefined && (
                    <span
                      className={cn(
                        "font-mono text-[11px] tabular-nums",
                        isSelected ? "text-primary-soft-ink" : "text-ink-muted",
                      )}
                    >
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {onClear && hasSelection && (
          <div className="border-t border-border-subtle p-1">
            <button
              type="button"
              onClick={() => {
                onClear();
                setQuery("");
              }}
              className="flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {clearLabel}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
