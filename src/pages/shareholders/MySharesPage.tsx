import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Eye, Loader2, Printer, Receipt, Ticket, Wallet } from 'lucide-react';
import { money, STATUS_STYLE, useGetMyShareholderProfileQuery } from '../../store/api/shareholderApi';
import { printShareholderDetails, ShareholderProfileView } from '../../components/shareholders/ShareholderDetailsModal';

/** Shareholder portal: own profile, nominees, shares and payments — view only. */
export const MySharesPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGetMyShareholderProfileQuery();
  const s = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your shareholding...
      </div>
    );
  }
  if (isError || !s) {
    return (
      <div className="max-w-lg mx-auto mt-16 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
        {(error as any)?.data?.message || 'Your shareholder profile could not be loaded. Please contact the hospital admin.'}
      </div>
    );
  }

  const ps = s.purchaseSummary;
  const cards = [
    { label: 'Shares held', value: String(ps?.purchaseCount ?? 0), icon: Ticket, cls: 'text-slate-900' },
    { label: 'Total amount', value: money(ps?.totalAmount), icon: Wallet, cls: 'text-slate-900' },
    { label: 'Paid', value: money(ps?.paidAmount), icon: Wallet, cls: 'text-emerald-700' },
    { label: 'Due', value: money(ps?.dueAmount), icon: Wallet, cls: (ps?.dueAmount || 0) > 0 ? 'text-amber-700' : 'text-slate-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16 text-slate-900">
      <div className="bg-white rounded-2xl px-5 py-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {s.photo ? (
            <img src={s.photo} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center">{s.name.charAt(0)}</div>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight">{s.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono">{s.shareholderCode}</span>
              <span className={`px-1.5 py-px rounded text-[10px] font-bold ${STATUS_STYLE[s.status] || ''}`}>{s.status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/expenses" className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5" /> Hospital expenses
          </Link>
          <Link to="/equipment" className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" /> Equipment
          </Link>
          <button
            type="button"
            onClick={() => printShareholderDetails(s)}
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              {c.label}
              <c.icon className="h-4 w-4 text-slate-300" />
            </div>
            <div className={`mt-1 text-xl font-black font-mono ${c.cls}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-4 py-2.5 flex items-center gap-2">
        <Eye className="h-4 w-4 text-indigo-600 shrink-0" />
        <span>
          <strong>View only.</strong> To correct any detail, please contact the hospital administration.
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs px-5 pb-6">
        <ShareholderProfileView shareholder={s} />
      </div>
    </div>
  );
};

export default MySharesPage;
