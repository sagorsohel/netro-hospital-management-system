import React, { useMemo, useState } from 'react';
import { DateRangeFilter, dateRangeLabel, dateRangeToParams, type DateRangeValue } from '../../components/common/DateRangeFilter';
import { TablePager } from '../../components/common/TablePager';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Search,
  Plus,
  Eye,
  Printer,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  Wallet,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  useGetDiagnosticInvoicesQuery,
  useSettleDiagnosticDueMutation,
  type DiagnosticInvoice,
} from '../../store/api/diagnosticInvoiceApi';
import { DiagnosticSlipModal } from '../../components/tests/DiagnosticSlipModal';

export const DiagnosticInvoicesPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: 'all' });
  const rangeParams = useMemo(() => dateRangeToParams(dateRange), [dateRange]);

  // Queries & Mutations
  const { data: invoicesData, isLoading, isFetching } = useGetDiagnosticInvoicesQuery({
    search: searchTerm || undefined,
    paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
    page,
    limit,
    ...rangeParams,
  });

  const [settleDueMutation, { isLoading: isSettling }] = useSettleDiagnosticDueMutation();

  // Slip Modal State
  const [selectedInvoiceForSlip, setSelectedInvoiceForSlip] =
    useState<DiagnosticInvoice | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Settle Due Modal State
  const [invoiceToSettle, setInvoiceToSettle] = useState<DiagnosticInvoice | null>(null);
  const [settleAmount, setSettleAmount] = useState<number | string>('');
  const [settleMethod, setSettleMethod] = useState('Cash');

  const handleOpenSettle = (inv: DiagnosticInvoice) => {
    setInvoiceToSettle(inv);
    setSettleAmount(parseFloat(String(inv.dueAmount || 0)));
    setSettleMethod('Cash');
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceToSettle) return;

    try {
      await settleDueMutation({
        id: invoiceToSettle.id,
        data: {
          additionalPayment: parseFloat(String(settleAmount)) || 0,
          paymentMethod: settleMethod,
        },
      }).unwrap();

      setInvoiceToSettle(null);
    } catch (err: any) {
      console.error('Failed to settle due:', err);
      alert(err?.data?.message || 'Failed to settle due payment.');
    }
  };

  const invoicesList = invoicesData?.data || [];
  const meta = invoicesData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const summary = invoicesData?.summary || { invoices: 0, tests: 0, billed: 0, collected: 0, due: 0, discount: 0, dueCount: 0 };
  const collectedPct = summary.billed > 0 ? Math.round((summary.collected / summary.billed) * 100) : 0;
  const periodLabel = dateRangeLabel(dateRange);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              Diagnostic & Pathology Invoices
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Laboratory Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track all diagnostic orders, laboratory bills, report deliveries, and settle outstanding balances.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/tests/pos')}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Diagnostic POS Order</span>
        </button>
      </div>

      {/* Date filter + period totals */}
      <div className="p-3 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <DateRangeFilter
          value={dateRange}
          onChange={(v) => {
            setDateRange(v);
            setPage(1);
          }}
        />
        <span className="text-[11px] text-slate-500">
          Figures for: <strong className="text-slate-700">{periodLabel}</strong>
          {isFetching && <span className="text-slate-400"> · updating…</span>}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Invoices</span>
            <div className="text-xl font-black font-mono text-dark mt-0.5">{summary.invoices}</div>
            <span className="text-[11px] text-slate-400">{summary.tests} tests ordered</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FlaskConical className="h-4 w-4" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Billed</span>
            <div className="text-xl font-black font-mono text-dark mt-0.5">৳{summary.billed.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400">{summary.discount > 0 ? `৳${summary.discount.toLocaleString()} discount given` : 'After discounts'}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Receipt className="h-4 w-4" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collected</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Wallet className="h-4 w-4" /></div>
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 -mt-1">৳{summary.collected.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${collectedPct}%` }} />
            </div>
            <span className="text-[10px] font-bold text-emerald-700">{collectedPct}%</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl border shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between ${summary.due > 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-slate-100'}`}>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Due</span>
            <div className={`text-xl font-black font-mono mt-0.5 ${summary.due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>৳{summary.due.toLocaleString()}</div>
            {summary.dueCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setPaymentFilter('hasDue');
                  setPage(1);
                }}
                className="text-[11px] text-rose-700 font-semibold hover:underline cursor-pointer"
              >
                {summary.dueCount} invoice{summary.dueCount === 1 ? '' : 's'} with due →
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">Nothing pending</span>
            )}
          </div>
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertCircle className="h-4 w-4" /></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search invoice no, patient, doctor..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Payment:
          </span>
          <div className="w-40">
            <Select
              value={paymentFilter}
              onValueChange={(val) => {
                setPaymentFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="Paid">Fully Paid</SelectItem>
                <SelectItem value="Partial">Partial Paid</SelectItem>
                <SelectItem value="Due">Unpaid / Due</SelectItem>
                <SelectItem value="hasDue">Any due (partial + unpaid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            {/* Primary Header */}
            <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">Tests Ordered</th>
                <th className="py-3.5 px-4">Ref. Doctor</th>
                <th className="py-3.5 px-4">Date & Delivery</th>
                <th className="py-3.5 px-4 text-right">Grand Total & Due</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            {/* Alternating White & Ash Rows */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading diagnostic invoices...</span>
                  </td>
                </tr>
              ) : invoicesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No diagnostic invoices found</p>
                    <p className="text-xs">Click "New Diagnostic POS Order" to generate a bill.</p>
                  </td>
                </tr>
              ) : (
                invoicesList.map((inv, idx) => {
                  const isEven = idx % 2 === 0;
                  const grandTotal = parseFloat(String(inv.grandTotal || 0));
                  const due = parseFloat(String(inv.dueAmount || 0));
                  const items = Array.isArray(inv.items) ? inv.items : [];

                  return (
                    <tr
                      key={inv.id}
                      className={`transition-colors hover:bg-emerald-50/40 ${
                        isEven ? 'bg-white' : 'bg-slate-50/90'
                      }`}
                    >
                      {/* Invoice No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {inv.invoiceNo}
                        </span>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/patients/${inv.patientId}`)}
                          type="button"
                          className="font-bold text-slate-900 hover:text-primary transition text-left cursor-pointer"
                        >
                          {inv.patientName}
                        </button>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-semibold text-slate-600">
                            {inv.patientUniqueId || 'PAT-ID'}
                          </span>
                          <span>•</span>
                          <span>{inv.patientPhone}</span>
                        </div>
                      </td>

                      {/* Tests Ordered */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                            {items.length} Test{items.length > 1 ? 's' : ''}
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px] block">
                            {items
                              .map((t) =>
                                t.quantity && t.quantity > 1
                                  ? `${t.testName} (x${t.quantity})`
                                  : t.testName
                              )
                              .join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {inv.doctorName || 'Dr. Medical Officer'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>
                            {new Date(inv.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-primary font-semibold block">
                          Delivery: {inv.deliveryDate}
                        </span>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900">
                          ৳{grandTotal.toLocaleString()}
                        </span>
                        {due > 0 ? (
                          <span className="block text-[10px] font-bold text-rose-600">
                            Due: ৳{due.toLocaleString()}
                          </span>
                        ) : (
                          <span className="block text-[10px] font-bold text-emerald-600">
                            Paid in Full
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Slip */}
                          <button
                            onClick={() => {
                              setSelectedInvoiceForSlip(inv);
                              setIsSlipOpen(true);
                            }}
                            title="Print / View A4 Lab Voucher"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {/* Settle Due (if due > 0) */}
                          {due > 0 && (
                            <button
                              onClick={() => handleOpenSettle(inv)}
                              title="Settle Outstanding Due"
                              type="button"
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 transition font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>Settle Due</span>
                            </button>
                          )}

                          {/* View Patient Profile */}
                          <button
                            onClick={() => navigate(`/patients/${inv.patientId}`)}
                            title="View Patient Permanent Profile"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <TablePager
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={limit}
          noun="invoices"
          onPageChange={setPage}
          onLimitChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />
      </div>

      {/* Settle Due Modal */}
      {invoiceToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    Settle Diagnostic Due
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {invoiceToSettle.invoiceNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceToSettle(null)}
                className="text-slate-400 hover:text-dark p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{invoiceToSettle.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grand Total:</span>
                <span className="font-semibold text-slate-800">
                  ৳{parseFloat(String(invoiceToSettle.grandTotal)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-semibold text-emerald-700">
                  ৳{parseFloat(String(invoiceToSettle.paidAmount)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-slate-200">
                <span>Current Remaining Due:</span>
                <span>৳{parseFloat(String(invoiceToSettle.dueAmount)).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-3.5 pt-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Amount to Collect (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={parseFloat(String(invoiceToSettle.dueAmount))}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-dark focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <Select value={settleMethod} onValueChange={setSettleMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="bKash / MFS">bKash / MFS</SelectItem>
                    <SelectItem value="Nagad">Nagad</SelectItem>
                    <SelectItem value="Card">Debit / Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceToSettle(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSettling}
                  className="w-1/2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSettling ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Record Payment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Diagnostic Slip Modal */}
      <DiagnosticSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        invoice={selectedInvoiceForSlip}
      />
    </div>
  );
};

export default DiagnosticInvoicesPage;
