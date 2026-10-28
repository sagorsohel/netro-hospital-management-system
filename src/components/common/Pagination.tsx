import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 8,
  onPageChange,
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  // Generate page numbers with smart ellipsis (1, 2, 3, 4 ... N)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 select-none font-sans">
      {/* Item summary */}
      {totalItems !== undefined && (
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-dark">{startItem}</span> to{' '}
          <span className="font-bold text-dark">{endItem}</span> of{' '}
          <span className="font-bold text-dark">{totalItems}</span> departments
        </div>
      )}

      {/* 1 2 3 4 Pagination Pill Buttons */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-100 shadow-2xs">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Previous Page"
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-dark hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Number Buttons: 1, 2, 3, 4 */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="h-8 w-8 flex items-center justify-center text-slate-300 text-xs font-medium"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-8 min-w-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-slate-600 hover:text-dark hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next Page"
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-dark hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
