import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  BedDouble,
  Phone,
  Calendar,
  HeartPulse,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  type PatientProfile,
} from '../../store/api/patientApi';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Queries
  const { data: patientsData, isLoading } = useGetPatientsQuery({
    search: searchTerm || undefined,
    gender: genderFilter !== 'all' ? genderFilter : undefined,
    bloodGroup: bloodFilter !== 'all' ? bloodFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('O+');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formGuardianPhone, setFormGuardianPhone] = useState('');
  const [formGuardianRelation, setFormGuardianRelation] = useState('Spouse');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formMaritalStatus, setFormMaritalStatus] = useState('Married');
  const [formOccupation, setFormOccupation] = useState('');
  const [formAllergies, setFormAllergies] = useState('None');
  const [formStatus, setFormStatus] = useState('Active');

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormName('');
    setFormPhone('');
    setFormAge('');
    setFormDob('');
    setFormGender('Male');
    setFormEmail('');
    setFormAddress('');
    setFormBloodGroup('O+');
    setFormGuardianName('');
    setFormGuardianPhone('');
    setFormGuardianRelation('Spouse');
    setFormEmergencyContact('');
    setFormMaritalStatus('Married');
    setFormOccupation('');
    setFormAllergies('None');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PatientProfile) => {
    setEditingPatient(p);
    setFormName(p.name || '');
    setFormPhone(p.phone || '');
    setFormAge(p.age ? String(p.age) : '');
    setFormDob(p.dob || '');
    setFormGender(p.gender || 'Male');
    setFormEmail(p.email || '');
    setFormAddress(p.address || '');
    setFormBloodGroup(p.bloodGroup || 'O+');
    setFormGuardianName(p.guardianName || '');
    setFormGuardianPhone(p.guardianPhone || '');
    setFormGuardianRelation(p.guardianRelation || 'Spouse');
    setFormEmergencyContact(p.emergencyContact || '');
    setFormMaritalStatus(p.maritalStatus || 'Married');
    setFormOccupation(p.occupation || '');
    setFormAllergies(p.allergies || 'None');
    setFormStatus(p.status || 'Active');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Patient Name and Phone are required.');
      return;
    }

    try {
      const payload: Partial<PatientProfile> = {
        name: formName.trim(),
        phone: formPhone.trim(),
        age: formAge ? parseInt(formAge) : null,
        dob: formDob || null,
        gender: formGender,
        email: formEmail || null,
        address: formAddress || null,
        bloodGroup: formBloodGroup,
        guardianName: formGuardianName || null,
        guardianPhone: formGuardianPhone || null,
        guardianRelation: formGuardianRelation || null,
        emergencyContact: formEmergencyContact || null,
        maritalStatus: formMaritalStatus,
        occupation: formOccupation || null,
        allergies: formAllergies || null,
        status: formStatus,
      };

      if (editingPatient) {
        await updatePatient({ id: editingPatient.id, data: payload }).unwrap();
      } else {
        await createPatient(payload).unwrap();
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(err?.data?.message || 'Failed to save patient profile.');
    }
  };

  const handleDelete = async (p: PatientProfile) => {
    if (confirm(`Are you sure you want to delete patient "${p.name}" (${p.patientId})?`)) {
      try {
        await deletePatient(p.id).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || 'Delete failed.');
      }
    }
  };

  const patientsList = patientsData?.data || [];
  const meta = patientsData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              Patient Digital Profiles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Permanent Hospital ID
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every patient receives an auto-generated unique digital ID used across diagnostics, admissions, and billing.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/admissions/new')}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            <BedDouble className="h-4 w-4" />
            <span>Admit Patient</span>
          </button>
          <button
            onClick={openCreateModal}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
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
            placeholder="Search by Patient ID, Name, Phone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender */}
          <div className="w-32">
            <Select
              value={genderFilter}
              onValueChange={(val) => {
                setGenderFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blood Group */}
          <div className="w-32">
            <Select
              value={bloodFilter}
              onValueChange={(val) => {
                setBloodFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Blood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-36">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Admitted">Admitted</SelectItem>
                <SelectItem value="Discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            {/* Primary Header */}
            <thead className="bg-primary text-white font-bold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Patient Demographics</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Guardian Info</th>
                <th className="py-3.5 px-4">Blood & Allergies</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            {/* Alternating White & Ash Rows */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading patient records...</span>
                  </td>
                </tr>
              ) : patientsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No patients registered</p>
                    <p className="text-xs">Click "Register New Patient" to create a permanent profile.</p>
                  </td>
                </tr>
              ) : (
                patientsList.map((patient, idx) => {
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={patient.id}
                      className={`transition-colors hover:bg-emerald-50/40 ${
                        isEven ? 'bg-white' : 'bg-slate-50/90'
                      }`}
                    >
                      {/* Patient ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {patient.patientId || 'PAT-ID'}
                        </span>
                      </td>

                      {/* Demographics */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          type="button"
                          className="font-bold text-slate-900 hover:text-primary transition text-left cursor-pointer"
                        >
                          {patient.name}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {patient.age ? `${patient.age} Yrs` : 'N/A'} • {patient.gender || 'Other'} •{' '}
                          {patient.maritalStatus || 'Single'}
                        </div>
                        {patient.address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                            {patient.address}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{patient.phone}</div>
                        {patient.emergencyContact && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Emerg: {patient.emergencyContact}
                          </div>
                        )}
                      </td>

                      {/* Guardian */}
                      <td className="py-3.5 px-4">
                        {patient.guardianName ? (
                          <div>
                            <span className="font-semibold text-slate-800">
                              {patient.guardianName}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ({patient.guardianRelation || 'Guardian'}) {patient.guardianPhone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None recorded</span>
                        )}
                      </td>

                      {/* Blood & Allergies */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {patient.bloodGroup || 'Unknown'}
                          </span>
                        </div>
                        {patient.allergies && patient.allergies !== 'None' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            {patient.allergies}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            patient.status === 'Admitted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              patient.status === 'Admitted'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-slate-400'
                            }`}
                          />
                          {patient.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Digital Profile (Eye) */}
                          <button
                            onClick={() => navigate(`/patients/${patient.id}`)}
                            title="View Permanent Profile & History"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Quick Admit */}
                          <button
                            onClick={() =>
                              navigate(`/admissions/new?patientId=${patient.patientId || patient.id}`)
                            }
                            title="Admit to Inpatient Bed"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <BedDouble className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(patient)}
                            title="Edit Profile"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(patient)}
                            title="Delete Patient"
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} registered patients)
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

      {/* Patient Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto overflow-hidden">
            <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    {editingPatient ? 'Edit Patient Profile' : 'Register New Patient Profile'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    A permanent digital profile and unique ID will be maintained for all hospital modules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-dark p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Full name"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+880 1711..."
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age (Yrs)</label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <Select value={formGender} onValueChange={setFormGender}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <Select value={formBloodGroup} onValueChange={setFormBloodGroup}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                    <Select value={formMaritalStatus} onValueChange={setFormMaritalStatus}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Full residential address"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                {/* Guardian Details */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formGuardianName}
                    onChange={(e) => setFormGuardianName(e.target.value)}
                    placeholder="Guardian full name"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      value={formGuardianPhone}
                      onChange={(e) => setFormGuardianPhone(e.target.value)}
                      placeholder="+880..."
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                    <Select value={formGuardianRelation} onValueChange={setFormGuardianRelation}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Son">Son</SelectItem>
                        <SelectItem value="Daughter">Daughter</SelectItem>
                        <SelectItem value="Brother">Brother</SelectItem>
                        <SelectItem value="Sister">Sister</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formEmergencyContact}
                    onChange={(e) => setFormEmergencyContact(e.target.value)}
                    placeholder="+880 1819..."
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Known Drug Allergies
                  </label>
                  <input
                    type="text"
                    value={formAllergies}
                    onChange={(e) => setFormAllergies(e.target.value)}
                    placeholder="Penicillin, etc. or None"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-1/2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isCreating || isUpdating ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{editingPatient ? 'Update Profile' : 'Save Patient Profile'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
