import React, { useState } from 'react';
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

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              Inpatient Admissions & IPD
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Live Ward Management
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track active inpatient stays, room and bed allocations, POS admission slips, and patient discharge.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/admissions/new')}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Inpatient Admission</span>
        </button>
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
            placeholder="Search admission no, patient, room..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Status:
          </span>
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admissions</SelectItem>
                <SelectItem value="Admitted">Currently Admitted</SelectItem>
                <SelectItem value="Discharged">Discharged</SelectItem>
                <SelectItem value="Under Observation">Under Observation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            {/* Primary Header */}
            <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Admission No</th>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">Room & Assigned Bed</th>
                <th className="py-3.5 px-4">Attending Doctor</th>
                <th className="py-3.5 px-4">Admitted On</th>
                <th className="py-3.5 px-4 text-right">POS Total & Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            {/* Alternating White & Ash Rows */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading admissions registry...</span>
                  </td>
                </tr>
              ) : admissionsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BedDouble className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No admission records found</p>
                    <p className="text-xs">Click "New Inpatient Admission" to admit a patient.</p>
                  </td>
                </tr>
              ) : (
                admissionsList.map((adm, idx) => {
                  const isEven = idx % 2 === 0;
                  const grandTotal = parseFloat(String(adm.grandTotal || 0));
                  const due = parseFloat(String(adm.dueAmount || 0));

                  return (
                    <tr
                      key={adm.id}
                      className={`transition-colors hover:bg-emerald-50/40 ${
                        isEven ? 'bg-white' : 'bg-slate-50/90'
                      }`}
                    >
                      {/* Admission No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {adm.admissionNo}
                        </span>
                        {adm.operationName && (
                          <span className="block text-[10px] text-amber-700 font-semibold mt-1">
                            ✂ {adm.operationName}
                          </span>
                        )}
                      </td>

                      {/* Patient Details */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/patients/${adm.patientId}`)}
                          type="button"
                          className="font-bold text-slate-900 hover:text-primary transition text-left cursor-pointer"
                        >
                          {adm.patientName}
                        </button>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-semibold text-slate-600">
                            {adm.patientUniqueId || 'PAT-ID'}
                          </span>
                          <span>•</span>
                          <span>{adm.patientPhone}</span>
                        </div>
                      </td>

                      {/* Room & Bed */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-[11px]">
                            {adm.bedNumber || 'Bed 1'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800">
                              Room {adm.roomNumber || 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {adm.roomName || 'General Ward'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {adm.doctorName || 'Dr. On Duty'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {adm.department || 'Inpatient IPD'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
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
                            Discharged:{' '}
                            {new Date(adm.dischargeDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        )}
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

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.status === 'Admitted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
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
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print / View Slip */}
                          <button
                            onClick={() => {
                              setSelectedAdmissionForSlip(adm);
                              setIsSlipOpen(true);
                            }}
                            title="View / Print Digital Slip"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {/* View Digital Profile */}
                          <button
                            onClick={() => navigate(`/patients/${adm.patientId}`)}
                            title="View Patient Permanent Profile"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Discharge Button (if active) */}
                          {adm.status === 'Admitted' && (
                            <button
                              onClick={() => {
                                setAdmissionToDischarge(adm);
                                setDischargeNotes('');
                              }}
                              title="Discharge Patient & Settle Bill"
                              type="button"
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition font-bold text-[10px] flex items-center gap-1 cursor-pointer"
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
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} admissions total)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Discharge Confirmation Modal */}
      {admissionToDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    Discharge Inpatient
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {admissionToDischarge.admissionNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdmissionToDischarge(null)}
                className="text-slate-400 hover:text-dark p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are discharging <strong>{admissionToDischarge.patientName}</strong> from{' '}
              <strong>
                Room {admissionToDischarge.roomNumber} (Bed {admissionToDischarge.bedNumber})
              </strong>
              . This will free the bed in the room inventory.
            </p>

            <form onSubmit={handleConfirmDischarge} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discharge Notes / Medical Summary
                </label>
                <textarea
                  rows={2}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="e.g. Patient stabilized, post-op vitals normal, discharged with medication regimen."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              {parseFloat(String(admissionToDischarge.dueAmount || 0)) > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-rose-950">
                    <span>Remaining Due Balance:</span>
                    <span>৳{parseFloat(String(admissionToDischarge.dueAmount)).toLocaleString()}</span>
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
                        Final Settlement Payment Method:
                      </label>
                      <Select
                        value={dischargePaymentMethod}
                        onValueChange={setDischargePaymentMethod}
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdmissionToDischarge(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDischarging}
                  className="w-1/2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
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
