import React, { useState } from 'react';
import { History, Loader2, Printer, User, X } from 'lucide-react';
import {
  identityTypeLabel,
  money,
  PAYMENT_STATUS_STYLE,
  paymentTypeLabel,
  STATUS_STYLE,
  useGetShareholderAuditLogsQuery,
  useGetShareholderByIdQuery,
  type ShareholderAddress,
  type ShareholderDetail,
} from '../../store/api/shareholderApi';

const HOSPITAL = {
  name: 'NETRO GENERAL HOSPITAL',
  address: 'Dhanmondi, Dhaka',
  phone: 'Hotline: 10655, 01711-002233',
};

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const personalRows = (s: ShareholderDetail): [string, string][] => [
  ['Shareholder ID', s.shareholderCode || ''],
  ['Applicant Name', s.name],
  ['Email', s.email || ''],
  ['Phone Number', s.phone],
  [identityTypeLabel(s.identityType), s.nid || ''],
  ['TIN Number', s.tinNumber || ''],
  ['Gender', s.gender || ''],
  ['Date of Birth', s.dateOfBirth || ''],
  ['Religion', s.religion || ''],
  ['Marital Status', s.maritalStatus || ''],
  ['Father Name', s.fatherName || ''],
  ['Mother Name', s.motherName || ''],
  ['Spouse Name', s.spouseName || ''],
];

const ADDRESS_ROWS: [keyof ShareholderAddress, string][] = [
  ['house', 'House Address'],
  ['area', 'Area'],
  ['postalCode', 'Postal Code'],
  ['zilla', 'Zilla'],
  ['division', 'Division'],
];

const pct = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : `${Number(v).toFixed(1)}%`);

const activePurchases = (s: ShareholderDetail) => (s.purchases || []).filter((p) => p.paymentStatus !== 'CANCELLED');

const buildPrintHtml = (s: ShareholderDetail) => {
  const pa = s.presentAddress || {};
  const pe = s.permanentAddress || {};
  const nominees = s.nominees || [];
  const purchases = activePurchases(s);
  const now = new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Share Holder Details - ${esc(s.name)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 11px; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { text-align: center; flex: 1; }
  .brand h1 { margin: 0; font-size: 18px; letter-spacing: 1px; color: #0f766e; }
  .brand p { margin: 2px 0; color: #475569; }
  .date { font-size: 10px; color: #475569; }
  h2.title { text-align: center; font-size: 15px; margin: 10px 0 8px; }
  .bar { background: #cfe3f3; border: 1px solid #334155; text-align: center; font-weight: 700; font-size: 13px; padding: 4px; margin: 12px 0 6px; }
  .personal { display: flex; gap: 12px; }
  .personal table { flex: 1; border-collapse: collapse; }
  .personal td { padding: 2.5px 0; vertical-align: top; }
  .personal td.k { font-weight: 700; width: 42%; }
  .photo { width: 120px; height: 140px; border: 1px solid #94a3b8; object-fit: cover; }
  table.grid { width: 100%; border-collapse: collapse; font-size: 10px; }
  table.grid th { background: #dbeaf6; font-weight: 700; padding: 5px; border: 1px solid #cbd5e1; }
  table.grid td { border: 1px solid #e2e8f0; padding: 5px; text-align: center; }
  table.addr td.k { font-weight: 700; text-align: left; width: 18%; }
  table.addr td.v { text-align: left; width: 32%; }
  .sign { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; }
  .sign div { border-top: 1px solid #475569; padding-top: 3px; width: 160px; text-align: center; }
  .foot { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
</style></head><body>
  <div class="head">
    <div style="width:110px"></div>
    <div class="brand"><h1>${HOSPITAL.name}</h1><p>${HOSPITAL.address}</p><p>${HOSPITAL.phone}</p></div>
    <div class="date" style="width:110px;text-align:right">${esc(now)}</div>
  </div>
  <h2 class="title">Share Holder Details</h2>

  <div class="bar">Personal Details</div>
  <div class="personal">
    <table>${personalRows(s).map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>: ${esc(v)}</td></tr>`).join('')}</table>
    ${s.photo ? `<img class="photo" src="${esc(s.photo)}" />` : ''}
  </div>

  <div class="bar">Address Information</div>
  <table class="grid addr">
    <tr><th colspan="2">PRESENT ADDRESS</th><th colspan="2">PERMANENT ADDRESS</th></tr>
    ${ADDRESS_ROWS.map(([key, label]) => `<tr><td class="k">${label}</td><td class="v">${esc(pa[key])}</td><td class="k">${label}</td><td class="v">${esc(pe[key])}</td></tr>`).join('')}
  </table>

  <div class="bar">Nominee Information</div>
  <table class="grid">
    <tr><th>SL</th><th>NAME</th><th>PHONE</th><th>SHARE</th><th>RELATIONSHIP</th><th>ADDRESS</th></tr>
    ${
      nominees.length
        ? nominees
            .map((n, i) => `<tr><td>${i + 1}</td><td>${esc(n.name)}</td><td>${esc(n.phone)}</td><td>${pct(n.sharePercent)}</td><td>${esc(n.relationship)}</td><td>${esc(n.address)}</td></tr>`)
            .join('')
        : '<tr><td colspan="6">No nominee</td></tr>'
    }
  </table>

  <div class="bar">Available Shares</div>
  <table class="grid">
    <tr><th>SL</th><th>PACKAGE</th><th>SHARE NO</th><th>PAYMENT</th><th>PURCHASED</th><th>REFERENCE</th><th>TOTAL</th><th>PAID</th><th>DUE</th></tr>
    ${
      purchases.length
        ? purchases
            .map(
              (x, i) =>
                `<tr><td>${i + 1}</td><td>${esc(x.planNameSnapshot)}</td><td>${esc(x.shareNumber)}</td><td>${esc(paymentTypeLabel(x.paymentType))}</td><td>${esc(x.purchaseDate)}</td><td>${esc(x.referenceName)}</td><td>${esc(money(x.totalAmount))}</td><td>${esc(money(x.paidAmount))}</td><td>${esc(money(x.dueAmount))}</td></tr>`
            )
            .join('')
        : '<tr><td colspan="9">No share recorded</td></tr>'
    }
  </table>

  <div class="sign"><div>Shareholder Signature</div><div>Authorized Signature</div></div>
  <div class="foot"><span>Printed from Netro Hospital Management System</span><span>Page 1 of 1</span></div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 300); };</script>
</body></html>`;
};

export const printShareholderDetails = (s: ShareholderDetail) => {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) {
    alert('Please allow pop-ups to print.');
    return;
  }
  w.document.write(buildPrintHtml(s));
  w.document.close();
};

/* ------------------------------------------------------------------ */
/* Read-only profile view — used by the admin modal and the shareholder */
/* ------------------------------------------------------------------ */

const Row: React.FC<{ k: string; v?: string | null }> = ({ k, v }) => (
  <div className="flex text-xs py-1.5 border-b border-slate-100 last:border-0">
    <span className="w-40 shrink-0 font-semibold text-slate-500">{k}</span>
    <span className="text-slate-900 break-words min-w-0">{v || <span className="text-slate-300">—</span>}</span>
  </div>
);

const Bar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg bg-sky-50 border border-sky-100 text-center text-xs font-bold text-slate-800 py-1.5 mt-5 mb-2">{children}</div>
);

const Img: React.FC<{ src?: string | null; label: string; className: string }> = ({ src, label, className }) =>
  src ? (
    <a href={src} target="_blank" rel="noreferrer" title={`Open ${label}`}>
      <img src={src} alt={label} className={`${className} object-cover rounded-lg border border-slate-200`} />
    </a>
  ) : null;

export const ShareholderProfileView: React.FC<{ shareholder: ShareholderDetail; showAdminFields?: boolean }> = ({
  shareholder: s,
  showAdminFields,
}) => {
  const pa = s.presentAddress || {};
  const pe = s.permanentAddress || {};
  const purchases = activePurchases(s);
  const sum = (k: 'totalAmount' | 'paidAmount' | 'dueAmount') => purchases.reduce((t, p) => t + Number(p[k] || 0), 0);

  return (
    <div>
      <Bar>Personal Details</Bar>
      <div className="flex flex-col-reverse sm:flex-row gap-5">
        <div className="flex-1 min-w-0">
          {personalRows(s).map(([k, v]) => (
            <Row key={k} k={k} v={v} />
          ))}
          {(s.nidFrontImage || s.nidBackImage) && (
            <div className="flex gap-3 pt-3">
              <div className="text-center">
                <Img src={s.nidFrontImage} label="ID front" className="h-20 w-32" />
                {s.nidFrontImage && <span className="text-[10px] text-slate-400">Front</span>}
              </div>
              <div className="text-center">
                <Img src={s.nidBackImage} label="ID back" className="h-20 w-32" />
                {s.nidBackImage && <span className="text-[10px] text-slate-400">Back</span>}
              </div>
            </div>
          )}
        </div>
        <div className="h-36 w-28 shrink-0 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          {s.photo ? <img src={s.photo} alt={s.name} className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-300" />}
        </div>
      </div>

      <Bar>Address Information</Bar>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            ['Present Address', pa],
            ['Permanent Address', pe],
          ] as [string, ShareholderAddress][]
        ).map(([title, a]) => (
          <div key={title} className="rounded-lg border border-slate-200 px-3 py-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 py-1">{title}</p>
            {ADDRESS_ROWS.map(([key, label]) => (
              <Row key={key} k={label} v={a[key]} />
            ))}
          </div>
        ))}
      </div>

      <Bar>Nominee Information</Bar>
      {(s.nominees || []).length === 0 ? (
        <p className="text-center text-xs text-slate-400 py-3">No nominee</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(s.nominees || []).map((n, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3 flex gap-3 text-xs">
              <div className="h-16 w-14 shrink-0 rounded-md bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                {n.photo ? <img src={n.photo} alt={n.name} className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-slate-300" />}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-slate-900">
                  {n.name}{' '}
                  {pct(n.sharePercent) !== '—' && (
                    <span className="ml-1 px-1.5 py-px rounded bg-teal-50 text-teal-800 text-[10px] font-bold">{pct(n.sharePercent)}</span>
                  )}
                </div>
                <div className="text-slate-500">{[n.relationship, n.phone].filter(Boolean).join(' • ') || '—'}</div>
                {n.nid && <div className="text-slate-500 font-mono text-[11px]">NID: {n.nid}</div>}
                {n.address && <div className="text-slate-500">{n.address}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Bar>Available Shares</Bar>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-200 min-w-[640px]">
          <thead className="bg-sky-50 text-[10px] uppercase text-slate-600">
            <tr>
              {['SL', 'Package', 'Share No', 'Payment', 'Purchased', 'Reference', 'Total', 'Paid', 'Due', 'Status'].map((h) => (
                <th key={h} className="p-2 border border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-3 text-center text-slate-400">No share recorded</td>
              </tr>
            ) : (
              purchases.map((x, i) => (
                <tr key={x.id} className="text-center">
                  <td className="p-2 border border-slate-200">{i + 1}</td>
                  <td className="p-2 border border-slate-200">{x.planNameSnapshot}</td>
                  <td className="p-2 border border-slate-200 font-mono">{x.shareNumber}</td>
                  <td className="p-2 border border-slate-200">{paymentTypeLabel(x.paymentType)}</td>
                  <td className="p-2 border border-slate-200">{x.purchaseDate}</td>
                  <td className="p-2 border border-slate-200">{x.referenceName}</td>
                  <td className="p-2 border border-slate-200 font-mono">{money(x.totalAmount)}</td>
                  <td className="p-2 border border-slate-200 font-mono text-emerald-700">{money(x.paidAmount)}</td>
                  <td className="p-2 border border-slate-200 font-mono text-amber-700">{money(x.dueAmount)}</td>
                  <td className="p-2 border border-slate-200">
                    <span className={`px-1.5 py-px rounded border text-[10px] font-bold ${PAYMENT_STATUS_STYLE[x.paymentStatus] || ''}`}>{x.paymentStatus}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {purchases.length > 1 && (
            <tfoot className="bg-slate-50 font-bold">
              <tr className="text-center">
                <td colSpan={6} className="p-2 border border-slate-200 text-right">Total</td>
                <td className="p-2 border border-slate-200 font-mono">{money(sum('totalAmount'))}</td>
                <td className="p-2 border border-slate-200 font-mono text-emerald-700">{money(sum('paidAmount'))}</td>
                <td className="p-2 border border-slate-200 font-mono text-amber-700">{money(sum('dueAmount'))}</td>
                <td className="p-2 border border-slate-200" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showAdminFields && (s.notes || s.bankAccountDetails) && (
        <>
          <Bar>Admin Only</Bar>
          <Row k="Bank for payout" v={s.bankAccountDetails} />
          <Row k="Notes" v={s.notes} />
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Admin modal                                                         */
/* ------------------------------------------------------------------ */

const ACTION_LABEL: Record<string, string> = {
  SHAREHOLDER_CREATED: 'Created',
  SHAREHOLDER_UPDATED: 'Updated',
  SHAREHOLDER_STATUS_CHANGED: 'Status changed',
  SHAREHOLDER_DELETED: 'Removed',
  LOGIN_CREATED: 'Login created',
  LOGIN_UPDATED: 'Login changed',
  PASSWORD_RESET: 'Password reset',
};

const ActivityTab: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = useGetShareholderAuditLogsQuery(id);
  if (isLoading) return <p className="py-10 text-center text-xs text-slate-400">Loading activity...</p>;
  const logs = data?.data || [];
  if (!logs.length) return <p className="py-10 text-center text-xs text-slate-400">No activity recorded yet.</p>;
  return (
    <ol className="relative border-l border-slate-200 ml-2 mt-2 space-y-4">
      {logs.map((l) => (
        <li key={l.id} className="ml-4">
          <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-teal-500 border-2 border-white" />
          <div className="text-xs">
            <span className="font-bold text-slate-900">{ACTION_LABEL[l.action] || l.action}</span>
            <span className="text-slate-400"> · {l.actorName || 'System'} · {new Date(l.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          {l.summary && <p className="text-[11px] text-slate-600 mt-0.5">{l.summary}</p>}
        </li>
      ))}
    </ol>
  );
};

export const ShareholderDetailsModal: React.FC<{ shareholderId: string; isAdmin?: boolean; onClose: () => void }> = ({
  shareholderId,
  isAdmin,
  onClose,
}) => {
  const { data, isLoading, isError } = useGetShareholderByIdQuery(shareholderId);
  const [tab, setTab] = useState<'profile' | 'activity'>('profile');
  const s = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{s ? s.name : 'Share Holder Details'}</h3>
            {s && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono">{s.shareholderCode}</span>
                <span className={`px-1.5 py-px rounded text-[10px] font-bold ${STATUS_STYLE[s.status] || ''}`}>{s.status}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                <button type="button" onClick={() => setTab('profile')} className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${tab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                  Profile
                </button>
                <button type="button" onClick={() => setTab('activity')} className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer ${tab === 'activity' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                  <History className="h-3 w-3" /> Activity
                </button>
              </div>
            )}
            <button
              type="button"
              disabled={!s}
              onClick={() => s && printShareholderDetails(s)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6">
          {isLoading && (
            <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
          {isError && <p className="py-16 text-center text-xs text-rose-600">Could not load this shareholder.</p>}
          {s && tab === 'profile' && <ShareholderProfileView shareholder={s} showAdminFields />}
          {s && tab === 'activity' && <ActivityTab id={s.id} />}
        </div>
      </div>
    </div>
  );
};

export default ShareholderDetailsModal;
