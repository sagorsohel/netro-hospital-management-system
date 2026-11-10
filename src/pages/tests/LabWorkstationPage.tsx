import React, { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  Barcode,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  User,
  Printer,
  Sparkles,
  Send,
  CheckCheck,
  RefreshCw,
  DoorOpen,
} from 'lucide-react';
import {
  useGetDiagnosticInvoicesQuery,
  type DiagnosticInvoice,
} from '../../store/api/diagnosticInvoiceApi';

export const LabWorkstationPage: React.FC = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<DiagnosticInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Collected' | 'Processing' | 'Report Ready'>('all');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const { data: invoicesData, isLoading, refetch } = useGetDiagnosticInvoicesQuery({ limit: 100 });
  const invoicesList: DiagnosticInvoice[] = invoicesData?.data || [];

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle Barcode Scan / Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.toLowerCase().trim();
    const found = invoicesList.find(
      (inv) =>
        inv.invoiceNo.toLowerCase() === term ||
        inv.id.toLowerCase() === term ||
        (inv.patientPhone && inv.patientPhone.includes(term))
    );

    if (found) {
      setSelectedInvoice(found);
    } else {
      alert(`No diagnostic invoice found for barcode/code: "${barcodeInput}"`);
    }
  };

  // 1-Click Status Update Simulation
  const handleUpdateStatus = (inv: DiagnosticInvoice, newStatus: 'Collected' | 'Processing' | 'Report Ready') => {
    setSelectedInvoice((prev) => (prev ? { ...prev, sampleStatus: newStatus } : null));

    if (newStatus === 'Report Ready') {
      setSmsNotification(
        `SMS Gateway Sent: "Dear ${inv.patientName}, your test report (Invoice #${inv.invoiceNo}) is READY for collection at Netro Hospital Diagnostic Lab. Hotline: 10655"`
      );
      setTimeout(() => setSmsNotification(null), 8000);
    }
  };

  const filteredInvoices = invoicesList.filter((inv) => {
    if (statusFilter !== 'all' && inv.sampleStatus !== statusFilter) return false;
    if (barcodeInput.trim()) {
      const q = barcodeInput.toLowerCase().trim();
      return (
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        (inv.patientPhone && inv.patientPhone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1680px] mx-auto gap-3 select-none font-sans text-dark">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-0.5">
            <FlaskConical className="h-4 w-4" />
            <span>Section 4.2 — Laboratory Workstation & Barcode Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Diagnostic Lab Workstation
          </h1>
          <p className="text-xs text-slate-500">
            Scan bill barcode or invoice code to track sample status (Pending ➔ Processing ➔ Report Ready).
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* SMS Gateway Live Alert Notification */}
      {smsNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between gap-3 text-xs text-emerald-950 animate-in fade-in shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <Send className="h-4 w-4 text-emerald-600 shrink-0 animate-bounce" />
            <span>{smsNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSmsNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Main Two-Panel Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: Barcode Scanner & Active Investigation Detail (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-hidden">
          {/* Barcode Scan Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark flex items-center gap-1.5">
                <Barcode className="h-4 w-4 text-teal-600" />
                <span>Barcode Scanner Input</span>
              </label>
              <span className="text-[10px] text-teal-700 font-semibold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                Auto-Detect USB Scanner
              </span>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode or type invoice code (e.g. LAB-2026-0004)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-teal-300 bg-teal-50/40 text-xs font-mono font-bold text-teal-950 focus:bg-white focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-4 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Scanned Patient / Order Inspection Panel */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs overflow-y-auto space-y-3.5">
            {selectedInvoice ? (
              <>
                {/* Header */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Bill</span>
                    <div className="text-base font-black text-dark font-mono">
                      #{selectedInvoice.invoiceNo}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        selectedInvoice.sampleStatus === 'Report Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedInvoice.sampleStatus === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvoice.sampleStatus || 'Collected'}
                    </span>
                  </div>
                </div>

                {/* Patient Profile */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Patient</span>
                  <div className="font-bold text-dark text-sm">{selectedInvoice.patientName}</div>
                  <div className="text-slate-500 font-mono flex items-center gap-2">
                    <Phone className="h-3 w-3 text-teal-600" />
                    <span>{selectedInvoice.patientPhone}</span>
                    <span>•</span>
                    <span>
                      {selectedInvoice.patientGender || 'Male'}, {selectedInvoice.patientAge ? `${selectedInvoice.patientAge}y` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Test Items Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Ordered Diagnostic Tests ({selectedInvoice.items?.length || 1})
                  </span>
                  <div className="space-y-1.5">
                    {selectedInvoice.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-dark">{item.testName}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="text-teal-700 font-semibold">{item.category || 'General'}</span>
                            {item.roomNumber && (
                              <span>• Chamber {item.roomNumber}</span>
                            )}
                            {item.sampleType && (
                              <span>• {item.sampleType}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-700">৳{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Technician Action Buttons */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Update Lab Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedInvoice, 'Processing')}
                      className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Mark Processing</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedInvoice, 'Report Ready')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Ready & Send SMS</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <Barcode className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-medium">Scan an invoice barcode or pick an item from the right table.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lab Diagnostic Queue Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Filter Pills Header */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-700">Lab Orders Queue</span>
            <div className="flex items-center gap-1">
              {(['all', 'Collected', 'Processing', 'Report Ready'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Queue' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredInvoices.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Invoice & Barcode</th>
                    <th className="py-2.5 px-3">Patient Profile</th>
                    <th className="py-2.5 px-3">Tests Count</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`cursor-pointer transition ${
                        selectedInvoice?.id === inv.id ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-dark">{inv.invoiceNo}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.createdAt?.slice(0, 10)}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-dark">{inv.patientName}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{inv.patientPhone}</span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        {inv.testsCount || inv.items?.length || 1} Tests
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.sampleStatus === 'Report Ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.sampleStatus === 'Processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.sampleStatus || 'Collected'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inv, 'Report Ready');
                          }}
                          className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-[10px] font-bold transition cursor-pointer"
                        >
                          Mark Ready
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No diagnostic orders found matching the filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabWorkstationPage;

