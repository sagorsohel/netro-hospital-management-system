import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  Building2,
  FileText,
  FileCheck2,
  Eye,
  Edit2,
  Trash2,
  TrendingDown,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useDeleteExpenseMutation,
  type Expense,
} from '../../store/api/expenseApi';
import { EXPENSE_CATEGORIES } from './ExpenseFormPage';
import { useAppSelector } from '../../store/hooks';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';
import { Pagination } from '../../components/common/Pagination';

export const ExpensesPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCategorySummary, setShowCategorySummary] = useState(false);

  // Selected Bill Voucher for modal inspection
  const [viewingBillUrl, setViewingBillUrl] = useState<string | null>(null);
  const [viewingBillTitle, setViewingBillTitle] = useState<string>('');

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // APIs
  const { data: statsResponse, isLoading: isLoadingStats } = useGetExpenseStatsQuery();
  const {
    data: expenseResponse,
    isLoading,
    isFetching,
  } = useGetExpensesQuery({
    page,
    limit,
    search: search.trim() || undefined,
    category: category !== 'all' ? category : undefined,
    status: status !== 'all' ? status : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const stats = statsResponse?.stats;
  const expensesList = expenseResponse?.data || [];
  const pagination = expenseResponse?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalAmount: 0,
  };

  const hasActiveFilters =
    Boolean(search) ||
    category !== 'all' ||
    status !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete?.id) return;
    try {
      await deleteExpense(expenseToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setExpenseToDelete(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete expense record.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans pb-12">
      {/* 1. Page Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
                  Hospital Expense Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-primary border border-emerald-200 text-xs font-bold">
                  {pagination.total} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily expense entries, bill voucher photo uploads, category auditing & financial ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCategorySummary(!showCategorySummary)}
            className="text-xs font-semibold gap-1.5 h-10 px-3.5 border-slate-200 text-slate-600 hover:text-dark"
          >
            <PieChart className="h-3.5 w-3.5 text-secondary" />
            <span>Category Breakdown</span>
            {showCategorySummary ? (
              <ChevronUp className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            )}
          </Button>

          {isAdmin && (
            <Link
              to="/expenses/new"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Record New Expense</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Top KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Overall Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outlay
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-dark font-mono">
              ৳ {stats ? Number(stats.totalOverall).toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="font-semibold text-emerald-700">{stats?.countOverall || 0}</span>{' '}
              cumulative expense vouchers
            </p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-primary/5 rounded-full pointer-events-none" />
        </div>

        {/* This Month's Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-secondary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              This Month's Spending
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-secondary flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-dark font-mono">
              ৳ {stats ? Number(stats.totalThisMonth).toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="font-semibold text-secondary">{stats?.countThisMonth || 0}</span>{' '}
              vouchers recorded this month
            </p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-secondary/5 rounded-full pointer-events-none" />
        </div>

        {/* Today's Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Expenses
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-dark font-mono">
              ৳ {stats ? Number(stats.totalToday).toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="font-semibold text-amber-600">{stats?.countToday || 0}</span> entries
              recorded today
            </p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-500/5 rounded-full pointer-events-none" />
        </div>

        {/* Filtered View Outlay */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filtered Total Outlay
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-purple-700 font-mono">
              ৳ {Number(pagination.totalAmount || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              Sum of currently matching vouchers
            </p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-purple-500/5 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Category Breakdown Drawer / Accordion Panel */}
      {showCategorySummary && stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-bold text-dark">Expenses by Category Audit</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {stats.categoryBreakdown.length} active spending sectors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.categoryBreakdown.map((item) => (
              <div
                key={item.category}
                onClick={() => {
                  setCategory(item.category);
                  setPage(1);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  category === item.category
                    ? 'bg-primary/5 border-primary shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-dark truncate max-w-[180px]">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {item.count}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    ৳ {Number(item.totalAmount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {stats.totalOverall > 0
                      ? `${Math.round((item.totalAmount / stats.totalOverall) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, voucher #, purpose, vendor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-primary text-dark"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Start & End */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="date"
                title="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-xs bg-slate-50 border-slate-200"
              />
            </div>
            <span className="text-slate-300 text-xs">-</span>
            <div className="relative flex-1">
              <Input
                type="date"
                title="End Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-10 text-xs bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary & Clear Filter */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing filtered results for expenses matching active criteria.
            </span>
            <button
              onClick={handleResetFilters}
              className="text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Expenses Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100/90 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading expense vouchers & records...</p>
          </div>
        ) : expensesList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-primary mx-auto flex items-center justify-center">
              <Receipt className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-dark">No Expense Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No expense voucher matches your search or filter criteria. Try adjusting filters.'
                : 'Start recording daily hospital expenses, utility bills, and attached voucher receipts.'}
            </p>
            {isAdmin && (
              <div className="pt-2">
                <Link
                  to="/expenses/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Record First Expense</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Voucher & Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Expense Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Vendor / Paid To</th>
                  <th className="py-3.5 px-4 text-center">Attached Bill</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expensesList.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Voucher & Title */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {exp.voucherNo && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">
                              {exp.voucherNo}
                            </span>
                          )}
                          <span className="font-bold text-dark group-hover:text-primary transition-colors">
                            {exp.title}
                          </span>
                        </div>
                        {exp.purpose && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {exp.purpose}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                        {exp.category}
                      </span>
                    </td>

                    {/* Expense Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{exp.date}</span>
                      </div>
                    </td>

                    {/* Amount & Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-black font-mono text-emerald-700">
                          ৳ {Number(exp.amount).toLocaleString()}
                        </span>
                        {exp.paymentMethod && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            {exp.paymentMethod}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Vendor / Paid To */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium text-xs">
                        {exp.paidTo || '—'}
                      </span>
                    </td>

                    {/* Attached Bill Voucher Photo */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {exp.billCopy ? (
                        <div
                          onClick={() => {
                            setViewingBillUrl(exp.billCopy as string);
                            setViewingBillTitle(exp.voucherNo ? `${exp.voucherNo} - ${exp.title}` : exp.title);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs group/btn"
                          title="Click to view full voucher receipt scan"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Bill</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">
                          No Attached Bill
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : exp.status === 'Approved'
                            ? 'bg-blue-50 text-secondary border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/expenses/edit/${exp.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-primary/40 bg-white hover:bg-emerald-50 text-slate-600 hover:text-primary transition-all"
                            title="Edit Expense"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(exp)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 text-slate-600 hover:text-accent transition-all cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* 6. Attached Bill Copy Modal Viewer */}
      {viewingBillUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-dark">Attached Bill Copy Voucher</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{viewingBillTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBillUrl(null)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-dark flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/70">
              <img
                src={viewingBillUrl}
                alt="Attached Bill Voucher Scan"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Audited copy on Cloudinary CDN
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={viewingBillUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Full Resolution</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Expense Record"
        itemName={
          expenseToDelete
            ? `${expenseToDelete.voucherNo ? `[${expenseToDelete.voucherNo}] ` : ''}${expenseToDelete.title}`
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
};

export default ExpensesPage;
