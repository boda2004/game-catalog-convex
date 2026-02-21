interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  hasMore,
  onPageChange,
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const hasPrevPage = currentPage > 1;
  // Prefer totalPages when available; fall back to hasMore to avoid disabling Next prematurely
  const hasNextPage = currentPage < totalPages || hasMore;

  const getPageItems = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisibleWhenSmall = 7; // show all pages if total small
    const showAll = totalPages <= maxVisibleWhenSmall;

    if (showAll) {
      for (let p = 1; p <= totalPages; p += 1) pages.push(p);
      return pages;
    }

    const siblings = 1;
    const firstPage = 1;
    const lastPage = totalPages;
    const left = Math.max(currentPage - siblings, firstPage + 1);
    const right = Math.min(currentPage + siblings, lastPage - 1);

    // Always show first
    pages.push(firstPage);
    // Left ellipsis
    if (left > firstPage + 1) {
      pages.push("ellipsis");
    } else {
      for (let p = firstPage + 1; p < left; p += 1) pages.push(p);
    }

    // Middle range
    for (let p = left; p <= right; p += 1) pages.push(p);

    // Right ellipsis
    if (right < lastPage - 1) {
      pages.push("ellipsis");
    } else {
      for (let p = right + 1; p < lastPage; p += 1) pages.push(p);
    }

    // Always show last
    pages.push(lastPage);

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {getPageItems().map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  onClick={() => onPageChange(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 ${
                    item === currentPage
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
