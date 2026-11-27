import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PAGE_SIZE_OPTIONS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlsProps) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageItems = (): Array<number | "ellipsis"> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: Array<number | "ellipsis"> = [1];
    const left = Math.max(currentPage - 1, 2);
    const right = Math.min(currentPage + 1, totalPages - 1);

    if (left > 2) pages.push("ellipsis");
    for (let p = left; p <= right; p += 1) pages.push(p);
    if (right < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle/75 pt-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Item range summary */}
      <p className="text-xs text-ink-secondary">
        Showing{" "}
        <span className="font-mono font-semibold tabular-nums text-ink">
          {startItem}–{endItem}
        </span>{" "}
        of{" "}
        <span className="font-mono font-semibold tabular-nums text-ink">
          {totalItems.toLocaleString()}
        </span>{" "}
        {totalItems === 1 ? "game" : "games"}
      </p>

      {/* Right: Page size selector + Page navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Per page
          </span>
          <Select
            size="sm"
            align="end"
            value={String(itemsPerPage)}
            onValueChange={(v) => onItemsPerPageChange(Number(v))}
            ariaLabel="Games per page"
            className="w-[70px] font-mono tabular-nums"
            contentClassName="min-w-[96px]"
            options={PAGE_SIZE_OPTIONS.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
          />
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="inline-flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
              className="hidden sm:inline-flex"
            >
              <ChevronsLeft className="size-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Compact page indicator on mobile */}
            <span className="px-2 font-mono text-xs tabular-nums text-ink-secondary sm:hidden">
              {currentPage} / {totalPages}
            </span>

            {/* Numbered page buttons on sm+ */}
            <div className="hidden items-center gap-1 sm:inline-flex">
              {getPageItems().map((item, idx) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="select-none px-1.5 text-xs text-ink-muted"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={cn(
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 font-mono text-xs font-semibold tabular-nums transition-colors",
                      item === currentPage
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-transparent bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <Button
              variant="secondary"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
              className="hidden sm:inline-flex"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
