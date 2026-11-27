import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalPages <= 1) return null;

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
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 sm:flex-row">
      <p className="text-xs text-ink-secondary">
        Showing{" "}
        <span className="font-mono font-semibold text-ink">{startItem}</span>–
        <span className="font-mono font-semibold text-ink">{endItem}</span> of{" "}
        <span className="font-mono font-semibold text-ink">{totalItems}</span>
      </p>

      <nav aria-label="Pagination" className="inline-flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {getPageItems().map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="select-none px-2 text-xs text-ink-muted"
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
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 font-mono text-xs font-semibold transition-all",
                item === currentPage
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-transparent bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink",
              )}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="secondary"
          size="icon-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  );
}
