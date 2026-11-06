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
  FlaskConical,
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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetTestsQuery, type DiagnosticTest } from '../../store/api/testApi';
import { useGetDoctorsQuery } from '../../store/api/doctorApi';
import { useGetPatientsQuery } from '../../store/api/patientApi';
import {
  useCreateDiagnosticInvoiceMutation,
  type DiagnosticInvoice,
  type DiagnosticInvoiceItem,
} from '../../store/api/diagnosticInvoiceApi';
import { DiagnosticSlipModal } from '../../components/tests/DiagnosticSlipModal';

export const TestPOSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPatientId = searchParams.get('patientId');

  // Queries
  const { data: testsData, isLoading: testsLoading } = useGetTestsQuery({ limit: 100 });
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({ limit: 50 });
  const { data: patientsData, isLoading: patientsLoading } = useGetPatientsQuery({ limit: 100 });

  const [createInvoice, { isLoading: isSubmitting }] = useCreateDiagnosticInvoiceMutation();

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
  const [allergies, setAllergies] = useState('None');

  // Form State - Doctor
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [customDoctorName, setCustomDoctorName] = useState('');

  // Form State - Selected Cart Items
  const [cartItems, setCartItems] = useState<DiagnosticInvoiceItem[]>([]);

  // Test Catalog Search & Filter
  const [testSearch, setTestSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State - POS Financials
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [deliveryDate, setDeliveryDate] = useState('Tomorrow 4:00 PM');
  const [notes, setNotes] = useState('');

  // Synchronize deliveryDate with all line items in the cart
  const handleUpdateDeliveryDate = (val: string) => {
    setDeliveryDate(val);
    setCartItems((prev) =>
      prev.map((item) => ({
        ...item,
        deliveryDate: val,
      }))
    );
  };

  // Slip Modal State
  const [createdInvoice, setCreatedInvoice] = useState<DiagnosticInvoice | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    invoiceNo: string;
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
    }
  };

  // Prefill when URL query patientId is provided and patients load
  useEffect(() => {
    if (prefillPatientId && patientsData?.data?.length) {
      setIntakeMode('existing');
      handleSelectExistingPatient(prefillPatientId);
    }
  }, [prefillPatientId, patientsData]);

  // Patient search state for phone number / name live search
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientSearchContainerRef = useRef<HTMLDivElement>(null);

  // Diagnostic Test fast search state
  const testSearchContainerRef = useRef<HTMLDivElement>(null);
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);

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
        testSearchContainerRef.current &&
        !testSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsTestDropdownOpen(false);
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
    return list.filter((p) => {
      const phone = p.phone ? p.phone.toLowerCase() : '';
      const name = p.name ? p.name.toLowerCase() : '';
      const patId = p.patientId ? p.patientId.toLowerCase() : '';
      return phone.includes(q) || name.includes(q) || patId.includes(q);
    }).slice(0, 15);
  }, [patientsData, patientSearchTerm]);

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

  // Popular / Frequently Ordered Diagnostic Tests for 1-click addition
  const popularTests = useMemo(() => {
    const list = testsData?.data || [];
    const popularCodes = ['cbc', 'lipid', 'glucose', 'creatinine', 'usg', 'ecg', 'urine', 'x-ray', 'rbs'];
    return list.filter((t) =>
      popularCodes.some(
        (code) =>
          t.name.toLowerCase().includes(code) ||
          (t.code && t.code.toLowerCase().includes(code))
      )
    ).slice(0, 6);
  }, [testsData]);

  // Find Selected Doctor
  const selectedDoctor = useMemo(() => {
    return doctorsData?.data?.find((d) => d.id === selectedDoctorId);
  }, [doctorsData, selectedDoctorId]);

  // Filtered Test Catalog
  const filteredTests = useMemo(() => {
    const list = testsData?.data || [];
    return list.filter((t) => {
      const matchSearch =
        !testSearch ||
        t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
        (t.code && t.code.toLowerCase().includes(testSearch.toLowerCase())) ||
        t.category.toLowerCase().includes(testSearch.toLowerCase());
      const matchCat =
        selectedCategory === 'all' ||
        t.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [testsData, testSearch, selectedCategory]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    testsData?.data?.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [testsData]);

  // Add Test to Cart (if already in cart, increment quantity by 1!)
  const handleAddTestToCart = (t: DiagnosticTest) => {
    const existingIndex = cartItems.findIndex((item) => item.testId === t.id);
    if (existingIndex > -1) {
      handleUpdateItemQuantity(
        existingIndex,
        (cartItems[existingIndex].quantity || 1) + 1
      );
      return;
    }
    const priceNum = parseFloat(String(t.price || 0));
    setCartItems((prev) => [
      ...prev,
      {
        testId: t.id,
        testName: t.name,
        category: t.category,
        price: priceNum,
        quantity: 1,
        discountType: 'amount',
        discountValue: 0,
        discountAmount: 0,
        finalAmount: priceNum,
        deliveryDate: deliveryDate || t.deliveryTime || 'Tomorrow 4:00 PM',
        roomNumber: t.roomNumber,
        sampleType: t.sampleType,
      },
    ]);
  };

  // Update Item Quantity
  const handleUpdateItemQuantity = (idx: number, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setCartItems((prev) =>
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
    setCartItems((prev) =>
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
    setCartItems((prev) =>
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

  // Remove Test from Cart
  const handleRemoveFromCart = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cartItems.length > 0 && window.confirm('Are you sure you want to clear all tests from the cart?')) {
      setCartItems([]);
    }
  };

  // Cart Calculations
  const grossSubtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (parseFloat(String(item.price)) || 0) * (item.quantity || 1),
      0
    );
  }, [cartItems]);

  const totalItemDiscounts = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (parseFloat(String(item.discountAmount)) || 0),
      0
    );
  }, [cartItems]);

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
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  // Default paid amount to grand total if not manually edited
  const paidVal = paidAmount === '' ? grandTotal : parseFloat(String(paidAmount)) || 0;
  const dueAmount = Math.max(0, grandTotal - paidVal);

  // Quick payment presets
  const handleQuickPayment = (type: 'full' | 'half' | 'due') => {
    if (type === 'full') setPaidAmount(grandTotal);
    else if (type === 'half') setPaidAmount(Math.round(grandTotal / 2));
    else if (type === 'due') setPaidAmount(0);
  };

  // Submit Test Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    if (!patientPhone.trim()) {
      alert('Please enter patient contact number.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Please select at least one diagnostic test.');
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
        allergies: allergies || undefined,

        // Doctor
        doctorId: selectedDoctor?.id,
        doctorName: customDoctorName.trim() || selectedDoctor?.name || 'Dr. Medical Officer',

        // Items & Financials
        items: cartItems.map((item) => ({
          testId: item.testId,
          testName: item.testName,
          category: item.category,
          price: parseFloat(String(item.price)) || 0,
          quantity: item.quantity || 1,
          discountType: item.discountType || 'amount',
          discountValue: item.discountValue || 0,
          discountAmount: parseFloat(String(item.discountAmount || 0)),
          finalAmount: parseFloat(String(item.finalAmount || 0)),
          deliveryDate: deliveryDate || item.deliveryDate || 'Tomorrow 4:00 PM',
          roomNumber: item.roomNumber,
          sampleType: item.sampleType,
        })),
        subtotal: grossSubtotal,
        discountAmount: totalDiscount,
        grandTotal,
        paidAmount: paidVal,
        dueAmount,
        paymentMethod,
        sampleStatus: 'Collected',
        deliveryDate,
        notes: notes.trim() || undefined,
      };

      const res = await createInvoice(payload).unwrap();

      if (res.success && res.data) {
        setCreatedInvoice(res.data.invoice);
        setSuccessInfo({
          invoiceNo: res.data.invoice.invoiceNo,
          patientId: res.data.patient.patientId,
          patientInternalId: res.data.patient.id,
        });
        setIsSlipOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to create diagnostic invoice:', err);
      alert(err?.data?.message || 'Failed to complete diagnostic order.');
    }
  };
  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1600px] mx-auto gap-2 select-none">
      {/* Success Notification Bar (Only shown upon invoice generation) */}
      {successInfo && (
        <div className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Invoice Confirmed: <strong className="font-mono font-semibold">#{successInfo.invoiceNo}</strong> | Linked Patient: <strong className="font-mono font-semibold">{successInfo.patientId}</strong>
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
        {/* ================= 1. FIXED TOP COMPACT PATIENT & DOCTOR BAR (shrink-0) ================= */}
        {selectedPatientId ? (
          /* Ultra Compact 1-Line Loaded Patient Pill */
          <div className="shrink-0 bg-white rounded-xl p-2 sm:px-3 border border-emerald-200/90 bg-emerald-50/70 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/patients')}
                type="button"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition font-medium cursor-pointer mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Patients</span>
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
              <span className="text-slate-700 font-medium pl-1 border-l border-emerald-200">
                Doc: {selectedDoctor?.name || customDoctorName || 'Hospital Duty Doctor'}
              </span>
              <div className="flex items-center gap-1 pl-1 border-l border-emerald-200 text-emerald-950 font-semibold">
                <Clock className="h-3 w-3 text-emerald-700" />
                <span>Delivery:</span>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => handleUpdateDeliveryDate(e.target.value)}
                  className="h-6 w-36 px-1.5 rounded border border-emerald-300 bg-white text-xs font-semibold text-emerald-950 focus:outline-hidden"
                />
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
                onClick={() => navigate('/tests/invoices')}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-primary text-xs font-medium transition cursor-pointer"
              >
                <Receipt className="h-3 w-3 text-slate-400" />
                <span>Invoices</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs space-y-2">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/patients')}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Patients</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-xs text-slate-900">Lab POS Terminal</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Counter #2 Active
                </span>
              </div>

              {/* Mode Switcher Pills & Invoice Link */}
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
                  onClick={() => navigate('/tests/invoices')}
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-primary text-xs font-medium transition cursor-pointer"
                >
                  <Receipt className="h-3 w-3 text-slate-400" />
                  <span>Invoices</span>
                </button>
              </div>
            </div>

            {/* Existing Patient Search Row */}
            {intakeMode === 'existing' ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div ref={patientSearchContainerRef} className="sm:col-span-6 relative">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary pointer-events-none" />
                    <input
                      type="text"
                      value={patientSearchTerm}
                      onChange={(e) => {
                        setPatientSearchTerm(e.target.value);
                        setIsPatientDropdownOpen(true);
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      placeholder="Type phone number (017...), patient ID (P-1001), or name..."
                      className="w-full h-8.5 pl-9 pr-8 rounded-lg border border-slate-300 focus:border-primary text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
                    />
                    {patientSearchTerm && (
                      <button
                        type="button"
                        onClick={handleClearPatient}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Instant Floating Dropdown */}
                  {isPatientDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-40 p-1.5 space-y-1">
                      {patientsLoading ? (
                        <div className="py-4 text-center text-xs text-slate-500">Loading patients...</div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="py-3 px-2 text-center text-xs text-slate-500">
                          <span>No patient found matching "{patientSearchTerm}". </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIntakeMode('new');
                              setPatientPhone(patientSearchTerm);
                              setIsPatientDropdownOpen(false);
                            }}
                            className="text-primary font-medium hover:underline"
                          >
                            + Register New
                          </button>
                        </div>
                      ) : (
                        filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handlePickPatient(p)}
                            className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 mr-2">{p.name}</span>
                              <span className="font-mono text-primary font-medium mr-2">{p.phone}</span>
                              <span className="font-mono text-[10px] text-slate-500">#{p.patientId}</span>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">Select</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Doctor Select */}
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
                      <SelectValue placeholder="-- Ref Doctor --" />
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

                {/* Expected Delivery */}
                <div className="sm:col-span-4 flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                  <Clock className="h-3.5 w-3.5 text-primary ml-1 shrink-0" />
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => handleUpdateDeliveryDate(e.target.value)}
                    placeholder="Delivery date/time"
                    className="w-full h-7 px-2 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateDeliveryDate('Today 8:00 PM')}
                    className={`px-1.5 h-7 rounded text-[10px] font-medium transition cursor-pointer shrink-0 ${
                      deliveryDate === 'Today 8:00 PM' ? 'bg-primary text-white font-bold' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateDeliveryDate('Tomorrow 4:00 PM')}
                    className={`px-1.5 h-7 rounded text-[10px] font-medium transition cursor-pointer shrink-0 ${
                      deliveryDate === 'Tomorrow 4:00 PM' ? 'bg-primary text-white font-bold' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Tmrw
                  </button>
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
                    placeholder="Address / Location"
                    className="sm:col-span-3 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                  <div className="sm:col-span-5">
                    <Select
                      value={selectedDoctorId}
                      onValueChange={(val) => {
                        setSelectedDoctorId(val);
                        const d = doctorsData?.data?.find((item) => item.id === val);
                        if (d) setCustomDoctorName(d.name);
                      }}
                    >
                      <SelectTrigger className="w-full h-8.5 bg-white border-slate-300 text-xs">
                        <SelectValue placeholder="-- Ref Doctor --" />
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
                  <div className="sm:col-span-7 flex items-center gap-1.5 bg-emerald-50/90 p-1 rounded-lg border border-emerald-300 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-950 shrink-0 flex items-center gap-1 pl-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Delivery:</span>
                    </span>
                    <input
                      type="text"
                      value={deliveryDate}
                      onChange={(e) => handleUpdateDeliveryDate(e.target.value)}
                      placeholder="e.g. Tomorrow 4:00 PM, Today 8:00 PM"
                      className="w-full h-7 px-2 rounded-md border border-emerald-300 bg-white text-xs font-bold text-emerald-950 focus:outline-hidden focus:border-emerald-600"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateDeliveryDate('Today 8:00 PM')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === 'Today 8:00 PM'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        Today (8 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDeliveryDate('Tomorrow 12:00 PM')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === 'Tomorrow 12:00 PM'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        Tmrw (12 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDeliveryDate('Tomorrow 4:00 PM')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === 'Tomorrow 4:00 PM'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        Tmrw (4 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDeliveryDate('2 Days (48 Hours)')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === '2 Days (48 Hours)'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        2 Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. MIDDLE SCROLLABLE DIAGNOSTIC TESTS TABLE (flex-1 min-h-0 overflow-hidden) ================= */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-2 overflow-hidden">
          {/* Top Search & Filter Bar (shrink-0) */}
          <div className="shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <div ref={testSearchContainerRef} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={testSearch}
                  onChange={(e) => {
                    setTestSearch(e.target.value);
                    setIsTestDropdownOpen(true);
                  }}
                  onFocus={() => setIsTestDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredTests.length > 0) {
                        handleAddTestToCart(filteredTests[0]);
                        setTestSearch('');
                        setIsTestDropdownOpen(false);
                      }
                    }
                  }}
                  placeholder="Search test by code or name (e.g. CBC, USG, Lipid, ECG, Glucose, Creatinine)... [Type to search, press Enter to add]"
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-300 focus:border-primary text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
                />
                {testSearch && (
                  <button
                    type="button"
                    onClick={() => setTestSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Instant Suggestions Dropdown */}
                {isTestDropdownOpen && testSearch.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 space-y-1">
                    {filteredTests.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No tests match "{testSearch}".
                      </div>
                    ) : (
                      filteredTests.slice(0, 10).map((t) => {
                        const inCart = cartItems.find((ci) => ci.testId === t.id);
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              handleAddTestToCart(t);
                              setTestSearch('');
                              setIsTestDropdownOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">{t.name}</span>
                              <span className="text-[11px] text-slate-500">{t.category} {t.roomNumber && `• Room ${t.roomNumber}`}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold font-mono text-primary">৳{parseFloat(String(t.price)).toLocaleString()}</span>
                              <span className="px-2 py-0.5 rounded bg-primary text-white text-[11px] font-medium">
                                {inCart ? `+ More (${inCart.quantity})` : '+ Add'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Table Status Pill */}
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shrink-0">
                {cartItems.length} Test(s) ({totalQuantity} Unit{totalQuantity > 1 ? 's' : ''})
              </span>

              {/* Clear Table Button */}
              {cartItems.length > 0 && (
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
                  <th className="py-2.5 px-3">Diagnostic Test & Lab Department</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (৳)</th>
                  <th className="py-2.5 px-3 text-center w-36">Quantity</th>
                  <th className="py-2.5 px-3 text-center w-44">Line Discount</th>
                  <th className="py-2.5 px-3 text-right w-28">Net Total</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FlaskConical className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                      <p className="font-semibold text-slate-800 text-xs">No diagnostic tests in table</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Use the search bar above to add diagnostic tests.</p>
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, idx) => {
                    const unitPrice = parseFloat(String(item.price)) || 0;
                    const qty = item.quantity || 1;
                    const lineGross = unitPrice * qty;
                    const itemDiscAmount = parseFloat(String(item.discountAmount || 0));
                    const finalAmount = parseFloat(String(item.finalAmount || (lineGross - itemDiscAmount)));
                    const itemDiscType = item.discountType || 'amount';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sl Number */}
                        <td className="py-2 px-3 text-center">
                          <span className="h-5 w-5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Test Details */}
                        <td className="py-2 px-3 min-w-[180px]">
                          <span className="font-semibold text-slate-900 block">
                            {item.testName}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{item.category || 'Pathology'}</span>
                            {item.roomNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono">Room {item.roomNumber}</span>
                              </>
                            )}
                            <span className="text-emerald-700 font-semibold font-mono">
                              • Due: {item.deliveryDate || deliveryDate}
                            </span>
                          </div>
                        </td>

                        {/* Standard Rate */}
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
                            title="Remove test"
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
            {/* Left Col (4 Cols): Special Invoice Discount & Payment Method */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">Inv Disc:</span>
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
                    className="px-2 h-8 bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 border-l border-slate-200 shrink-0"
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
                {totalDiscount > 0 && <span className="text-emerald-700 font-medium">Disc: -৳{totalDiscount.toFixed(0)}</span>}
              </div>

              {/* Compact Net Payable Hero Card */}
              <div className="h-10 px-3.5 rounded-xl bg-slate-950 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400">Net Payable</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  ৳{grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right Col (4 Cols): Cash Received, Due Status & Complete Button */}
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
                    onClick={() => handleQuickPayment('due')}
                    className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 font-medium cursor-pointer"
                  >
                    Due
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={grandTotal ? `৳${grandTotal}` : 'Paid (৳)'}
                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold font-mono text-slate-900 focus:outline-hidden focus:border-primary text-right"
                />
                <span className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0 ${
                  dueAmount <= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {dueAmount <= 0 ? 'Zero Due' : `Due: ৳${dueAmount.toFixed(0)}`}
                </span>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full h-8.5 rounded-xl bg-primary text-white font-bold text-xs tracking-wide shadow-xs hover:bg-primary-hover active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Complete & Print Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Printable Diagnostic Slip Modal */}
      <DiagnosticSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        invoice={createdInvoice}
      />
    </div>
  );
};

export default TestPOSPage;

