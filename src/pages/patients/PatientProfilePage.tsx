import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  BedDouble,
  FlaskConical,
  Receipt,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Heart,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  useGetPatientByIdQuery,
  type PatientAdmissionRecord,
} from '../../store/api/patientApi';
import { AdmissionSlipModal } from '../../components/admissions/AdmissionSlipModal';
import type { InpatientAdmission } from '../../store/api/admissionApi';

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useGetPatientByIdQuery(id || '');

  // Tab State
  const [activeTab, setActiveTab] = useState<'admissions' | 'diagnostics' | 'billing' | 'appointments'>('admissions');

  // Admission Slip Modal State
  const [selectedAdmissionForSlip, setSelectedAdmissionForSlip] = useState<InpatientAdmission | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const patient = response?.data;
  const metrics = patient?.metrics;

  const handlePrintCard = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600">Loading Permanent Patient Profile...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Patient Profile Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Could not locate permanent profile for ID "{id}". Please check the ID or return to the patient directory.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition"
        >
          Back to Patients Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Header & Breadcrumbs (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 print:hidden">
        <div>
          <button
            onClick={() => navigate('/patients')}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Patients Directory</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              Permanent Digital Patient Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Hospital Master Record
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/tests/pos?patientId=${patient.patientId || patient.id}`)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            <FlaskConical className="h-4 w-4" />
            <span>Order Lab Tests (POS)</span>
          </button>
          <button
            onClick={handlePrintCard}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-dark text-xs font-bold hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Patient Card</span>
          </button>
          <button
            onClick={() => navigate(`/admissions/new?patientId=${patient.patientId || patient.id}`)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm cursor-pointer"
          >
            <BedDouble className="h-4 w-4" />
            <span>Admit This Patient</span>
          </button>
        </div>
      </div>

      {/* Digital Patient ID Card Banner (Card Style) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Building2 className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Patient Details & Avatar */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-primary text-white tracking-wider">
                  {patient.patientId || 'PAT-ID'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    patient.status === 'Admitted'
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      patient.status === 'Admitted'
                        ? 'bg-emerald-950 animate-pulse'
                        : 'bg-white'
                    }`}
                  />
                  {patient.status.toUpperCase()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {patient.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span>{patient.age ? `${patient.age} Years Old` : 'Age N/A'}</span>
                <span>•</span>
                <span>{patient.gender || 'Other'}</span>
                <span>•</span>
                <span>{patient.maritalStatus || 'Single'}</span>
                <span>•</span>
                <span className="font-semibold text-rose-300 flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-rose-300" />
                  Blood: {patient.bloodGroup || 'O+'}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Verification Tag */}
          <div className="flex flex-col items-start md:items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              NETRO CENTRAL HEALTHCARE
            </span>
            {/* Visual Simulated Barcode */}
            <div className="bg-white p-2 rounded-xl text-slate-900 flex flex-col items-center shadow-md">
              <div className="font-mono text-[9px] font-bold tracking-[0.25em] text-slate-800">
                |||| | |||||| || | |||| |||
              </div>
              <div className="font-mono text-[9px] font-bold text-slate-600 mt-0.5">
                {patient.patientId || 'PAT-2026-0001'}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Registered:{' '}
              {patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString('en-GB')
                : 'Current Year'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial & Visit Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Visits
          </span>
          <span className="text-xl font-black text-dark mt-1 block">
            {metrics?.totalVisits ?? 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Admissions (IPD)
          </span>
          <span className="text-xl font-black text-primary mt-1 block">
            {metrics?.totalAdmissions ?? patient.admissions?.length ?? 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Diagnostic Tests
          </span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {metrics?.totalDiagnostics ?? patient.diagnostics?.length ?? 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Invoiced
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            ৳{parseFloat(metrics?.totalBilled || '0').toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Paid
          </span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            ৳{parseFloat(metrics?.totalPaid || '0').toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Balance Due
          </span>
          <span
            className={`text-xl font-black mt-1 block ${
              parseFloat(metrics?.totalDue || '0') > 0 ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            ৳{parseFloat(metrics?.totalDue || '0').toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Demographics (Left 4 Cols) + Visit History (Right 8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: DEMOGRAPHICS & GUARDIAN PROFILE ================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card: Primary Demographics */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                Personal Demographics
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Birth:</span>
                <span className="font-semibold text-slate-800">
                  {patient.dob || 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-semibold text-slate-800">{patient.gender || 'Other'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700">
                  {patient.bloodGroup || 'O+'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Marital Status:</span>
                <span className="font-semibold text-slate-800">
                  {patient.maritalStatus || 'Single'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupation:</span>
                <span className="font-semibold text-slate-800">
                  {patient.occupation || 'N/A'}
                </span>
              </div>
            </div>

            {/* Allergies Warning Alert */}
            {patient.allergies && patient.allergies !== 'None' && (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Clinical Allergies Alert:</span>
                </div>
                <p className="text-amber-800 font-semibold">{patient.allergies}</p>
              </div>
            )}
          </div>

          {/* Card: Contact Details */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                Contact & Address
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Phone:</span>
                <span className="font-bold text-slate-900">{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {patient.email}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-0.5">Address:</span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {patient.address || 'Address not recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Guardian & Emergency Information */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                Guardian & Emergency
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Name:</span>
                <span className="font-bold text-slate-900">
                  {patient.guardianName || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Relationship:</span>
                <span className="font-semibold text-slate-800">
                  {patient.guardianRelation || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Phone:</span>
                <span className="font-semibold text-slate-800">
                  {patient.guardianPhone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-400">Emergency Hotline:</span>
                <span className="font-bold text-rose-600">
                  {patient.emergencyContact || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: FULL VISIT HISTORY TABS ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Selection Header */}
          <div className="flex p-1.5 bg-slate-100/90 rounded-2xl gap-1 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('admissions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'admissions'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-dark'
              }`}
            >
              <BedDouble className="h-4 w-4" />
              <span>Admissions (IPD) ({patient.admissions?.length ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'diagnostics'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-dark'
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Diagnostics ({patient.diagnostics?.length ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-dark'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Billing Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-dark'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Appointments ({patient.appointments?.length ?? 0})</span>
            </button>
          </div>

          {/* TAB 1: INPATIENT ADMISSIONS HISTORY */}
          {activeTab === 'admissions' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Admission No</th>
                      <th className="py-3.5 px-4">Stay & Bed</th>
                      <th className="py-3.5 px-4">Doctor</th>
                      <th className="py-3.5 px-4">Admit Date</th>
                      <th className="py-3.5 px-4 text-right">Total & Due</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!patient.admissions || patient.admissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <BedDouble className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No inpatient stays recorded</p>
                          <p className="text-xs">Click "Admit This Patient" to create an admission.</p>
                        </td>
                      </tr>
                    ) : (
                      patient.admissions.map((adm: PatientAdmissionRecord, idx: number) => {
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

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[11px]">
                                  {adm.bedNumber || 'Bed 1'}
                                </span>
                                <span className="font-bold text-slate-800">
                                  Room {adm.roomNumber || 'N/A'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800">
                                {adm.doctorName || 'Dr. On Duty'}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {adm.department || 'IPD'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(adm.admissionDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

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
                                  Paid
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  adm.status === 'Admitted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {adm.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedAdmissionForSlip(adm as any);
                                  setIsSlipOpen(true);
                                }}
                                title="View Inpatient Admission Slip"
                                type="button"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DIAGNOSTICS & PATHOLOGY HISTORY */}
          {activeTab === 'diagnostics' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Order No</th>
                      <th className="py-3.5 px-4">Investigation Test Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Doctor</th>
                      <th className="py-3.5 px-4 text-right">Fee (BDT)</th>
                      <th className="py-3.5 px-4 text-center">Report Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!patient.diagnostics || patient.diagnostics.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <FlaskConical className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No diagnostic investigations</p>
                          <p className="text-xs mb-3">Laboratory orders for this patient will appear here.</p>
                          <button
                            type="button"
                            onClick={() => navigate(`/tests/pos?patientId=${patient.patientId || patient.id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm cursor-pointer"
                          >
                            <FlaskConical className="h-4 w-4" />
                            <span>Create Test POS Bill</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      patient.diagnostics.map((diag, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                          <tr
                            key={diag.id}
                            className={`transition-colors hover:bg-emerald-50/40 ${
                              isEven ? 'bg-white' : 'bg-slate-50/90'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {diag.orderNo}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {diag.testName}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {diag.category || 'Pathology'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {diag.doctorName || 'Dr. On Duty'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                              ৳{parseFloat(String(diag.finalAmount)).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="h-3 w-3" />
                                {diag.sampleStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONSOLIDATED BILLING LEDGER */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Ref Voucher</th>
                      <th className="py-3.5 px-4">Module Service</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Billed Amount</th>
                      <th className="py-3.5 px-4 text-right">Paid</th>
                      <th className="py-3.5 px-4 text-right">Balance Due</th>
                      <th className="py-3.5 px-4 text-center">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Admissions Billing entries */}
                    {patient.admissions?.map((adm, idx) => {
                      const grandTotal = parseFloat(String(adm.grandTotal || 0));
                      const advance = parseFloat(String(adm.advancePayment || 0));
                      const due = parseFloat(String(adm.dueAmount || 0));
                      return (
                        <tr key={`adm-${adm.id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'}>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary">
                            {adm.admissionNo}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            IPD Stay — Room {adm.roomNumber} ({adm.bedNumber})
                            {adm.operationName && ` + ${adm.operationName}`}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(adm.admissionDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            ৳{grandTotal.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                            ৳{advance.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                            ৳{due.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                due <= 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {due <= 0 ? 'Paid' : 'Due'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Diagnostics Billing entries */}
                    {patient.diagnostics?.map((diag, idx) => {
                      const finalAmount = parseFloat(String(diag.finalAmount || 0));
                      return (
                        <tr key={`diag-${diag.id}`} className="bg-white">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                            {diag.orderNo}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            Lab Investigation — {diag.testName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(diag.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            ৳{finalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                            ৳{finalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-400">
                            ৳0.00
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Paid
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Doctor Consultation</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!patient.appointments || patient.appointments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No scheduled appointments</p>
                        </td>
                      </tr>
                    ) : (
                      patient.appointments.map((apt, idx) => (
                        <tr key={apt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'}>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {apt.doctorName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {apt.date} at {apt.time}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {apt.type || 'Consultation'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Digital Admission Slip Modal */}
      <AdmissionSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        admission={selectedAdmissionForSlip}
      />
    </div>
  );
};

export default PatientProfilePage;
