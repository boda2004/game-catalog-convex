import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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
  searchable?: boolean;
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
  searchable = true,
  align = "start",
  triggerClassName,
}: MultiSelectFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-150 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/25",
            selected.length > 0
              ? "border-primary/45 bg-primary-soft text-primary-soft-ink"
              : "border-border-strong/80 bg-surface-elevated text-ink-secondary hover:bg-surface-muted hover:text-ink",
            triggerClassName,
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            {icon}
            <span className="truncate">{label}</span>
            {selected.length > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white tabular-nums">
                {selected.length}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 opacity-70 transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-64">
        {(searchable || (onClear && selected.length > 0)) && (
          <div className="flex items-center gap-1.5 border-b border-border-subtle p-2">
            {searchable && (
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Filter ${label.toLowerCase()}...`}
                  className="h-8 w-full rounded-lg border border-border-strong/70 bg-surface-subtle pl-8 pr-2 text-xs text-ink placeholder:text-ink-muted focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
            {onClear && selected.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setQuery("");
                }}
                className="h-8 rounded-lg border border-border-strong/70 px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        )}
        <div className="max-h-60 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-5 text-center text-xs text-ink-muted">
              No matches
            </p>
          ) : (
            filtered.map((opt) => {
              const isSelected = selectedSet.has(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => onToggle(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors disabled:opacity-45",
                    isSelected
                      ? "bg-primary-soft font-medium text-primary-soft-ink"
                      : "text-ink hover:bg-surface-muted",
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
                    <span className="truncate text-[13px]">{opt.label}</span>
                  </span>
                  {opt.count !== undefined && (
                    <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
