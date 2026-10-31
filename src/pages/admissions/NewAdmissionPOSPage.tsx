import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  UserPlus,
  BedDouble,
  Stethoscope,
  Scissors,
  PlusCircle,
  Trash2,
  Receipt,
  CheckCircle2,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Printer,
  Eye,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetRoomsQuery } from '../../store/api/roomApi';
import { useGetDoctorsQuery } from '../../store/api/doctorApi';
import { useGetOperationsQuery } from '../../store/api/operationApi';
import { useGetPatientsQuery } from '../../store/api/patientApi';
import {
  useCreateAdmissionMutation,
  type InpatientAdmission,
} from '../../store/api/admissionApi';
import { AdmissionSlipModal } from '../../components/admissions/AdmissionSlipModal';

interface ExtraChargeItem {
  key: string;
  value: number;
  unit: string;
}

export const NewAdmissionPOSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPatientId = searchParams.get('patientId');

  // Queries
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery({ limit: 50 });
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({ limit: 50 });
  const { data: operationsData, isLoading: operationsLoading } = useGetOperationsQuery({ limit: 50 });
  const { data: patientsData, isLoading: patientsLoading } = useGetPatientsQuery({ limit: 100 });

  const [createAdmission, { isLoading: isSubmitting }] = useCreateAdmissionMutation();

  // Intake Mode: 'new' vs 'existing'
  const [intakeMode, setIntakeMode] = useState<'new' | 'existing'>(
    prefillPatientId ? 'existing' : 'new'
  );

  // Form State - Patient Info
  const [selectedPatientId, setSelectedPatientId] = useState<string>(prefillPatientId || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientDob, setPatientDob] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Spouse');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [occupation, setOccupation] = useState('');
  const [allergies, setAllergies] = useState('None');

  // Form State - Room & Bed
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedNumber, setSelectedBedNumber] = useState('');

  // Form State - Doctor & Operation
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedOperationId, setSelectedOperationId] = useState('');

  // Form State - Extra Charges
  const [extraCharges, setExtraCharges] = useState<ExtraChargeItem[]>([
    { key: 'Oxygen Pipeline Support', value: 500, unit: 'per day' },
  ]);
  const [customChargeName, setCustomChargeName] = useState('');
  const [customChargeAmount, setCustomChargeAmount] = useState('');
  const [customChargeUnit, setCustomChargeUnit] = useState('per day');

  // Form State - POS Financials
  const [admissionFee, setAdmissionFee] = useState<number>(500);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Clinical
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Success State for Modal
  const [createdAdmission, setCreatedAdmission] = useState<InpatientAdmission | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    admissionNo: string;
    patientId: string;
    patientInternalId: string;
  } | null>(null);

  // Auto-fill when existing patient is chosen
  const handleSelectExistingPatient = (patId: string) => {
    setSelectedPatientId(patId);
    const found = patientsData?.data?.find(
      (p) => p.id === patId || p.patientId === patId
    );
    if (found) {
      setPatientName(found.name || '');
      setPatientPhone(found.phone || '');
      setPatientAge(found.age ? String(found.age) : '');
      setPatientGender(found.gender || 'Male');
      setPatientBloodGroup(found.bloodGroup || 'O+');
      setPatientAddress(found.address || '');
      setGuardianName(found.guardianName || '');
      setGuardianPhone(found.guardianPhone || '');
      setGuardianRelation(found.guardianRelation || 'Spouse');
      setEmergencyContact(found.emergencyContact || '');
      setAllergies(found.allergies || 'None');
      setMaritalStatus(found.maritalStatus || 'Single');
      setOccupation(found.occupation || '');
    }
  };

  // Find Selected Room
  const selectedRoom = useMemo(() => {
    return roomsData?.data?.find((r) => r.id === selectedRoomId);
  }, [roomsData, selectedRoomId]);

  // Find Selected Doctor
  const selectedDoctor = useMemo(() => {
    return doctorsData?.data?.find((d) => d.id === selectedDoctorId);
  }, [doctorsData, selectedDoctorId]);

  // Find Selected Operation
  const selectedOperation = useMemo(() => {
    return operationsData?.data?.find((op) => op.id === selectedOperationId);
  }, [operationsData, selectedOperationId]);

  // Calculations
  const roomCharge = selectedRoom ? parseFloat(String(selectedRoom.perDayCharge || 0)) : 1500;
  const operationCharge = selectedOperation ? parseFloat(String(selectedOperation.price || 0)) : 0;
  const extraChargesTotal = extraCharges.reduce((sum, item) => sum + (item.value || 0), 0);

  const subtotal = admissionFee + roomCharge + operationCharge + extraChargesTotal;

  const calculatedDiscount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotal * (discountVal || 0)) / 100;
    }
    return discountVal || 0;
  }, [discountType, discountVal, subtotal]);

  const grandTotal = Math.max(0, subtotal - calculatedDiscount);
  const dueAmount = Math.max(0, grandTotal - (advancePayment || 0));

  // Add custom extra charge
  const handleAddCustomCharge = () => {
    if (!customChargeName.trim() || !customChargeAmount) return;
    setExtraCharges((prev) => [
      ...prev,
      {
        key: customChargeName.trim(),
        value: parseFloat(customChargeAmount) || 0,
        unit: customChargeUnit.trim() || 'item',
      },
    ]);
    setCustomChargeName('');
    setCustomChargeAmount('');
  };

  // Remove charge
  const handleRemoveCharge = (idx: number) => {
    setExtraCharges((prev) => prev.filter((_, i) => i !== idx));
  };

  // Quick preset charge adder
  const addPresetCharge = (key: string, value: number, unit: string) => {
    if (extraCharges.some((c) => c.key === key)) return;
    setExtraCharges((prev) => [...prev, { key, value, unit }]);
  };

  // Quick Advance button
  const handleQuickAdvance = (type: 'full' | 'half' | 'fixed5000') => {
    if (type === 'full') setAdvancePayment(grandTotal);
    else if (type === 'half') setAdvancePayment(Math.round(grandTotal / 2));
    else if (type === 'fixed5000') setAdvancePayment(Math.min(5000, grandTotal));
  };

  // Submit Admission
  const handleSubmitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    if (!patientPhone.trim()) {
      alert('Please enter patient contact number.');
      return;
    }
    if (!selectedRoomId) {
      alert('Please select an inpatient room.');
      return;
    }

    try {
      const payload = {
        isNewPatient: intakeMode === 'new',
        patientId: intakeMode === 'existing' ? selectedPatientId : undefined,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientGender,
        dob: patientDob || undefined,
        patientEmail: patientEmail || undefined,
        patientAddress: patientAddress || undefined,
        patientBloodGroup,
        guardianName: guardianName || undefined,
        guardianPhone: guardianPhone || undefined,
        guardianRelation: guardianRelation || undefined,
        emergencyContact: emergencyContact || undefined,
        maritalStatus,
        occupation: occupation || undefined,
        allergies: allergies || undefined,

        // Room & Bed
        roomId: selectedRoom?.id,
        roomNumber: selectedRoom?.roomNumber,
        roomName: selectedRoom?.name,
        bedNumber: selectedBedNumber || (selectedRoom?.bedNumbers?.[0] ?? 'Bed 1'),
        perDayCharge: roomCharge,

        // Doctor
        doctorId: selectedDoctor?.id,
        doctorName: selectedDoctor?.name,
        department: selectedDoctor?.department || selectedRoom?.department,

        // Operation
        operationId: selectedOperation?.id,
        operationName: selectedOperation?.name,
        operationPrice: operationCharge,

        // Financial POS
        extraCharges,
        admissionFee,
        roomCharge,
        operationCharge,
        extraChargesTotal,
        subtotal,
        discountAmount: calculatedDiscount,
        grandTotal,
        advancePayment,
        dueAmount,
        paymentMethod,
        paymentStatus: dueAmount <= 0 ? 'Paid' : advancePayment > 0 ? 'Partial' : 'Due',

        // Clinical
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await createAdmission(payload).unwrap();

      if (res.success && res.data) {
        setCreatedAdmission(res.data.admission);
        setSuccessInfo({
          admissionNo: res.data.admission.admissionNo,
          patientId: res.data.patient.patientId,
          patientInternalId: res.data.patient.id,
        });
        setIsSlipOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to create admission:', err);
      alert(err?.data?.message || 'Failed to complete admission. Please check form fields.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <button
            onClick={() => navigate('/admissions')}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Inpatient Admissions</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              New Inpatient Admission & POS Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              IPD Desk
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Register patient, allocate room & bed, add procedures/charges, and generate live POS billing slip.
          </p>
        </div>

        {/* Live Terminal Clock & Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Terminal Date
            </p>
            <p className="text-xs font-bold text-dark font-mono">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center font-bold">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Success Banner if Created */}
      {successInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Admission Successful! Voucher #{successInfo.admissionNo}
              </h4>
              <p className="text-xs text-emerald-700">
                Permanent Patient Profile generated: <strong className="font-mono">{successInfo.patientId}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlipOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => navigate(`/patients/${successInfo.patientInternalId}`)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-dark border border-slate-200 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Form (60%) + Right POS Terminal (40%) */}
      <form onSubmit={handleSubmitAdmission}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: INTAKE & CLINICAL SETUP (7 Cols) ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Patient Selection / Registration */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark">
                      1. Patient Intake & Digital Profile
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Auto-creates permanent patient profile or select existing
                    </p>
                  </div>
                </div>

                {/* Intake Mode Switch */}
                <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode('new');
                      setSelectedPatientId('');
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      intakeMode === 'new'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-slate-500 hover:text-dark'
                    }`}
                  >
                    + New Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeMode('existing')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      intakeMode === 'existing'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-slate-500 hover:text-dark'
                    }`}
                  >
                    Existing Patient
                  </button>
                </div>
              </div>

              {/* If Existing Patient Mode */}
              {intakeMode === 'existing' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Search & Select Existing Patient Profile *
                  </label>
                  <Select
                    value={selectedPatientId}
                    onValueChange={handleSelectExistingPatient}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Choose registered patient profile --" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsData?.data?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.patientId}) - {p.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPatientId && (
                    <div className="text-xs text-primary font-semibold flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        Existing profile loaded! Demographics and guardian info auto-filled below.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Shahanara Begum"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +880 1711-002233"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Age (Yrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={130}
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 52"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                      <SelectTrigger className="w-full">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Blood Group
                    </label>
                    <Select value={patientBloodGroup} onValueChange={setPatientBloodGroup}>
                      <SelectTrigger className="w-full">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Marital Status
                    </label>
                    <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                      <SelectTrigger className="w-full">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="e.g. House 14, Road 5, Dhanmondi, Dhaka"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                {/* Guardian Info */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Kamrul Islam"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Guardian Phone
                    </label>
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="+880 1711..."
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Relationship
                    </label>
                    <Select value={guardianRelation} onValueChange={setGuardianRelation}>
                      <SelectTrigger className="w-full">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +880 1819-998877"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfonamides, None"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Room & Bed Assignment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <BedDouble className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    2. Inpatient Room & Bed Allocation *
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign specific room and bed number for this patient's admission
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Hospital Room *
                  </label>
                  <Select
                    value={selectedRoomId}
                    onValueChange={(val) => {
                      setSelectedRoomId(val);
                      const r = roomsData?.data?.find((item) => item.id === val);
                      if (r?.bedNumbers && r.bedNumbers.length > 0) {
                        setSelectedBedNumber(r.bedNumbers[0]);
                      } else {
                        setSelectedBedNumber('Bed 1');
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Available Room --" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomsData?.data?.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} ({room.name}) - ৳{parseFloat(String(room.perDayCharge)).toLocaleString()}/day
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bed Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Bed Number *
                  </label>
                  {selectedRoom && selectedRoom.bedNumbers && selectedRoom.bedNumbers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedRoom.bedNumbers.map((bed) => (
                        <button
                          key={bed}
                          type="button"
                          onClick={() => setSelectedBedNumber(bed)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            selectedBedNumber === bed
                              ? 'bg-primary text-white shadow-sm shadow-primary/25'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {bed}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={selectedBedNumber}
                      onChange={(e) => setSelectedBedNumber(e.target.value)}
                      placeholder="e.g. Bed 1, A1, B3"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                    />
                  )}
                </div>
              </div>

              {/* Selected Room Details Banner */}
              {selectedRoom && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">
                      Room {selectedRoom.roomNumber} — {selectedRoom.name}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({selectedRoom.roomType}, Floor {selectedRoom.floor})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                      Rate: ৳{parseFloat(String(selectedRoom.perDayCharge)).toLocaleString()} / day
                    </span>
                    <span className="text-slate-500">
                      Capacity: {selectedRoom.occupiedBeds || 0} / {selectedRoom.bedCount} beds
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Doctor & Surgical Procedure */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    3. Attending Doctor & Surgical Procedure
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign lead physician and optional surgical operation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Attending Physician / Doctor
                  </label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Doctor on duty --" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsData?.data?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} ({doc.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operation Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Surgical Operation (Optional)
                  </label>
                  <Select
                    value={selectedOperationId}
                    onValueChange={(val) =>
                      setSelectedOperationId(val === 'none' ? '' : val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- None / Medical Management --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- None (No Surgery) --</SelectItem>
                      {operationsData?.data?.map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name} (৳{parseFloat(String(op.price)).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedOperation && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-amber-700" />
                    <span className="font-bold text-amber-950">{selectedOperation.name}</span>
                    <span className="text-amber-800">
                      ({selectedOperation.category}, {selectedOperation.duration})
                    </span>
                  </div>
                  <span className="font-black text-amber-900 text-sm">
                    +৳{parseFloat(String(selectedOperation.price)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Card 4: Dynamic Extra Inpatient Charges */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark">
                      4. Extra Inpatient Charges & Services
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add custom key-value charges (Oxygen, monitors, special care)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Add Presets:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addPresetCharge('Specialist Nursing Care', 350, 'per shift')
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    + Specialist Nursing (৳350)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addPresetCharge('Cardiac Telemetry Monitor', 1200, 'per day')
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    + Cardiac Monitor (৳1200)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addPresetCharge('Attendant Extra Bed', 400, 'per day')
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    + Attendant Bed (৳400)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addPresetCharge('Nebulizer & Respiratory Therapy', 200, 'per session')
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    + Nebulizer Support (৳200)
                  </button>
                </div>
              </div>

              {/* Custom Key-Value Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    value={customChargeName}
                    onChange={(e) => setCustomChargeName(e.target.value)}
                    placeholder="Charge name (e.g. ICU Dialysis Support)"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    min={0}
                    value={customChargeAmount}
                    onChange={(e) => setCustomChargeAmount(e.target.value)}
                    placeholder="Amount (৳)"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddCustomCharge}
                    className="w-full h-9 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Active Extra Charges List */}
              {extraCharges.length > 0 && (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                  {extraCharges.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3.5 py-2 text-xs bg-slate-50/50"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{c.key}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({c.unit})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">
                          ৳{c.value.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCharge(i)}
                          className="text-rose-500 hover:text-rose-700 transition p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 5: Diagnosis & Clinical Notes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-dark">
                5. Provisional Diagnosis & Admission Notes
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Diagnosis
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute appendicitis with localized peritonitis"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admission Instructions / Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. NPO from midnight, IV fluids normal saline, routine pre-op lab profile."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE POS BILLING TERMINAL (5 Cols) ================= */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* POS Terminal Header */}
              <div className="bg-slate-900 text-white p-5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                    Live Digital POS Receipt
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white">
                    Counter #1
                  </span>
                </div>
                <h3 className="text-base font-black tracking-tight">
                  NETRO INPATIENT BILLING
                </h3>
                <p className="text-xs text-slate-400">
                  {patientName || 'New Patient'} — {selectedRoom ? `Room ${selectedRoom.roomNumber} (${selectedBedNumber || 'Bed 1'})` : 'No Room Assigned'}
                </p>
              </div>

              {/* Itemized Live Bill Receipt */}
              <div className="p-5 space-y-4 text-xs">
                {/* Items */}
                <div className="space-y-2.5 pb-4 border-b border-dashed border-slate-200">
                  {/* Admission Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Inpatient Admission Fee
                    </span>
                    <span className="font-bold text-slate-900">
                      ৳{admissionFee.toFixed(2)}
                    </span>
                  </div>

                  {/* Room Charge */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-600 font-medium">Room Rate (Day 1)</span>
                      <span className="text-[10px] text-slate-400 block">
                        {selectedRoom
                          ? `Room ${selectedRoom.roomNumber} - ${selectedBedNumber || 'Bed'}`
                          : 'Standard Ward'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ৳{roomCharge.toFixed(2)}
                    </span>
                  </div>

                  {/* Operation Charge */}
                  {operationCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-600 font-medium">Surgical Operation</span>
                        <span className="text-[10px] text-amber-600 font-semibold block">
                          {selectedOperation?.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ৳{operationCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Extra Charges */}
                  {extraCharges.map((c, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-slate-500">{c.key}</span>
                      <span className="font-semibold text-slate-800">
                        ৳{c.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Discount Row */}
                <div className="space-y-2 pb-4 border-b border-slate-100">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal Gross:</span>
                    <span className="font-bold text-slate-800">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 font-medium">Discount:</span>
                    <div className="flex items-center gap-1.5 w-40">
                      <input
                        type="number"
                        min={0}
                        value={discountVal || ''}
                        onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-right font-bold text-dark focus:outline-hidden focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDiscountType(discountType === 'amount' ? 'percent' : 'amount')
                        }
                        className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                      >
                        {discountType === 'amount' ? 'BDT' : '%'}
                      </button>
                    </div>
                  </div>

                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Deducted:</span>
                      <span>-৳{calculatedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Payable Grand Total
                    </span>
                    <span className="text-xl font-black text-primary">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary font-mono">
                    IPD POS
                  </span>
                </div>

                {/* Advance Payment Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Advance Deposit Received (BDT) *
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdvance('full')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Full
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdvance('half')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        50%
                      </button>
                    </div>
                  </div>

                  <input
                    type="number"
                    min={0}
                    value={advancePayment || ''}
                    onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                    placeholder="Enter deposit amount"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-dark focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                {/* Due Balance Card */}
                <div
                  className={`p-3 rounded-xl flex items-center justify-between ${
                    dueAmount <= 0
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <span className="font-bold">
                    {dueAmount <= 0 ? 'Fully Paid at Admission' : 'Balance Remaining Due:'}
                  </span>
                  <span className="text-sm font-black font-mono">
                    ৳{dueAmount.toFixed(2)}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Payment Method
                  </label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash at Counter</SelectItem>
                      <SelectItem value="bKash / MFS">bKash / Mobile Money</SelectItem>
                      <SelectItem value="Nagad">Nagad MFS</SelectItem>
                      <SelectItem value="Visa / Mastercard">Debit / Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Direct Bank Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Large Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-sm tracking-wide shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" />
                      <span>Complete Admission & Generate Slip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Printable Digital Admission Slip Modal */}
      <AdmissionSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        admission={createdAdmission}
      />
    </div>
  );
};

export default NewAdmissionPOSPage;
