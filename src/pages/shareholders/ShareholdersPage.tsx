import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Ticket,
  Wallet,
  Edit2,
  FileText,
  KeyRound,
  Layers,
  Phone,
  PieChart,
  Plus,
  Power,
  Search,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';
import {
  money,
  PAYMENT_STATUSES,
  SHAREHOLDER_STATUSES,
  STATUS_STYLE,
  useDeleteShareholderMutation,
  useGetShareholdersQuery,
  useGetSharePlansQuery,
  useUpdateShareholderAccountMutation,
  useUpdateShareholderStatusMutation,
  type Shareholder,
} from '../../store/api/shareholderApi';
import { useAppSelector } from '../../store/hooks';
import { Pagination } from '../../components/common/Pagination';
import { ShareholderAccountModal } from '../../components/shareholders/ShareholderAccountModal';
import { ShareholderDetailsModal } from '../../components/shareholders/ShareholderDetailsModal';

const PAGE_SIZE = 20;
const COLORS = ['bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-emerald-600', 'bg-rose-500', 'bg-indigo-500'];
const selectCls = 'h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:border-teal-500 focus:outline-hidden';

export const ShareholdersPage: React.FC = () => {
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const isAdmin = role === 'admin' || role === 'super_admin';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planId, setPlanId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: response, isLoading, isFetching } = useGetShareholdersQuery({ page, limit: PAGE_SIZE, search, status, planId, paymentStatus });
  const { data: plansRes } = useGetSharePlansQuery();
  const [deleteShareholder] = useDeleteShareholderMutation();
  const [updateAccount] = useUpdateShareholderAccountMutation();
  const [updateStatus] = useUpdateShareholderStatusMutation();

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [accountModal, setAccountModal] = useState<{ s: Shareholder; mode: 'create' | 'reset' } | null>(null);

  const list = response?.data || [];
  const pagination = response?.pagination;
  const metrics = response?.metrics || {
    totalShareholders: 0,
    totalOwnershipAllocated: 0,
    availableOwnershipPercentage: 100,
    totalCapital: 0,
    shareSales: undefined,
    hospitalFinancialSummary: { totalIncome: 0, totalExpense: 0, netProfit: 0 },
  };
  const sales = metrics.shareSales || {
    sharesSold: 0,
    unitsSold: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    overdueAmount: 0,
    shareholdersWithDue: 0,
    byPlan: [],
  };
  const collectedPct = sales.totalAmount > 0 ? Math.round((sales.paidAmount / sales.totalAmount) * 100) : 0;
  const plans = plansRes?.data || [];
  const hasFilters = !!(search || status || planId || paymentStatus);

  const handleDelete = async (s: Shareholder) => {
    if (!confirm(`Remove shareholder "${s.name}"?\n\nThe record and its history are kept for audit, but it disappears from lists and the login is disabled.`)) return;
    try {
      await deleteShareholder(s.id).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to remove shareholder.');
    }
  };

  const handleToggleAccess = async (s: Shareholder) => {
    if (!s.account) return;
    const next = !s.account.isActive;
    if (!confirm(`${next ? 'Enable' : 'Disable'} login for ${s.name} (${s.account.email})?`)) return;
    try {
      await updateAccount({ id: s.id, isActive: next }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update login access.');
    }
  };

  const handleStatus = async (s: Shareholder, next: string) => {
    if (next === s.status) return;
    const reason = next === 'Rejected' || next === 'Inactive' ? prompt(`Reason for marking ${s.name} as ${next}? (optional)`) ?? undefined : undefined;
    try {
      await updateStatus({ id: s.id, status: next, reason: reason || undefined }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to change status.');
    }
  };

  return (
    <div className="space-y-5 pb-12 select-none font-sans text-dark">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <PieChart className="h-4 w-4" />
            <span>Shareholder Management</span>
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight">Shareholder Panel</h1>
          <p className="text-xs text-slate-500 mt-0.5">Profiles, nominees, purchased shares and payments, and shareholder logins.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/shareholders/plans"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
          >
            <Layers className="h-4 w-4" /> Share Plans
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/shareholders/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Shareholder
            </button>
          )}
        </div>
      </div>

      {/* Share sales — the main numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Shares Sold</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-1">{sales.sharesSold}</div>
          <p className="text-[11px] text-slate-400">
            to {metrics.totalShareholders} shareholder{metrics.totalShareholders === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Sales</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-1">{money(sales.totalAmount)}</div>
          <p className="text-[11px] text-slate-400">Value of all shares sold</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Collected</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{money(sales.paidAmount)}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${collectedPct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-emerald-700">{collectedPct}%</span>
          </div>
        </div>

        <div className={`rounded-2xl p-4 border shadow-xs ${sales.dueAmount > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Due</span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-1 ${sales.dueAmount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{money(sales.dueAmount)}</div>
          <p className="text-[11px] text-slate-500">
            {sales.shareholdersWithDue > 0
              ? `${sales.shareholdersWithDue} shareholder${sales.shareholdersWithDue === 1 ? '' : 's'} owe money`
              : 'Nothing due'}
            {sales.overdueAmount > 0 && <span className="text-rose-600 font-semibold"> · {money(sales.overdueAmount)} overdue</span>}
          </p>
        </div>
      </div>

      {/* Sales by plan */}
      {sales.byPlan.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Sales by plan</span>
            <Link to="/shareholders/plans" className="text-[11px] font-semibold text-teal-700 hover:underline">
              Manage plans →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-slate-500 bg-slate-50">
                <tr>
                  <th className="py-2 px-4 text-left">Plan</th>
                  <th className="py-2 px-4 text-right">Sold</th>
                  <th className="py-2 px-4 text-right">Sales</th>
                  <th className="py-2 px-4 text-right">Collected</th>
                  <th className="py-2 px-4 text-right">Due</th>
                  <th className="py-2 px-4 w-40">Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.byPlan.map((p) => {
                  const pct = p.total > 0 ? Math.round((p.paid / p.total) * 100) : 0;
                  return (
                    <tr key={`${p.planId}-${p.planName}`}>
                      <td className="py-2 px-4 font-semibold text-slate-800">{p.planName}</td>
                      <td className="py-2 px-4 text-right font-mono">{p.sold}</td>
                      <td className="py-2 px-4 text-right font-mono">{money(p.total)}</td>
                      <td className="py-2 px-4 text-right font-mono text-emerald-700">{money(p.paid)}</td>
                      <td className={`py-2 px-4 text-right font-mono ${p.due > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>{money(p.due)}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hospital / equity figures (secondary) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-xs flex items-center gap-3">
          <PieChart className="h-4 w-4 text-teal-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Allocated equity</div>
            <div className="text-sm font-black text-dark">
              {Number(metrics.totalOwnershipAllocated.toFixed(2))}%{' '}
              <span className="text-[11px] font-medium text-slate-400">· {Number(metrics.availableOwnershipPercentage.toFixed(2))}% unallocated</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-xs flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Hospital net profit</div>
            <div className="text-sm font-black text-emerald-700">
              {money(metrics.hospitalFinancialSummary.netProfit)}{' '}
              <span className="text-[11px] font-medium text-slate-400">
                · Rev {money(metrics.hospitalFinancialSummary.totalIncome)} / Exp {money(metrics.hospitalFinancialSummary.totalExpense)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-xs flex items-center gap-3">
          <Award className="h-4 w-4 text-purple-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Capital invested (profiles)</div>
            <div className="text-sm font-black text-purple-900">{money(metrics.totalCapital)}</div>
          </div>
        </div>
      </div>

      {/* Ownership bar (shareholders on this page) */}
      {list.some((x) => Number(x.ownershipPercentage) > 0) && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Ownership distribution</span>
            <span className="text-slate-400 text-[11px]">Shareholders listed below</span>
          </div>
          <div className="h-3.5 w-full bg-slate-100 rounded-xl overflow-hidden flex">
            {list.map((s, idx) => (
              <div key={s.id} className={`${COLORS[idx % COLORS.length]} h-full`} style={{ width: `${Number(s.ownershipPercentage) || 0}%` }} title={`${s.name}: ${s.ownershipPercentage}%`} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {list
              .filter((s) => Number(s.ownershipPercentage) > 0)
              .map((s, idx) => (
                <div key={s.id} className="flex items-center gap-1.5 text-[11px]">
                  <div className={`h-2.5 w-2.5 rounded-full ${COLORS[idx % COLORS.length]}`} />
                  <span className="font-semibold text-slate-700">{s.name}</span>
                  <span className="font-mono font-bold text-slate-500">({Number(s.ownershipPercentage)}%)</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, phone, email, SH-ID, share no..."
              className="h-8.5 w-full lg:w-72 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:border-teal-500 focus:outline-hidden"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className={selectCls} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {SHAREHOLDER_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select className={selectCls} value={planId} onChange={(e) => { setPlanId(e.target.value); setPage(1); }}>
              <option value="">All plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select className={selectCls} value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
              <option value="">Any payment</option>
              {PAYMENT_STATUSES.filter((s) => s !== 'CANCELLED').map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setStatus(''); setPlanId(''); setPaymentStatus(''); setPage(1); }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Shareholder</th>
                <th className="py-3 px-4">Shares</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Ownership</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading shareholders...</td>
                </tr>
              )}
              {!isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {hasFilters ? 'No shareholder matches these filters.' : 'No shareholders yet. Click "Add Shareholder".'}
                  </td>
                </tr>
              )}
              {list.map((s) => {
                const ps = s.purchaseSummary;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition align-top">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {s.photo ? (
                          <img src={s.photo} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-dark">{s.name}</div>
                          <div className="font-mono text-[10px] font-semibold text-slate-400">{s.shareholderCode}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="h-2.5 w-2.5 text-teal-600" /> {s.phone}
                            {s.nid && <span className="ml-1">• ID {s.nid}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {ps?.purchaseCount ? (
                        <>
                          <div className="font-semibold text-slate-800">
                            {ps.purchaseCount} share{ps.purchaseCount > 1 ? 's' : ''}
                            <span className="font-normal text-slate-400"> · {ps.planNames.join(', ')}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {ps.shareNumbers.slice(0, 3).join(', ')}
                            {ps.shareNumbers.length > 3 ? ` +${ps.shareNumbers.length - 3}` : ''}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {ps?.purchaseCount ? (
                        <>
                          <div className="font-mono text-emerald-700 font-semibold">{money(ps.paidAmount)} paid</div>
                          <div className={`font-mono text-[11px] ${ps.dueAmount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
                            {ps.dueAmount > 0 ? `${money(ps.dueAmount)} due` : 'No due'}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-extrabold">{Number(s.ownershipPercentage)}%</span>
                      <div className="text-[10px] text-slate-400 mt-1">Profit share {money(s.calculatedEarning)}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {s.account ? (
                        <div className="space-y-1">
                          <div className="font-mono text-slate-700 truncate max-w-[170px]" title={s.account.email}>{s.account.email}</div>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-px rounded text-[10px] font-bold ${s.account.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                              {s.account.isActive ? 'Active' : 'Disabled'}
                            </span>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setAccountModal({ s, mode: 'reset' })}
                                  className="px-1.5 py-px rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] font-semibold whitespace-nowrap cursor-pointer"
                                >
                                  Reset password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAccess(s)}
                                  title={s.account.isActive ? 'Disable login' : 'Enable login'}
                                  className={`p-0.5 rounded cursor-pointer ${s.account.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600 hover:text-emerald-700'}`}
                                >
                                  <Power className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setAccountModal({ s, mode: 'create' })}
                          className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="h-3 w-3" /> Create login
                        </button>
                      ) : (
                        <span className="text-slate-300">No login</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <select
                          value={s.status}
                          onChange={(e) => handleStatus(s, e.target.value)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold border-0 cursor-pointer focus:outline-hidden ${STATUS_STYLE[s.status] || 'bg-slate-100'}`}
                        >
                          {SHAREHOLDER_STATUSES.map((st) => (
                            <option key={st}>{st}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[s.status] || 'bg-slate-100'}`}>{s.status}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailsId(s.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                          title="Full details / Print"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/shareholders/edit/${s.id}`)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(s)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              itemsPerPage={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {accountModal && (
        <ShareholderAccountModal shareholder={accountModal.s} mode={accountModal.mode} onClose={() => setAccountModal(null)} />
      )}
      {detailsId && <ShareholderDetailsModal shareholderId={detailsId} isAdmin={isAdmin} onClose={() => setDetailsId(null)} />}
    </div>
  );
};

export default ShareholdersPage;
