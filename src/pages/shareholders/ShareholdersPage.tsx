import React, { useState } from 'react';
import {
  PieChart,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  ShieldAlert,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  X,
  CreditCard,
  Lock,
  ArrowUpRight,
  Receipt,
  Award,
} from 'lucide-react';
import {
  useGetShareholdersQuery,
  useCreateShareholderMutation,
  useUpdateShareholderMutation,
  useDeleteShareholderMutation,
  type Shareholder,
} from '../../store/api/shareholderApi';

export const ShareholdersPage: React.FC = () => {
  const { data: response, isLoading } = useGetShareholdersQuery();
  const [createShareholder, { isLoading: isCreating }] = useCreateShareholderMutation();
  const [updateShareholder, { isLoading: isUpdating }] = useUpdateShareholderMutation();
  const [deleteShareholder] = useDeleteShareholderMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nid, setNid] = useState('');
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>('10');
  const [investmentAmount, setInvestmentAmount] = useState<string>('1000000');
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Read-only Investor Portal simulation
  const [viewOnlyShareholder, setViewOnlyShareholder] = useState<Shareholder | null>(null);

  const shareholdersList = response?.data || [];
  const metrics = response?.metrics || {
    totalShareholders: 0,
    totalOwnershipAllocated: 0,
    availableOwnershipPercentage: 100,
    hospitalFinancialSummary: {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
    },
  };

  const handleOpenAdd = () => {
    setEditingShareholder(null);
    setName('');
    setPhone('');
    setEmail('');
    setNid('');
    setOwnershipPercentage('10');
    setInvestmentAmount('1000000');
    setBankAccountDetails('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Shareholder) => {
    setEditingShareholder(s);
    setName(s.name);
    setPhone(s.phone);
    setEmail(s.email || '');
    setNid(s.nid || '');
    setOwnershipPercentage(String(s.ownershipPercentage));
    setInvestmentAmount(String(s.investmentAmount || ''));
    setBankAccountDetails(s.bankAccountDetails || '');
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(ownershipPercentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      alert('Please enter a valid ownership percentage between 1 and 100.');
      return;
    }

    try {
      if (editingShareholder) {
        await updateShareholder({
          id: editingShareholder.id,
          data: {
            name,
            phone,
            email,
            nid,
            ownershipPercentage: pct,
            investmentAmount: parseFloat(investmentAmount) || 0,
            bankAccountDetails,
            notes,
          },
        }).unwrap();
      } else {
        await createShareholder({
          name,
          phone,
          email,
          nid,
          ownershipPercentage: pct,
          investmentAmount: parseFloat(investmentAmount) || 0,
          bankAccountDetails,
          notes,
          status: 'Active',
        }).unwrap();
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save shareholder.');
    }
  };

  const handleDelete = async (id: string, sName: string) => {
    if (confirm(`Are you sure you want to remove shareholder "${sName}"?`)) {
      await deleteShareholder(id);
    }
  };

  return (
    <div className="space-y-5 pb-12 select-none font-sans text-dark">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <PieChart className="h-4 w-4" />
            <span>Section 4.7 — Hospital Ownership & Dividend Governance</span>
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight">Shareholder Panel</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital equity partners, ownership allocations (%), and calculated profit dividends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shareholder</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Equity */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Allocated Equity</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark">
            {metrics.totalOwnershipAllocated}%
          </div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
            <span>Available unallocated: {metrics.availableOwnershipPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-teal-600 h-full rounded-full"
              style={{ width: `${Math.min(100, metrics.totalOwnershipAllocated)}%` }}
            />
          </div>
        </div>

        {/* Hospital Net Profit */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Hospital Net Profit</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ৳{metrics.hospitalFinancialSummary.netProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Revenue: ৳{metrics.hospitalFinancialSummary.totalIncome.toLocaleString()} | Exp: ৳{metrics.hospitalFinancialSummary.totalExpense.toLocaleString()}
          </p>
        </div>

        {/* Total Shareholders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Active Shareholders</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark">{metrics.totalShareholders} Partners</div>
          <p className="text-[11px] text-slate-400">Registered board stakeholders</p>
        </div>

        {/* Total Capital */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Capital Injected</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">
            ৳
            {shareholdersList
              .reduce((sum, s) => sum + Number(s.investmentAmount || 0), 0)
              .toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Total hospital paid-up equity</p>
        </div>
      </div>

      {/* 3. Equity Share Distribution Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Equity Breakdown & Ownership Distribution</span>
          <span className="font-mono text-slate-400 text-[11px]">100% Total Ownership</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-xl overflow-hidden flex">
          {shareholdersList.map((s, idx) => {
            const colors = ['bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-emerald-600'];
            const color = colors[idx % colors.length];
            return (
              <div
                key={s.id}
                className={`${color} h-full relative group transition-all`}
                style={{ width: `${s.ownershipPercentage}%` }}
                title={`${s.name}: ${s.ownershipPercentage}%`}
              />
            );
          })}
          {metrics.availableOwnershipPercentage > 0 && (
            <div
              className="bg-slate-200 h-full"
              style={{ width: `${metrics.availableOwnershipPercentage}%` }}
              title={`Treasury: ${metrics.availableOwnershipPercentage}%`}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          {shareholdersList.map((s, idx) => {
            const colors = ['bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-emerald-600'];
            const color = colors[idx % colors.length];
            return (
              <div key={s.id} className="flex items-center gap-1.5 text-[11px]">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="font-semibold text-slate-700">{s.name}</span>
                <span className="font-mono font-bold text-slate-500">({s.ownershipPercentage}%)</span>
              </div>
            );
          })}
          {metrics.availableOwnershipPercentage > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span>Hospital Treasury ({metrics.availableOwnershipPercentage}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Shareholders Master Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-dark">Board of Shareholders</h3>
            <p className="text-[11px] text-slate-400">
              Detailed list with individual ownership % and real-time calculated dividend share
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            {shareholdersList.length} Partners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Shareholder Name</th>
                <th className="py-3 px-4">Ownership (%)</th>
                <th className="py-3 px-4">Investment Capital</th>
                <th className="py-3 px-4">Calculated Profit Share (৳)</th>
                <th className="py-3 px-4">Bank & Payout A/C</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shareholdersList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-dark">{s.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-2.5 w-2.5 text-teal-600" />
                        {s.phone}
                      </span>
                      {s.email && (
                        <span>• {s.email}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-xs">
                      {s.ownershipPercentage}%
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-700">
                    ৳{Number(s.investmentAmount || 0).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-emerald-700 text-sm">
                      ৳{Number(s.calculatedEarning || 0).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Based on Net Profit: ৳{metrics.hospitalFinancialSummary.netProfit.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs text-[11px] text-slate-600 truncate">
                    {s.bankAccountDetails || 'N/A'}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewOnlyShareholder(s)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                        title="Simulate Read-Only Shareholder Portal (Section 4.7)"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove Partner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">
                {editingShareholder ? 'Edit Shareholder' : 'Add New Hospital Shareholder'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alhaj Mobarok Hossain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="partner@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">National ID (NID)</label>
                  <input
                    type="text"
                    placeholder="19xxxxxxxxxxxx"
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ownership Share (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15"
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-teal-300 bg-teal-50 text-xs font-extrabold text-teal-800 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Capital Invested (৳)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2000000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Bank & Routing Details for Dividend Payout</label>
                <input
                  type="text"
                  placeholder="e.g. Islami Bank, Gulshan Branch, A/C: 2050123456"
                  value={bankAccountDetails}
                  onChange={(e) => setBankAccountDetails(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Notes / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Director, Founding Partner"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition shadow-xs"
                >
                  {editingShareholder ? 'Save Changes' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. STRICTLY READ-ONLY SHAREHOLDER PORTAL (Section 4.7 Requirement) */}
      {viewOnlyShareholder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-300" />
                <div>
                  <h3 className="text-sm font-bold">Shareholder Statement (Read-Only Mode)</h3>
                  <p className="text-[10px] text-teal-200">As specified in Section 4.7 of proposal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewOnlyShareholder(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Partner Details */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Partner Name</span>
                  <div className="text-base font-black text-dark">{viewOnlyShareholder.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Phone: {viewOnlyShareholder.phone} • NID: {viewOnlyShareholder.nid || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Equity Share</span>
                  <div className="text-2xl font-black text-teal-800">
                    {viewOnlyShareholder.ownershipPercentage}%
                  </div>
                </div>
              </div>

              {/* Calculated Earnings Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Hospital Net Profit</span>
                  <div className="text-lg font-black text-dark">
                    ৳{metrics.hospitalFinancialSummary.netProfit.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">Total hospital operational gain</span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Your Dividend Share</span>
                  <div className="text-xl font-black text-emerald-800">
                    ৳{Number(viewOnlyShareholder.calculatedEarning || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Calculated at {viewOnlyShareholder.ownershipPercentage}% rate
                  </span>
                </div>
              </div>

              {/* Bank Payout Info */}
              <div className="p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Dividend Deposit Account</span>
                <p className="font-semibold text-slate-800">
                  {viewOnlyShareholder.bankAccountDetails || 'No bank account details provided'}
                </p>
              </div>

              {/* Read Only Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Read-Only Notice:</strong> In accordance with hospital governance rules, shareholders
                  have viewing permission for audit verification only. Changes must be requested via the Board Admin.
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewOnlyShareholder(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs cursor-pointer hover:bg-slate-900 transition"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareholdersPage;

