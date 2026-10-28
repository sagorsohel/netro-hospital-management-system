import React from 'react';
import { CreditCard, Receipt, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BillingPage: React.FC = () => {
  const invoices = [
    {
      id: 'INV-2026-0841',
      patient: 'Md. Tariqul Islam',
      department: 'Cardiology',
      amount: '$450.00',
      date: 'Oct 28, 2026',
      status: 'Paid',
      method: 'Credit Card',
    },
    {
      id: 'INV-2026-0840',
      patient: 'Farhana Akhter',
      department: 'Gynecology',
      amount: '$180.00',
      date: 'Oct 28, 2026',
      status: 'Pending',
      method: 'Insurance Claim',
    },
    {
      id: 'INV-2026-0839',
      patient: 'Kamrul Hassan',
      department: 'Neurology',
      amount: '$920.00',
      date: 'Oct 27, 2026',
      status: 'Paid',
      method: 'Direct Cash',
    },
    {
      id: 'INV-2026-0838',
      patient: 'Salma Khatun',
      department: 'Pediatrics',
      amount: '$120.00',
      date: 'Oct 27, 2026',
      status: 'Pending',
      method: 'Mobile Banking',
    },
    {
      id: 'INV-2026-0837',
      patient: 'Zakir Hossain',
      department: 'Orthopedics',
      amount: '$650.00',
      date: 'Oct 26, 2026',
      status: 'Paid',
      method: 'Health Insurance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-dark tracking-tight">
            Diagnostic & IPD Billing
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Barcoded billing, itemized bed charges, lab test invoices, and automated patient receipts.
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors">
          + Generate Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/90">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Billed Today</span>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-dark mt-2">$8,450.00</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +14.2% from yesterday
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/90">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Collected Cash / Card</span>
            <Receipt className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-dark mt-2">$6,820.00</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">81% clearance rate</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/90">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Claims</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-dark mt-2">$1,630.00</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">4 claims awaiting approval</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/90">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Invoices</span>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-2xl font-black text-dark mt-2">128</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">98% customer satisfaction</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-dark">Recent Invoices & Transactions</h3>
          <Link to="/dashboard" className="text-xs text-primary font-semibold hover:underline">
            View All in Ledger →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3 pl-2">Invoice ID</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-dark">{inv.id}</td>
                  <td className="py-3.5 font-medium text-slate-800">{inv.patient}</td>
                  <td className="py-3.5 text-slate-500">{inv.department}</td>
                  <td className="py-3.5 text-slate-400">{inv.date}</td>
                  <td className="py-3.5 text-slate-600">{inv.method}</td>
                  <td className="py-3.5 font-bold text-dark">{inv.amount}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inv.status === 'Paid' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
