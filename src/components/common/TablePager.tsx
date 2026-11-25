import React from 'react';
import { Pagination } from './Pagination';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  noun?: string;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limits?: number[];
}

/** "Showing 11–20 of 57" + numbered pages + rows-per-page */
export const TablePager: React.FC<Props> = ({
  page,
  totalPages,
  total,
  limit,
  noun = 'records',
  onPageChange,
  onLimitChange,
  limits = [10, 20, 50, 100],
}) => {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(total, page * limit);
  return (
    <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-700">{first}–{last}</strong> of <strong className="text-slate-700">{total}</strong> {noun}
        </span>
        {onLimitChange && (
          <label className="flex items-center gap-1.5">
            Rows
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 px-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-700 focus:outline-hidden"
            >
              {limits.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} itemsPerPage={limit} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default TablePager;
