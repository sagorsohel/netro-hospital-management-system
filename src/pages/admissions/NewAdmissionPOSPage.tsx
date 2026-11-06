import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  Receipt,
  CheckCircle2,
  BedDouble,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Printer,
  Eye,
  Tag,
  Stethoscope,
  Clock,
  Sparkles,
  ShieldCheck,
  Wallet,
  DollarSign,
  Check,
  X,
  BadgePercent,
  Phone,
  ChevronDown,
  User,
  Scissors,
  Activity,
  HeartPulse,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetRoomsQuery, type HospitalRoom } from '../../store/api/roomApi';
import { useGetDoctorsQuery } from '../../store/api/doctorApi';
import { useGetOperationsQuery } from '../../store/api/operationApi';
import { useGetPatientsQuery } from '../../store/api/patientApi';
import {
  useCreateAdmissionMutation,
  useGetAdmissionsQuery,
  type InpatientAdmission,
  type AdmissionExtraCharge,
} from '../../store/api/admissionApi';
import { AdmissionSlipModal } from '../../components/admissions/AdmissionSlipModal';

export interface AdmissionTableItem {
  id: string;
  itemType: 'admission_fee' | 'room_stay' | 'operation' | 'extra_service';
  name: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  discountType: 'amount' | 'percent';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  removable?: boolean;
}

export const NewAdmissionPOSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPatientId = searchParams.get('patientId');

  // Queries
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery({ limit: 100 });
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({ limit: 50 });
  const { data: operationsData, isLoading: operationsLoading } = useGetOperationsQuery({ limit: 50 });
  const { data: patientsData, isLoading: patientsLoading } = useGetPatientsQuery({ limit: 100 });
  const { data: activeAdmissionsData } = useGetAdmissionsQuery({ status: 'Admitted', limit: 100 });

  const [createAdmission, { isLoading: isSubmitting }] = useCreateAdmissionMutation();

  // Intake Mode: 'existing' vs 'new' (default to existing phone search for fastest POS flow)
  const [intakeMode, setIntakeMode] = useState<'new' | 'existing'>('existing');

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

  // Clinical Stays & Assignments
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedNumber, setSelectedBedNumber] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [customDoctorName, setCustomDoctorName] = useState('');
  const [selectedOperationId, setSelectedOperationId] = useState('none');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Table Line Items Ledger
  const [tableItems, setTableItems] = useState<AdmissionTableItem[]>([
    {
      id: 'item-admission-fee',
      itemType: 'admission_fee',
      name: 'Admission & IPD Registration Fee',
      category: 'Hospital Admin',
      unit: 'admission',
      price: 500,
      quantity: 1,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      finalAmount: 500,
      removable: true,
    },
  ]);

  // Fast Service Search & Custom Add State
  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceSearchContainerRef = useRef<HTMLDivElement>(null);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [customUnitInput, setCustomUnitInput] = useState('per day');

  // POS Financials
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Slip Modal State
  const [createdAdmission, setCreatedAdmission] = useState<InpatientAdmission | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    admissionNo: string;
    patientId: string;
    patientInternalId: string;
    roomInfo: string;
  } | null>(null);

  // Patient search state for phone number / name live search
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientSearchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        patientSearchContainerRef.current &&
        !patientSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsPatientDropdownOpen(false);
      }
      if (
        serviceSearchContainerRef.current &&
        !serviceSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered patients for search with phone number, name, or patient ID
  const filteredPatients = useMemo(() => {
    const list = patientsData?.data || [];
    if (!patientSearchTerm.trim()) return list.slice(0, 10);
    const q = patientSearchTerm.toLowerCase().trim();
    return list
      .filter((p) => {
        const phone = p.phone ? p.phone.toLowerCase() : '';
        const name = p.name ? p.name.toLowerCase() : '';
        const patId = p.patientId ? p.patientId.toLowerCase() : '';
        return phone.includes(q) || name.includes(q) || patId.includes(q);
      })
      .slice(0, 15);
  }, [patientsData, patientSearchTerm]);

  // Auto-fill when existing patient is chosen
  const handleSelectExistingPatient = (patId: string) => {
    setSelectedPatientId(patId);
    const found = patientsData?.data?.find(
      (p) => p.id === patId || p.patientId === patId
    );
    if (found) {
      setPatientName(found.name || '');
      setPatientPhone(found.phone || '');
      setPatientSearchTerm(found.phone ? `${found.phone} — ${found.name}` : found.name);
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

  // Prefill when URL query patientId is provided and patients load
  useEffect(() => {
    if (prefillPatientId && patientsData?.data?.length) {
      setIntakeMode('existing');
      handleSelectExistingPatient(prefillPatientId);
    }
  }, [prefillPatientId, patientsData]);

  // Pick existing patient from phone/name search
  const handlePickPatient = (p: any) => {
    handleSelectExistingPatient(p.id);
    setPatientSearchTerm(p.phone ? `${p.phone} — ${p.name}` : p.name);
    setIsPatientDropdownOpen(false);
  };

  // Clear selected patient
  const handleClearPatient = () => {
    setSelectedPatientId('');
    setPatientSearchTerm('');
    setPatientName('');
    setPatientPhone('');
    setPatientAge('');
    setPatientGender('Male');
    setPatientBloodGroup('O+');
    setPatientAddress('');
    setMaritalStatus('Single');
  };

  // Complete Reset of Admission Form
  const resetForm = () => {
    setSelectedPatientId('');
    setPatientSearchTerm('');
    setPatientName('');
    setPatientPhone('');
    setPatientAge('');
    setPatientGender('Male');
    setPatientDob('');
    setPatientEmail('');
    setPatientAddress('');
    setPatientBloodGroup('O+');
    setGuardianName('');
    setGuardianPhone('');
    setGuardianRelation('Spouse');
    setEmergencyContact('');
    setMaritalStatus('Married');
    setOccupation('');
    setAllergies('None');
    setIsPatientDropdownOpen(false);

    setSelectedRoomId('');
    setSelectedBedNumber('');
    setSelectedDoctorId('');
    setCustomDoctorName('');
    setSelectedOperationId('none');
    setDiagnosis('');
    setNotes('');

    setTableItems([
      {
        id: 'item-admission-fee',
        itemType: 'admission_fee',
        name: 'Admission & IPD Registration Fee',
        category: 'Hospital Admin',
        unit: 'admission',
        price: 500,
        quantity: 1,
        discountType: 'amount',
        discountValue: 0,
        discountAmount: 0,
        finalAmount: 500,
        removable: true,
      },
    ]);

    setServiceSearch('');
    setIsServiceDropdownOpen(false);
    setCustomPriceInput('');
    setCustomUnitInput('per day');

    setDiscountType('amount');
    setDiscountVal(0);
    setAdvancePayment('');
    setPaymentMethod('Cash');
  };

  // Selected Entities
  const selectedRoom = useMemo(() => {
    return roomsData?.data?.find((r) => r.id === selectedRoomId);
  }, [roomsData, selectedRoomId]);

  const selectedDoctor = useMemo(() => {
    return doctorsData?.data?.find((d) => d.id === selectedDoctorId);
  }, [doctorsData, selectedDoctorId]);

  const selectedOperation = useMemo(() => {
    if (!selectedOperationId || selectedOperationId === 'none') return null;
    return operationsData?.data?.find((op) => op.id === selectedOperationId);
  }, [operationsData, selectedOperationId]);

  // Normalize string for case-insensitive matching
  const normalizeKey = (s?: string | null) => (s || '').trim().toLowerCase();

  // Helper to get active admission record for a specific room & bed
  const getOccupiedAdmissionForBed = (room: HospitalRoom | undefined, bedNumber: string) => {
    if (!room) return null;
    const rId = normalizeKey(room.id);
    const rNum = normalizeKey(room.roomNumber);
    const targetBed = normalizeKey(bedNumber);

    const activeList = activeAdmissionsData?.data || [];
    return (
      activeList.find((adm) => {
        if (adm.status !== 'Admitted') return false;
        const admRoomId = normalizeKey(adm.roomId);
        const admRoomNum = normalizeKey(adm.roomNumber);
        const matchRoom =
          (admRoomId && (admRoomId === rId || admRoomId === rNum)) ||
          (admRoomNum && (admRoomNum === rNum || admRoomNum === rId));
        if (!matchRoom) return false;
        const admBed = normalizeKey(adm.bedNumber);
        return admBed === targetBed;
      }) || null
    );
  };

  // Helper to check if a room is completely booked
  const isRoomFullyBooked = (room: HospitalRoom) => {
    if (room.status === 'Booked' || room.status === 'Maintenance' || room.status === 'Cleaning') {
      return true;
    }

    const beds = room.bedNumbers && room.bedNumbers.length > 0 ? room.bedNumbers : ['Bed 1'];
    const occupiedCount = beds.filter((b) => !!getOccupiedAdmissionForBed(room, b)).length;

    // If all individual beds in this room are occupied by admitted patients
    if (occupiedCount >= beds.length) {
      return true;
    }

    // If room's occupiedBeds matches or exceeds total bedCount
    if (room.bedCount > 0 && (room.occupiedBeds || 0) >= room.bedCount) {
      return true;
    }

    return false;
  };

  // Helper to count available beds in a room
  const getRoomFreeBedsCount = (room: HospitalRoom) => {
    const beds = room.bedNumbers && room.bedNumbers.length > 0 ? room.bedNumbers : ['Bed 1'];
    const occupiedCount = beds.filter((b) => !!getOccupiedAdmissionForBed(room, b)).length;
    return Math.max(0, beds.length - occupiedCount);
  };

  // Automatically update/inject Room Stay line into table
  const handleRoomSelect = (roomId: string) => {
    const room = roomsData?.data?.find((r) => r.id === roomId);
    if (!room) return;

    if (isRoomFullyBooked(room)) {
      alert(`Room ${room.roomNumber} is currently fully booked. Please choose an available room.`);
      return;
    }

    setSelectedRoomId(roomId);

    // Automatically pick the first AVAILABLE bed in this room!
    const beds = room.bedNumbers && room.bedNumbers.length > 0 ? room.bedNumbers : ['Bed 1'];
    const availableBed = beds.find((b) => !getOccupiedAdmissionForBed(room, b)) || beds[0] || 'Bed 1';
    setSelectedBedNumber(availableBed);

    const perDay = parseFloat(String(room.perDayCharge || 1500));
    const label = `Room ${room.roomNumber} (${room.name || room.roomType}) - ${availableBed}`;

    setTableItems((prev) => {
      const idx = prev.findIndex((item) => item.itemType === 'room_stay');
      if (idx > -1) {
        return prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                name: label,
                price: perDay,
                finalAmount: perDay * (item.quantity || 1) - (item.discountAmount || 0),
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: 'item-room-stay',
            itemType: 'room_stay',
            name: label,
            category: 'Bed & Ward',
            unit: 'day',
            price: perDay,
            quantity: 1,
            discountType: 'amount',
            discountValue: 0,
            discountAmount: 0,
            finalAmount: perDay,
            removable: true,
          },
        ];
      }
    });
  };

  // Change Bed Number and reflect on room item
  const handleBedSelect = (bed: string) => {
    if (selectedRoom) {
      const occupied = getOccupiedAdmissionForBed(selectedRoom, bed);
      if (occupied) {
        alert(
          `Bed "${bed}" in Room ${selectedRoom.roomNumber} is already booked by ${occupied.patientName} (#${occupied.admissionNo}). Please select an available bed.`
        );
        return;
      }
    }
    setSelectedBedNumber(bed);
    if (!selectedRoom) return;
    const label = `Room ${selectedRoom.roomNumber} (${selectedRoom.name || selectedRoom.roomType}) - ${bed}`;
    setTableItems((prev) =>
      prev.map((item) =>
        item.itemType === 'room_stay' ? { ...item, name: label } : item
      )
    );
  };

  // Render Room Select Options (marks full rooms as disabled & [BOOKED])
  const renderRoomSelectOptions = () => {
    return roomsData?.data?.map((r) => {
      const isFull = isRoomFullyBooked(r);
      const freeBeds = getRoomFreeBedsCount(r);
      const totalBeds = r.bedNumbers?.length || r.bedCount || 1;

      return (
        <SelectItem
          key={r.id}
          value={r.id}
          disabled={isFull}
          className={`text-xs ${
            isFull
              ? 'opacity-40 cursor-not-allowed bg-rose-50/40 text-slate-400 font-normal'
              : 'text-slate-800 font-medium'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <span className={`truncate max-w-[190px] ${isFull ? 'line-through text-slate-400' : ''}`}>
              Room {r.roomNumber} ({r.name || r.roomType})
            </span>
            <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
              {isFull ? (
                <span className="px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-700">
                  BOOKED
                </span>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">
                    ৳{parseFloat(String(r.perDayCharge || 0)).toLocaleString()}/d
                  </span>
                  {totalBeds > 1 && (
                    <span className="px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {freeBeds}/{totalBeds} Free
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </SelectItem>
      );
    });
  };

  // Render Bed Select Options (marks booked beds as disabled & [Booked (Patient)])
  const renderBedSelectOptions = () => {
    const beds = selectedRoom?.bedNumbers?.length ? selectedRoom.bedNumbers : ['Bed 1'];
    return beds.map((b) => {
      const occupiedAdm = getOccupiedAdmissionForBed(selectedRoom, b);
      const isOccupied = !!occupiedAdm;

      return (
        <SelectItem
          key={b}
          value={b}
          disabled={isOccupied}
          className={`text-xs ${
            isOccupied
              ? 'opacity-40 cursor-not-allowed bg-rose-50/40 text-slate-400 font-normal'
              : 'text-slate-800 font-semibold'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <span className={isOccupied ? 'line-through text-slate-400' : ''}>
              {b}
            </span>
            {isOccupied ? (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                Booked ({occupiedAdm.patientName?.split(' ')[0] || 'Occupied'})
              </span>
            ) : (
              <span className="text-[10px] font-mono font-medium text-emerald-700">
                Available
              </span>
            )}
          </div>
        </SelectItem>
      );
    });
  };

  // Handle Operation Selection and reflect on table
  const handleOperationSelect = (opId: string) => {
    setSelectedOperationId(opId);
    if (!opId || opId === 'none') {
      setTableItems((prev) => prev.filter((item) => item.itemType !== 'operation'));
      return;
    }

    const op = operationsData?.data?.find((o) => o.id === opId);
    if (!op) return;

    const opPrice = parseFloat(String(op.price || 0));
    setTableItems((prev) => {
      const idx = prev.findIndex((item) => item.itemType === 'operation');
      if (idx > -1) {
        return prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                name: `Surgery / Procedure: ${op.name}`,
                price: opPrice,
                finalAmount: opPrice * (item.quantity || 1) - (item.discountAmount || 0),
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: 'item-operation',
            itemType: 'operation',
            name: `Surgery / Procedure: ${op.name}`,
            category: 'Surgery & OT',
            unit: 'procedure',
            price: opPrice,
            quantity: 1,
            discountType: 'amount',
            discountValue: 0,
            discountAmount: 0,
            finalAmount: opPrice,
            removable: true,
          },
        ];
      }
    });
  };

  // Popular / Frequently Ordered IPD Hospital Services (1-Click Addition)
  const popularServices = useMemo(() => [
    { name: 'Oxygen Pipeline Support', price: 500, unit: 'per day', category: 'Medical Gas' },
    { name: 'ICU Monitor Support', price: 1200, unit: 'per day', category: 'Monitoring' },
    { name: 'Nebulization Support', price: 200, unit: 'per session', category: 'Respiratory' },
    { name: 'Nursing Care Service', price: 400, unit: 'per day', category: 'Nursing' },
    { name: 'RMO Doctor Ward Round', price: 600, unit: 'per day', category: 'Clinical' },
    { name: 'Surgical Dressing Charge', price: 350, unit: 'per session', category: 'Surgical' },
    { name: 'Infusion Pump Support', price: 450, unit: 'per day', category: 'Equipment' },
  ], []);

  // Filtered preset services for fast search
  const filteredPresetServices = useMemo(() => {
    if (!serviceSearch.trim()) return popularServices;
    const q = serviceSearch.toLowerCase().trim();
    return popularServices.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [popularServices, serviceSearch]);

  // Add Service Item to Cart Table
  const handleAddServiceToCart = (
    name: string,
    price: number,
    unit: string = 'per day',
    category: string = 'Inpatient Support'
  ) => {
    const existingIndex = tableItems.findIndex(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
    if (existingIndex > -1) {
      handleUpdateItemQuantity(
        existingIndex,
        (tableItems[existingIndex].quantity || 1) + 1
      );
      return;
    }

    const priceNum = Math.max(0, parseFloat(String(price)) || 0);
    setTableItems((prev) => [
      ...prev,
      {
        id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemType: 'extra_service',
        name,
        category,
        unit,
        price: priceNum,
        quantity: 1,
        discountType: 'amount',
        discountValue: 0,
        discountAmount: 0,
        finalAmount: priceNum,
        removable: true,
      },
    ]);
  };

  // Custom Service Add handler
  const handleAddCustomChargeItem = () => {
    if (!serviceSearch.trim()) return;
    const price = parseFloat(customPriceInput) || 500;
    handleAddServiceToCart(
      serviceSearch.trim(),
      price,
      customUnitInput.trim() || 'item',
      'Clinical Extra'
    );
    setServiceSearch('');
    setCustomPriceInput('');
    setIsServiceDropdownOpen(false);
  };

  // Update Item Quantity (Days / Units)
  const handleUpdateItemQuantity = (idx: number, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setTableItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const unitPrice = parseFloat(String(item.price || 0));
        const lineGross = unitPrice * validQty;
        const discVal = item.discountValue || 0;
        let discAmt = 0;
        if (item.discountType === 'percent') {
          discAmt = (lineGross * Math.min(100, Math.max(0, discVal))) / 100;
        } else {
          discAmt = Math.min(lineGross, Math.max(0, discVal));
        }
        const finalAmt = Math.max(0, lineGross - discAmt);
        return {
          ...item,
          quantity: validQty,
          discountAmount: discAmt,
          finalAmount: finalAmt,
        };
      })
    );
  };

  // Update Item Individual Discount Value
  const handleUpdateItemDiscountValue = (idx: number, value: number) => {
    const rawVal = Math.max(0, value);
    setTableItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const qty = item.quantity || 1;
        const unitPrice = parseFloat(String(item.price || 0));
        const lineGross = unitPrice * qty;
        let discVal = rawVal;
        let discAmt = 0;
        if (item.discountType === 'percent') {
          discVal = Math.min(100, rawVal);
          discAmt = (lineGross * discVal) / 100;
        } else {
          discVal = rawVal;
          discAmt = Math.min(lineGross, discVal);
        }
        const finalAmt = Math.max(0, lineGross - discAmt);
        return {
          ...item,
          discountValue: discVal,
          discountAmount: discAmt,
          finalAmount: finalAmt,
        };
      })
    );
  };

  // Toggle Item Individual Discount Type (BDT vs %)
  const handleToggleItemDiscountType = (idx: number) => {
    setTableItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const nextType = item.discountType === 'percent' ? 'amount' : 'percent';
        const qty = item.quantity || 1;
        const unitPrice = parseFloat(String(item.price || 0));
        const lineGross = unitPrice * qty;
        let discVal = item.discountValue || 0;
        let discAmt = 0;
        if (nextType === 'percent') {
          discVal = Math.min(100, discVal);
          discAmt = (lineGross * discVal) / 100;
        } else {
          discAmt = Math.min(lineGross, discVal);
        }
        const finalAmt = Math.max(0, lineGross - discAmt);
        return {
          ...item,
          discountType: nextType,
          discountValue: discVal,
          discountAmount: discAmt,
          finalAmount: finalAmt,
        };
      })
    );
  };

  // Remove Item from Table
  const handleRemoveFromCart = (idx: number) => {
    const item = tableItems[idx];
    if (item.itemType === 'room_stay') {
      setSelectedRoomId('');
      setSelectedBedNumber('');
    }
    if (item.itemType === 'operation') {
      setSelectedOperationId('none');
    }
    setTableItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Clear Table
  const handleClearCart = () => {
    if (tableItems.length > 0 && window.confirm('Are you sure you want to clear all admission charges?')) {
      setSelectedRoomId('');
      setSelectedBedNumber('');
      setSelectedOperationId('none');
      setTableItems([]);
    }
  };

  // Table Calculations
  const grossSubtotal = useMemo(() => {
    return tableItems.reduce(
      (sum, item) => sum + (parseFloat(String(item.price)) || 0) * (item.quantity || 1),
      0
    );
  }, [tableItems]);

  const totalItemDiscounts = useMemo(() => {
    return tableItems.reduce(
      (sum, item) => sum + (parseFloat(String(item.discountAmount)) || 0),
      0
    );
  }, [tableItems]);

  const subtotalAfterItemDiscounts = Math.max(0, grossSubtotal - totalItemDiscounts);

  const calculatedInvoiceDiscount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotalAfterItemDiscounts * (discountVal || 0)) / 100;
    }
    return Math.min(subtotalAfterItemDiscounts, discountVal || 0);
  }, [discountType, discountVal, subtotalAfterItemDiscounts]);

  const totalDiscount = totalItemDiscounts + calculatedInvoiceDiscount;
  const grandTotal = Math.max(0, grossSubtotal - totalDiscount);

  const totalQuantity = useMemo(() => {
    return tableItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [tableItems]);

  // Default advance payment to grand total or user input
  const paidVal = advancePayment === '' ? grandTotal : parseFloat(String(advancePayment)) || 0;
  const dueAmount = Math.max(0, grandTotal - paidVal);

  // Quick payment presets
  const handleQuickPayment = (type: 'full' | 'half' | 'fixed5000' | 'due') => {
    if (type === 'full') setAdvancePayment(grandTotal);
    else if (type === 'half') setAdvancePayment(Math.round(grandTotal / 2));
    else if (type === 'fixed5000') setAdvancePayment(Math.min(5000, grandTotal));
    else if (type === 'due') setAdvancePayment(0);
  };

  // Submit Admission POS Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    if (!patientPhone.trim()) {
      alert('Please enter patient contact phone number.');
      return;
    }
    if (!selectedRoomId) {
      alert('Please select an inpatient room & bed from the top bar.');
      return;
    }

    if (selectedRoom) {
      const occupiedAdm = getOccupiedAdmissionForBed(selectedRoom, selectedBedNumber);
      if (occupiedAdm) {
        alert(
          `Bed "${selectedBedNumber}" in Room ${selectedRoom.roomNumber} is currently occupied by ${occupiedAdm.patientName} (#${occupiedAdm.admissionNo}). Please choose an available bed before completing admission.`
        );
        return;
      }
    }

    try {
      // Find breakdown amounts for backend payload
      const admFeeItem = tableItems.find((i) => i.itemType === 'admission_fee');
      const roomItem = tableItems.find((i) => i.itemType === 'room_stay');
      const opItem = tableItems.find((i) => i.itemType === 'operation');

      const admissionFeeNum = admFeeItem ? admFeeItem.finalAmount : 0;
      const roomChargeNum = roomItem ? roomItem.finalAmount : 0;
      const opChargeNum = opItem ? opItem.finalAmount : 0;

      const extraItems = tableItems.filter((i) => i.itemType === 'extra_service');
      const extraChargesFormatted: AdmissionExtraCharge[] = extraItems.map((i) => ({
        key: `${i.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`,
        value: i.finalAmount,
        unit: i.unit || 'unit',
      }));

      const extraChargesTotalNum = extraItems.reduce((s, i) => s + i.finalAmount, 0);

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
        perDayCharge: parseFloat(String(selectedRoom?.perDayCharge || 0)),

        // Doctor
        doctorId: selectedDoctor?.id,
        doctorName: selectedDoctor?.name || customDoctorName || undefined,
        department: selectedDoctor?.department || selectedRoom?.department,

        // Operation
        operationId: selectedOperation?.id,
        operationName: selectedOperation?.name,
        operationPrice: opChargeNum,

        // Financial POS Ledger
        extraCharges: extraChargesFormatted,
        admissionFee: admissionFeeNum,
        roomCharge: roomChargeNum,
        operationCharge: opChargeNum,
        extraChargesTotal: extraChargesTotalNum,
        subtotal: grossSubtotal,
        discountAmount: totalDiscount,
        grandTotal,
        advancePayment: paidVal,
        dueAmount,
        paymentMethod,
        paymentStatus: dueAmount <= 0 ? 'Paid' : paidVal > 0 ? 'Partial' : 'Due',

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
          roomInfo: `Room ${selectedRoom?.roomNumber || 'N/A'} (${selectedBedNumber || 'Bed 1'})`,
        });
        setIsSlipOpen(true);
        // Automatically reset admission form for the next patient!
        resetForm();
      }
    } catch (err: any) {
      console.error('Failed to create admission:', err);
      alert(err?.data?.message || 'Failed to complete admission order. Please verify required fields.');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1600px] mx-auto gap-2 select-none">
      {/* Success Notification Bar (Only shown upon admission generation) */}
      {successInfo && (
        <div className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Admission Confirmed: <strong className="font-mono font-semibold">#{successInfo.admissionNo}</strong> | Linked Patient: <strong className="font-mono font-semibold">{successInfo.patientId}</strong> | Assigned: <strong className="font-semibold">{successInfo.roomInfo}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlipOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover shadow-2xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4 Slip</span>
            </button>
            <button
              onClick={() => navigate(`/patients/${successInfo.patientInternalId}`)}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              View Profile
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Screen POS Form */}
      <form onSubmit={handleSubmitOrder} className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        {/* ================= 1. FIXED TOP COMPACT PATIENT & INPATIENT ASSIGNMENT BAR (shrink-0) ================= */}
        {selectedPatientId ? (
          /* Ultra Compact 1-Line Loaded Patient Pill */
          <div className="shrink-0 bg-white rounded-xl p-2 sm:px-3 border border-emerald-200/90 bg-emerald-50/70 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/admissions')}
                type="button"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition font-medium cursor-pointer mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Admissions</span>
              </button>
              <span className="text-slate-300">|</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950">{patientName}</span>
              <span className="font-mono font-medium text-emerald-800 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                {patientPhone}
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {selectedPatientId}
              </span>
              <span className="text-slate-500">
                • {patientGender}, {patientAge || 'N/A'} yrs • {patientBloodGroup}
              </span>
              {patientAddress && <span className="text-slate-500 truncate max-w-xs">• {patientAddress}</span>}

              {/* Room & Bed Inline Selectors */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-200">
                <BedDouble className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <Select value={selectedRoomId} onValueChange={handleRoomSelect}>
                  <SelectTrigger className="h-6.5 w-48 bg-white border-emerald-300 text-xs font-semibold text-emerald-950">
                    <SelectValue placeholder="-- Pick Room * --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {renderRoomSelectOptions()}
                  </SelectContent>
                </Select>

                {selectedRoom && (
                  <Select value={selectedBedNumber} onValueChange={handleBedSelect}>
                    <SelectTrigger className="h-6.5 w-32 bg-white border-emerald-300 text-xs font-semibold text-emerald-950">
                      <SelectValue placeholder="Bed" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {renderBedSelectOptions()}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Doctor Selector */}
              <div className="flex items-center gap-1 pl-2 border-l border-emerald-200">
                <Stethoscope className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <Select
                  value={selectedDoctorId}
                  onValueChange={(val) => {
                    setSelectedDoctorId(val);
                    const d = doctorsData?.data?.find((item) => item.id === val);
                    if (d) setCustomDoctorName(d.name);
                  }}
                >
                  <SelectTrigger className="h-6.5 w-40 bg-white border-emerald-300 text-xs font-medium text-emerald-950">
                    <SelectValue placeholder="-- Doctor --" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsData?.data?.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-xs">
                        {doc.name} ({doc.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Surgery Selector */}
              <div className="flex items-center gap-1 pl-2 border-l border-emerald-200">
                <Scissors className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <Select value={selectedOperationId} onValueChange={handleOperationSelect}>
                  <SelectTrigger className="h-6.5 w-36 bg-white border-emerald-300 text-xs font-medium text-slate-800">
                    <SelectValue placeholder="-- Surgery (Opt) --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs text-slate-400">
                      None (Medical Stay)
                    </SelectItem>
                    {operationsData?.data?.map((op) => (
                      <SelectItem key={op.id} value={op.id} className="text-xs">
                        {op.name} (৳{parseFloat(String(op.price)).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearPatient}
                className="text-xs text-emerald-800 hover:text-rose-600 underline font-medium cursor-pointer"
              >
                Change Patient
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => navigate('/admissions')}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-primary text-xs font-medium transition cursor-pointer"
              >
                <Receipt className="h-3 w-3 text-slate-400" />
                <span>Admissions</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs space-y-2">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admissions')}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Admissions</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-xs text-slate-900">Inpatient Admission POS Terminal</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  IPD Desk Active
                </span>
              </div>

              {/* Mode Switcher Pills & Inpatient Registry Link */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode('existing');
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      intakeMode === 'existing'
                        ? 'bg-white text-primary shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="h-3 w-3" />
                    <span>Existing Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode('new');
                      handleClearPatient();
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      intakeMode === 'new'
                        ? 'bg-white text-primary shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>+ New Patient</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/admissions')}
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-primary text-xs font-medium transition cursor-pointer"
                >
                  <Receipt className="h-3 w-3 text-slate-400" />
                  <span>Admissions List</span>
                </button>
              </div>
            </div>

            {/* Patient Form Mode Inputs */}
            {intakeMode === 'existing' ? (
              /* Existing Patient Search + Clinical Selectors */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center text-xs">
                {/* Live Search Input by Phone / Name / ID */}
                <div ref={patientSearchContainerRef} className="sm:col-span-4 relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={patientSearchTerm}
                      onChange={(e) => {
                        setPatientSearchTerm(e.target.value);
                        setIsPatientDropdownOpen(true);
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      placeholder="Search patient by mobile, name or ID..."
                      className="w-full h-8 pl-8 pr-7 rounded-lg border border-slate-300 focus:border-primary text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                    />
                    {patientSearchTerm && (
                      <button
                        type="button"
                        onClick={handleClearPatient}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {isPatientDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-40 p-1 space-y-0.5">
                      {filteredPatients.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          No matching patients found.
                          <button
                            type="button"
                            onClick={() => {
                              setIntakeMode('new');
                              setIsPatientDropdownOpen(false);
                            }}
                            className="block mx-auto mt-1 text-primary hover:underline font-semibold"
                          >
                            + Register New Patient
                          </button>
                        </div>
                      ) : (
                        filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handlePickPatient(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">{p.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {p.phone || 'No phone'} • {p.patientId}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                              {p.bloodGroup || 'Blood N/A'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Inpatient Room Selector */}
                <div className="sm:col-span-3">
                  <Select value={selectedRoomId} onValueChange={handleRoomSelect}>
                    <SelectTrigger className="w-full h-8 bg-white border-slate-300 text-xs font-medium">
                      <SelectValue placeholder="-- Inpatient Room * --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {renderRoomSelectOptions()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bed Number Selector */}
                <div className="sm:col-span-2">
                  <Select
                    value={selectedBedNumber}
                    onValueChange={handleBedSelect}
                    disabled={!selectedRoom}
                  >
                    <SelectTrigger className="w-full h-8 bg-white border-slate-300 text-xs font-medium">
                      <SelectValue placeholder="Bed No" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {renderBedSelectOptions()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attending Doctor */}
                <div className="sm:col-span-3">
                  <Select
                    value={selectedDoctorId}
                    onValueChange={(val) => {
                      setSelectedDoctorId(val);
                      const d = doctorsData?.data?.find((item) => item.id === val);
                      if (d) setCustomDoctorName(d.name);
                    }}
                  >
                    <SelectTrigger className="w-full h-8 bg-white border-slate-300 text-xs">
                      <SelectValue placeholder="-- Attending Doctor --" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsData?.data?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id} className="text-xs">
                          {doc.name} ({doc.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              /* New Patient Mode: 2 Tight Rows */
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient Full Name *"
                    className="sm:col-span-3 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-primary focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Contact Phone *"
                    className="sm:col-span-3 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-primary focus:outline-hidden"
                  />
                  <input
                    type="number"
                    min={0}
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Age"
                    className="sm:col-span-1 h-8.5 px-2 rounded-lg border border-slate-300 focus:border-primary focus:outline-hidden"
                  />
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger className="sm:col-span-1 h-8.5 bg-white border-slate-300 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={patientBloodGroup} onValueChange={setPatientBloodGroup}>
                    <SelectTrigger className="sm:col-span-1 h-8.5 bg-white border-slate-300 text-xs">
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
                  <input
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="Address / City"
                    className="sm:col-span-3 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                  {/* Room Selector */}
                  <div className="sm:col-span-3">
                    <Select value={selectedRoomId} onValueChange={handleRoomSelect}>
                      <SelectTrigger className="w-full h-8.5 bg-white border-slate-300 text-xs font-medium">
                        <SelectValue placeholder="-- Inpatient Room * --" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {renderRoomSelectOptions()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bed Selector */}
                  <div className="sm:col-span-2">
                    <Select
                      value={selectedBedNumber}
                      onValueChange={handleBedSelect}
                      disabled={!selectedRoom}
                    >
                      <SelectTrigger className="w-full h-8.5 bg-white border-slate-300 text-xs font-medium">
                        <SelectValue placeholder="Bed No" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {renderBedSelectOptions()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor Selector */}
                  <div className="sm:col-span-3">
                    <Select
                      value={selectedDoctorId}
                      onValueChange={(val) => {
                        setSelectedDoctorId(val);
                        const d = doctorsData?.data?.find((item) => item.id === val);
                        if (d) setCustomDoctorName(d.name);
                      }}
                    >
                      <SelectTrigger className="w-full h-8.5 bg-white border-slate-300 text-xs">
                        <SelectValue placeholder="-- Attending Doctor --" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData?.data?.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id} className="text-xs">
                            {doc.name} ({doc.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Surgery Selector */}
                  <div className="sm:col-span-2">
                    <Select value={selectedOperationId} onValueChange={handleOperationSelect}>
                      <SelectTrigger className="w-full h-8.5 bg-white border-slate-300 text-xs">
                        <SelectValue placeholder="-- Surgery (Opt) --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs text-slate-400">
                          None (Medical Stay)
                        </SelectItem>
                        {operationsData?.data?.map((op) => (
                          <SelectItem key={op.id} value={op.id} className="text-xs">
                            {op.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Diagnosis */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Admission Diagnosis"
                      className="w-full h-8.5 px-2 rounded-lg border border-slate-300 text-xs focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. MIDDLE SCROLLABLE INPATIENT CHARGES & SERVICES TABLE (flex-1 min-h-0 overflow-hidden) ================= */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-2 overflow-hidden">
          {/* Top Search & Filter Bar (shrink-0) */}
          <div className="shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <div ref={serviceSearchContainerRef} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => {
                    setServiceSearch(e.target.value);
                    setIsServiceDropdownOpen(true);
                  }}
                  onFocus={() => setIsServiceDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredPresetServices.length > 0) {
                        const top = filteredPresetServices[0];
                        handleAddServiceToCart(top.name, top.price, top.unit, top.category);
                        setServiceSearch('');
                        setIsServiceDropdownOpen(false);
                      } else if (serviceSearch.trim()) {
                        handleAddCustomChargeItem();
                      }
                    }
                  }}
                  placeholder="Quick add IPD clinical charge (e.g. Oxygen Pipeline, ICU Monitor, Nebulizer, Nursing Care, Dressing)... [Type & press Enter]"
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-300 focus:border-primary text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
                />
                {serviceSearch && (
                  <button
                    type="button"
                    onClick={() => setServiceSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Instant Suggestions Dropdown */}
                {isServiceDropdownOpen && serviceSearch.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 space-y-1">
                    {filteredPresetServices.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                          Matching Hospital Services
                        </span>
                        {filteredPresetServices.slice(0, 8).map((s) => (
                          <div
                            key={s.name}
                            onClick={() => {
                              handleAddServiceToCart(s.name, s.price, s.unit, s.category);
                              setServiceSearch('');
                              setIsServiceDropdownOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">{s.name}</span>
                              <span className="text-[11px] text-slate-500">
                                {s.category} • {s.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold font-mono text-primary">
                                ৳{s.price.toLocaleString()}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-primary text-white text-[11px] font-medium">
                                + Add
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add as Custom Item Row */}
                    <div className="pt-2 border-t border-slate-100 p-1 flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-medium shrink-0">
                        Add "{serviceSearch}" as custom:
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Price (৳)"
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        className="w-24 h-7 px-2 rounded border border-slate-300 text-xs font-mono font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="unit (e.g. per day)"
                        value={customUnitInput}
                        onChange={(e) => setCustomUnitInput(e.target.value)}
                        className="w-24 h-7 px-2 rounded border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomChargeItem}
                        className="px-2.5 h-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        + Add Custom
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table Status Pill */}
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shrink-0">
                {tableItems.length} Charge Item(s) ({totalQuantity} Unit{totalQuantity > 1 ? 's' : ''})
              </span>

              {/* Clear Table Button */}
              {tableItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 text-xs font-medium transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

          </div>

          {/* DEDICATED SCROLLABLE TABLE CONTAINER */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200 relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] z-10 shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Service / Charge Description & Category</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (৳)</th>
                  <th className="py-2.5 px-3 text-center w-36">Quantity / Days</th>
                  <th className="py-2.5 px-3 text-center w-44">Line Discount</th>
                  <th className="py-2.5 px-3 text-right w-28">Net Total</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tableItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <BedDouble className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                      <p className="font-semibold text-slate-800 text-xs">No charges in inpatient ledger</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pick an inpatient room above or add services to start billing.
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableItems.map((item, idx) => {
                    const unitPrice = parseFloat(String(item.price)) || 0;
                    const qty = item.quantity || 1;
                    const lineGross = unitPrice * qty;
                    const itemDiscAmount = parseFloat(String(item.discountAmount || 0));
                    const finalAmount = parseFloat(String(item.finalAmount || lineGross - itemDiscAmount));
                    const itemDiscType = item.discountType || 'amount';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sl Number */}
                        <td className="py-2 px-3 text-center">
                          <span className="h-5 w-5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Service / Item Details */}
                        <td className="py-2 px-3 min-w-[200px]">
                          <span className="font-semibold text-slate-900 block">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-medium text-primary">{item.category}</span>
                            <span>•</span>
                            <span className="capitalize">{item.unit || 'unit'}</span>
                            {item.itemType === 'room_stay' && selectedRoom && (
                              <span className="text-emerald-700 font-semibold font-mono">
                                • Floor: {selectedRoom.floor || '1st'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Standard Unit Rate */}
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                          ৳{unitPrice.toLocaleString()}
                        </td>

                        {/* Quantity Counter */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-300 focus-within:border-primary rounded-lg bg-white overflow-hidden h-8">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, qty - 1)}
                              disabled={qty <= 1}
                              className="w-7 h-8 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-25 transition cursor-pointer select-none active:scale-95"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) =>
                                handleUpdateItemQuantity(idx, parseInt(e.target.value) || 1)
                              }
                              style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                              className="w-10 h-8 text-center font-semibold text-slate-900 text-xs focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, qty + 1)}
                              className="w-7 h-8 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer select-none active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Line Discount */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-300 focus-within:border-primary rounded-lg bg-white overflow-hidden h-8">
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={item.discountValue || ''}
                              onChange={(e) =>
                                handleUpdateItemDiscountValue(
                                  idx,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                              className="w-16 h-8 px-2 text-right font-semibold text-slate-900 text-xs focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleToggleItemDiscountType(idx)}
                              className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer border-l border-slate-200 shrink-0"
                              title="Toggle discount type (BDT / %)"
                            >
                              {itemDiscType === 'amount' ? '৳' : '%'}
                            </button>
                          </div>
                        </td>

                        {/* Net Total */}
                        <td className="py-2 px-3 text-right">
                          <span className="font-bold font-mono text-slate-900 block">
                            ৳{finalAmount.toFixed(2)}
                          </span>
                          {(qty > 1 || itemDiscAmount > 0) && (
                            <span className="text-[10px] text-slate-500 block font-normal">
                              {itemDiscAmount > 0 ? (
                                <span className="text-emerald-600 font-medium">
                                  (-৳{itemDiscAmount.toFixed(0)})
                                </span>
                              ) : (
                                <span>৳{unitPrice}×{qty}</span>
                              )}
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            title="Remove service"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* ================= 3. FIXED BOTTOM COMPACT FINANCIAL SETTLEMENT DOCK (shrink-0) ================= */}
        <div className="shrink-0 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
            {/* Left Col (4 Cols): Special Admission Discount & Payment Method */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">Adm Disc:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden flex-1 h-8">
                  <input
                    type="number"
                    min={0}
                    value={discountVal || ''}
                    onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                    className="w-full h-8 px-2 text-right font-semibold text-slate-900 text-xs focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountType(discountType === 'amount' ? 'percent' : 'amount')
                    }
                    className="px-2 h-8 bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 border-l border-slate-200 shrink-0 cursor-pointer"
                  >
                    {discountType === 'amount' ? 'BDT' : '%'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">Pay Via:</span>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full h-8 bg-white border-slate-300 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash at Counter</SelectItem>
                    <SelectItem value="bKash / MFS">bKash / MFS</SelectItem>
                    <SelectItem value="Nagad">Nagad MFS</SelectItem>
                    <SelectItem value="Card">Card POS</SelectItem>
                    <SelectItem value="Bank Wire">Bank Wire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Middle Col (4 Cols): Subtotals & Compact Grand Total Hero */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>Gross: ৳{grossSubtotal.toFixed(0)}</span>
                {totalDiscount > 0 && (
                  <span className="text-emerald-700 font-medium">
                    Disc: -৳{totalDiscount.toFixed(0)}
                  </span>
                )}
              </div>

              {/* Compact Net Payable Hero Card */}
              <div className="h-10 px-3.5 rounded-xl bg-slate-950 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400">
                    Net Payable
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  ৳{grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right Col (4 Cols): Advance Cash Received, Due Status & Complete Button */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('full')}
                    className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium cursor-pointer"
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('half')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('fixed5000')}
                    className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium cursor-pointer"
                  >
                    ৳5k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('due')}
                    className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 font-medium cursor-pointer"
                  >
                    Due
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  placeholder={grandTotal ? `৳${grandTotal}` : 'Advance (৳)'}
                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold font-mono text-slate-900 focus:outline-hidden focus:border-primary text-right"
                />
                <span
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0 ${
                    dueAmount <= 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {dueAmount <= 0 ? 'Zero Due' : `Due: ৳${dueAmount.toFixed(0)}`}
                </span>
              </div>

              {/* Complete Admission Button */}
              <button
                type="submit"
                disabled={isSubmitting || tableItems.length === 0}
                className="w-full h-8.5 rounded-xl bg-primary text-white font-bold text-xs tracking-wide shadow-xs hover:bg-primary-hover active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Complete & Print Admission Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Printable Digital Admission Slip Modal */}
      <AdmissionSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        admission={createdAdmission}
        autoPrint={true}
      />
    </div>
  );
};

export default NewAdmissionPOSPage;
