import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Search,
  Plus,
  Eye,
  Printer,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Building2,
  X,
  AlertCircle,
  Scissors,
  Receipt,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  useGetAdmissionsQuery,
  useDischargeAdmissionMutation,
  type InpatientAdmission,
} from '../../store/api/admissionApi';
import { AdmissionSlipModal } from '../../components/admissions/AdmissionSlipModal';

export const AdmissionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Queries & Mutations
  const { data: admissionsData, isLoading } = useGetAdmissionsQuery({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const [dischargeAdmission, { isLoading: isDischarging }] = useDischargeAdmissionMutation();

  // Modal States
  const [selectedAdmissionForSlip, setSelectedAdmissionForSlip] =
    useState<InpatientAdmission | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const [admissionToDischarge, setAdmissionToDischarge] =
    useState<InpatientAdmission | null>(null);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [settleDue, setSettleDue] = useState(true);
  const [dischargePaymentMethod, setDischargePaymentMethod] = useState('Cash');

  // Handle Discharge Submit
  const handleConfirmDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionToDischarge) return;

    try {
      await dischargeAdmission({
        id: admissionToDischarge.id,
        data: {
          dischargeNotes,
          settleDue,
          finalPaymentMethod: dischargePaymentMethod,
        },
      }).unwrap();

      setAdmissionToDischarge(null);
      setDischargeNotes('');
    } catch (err: any) {
      console.error('Failed to discharge patient:', err);
      alert(err?.data?.message || 'Failed to discharge patient.');
    }
  };

  const admissionsList = admissionsData?.data || [];
  const meta = admissionsData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Calculate live summary stats from current registry
  const stats = useMemo(() => {
    let admittedCount = 0;
    let dischargedCount = 0;
    let totalBilled = 0;
    let totalDue = 0;

    admissionsList.forEach((adm) => {
      if (adm.status === 'Admitted') admittedCount += 1;
      if (adm.status === 'Discharged') dischargedCount += 1;
      totalBilled += parseFloat(String(adm.grandTotal || 0));
      totalDue += parseFloat(String(adm.dueAmount || 0));
    });

    return {
      admittedCount,
      dischargedCount,
      totalBilled,
      totalDue,
    };
  }, [admissionsList]);

  return (
    <div className="space-y-3.5 max-w-[1600px] mx-auto select-none pb-6">
      {/* 1. Page Header & Quick Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Inpatient Admissions & IPD
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ward Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active inpatient stays, room and bed allocations, POS admission slips, and patient discharge.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/tests/pos')}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-primary text-xs font-semibold transition cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5 text-slate-400" />
            <span>Diagnostic POS</span>
          </button>
          <button
            onClick={() => navigate('/admissions/new')}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Inpatient Admission</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Modern KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Currently Admitted */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Active Inpatients
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {stats.admittedCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Occupying Beds</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <BedDouble className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Card 2: Discharged */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Discharged (Page)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {stats.dischargedCount}
              </span>
              <span className="text-[11px] text-slate-400">Patients Released</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <LogOut className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Card 3: Total IPD Billing */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Page Billing
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                ৳{stats.totalBilled.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Billed IPD</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Receipt className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Outstanding Dues
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold font-mono ${stats.totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                ৳{stats.totalDue.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">Pending Collection</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search admission no, patient name, phone, room..."
            className="w-full h-8 pl-8.5 pr-8 rounded-lg border border-slate-300 focus:border-primary text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter & Count Badge */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Admissions
                </SelectItem>
                <SelectItem value="Admitted" className="text-xs">
                  Currently Admitted
                </SelectItem>
                <SelectItem value="Discharged" className="text-xs">
                  Discharged
                </SelectItem>
                <SelectItem value="Under Observation" className="text-xs">
                  Under Observation
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shrink-0">
            {meta.total} Admissions Total
          </span>
        </div>
      </div>

      {/* 4. Admissions Table (matching TestPOSPage & DiagnosticInvoicesPage standard) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            {/* Header matching TestPOSPage */}
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">Admission Voucher</th>
                <th className="py-2.5 px-3">Patient Profile</th>
                <th className="py-2.5 px-3">Room & Assigned Bed</th>
                <th className="py-2.5 px-3">Attending Doctor</th>
                <th className="py-2.5 px-3">Admitted Date</th>
                <th className="py-2.5 px-3 text-right">POS Billing & Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    <span className="text-xs">Loading inpatient admissions registry...</span>
                  </td>
                </tr>
              ) : admissionsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <BedDouble className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-semibold text-slate-800 text-xs">No admission records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click "+ New Inpatient Admission" to admit a patient.
                    </p>
                  </td>
                </tr>
              ) : (
                admissionsList.map((adm, idx) => {
                  const grandTotal = parseFloat(String(adm.grandTotal || 0));
                  const due = parseFloat(String(adm.dueAmount || 0));

                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Sl Number */}
                      <td className="py-2 px-3 text-center">
                        <span className="h-5 w-5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center justify-center">
                          {(page - 1) * 10 + idx + 1}
                        </span>
                      </td>

                      {/* Admission No & Surgery Tag */}
                      <td className="py-2 px-3">
                        <span className="font-mono font-semibold text-primary block">
                          #{adm.admissionNo}
                        </span>
                        {adm.operationName && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5">
                            <Scissors className="h-2.5 w-2.5" />
                            <span>{adm.operationName}</span>
                          </span>
                        )}
                      </td>

                      {/* Patient Profile */}
                      <td className="py-2 px-3">
                        <button
                          onClick={() => navigate(`/patients/${adm.patientId}`)}
                          type="button"
                          className="font-semibold text-slate-900 hover:text-primary transition text-left cursor-pointer block"
                        >
                          {adm.patientName}
                        </button>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="px-1 rounded bg-slate-100 text-slate-700">
                            {adm.patientUniqueId || 'PAT-ID'}
                          </span>
                          <span>•</span>
                          <span>{adm.patientPhone}</span>
                        </div>
                      </td>

                      {/* Room & Assigned Bed */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono font-semibold text-[10px]">
                            {adm.bedNumber || 'Bed 1'}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              Room {adm.roomNumber || 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {adm.roomName || 'General Ward'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Attending Doctor */}
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-800 block">
                          {adm.doctorName || 'Dr. On Duty'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {adm.department || 'Inpatient IPD'}
                        </span>
                      </td>

                      {/* Admitted Date */}
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>
                            {new Date(adm.admissionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {adm.dischargeDate && (
                          <span className="text-[10px] text-slate-400 block">
                            Out:{' '}
                            {new Date(adm.dischargeDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </td>

                      {/* POS Billing & Due */}
                      <td className="py-2 px-3 text-right">
                        <span className="font-bold font-mono text-slate-900 block">
                          ৳{grandTotal.toLocaleString()}
                        </span>
                        {due > 0 ? (
                          <span className="text-[10px] font-mono font-semibold text-rose-600 block">
                            Due: ৳{due.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 block">
                            Paid in Full
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            adm.status === 'Admitted'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              adm.status === 'Admitted'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-slate-400'
                            }`}
                          />
                          {adm.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Print Slip */}
                          <button
                            onClick={() => {
                              setSelectedAdmissionForSlip(adm);
                              setIsSlipOpen(true);
                            }}
                            title="Print Admission Slip"
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* View Profile */}
                          <button
                            onClick={() => navigate(`/patients/${adm.patientId}`)}
                            title="View Patient Profile"
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Discharge Button (if active) */}
                          {adm.status === 'Admitted' && (
                            <button
                              onClick={() => {
                                setAdmissionToDischarge(adm);
                                setDischargeNotes('');
                              }}
                              title="Discharge Patient & Settle Dues"
                              type="button"
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <LogOut className="h-3 w-3" />
                              <span>Discharge</span>
                            </button>
                          )}
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
        <div className="p-2 sm:px-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} admissions total)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Discharge Confirmation Modal */}
      {admissionToDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Discharge Inpatient
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    #{admissionToDischarge.admissionNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdmissionToDischarge(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Discharging <strong>{admissionToDischarge.patientName}</strong> from{' '}
              <strong>
                Room {admissionToDischarge.roomNumber} ({admissionToDischarge.bedNumber})
              </strong>
              . This will free the assigned bed in room inventory.
            </p>

            <form onSubmit={handleConfirmDischarge} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discharge Notes / Medical Summary
                </label>
                <textarea
                  rows={2}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="e.g. Patient stabilized, vitals normal, discharged with medication instructions."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              {parseFloat(String(admissionToDischarge.dueAmount || 0)) > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-rose-950">
                    <span>Remaining Due Balance:</span>
                    <span className="font-mono">
                      ৳{parseFloat(String(admissionToDischarge.dueAmount)).toLocaleString()}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <input
                      type="checkbox"
                      checked={settleDue}
                      onChange={(e) => setSettleDue(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Collect and settle remaining balance now</span>
                  </label>

                  {settleDue && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Settlement Payment Method:
                      </label>
                      <Select
                        value={dischargePaymentMethod}
                        onValueChange={setDischargePaymentMethod}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash" className="text-xs">Cash at Counter</SelectItem>
                          <SelectItem value="bKash / MFS" className="text-xs">bKash / MFS</SelectItem>
                          <SelectItem value="Nagad" className="text-xs">Nagad MFS</SelectItem>
                          <SelectItem value="Card" className="text-xs">Card POS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdmissionToDischarge(null)}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDischarging}
                  className="w-1/2 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  {isDischarging ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Discharge</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Digital Admission Slip Modal */}
      <AdmissionSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        admission={selectedAdmissionForSlip}
      />
    </div>
  );
};

export default AdmissionsPage;
