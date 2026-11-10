import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DoorOpen,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Printer,
  Eye,
  Trash2,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Ticket,
  Users,
  Check,
  X,
  CreditCard,
  Building2,
  Activity,
  Play,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetDoctorsQuery, type Doctor } from '../../store/api/doctorApi';
import { useGetPatientsQuery } from '../../store/api/patientApi';
import {
  useGetDoctorSerialsQuery,
  useCreateDoctorSerialMutation,
  useUpdateDoctorSerialStatusMutation,
  useDeleteDoctorSerialMutation,
  type DoctorSerial,
} from '../../store/api/serialApi';
import { DoctorSerialSlipModal } from '../../components/serials/DoctorSerialSlipModal';

export const DoctorSerialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillDoctorId = searchParams.get('doctorId');
  const prefillPatientId = searchParams.get('patientId');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(prefillDoctorId || '');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState<string>('');
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState<boolean>(false);
  const doctorSearchRef = useRef<HTMLDivElement>(null);

  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);
  const [intakeMode, setIntakeMode] = useState<'existing' | 'new'>('existing');

  // Patient Info State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(prefillPatientId || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Visit & Financial State
  const [visitType, setVisitType] = useState<'First Visit' | 'Follow-up' | 'Report Show' | 'Emergency'>('First Visit');
  const [consultationFee, setConsultationFee] = useState<number>(1000);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Card'>('Cash');
  const [symptoms, setSymptoms] = useState('');

  // Live Query & Monitor State
  const [querySearch, setQuerySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled'>('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');

  // Slip Modal State
  const [selectedSlipSerial, setSelectedSlipSerial] = useState<DoctorSerial | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [recentSuccessSerial, setRecentSuccessSerial] = useState<DoctorSerial | null>(null);

  // API Queries & Mutations
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({ limit: 100 });
  const { data: patientsData, isLoading: patientsLoading } = useGetPatientsQuery({ limit: 100 });
  const { data: serialsData, isLoading: serialsLoading } = useGetDoctorSerialsQuery({
    doctorId: selectedDoctorFilter !== 'all' ? selectedDoctorFilter : undefined,
    date: appointmentDate,
  });

  const [createSerial, { isLoading: isSubmitting }] = useCreateDoctorSerialMutation();
  const [updateStatus] = useUpdateDoctorSerialStatusMutation();
  const [deleteSerial] = useDeleteDoctorSerialMutation();

  const doctorsList: Doctor[] = doctorsData?.data || [];
  const patientsList = patientsData?.data || [];
  const serialsList: DoctorSerial[] = serialsData?.data || [];

  // Default to first active doctor if none selected
  useEffect(() => {
    if (!selectedDoctorId && doctorsList.length > 0) {
      setSelectedDoctorId(doctorsList[0].id);
    }
  }, [doctorsList, selectedDoctorId]);

  // Selected Doctor Object
  const selectedDoctor = useMemo(() => {
    return doctorsList.find((d) => d.id === selectedDoctorId) || doctorsList[0];
  }, [doctorsList, selectedDoctorId]);

  // Track if doctor input has been initially set so deleting/clearing doesn't force re-fill
  const isDoctorInputInitializedRef = useRef<boolean>(false);

  // Sync doctorSearchTerm only once when selected doctor first loads
  useEffect(() => {
    if (selectedDoctor && !isDoctorInputInitializedRef.current) {
      setDoctorSearchTerm(selectedDoctor.name);
      isDoctorInputInitializedRef.current = true;
    }
  }, [selectedDoctor]);

  // Filtered doctors based on user typing doctor's name, specialty, dept, or room
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchTerm.trim()) return doctorsList;
    const q = doctorSearchTerm.toLowerCase().trim();
    return doctorsList.filter((doc) => {
      const name = doc.name.toLowerCase();
      const dept = doc.department.toLowerCase();
      const spec = (doc.specialty || '').toLowerCase();
      const room = (doc.roomNumber || '').toLowerCase();
      return name.includes(q) || dept.includes(q) || spec.includes(q) || room.includes(q);
    });
  }, [doctorsList, doctorSearchTerm]);

  // Auto-adjust consultation fee when doctor or visit type changes
  useEffect(() => {
    if (!selectedDoctor) return;
    if (visitType === 'Report Show') {
      setConsultationFee(0);
      setPaidAmount(0);
    } else if (visitType === 'Follow-up') {
      const fee = selectedDoctor.secondVisitFee ? parseFloat(selectedDoctor.secondVisitFee) : 500;
      setConsultationFee(fee);
      setPaidAmount(Math.max(0, fee - discount));
    } else {
      const fee = selectedDoctor.firstVisitFee ? parseFloat(selectedDoctor.firstVisitFee) : 1000;
      setConsultationFee(fee);
      setPaidAmount(Math.max(0, fee - discount));
    }
  }, [selectedDoctor, visitType, discount]);

  // Calculate Next Serial Number for Selected Doctor & Date
  const doctorSerialsForDate = useMemo(() => {
    if (!selectedDoctorId) return [];
    return serialsList.filter(
      (s) => s.doctorId === selectedDoctorId && s.appointmentDate === appointmentDate
    );
  }, [serialsList, selectedDoctorId, appointmentDate]);

  const nextSerialNumber = useMemo(() => {
    if (doctorSerialsForDate.length === 0) return 1;
    const maxSerial = doctorSerialsForDate.reduce((max, s) => Math.max(max, s.serialNumber || 0), 0);
    return maxSerial + 1;
  }, [doctorSerialsForDate]);

  // Daily limit & capacity progress
  const dailyLimit = selectedDoctor?.dailyPatientLimit || 30;
  const bookedCount = doctorSerialsForDate.length;
  const capacityPercent = Math.min(100, Math.round((bookedCount / dailyLimit) * 100));

  // Auto-fill existing patient
  const handleSelectExistingPatient = (patId: string) => {
    setSelectedPatientId(patId);
    const found = patientsList.find((p) => p.id === patId || p.patientId === patId);
    if (found) {
      setPatientName(found.name || '');
      setPatientPhone(found.phone || '');
      setPatientSearchTerm(found.phone ? `${found.phone} — ${found.name}` : found.name);
      setPatientAge(found.age ? String(found.age) : '');
      setPatientGender(found.gender || 'Male');
      setPatientAddress(found.address || '');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (doctorSearchRef.current && !doctorSearchRef.current.contains(e.target as Node)) {
        setIsDoctorDropdownOpen(false);
        // If user left doctor search input blank and clicked outside, restore current selected doctor's name
        if (!doctorSearchTerm.trim() && selectedDoctor) {
          setDoctorSearchTerm(selectedDoctor.name);
        }
      }
      if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [doctorSearchTerm, selectedDoctor]);

  // Filtered patients for dropdown
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return patientsList.slice(0, 8);
    const q = patientSearchTerm.toLowerCase().trim();
    return patientsList
      .filter((p) => {
        const phone = p.phone ? p.phone.toLowerCase() : '';
        const name = p.name ? p.name.toLowerCase() : '';
        const pid = p.patientId ? p.patientId.toLowerCase() : '';
        return phone.includes(q) || name.includes(q) || pid.includes(q);
      })
      .slice(0, 10);
  }, [patientsList, patientSearchTerm]);

  // Instant Serial Query Matching ("abr query o kora jabe seral kar koto")
  const queryMatchedSerials = useMemo(() => {
    if (!querySearch.trim()) return [];
    const q = querySearch.toLowerCase().trim();
    return serialsList.filter((s) => {
      const matchPhone = s.patientPhone.toLowerCase().includes(q);
      const matchName = s.patientName.toLowerCase().includes(q);
      const matchToken = s.tokenNo.toLowerCase().includes(q);
      const matchSerial = String(s.serialNumber) === q;
      const matchDoctor = s.doctorName.toLowerCase().includes(q);
      return matchPhone || matchName || matchToken || matchSerial || matchDoctor;
    });
  }, [serialsList, querySearch]);

  // Queue Monitor for Active Doctor: Currently Serving vs Next Up
  const activeQueueServing = useMemo(() => {
    return doctorSerialsForDate.find((s) => s.status === 'In Consultation');
  }, [doctorSerialsForDate]);

  const activeQueueNext = useMemo(() => {
    return doctorSerialsForDate.find((s) => s.status === 'Waiting');
  }, [doctorSerialsForDate]);

  const activeQueueWaitingCount = useMemo(() => {
    return doctorSerialsForDate.filter((s) => s.status === 'Waiting').length;
  }, [doctorSerialsForDate]);

  // One-Click Queue Advancement ("Call Next")
  const handleCallNextSerial = async () => {
    if (!activeQueueNext) {
      alert('No waiting patients in queue for this doctor!');
      return;
    }
    try {
      await updateStatus({
        id: activeQueueNext.id,
        status: 'In Consultation',
      }).unwrap();
    } catch (err: any) {
      alert('Failed to update queue');
    }
  };

  // Form Submit: Confirm Serial
  const handleConfirmSerial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor) {
      alert('Please select a doctor.');
      return;
    }
    if (!patientName.trim()) {
      alert('Patient name is required.');
      return;
    }
    if (!patientPhone.trim()) {
      alert('Patient phone number is required.');
      return;
    }

    try {
      const feeNum = consultationFee;
      const discNum = discount;
      const totalPayable = Math.max(0, feeNum - discNum);
      const paidVal = paidAmount === '' ? totalPayable : parseFloat(String(paidAmount));
      const dueVal = Math.max(0, totalPayable - paidVal);

      const res = await createSerial({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorDepartment: selectedDoctor.department,
        doctorRoomNumber: selectedDoctor.roomNumber || 'Room 101',
        doctorSerialContact: selectedDoctor.serialContactNumber || selectedDoctor.contactNumber || '01711-002233',
        patientId: selectedPatientId || undefined,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge.trim() || undefined,
        patientGender,
        patientAddress: patientAddress.trim() || undefined,
        appointmentDate,
        visitType,
        consultationFee: feeNum,
        discount: discNum,
        paidAmount: paidVal,
        dueAmount: dueVal,
        paymentStatus: dueVal === 0 ? 'Paid' : paidVal > 0 ? 'Partial' : 'Unpaid',
        paymentMethod,
        symptoms: symptoms.trim() || undefined,
        status: 'Waiting',
      }).unwrap();

      if (res.success && res.data) {
        setRecentSuccessSerial(res.data);
        setSelectedSlipSerial(res.data);
        setIsSlipOpen(true);

        // Reset patient intake if in new mode
        if (intakeMode === 'new') {
          setPatientName('');
          setPatientPhone('');
          setPatientAge('');
          setPatientAddress('');
        }
        setSymptoms('');
      }
    } catch (err: any) {
      console.error('Failed to book serial:', err);
      alert(err?.data?.message || 'Failed to book serial.');
    }
  };

  // Serials Table Filtered Display
  const displayedSerials = useMemo(() => {
    let list = serialsList;
    if (selectedDoctorFilter !== 'all') {
      list = list.filter((s) => s.doctorId === selectedDoctorFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list;
  }, [serialsList, selectedDoctorFilter, statusFilter]);

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1680px] mx-auto gap-2.5 select-none font-sans text-dark">
      {/* 1. SUCCESS NOTIFICATION BAR */}
      {recentSuccessSerial && (
        <div className="shrink-0 p-2 sm:px-3 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in text-xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Serial Confirmed: <strong className="font-bold text-emerald-900">Serial #{recentSuccessSerial.serialNumber}</strong> (Token: <span className="font-mono">{recentSuccessSerial.tokenNo}</span>) | Patient: <strong>{recentSuccessSerial.patientName}</strong> | Doctor: <strong>{recentSuccessSerial.doctorName}</strong> ({recentSuccessSerial.doctorRoomNumber})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedSlipSerial(recentSuccessSerial);
                setIsSlipOpen(true);
              }}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Token Slip</span>
            </button>
            <button
              onClick={() => setRecentSuccessSerial(null)}
              type="button"
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. DUAL PANEL WORKFLOW: BOOKING (LEFT) vs QUEUE MONITOR & QUERY (RIGHT) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* ================= LEFT COLUMN: FAST SERIAL ALLOCATION FORM (5 cols) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 overflow-hidden">
          <form
            onSubmit={handleConfirmSerial}
            className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {/* Form Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-teal-50 via-teal-50/50 to-white border-b border-teal-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-dark flex items-center gap-1.5">
                    <span>Doctor Serial Booking</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                      Queue POS
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Allocate next available queue token with instant receipt
                  </p>
                </div>
              </div>

              {/* Next Serial Callout Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-200 animate-pulse" />
                <span>Next: #{String(nextSerialNumber).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {/* Doctor Selector & Overview Card */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                    <span>Select Specialist Doctor *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {doctorsList.length} Doctors Available
                  </span>
                </label>

                {/* Searchable Doctor Combobox / Name Search */}
                <div ref={doctorSearchRef} className="relative">
                  <div className="relative flex items-center">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search doctor by name, specialty, chamber..."
                      value={doctorSearchTerm}
                      onFocus={() => setIsDoctorDropdownOpen(true)}
                      onChange={(e) => {
                        setDoctorSearchTerm(e.target.value);
                        setIsDoctorDropdownOpen(true);
                      }}
                      className="w-full h-9 pl-8 pr-16 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 focus:outline-hidden transition"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      {doctorSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setDoctorSearchTerm('');
                            setIsDoctorDropdownOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                          title="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsDoctorDropdownOpen((prev) => !prev)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                        title="Toggle list"
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isDoctorDropdownOpen ? 'rotate-180 text-teal-600' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu of Filtered Doctors */}
                  {isDoctorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-10 bg-white rounded-xl border border-slate-200 shadow-xl z-30 max-h-64 overflow-y-auto p-1.5 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Available Doctors ({filteredDoctors.length})</span>
                        {doctorSearchTerm && (
                          <span className="text-teal-600 font-semibold normal-case">
                            Filter: "{doctorSearchTerm}"
                          </span>
                        )}
                      </div>

                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doc) => {
                          const isSelected = doc.id === selectedDoctorId;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setSelectedDoctorId(doc.id);
                                setDoctorSearchTerm(doc.name);
                                setIsDoctorDropdownOpen(false);
                                if (selectedDoctorFilter === 'all') {
                                  setSelectedDoctorFilter(doc.id);
                                }
                              }}
                              className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between gap-3 text-xs ${
                                isSelected
                                  ? 'bg-teal-50 border border-teal-200 text-teal-950 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{doc.name}</span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.2 rounded bg-teal-600 text-white text-[9px] font-bold">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                                  <span className="text-teal-700 font-semibold">
                                    {doc.specialty || doc.department}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-mono">
                                    <DoorOpen className="h-2.5 w-2.5 text-slate-400" />
                                    {doc.roomNumber || 'Chamber TBA'}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-600 font-semibold">
                                    Fee: ৳{doc.firstVisitFee || 1000}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                {isSelected ? (
                                  <div className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                                    <Check className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <span className="text-[10.5px] font-semibold text-teal-600 hover:underline">
                                    Select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No doctor found matching "{doctorSearchTerm}".
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Doctor Chamber Information Capsule */}
                {selectedDoctor && (
                  <div className="p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/40 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <span>{selectedDoctor.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-semibold">
                          {selectedDoctor.specialty || selectedDoctor.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-teal-800">
                          <DoorOpen className="h-3 w-3" />
                          {selectedDoctor.roomNumber || 'Chamber 101'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {selectedDoctor.serialContactNumber || selectedDoctor.contactNumber || '01711-002233'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" />
                          {selectedDoctor.consultationStartTime || '05:00 PM'} - {selectedDoctor.consultationEndTime || '09:00 PM'}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold text-teal-900">
                        {bookedCount} / {dailyLimit} Booked
                      </div>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            capacityPercent > 85 ? 'bg-rose-500' : capacityPercent > 60 ? 'bg-amber-500' : 'bg-teal-600'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Date Picker with Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" />
                    <span>Appointment Date</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAppointmentDate(todayStr)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                        appointmentDate === todayStr
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmrw = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                        setAppointmentDate(tmrw);
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Patient Intake Section (Matching TestPOSPage) */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5">
                {/* Tabs: Existing vs New Patient */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Patient Details</span>
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setIntakeMode('existing')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                        intakeMode === 'existing'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-dark'
                      }`}
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>Existing Phone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIntakeMode('new');
                        setSelectedPatientId('');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                        intakeMode === 'new'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-dark'
                      }`}
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>New Patient</span>
                    </button>
                  </div>
                </div>

                {intakeMode === 'existing' ? (
                  /* Existing Patient Live Phone/Name Search */
                  <div ref={patientSearchRef} className="relative">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search patient by mobile number or name..."
                        value={patientSearchTerm}
                        onFocus={() => setIsPatientDropdownOpen(true)}
                        onChange={(e) => {
                          setPatientSearchTerm(e.target.value);
                          setIsPatientDropdownOpen(true);
                        }}
                        className="w-full h-8.5 pl-8 pr-7 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                      />
                      {patientSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setPatientSearchTerm('');
                            setSelectedPatientId('');
                            setPatientName('');
                            setPatientPhone('');
                          }}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Results */}
                    {isPatientDropdownOpen && filteredPatients.length > 0 && (
                      <div className="absolute left-0 right-0 top-10 bg-white rounded-xl border border-slate-200 shadow-xl z-20 max-h-48 overflow-y-auto p-1 divide-y divide-slate-100">
                        {filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              handleSelectExistingPatient(p.id);
                              setIsPatientDropdownOpen(false);
                            }}
                            className="p-2 hover:bg-teal-50 rounded-lg cursor-pointer transition flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-dark">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                <Phone className="h-2.5 w-2.5 text-teal-600" />
                                {p.phone}
                                <span>•</span>
                                <span>{p.gender || 'Male'}, {p.age ? `${p.age} yrs` : 'N/A'}</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {p.patientId || p.id.slice(0, 8)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Patient Information Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Patient Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahim Uddin"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="017xxxxxxxx"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Age (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Address / City</label>
                    <input
                      type="text"
                      placeholder="Dhanmondi, Dhaka"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Type & Financials */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700">Consultation Category & Fees</span>

                {/* Visit Type Chips */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['First Visit', 'Follow-up', 'Report Show', 'Emergency'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVisitType(type)}
                      className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer border ${
                        visitType === type
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'First Visit'
                        ? '1st Visit'
                        : type === 'Follow-up'
                        ? '2nd / Follow-up'
                        : type === 'Report Show'
                        ? 'Report Free'
                        : 'Emergency'}
                    </button>
                  ))}
                </div>

                {/* Billing Grid */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">Doctor Fee (৳)</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-dark focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">Discount (৳)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-dark focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">Paid Amount (৳)</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-teal-300 bg-teal-50 text-xs font-bold text-teal-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">Payment Via</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                {/* Symptoms / Chief Complaints */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-semibold text-slate-500">
                    Chief Complaint / Clinical Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eye redness, itching, vision checkup..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full h-7.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                <span className="text-slate-500">Issuing Serial: </span>
                <strong className="text-teal-700 font-extrabold text-sm">
                  #{String(nextSerialNumber).padStart(2, '0')}
                </strong>
                <span className="text-slate-400 font-mono text-[11px] ml-1">
                  ({appointmentDate})
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/30 transition cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Confirming...' : `Confirm & Issue Serial #${nextSerialNumber}`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT COLUMN: LIVE SERIAL QUERY & QUEUE MONITOR (7 cols) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-2.5 overflow-hidden">
          {/* 1. INSTANT QUERY & SEARCH BANNER ("abr query o kora jabe seral kar koto") */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-teal-600" />
                <span className="text-xs font-bold text-dark">Instant Serial Query & Lookup</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Find patient serial by Mobile No, Name, or Token ID
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Type patient phone (e.g. 017...), name, or token number (SRL-...) to check serial..."
                value={querySearch}
                onChange={(e) => setQuerySearch(e.target.value)}
                className="w-full h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-hidden"
              />
              {querySearch && (
                <button
                  type="button"
                  onClick={() => setQuerySearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Live Query Match Cards (When searched) */}
            {querySearch.trim() && (
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {queryMatchedSerials.length > 0 ? (
                  queryMatchedSerials.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 flex items-center justify-between gap-3 text-xs animate-in fade-in"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          #{String(s.serialNumber).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="font-bold text-dark flex items-center gap-2">
                            <span>{s.patientName}</span>
                            <span className="font-mono text-teal-700 text-[11px] font-semibold flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {s.patientPhone}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Dr: <strong>{s.doctorName}</strong> ({s.doctorRoomNumber}) • Date: {s.appointmentDate} • Est: {s.estimatedTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Waiting'
                              ? 'bg-amber-100 text-amber-800'
                              : s.status === 'In Consultation'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : s.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlipSerial(s);
                            setIsSlipOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-teal-300 bg-white text-teal-700 hover:bg-teal-600 hover:text-white transition cursor-pointer shadow-2xs"
                          title="Print Token Slip"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                    No doctor serial found matching "{querySearch}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. LIVE QUEUE MONITOR BOARD (Serving vs Next Up) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Now Serving Card */}
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-600 animate-spin" />
                  <span>Now In Consultation</span>
                </div>
                {activeQueueServing ? (
                  <div className="mt-1">
                    <div className="text-xl font-black text-blue-950">
                      Serial #{String(activeQueueServing.serialNumber).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] font-semibold text-blue-900 truncate max-w-[130px]">
                      {activeQueueServing.patientName}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-2 font-medium">None currently inside</div>
                )}
              </div>
              {activeQueueServing && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus({
                      id: activeQueueServing.id,
                      status: 'Completed',
                    })
                  }
                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Done</span>
                </button>
              )}
            </div>

            {/* Next Up Card */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>Next in Queue</span>
                </div>
                {activeQueueNext ? (
                  <div className="mt-1">
                    <div className="text-xl font-black text-amber-950">
                      Serial #{String(activeQueueNext.serialNumber).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] font-semibold text-amber-900 truncate max-w-[130px]">
                      {activeQueueNext.patientName}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-2 font-medium">No waiting patients</div>
                )}
              </div>
              {activeQueueNext && (
                <button
                  type="button"
                  onClick={handleCallNextSerial}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  <span>Call Next</span>
                </button>
              )}
            </div>

            {/* Queue Counter Summary */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Waiting</span>
                <div className="text-xl font-black text-amber-700">{activeQueueWaitingCount}</div>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Completed</span>
                <div className="text-xl font-black text-emerald-700">
                  {doctorSerialsForDate.filter((s) => s.status === 'Completed').length}
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Booked</span>
                <div className="text-xl font-black text-dark">{doctorSerialsForDate.length}</div>
              </div>
            </div>
          </div>

          {/* 3. SERIALS TABLE & QUEUE MANAGEMENT LIST */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
            {/* Filter Tabs Bar */}
            <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              {/* Doctor filter dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Filter Doctor:</span>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="h-7.5 px-2 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-hidden"
                >
                  <option value="all">All Doctors ({serialsList.length})</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1">
                {(['all', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'] as const).map((st) => (
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
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto">
              {displayedSerials.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Serial</th>
                      <th className="py-2.5 px-3">Patient Information</th>
                      <th className="py-2.5 px-3">Doctor & Chamber</th>
                      <th className="py-2.5 px-3">Visit & Fee</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedSerials.map((s) => (
                      <tr key={s.id} className="hover:bg-teal-50/40 transition">
                        {/* Serial Number Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="h-7 w-7 rounded-lg bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-xs">
                              #{s.serialNumber}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{s.tokenNo}</span>
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-dark">{s.patientName}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 text-teal-600" />
                            {s.patientPhone}
                            <span>•</span>
                            <span>{s.patientGender || 'Male'}, {s.patientAge ? `${s.patientAge}y` : 'N/A'}</span>
                          </div>
                        </td>

                        {/* Doctor & Room */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{s.doctorName}</div>
                          <div className="text-[10px] text-teal-700 flex items-center gap-1 font-medium">
                            <DoorOpen className="h-2.5 w-2.5" />
                            {s.doctorRoomNumber}
                            <span>•</span>
                            <Clock className="h-2.5 w-2.5" />
                            {s.estimatedTime}
                          </div>
                        </td>

                        {/* Visit & Fee */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-700">{s.visitType}</div>
                          <div className="text-[10px] font-bold text-teal-800">
                            ৳{s.paidAmount} <span className="font-normal text-slate-400">({s.paymentStatus})</span>
                          </div>
                        </td>

                        {/* Status Change Dropdown */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <select
                            value={s.status}
                            onChange={(e) =>
                              updateStatus({
                                id: s.id,
                                status: e.target.value as any,
                              })
                            }
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer focus:outline-hidden ${
                              s.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : s.status === 'In Consultation'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : s.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                          >
                            <option value="Waiting">Waiting</option>
                            <option value="In Consultation">In Consultation</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlipSerial(s);
                                setIsSlipOpen(true);
                              }}
                              className="p-1 rounded-md border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition cursor-pointer"
                              title="Print Token Slip"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Cancel and remove serial #${s.serialNumber} for ${s.patientName}?`)) {
                                  deleteSerial(s.id);
                                }
                              }}
                              className="p-1 rounded-md border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Cancel Serial"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No doctor serials found for the selected criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRINTABLE TOKEN SLIP MODAL */}
      <DoctorSerialSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        serial={selectedSlipSerial}
      />
    </div>
  );
};

export default DoctorSerialsPage;
