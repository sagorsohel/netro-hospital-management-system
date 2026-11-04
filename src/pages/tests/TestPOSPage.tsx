import React, { useState, useMemo, useEffect } from 'react';
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
        deliveryDate: t.deliveryTime || 'Tomorrow 4:00 PM',
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
          deliveryDate: item.deliveryDate || deliveryDate,
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
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
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
              Diagnostic & Lab Test POS Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Pathology & Imaging Desk
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Intake patient, select pathology & diagnostic tests, apply discounts, collect advance or manage dues, and print A4 voucher.
          </p>
        </div>

        {/* Navigation & Counter Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tests/invoices')}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>All Lab Invoices</span>
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Diagnostic Terminal
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
          <div className="h-9 w-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FlaskConical className="h-5 w-5" />
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
                Diagnostic Order Complete! Voucher #{successInfo.invoiceNo}
              </h4>
              <p className="text-xs text-emerald-700">
                Patient Profile linked: <strong className="font-mono">{successInfo.patientId}</strong>
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
              <span>Print A4 Slip</span>
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

      {/* Main Split Layout: Left Setup (5 Cols) + Right POS Terminal (7 Cols) */}
      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: INTAKE & TEST SELECTOR (5 Cols) ================= */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
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
                      Auto-registers new permanent profile or select existing patient
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
                    Search & Select Registered Patient *
                  </label>
                  <Select
                    value={selectedPatientId}
                    onValueChange={handleSelectExistingPatient}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Choose registered patient --" />
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
                      <span>Patient found! Information auto-populated below.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ruhul Amin"
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
                    placeholder="e.g. +880 1718-445566"
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
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 38"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
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
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="e.g. Tejgaon Industrial Area, Dhaka"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Referring Physician & Specimen Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">
                    2. Referring Doctor & Delivery Schedule
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign doctor name and target report delivery time
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Hospital Doctor
                  </label>
                  <Select
                    value={selectedDoctorId}
                    onValueChange={(val) => {
                      setSelectedDoctorId(val);
                      const d = doctorsData?.data?.find((item) => item.id === val);
                      if (d) setCustomDoctorName(d.name);
                    }}
                  >
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Or External Doctor Name
                  </label>
                  <input
                    type="text"
                    value={customDoctorName}
                    onChange={(e) => setCustomDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Kazi Shahed (Consultant)"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Report Expected Delivery Date / Time
                  </label>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    placeholder="e.g. Tomorrow 4:00 PM, Same Day (4 Hours)"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Diagnostic Tests Catalog & Selection */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark">
                      3. Select Diagnostic & Lab Tests *
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Search and click to add tests into the active billing cart
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {cartItems.length} Added
                </span>
              </div>

              {/* Search & Category Filter Pills */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    placeholder="Search test name (CBC, USG, MRI, Glucose, etc.)..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 focus:outline-hidden focus:border-primary transition"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tests Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredTests.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                    No diagnostic tests found matching your search.
                  </div>
                ) : (
                  filteredTests.map((t) => {
                    const existingItem = cartItems.find((item) => item.testId === t.id);
                    const isAdded = Boolean(existingItem);

                    return (
                      <div
                        key={t.id}
                        onClick={() => handleAddTestToCart(t)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isAdded
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-0.5 overflow-hidden">
                          <h4 className="text-xs font-bold truncate text-slate-900">
                            {t.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{t.category}</span>
                            {t.roomNumber && (
                              <>
                                <span>•</span>
                                <span>{t.roomNumber}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-primary block">
                            ৳{parseFloat(String(t.price)).toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              isAdded
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isAdded ? `✓ Added (${existingItem?.quantity || 1})` : '+ Add'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE POS TERMINAL (7 Cols - Expanded) ================= */}
          <div className="lg:col-span-7 xl:col-span-7 sticky top-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Terminal Header */}
              <div className="bg-slate-900 text-white p-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-black tracking-widest text-primary">
                    Live Diagnostic POS Receipt
                  </span>
                  <div className="flex items-center gap-2">
                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearCart}
                        title="Clear all cart items"
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-rose-500/80 text-white transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear Cart</span>
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/10 text-white font-bold">
                      Counter #2 (Lab)
                    </span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  NETRO DIAGNOSTICS & LAB BILLING
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Patient: <span className="font-bold text-white">{patientName || 'New Patient'}</span> • {cartItems.length} Test(s) ({totalQuantity} Unit{totalQuantity > 1 ? 's' : ''})
                </p>
              </div>

              {/* Itemized Live Bill Cart */}
              <div className="p-6 space-y-5 text-xs sm:text-sm">
                {/* Cart Items List */}
                <div className="space-y-3 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1.5 pb-3 border-b border-dashed border-slate-200">
                  {cartItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm">No tests selected yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Click any diagnostic test on the left catalog to add to bill.</p>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => {
                      const unitPrice = parseFloat(String(item.price)) || 0;
                      const qty = item.quantity || 1;
                      const lineGross = unitPrice * qty;
                      const itemDiscAmount = parseFloat(String(item.discountAmount || 0));
                      const finalAmount = parseFloat(String(item.finalAmount || (lineGross - itemDiscAmount)));
                      const itemDiscType = item.discountType || 'amount';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 space-y-3 transition-all shadow-2xs"
                        >
                          {/* Top row: test info and delete button */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="overflow-hidden min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-900 truncate block text-sm sm:text-base">
                                  {item.testName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-7 mt-0.5">
                                <span className="font-medium">{item.category || 'Pathology'}</span>
                                {item.roomNumber && (
                                  <>
                                    <span>•</span>
                                    <span>Room: {item.roomNumber}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="font-bold text-slate-800">Rate: ৳{unitPrice.toLocaleString()}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(idx)}
                              title="Remove test"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Bottom controls: Quantity (+/-) & Individual Line Discount & Line Total */}
                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider bg-slate-200/80 px-2 py-1 rounded-lg shrink-0">
                                QTY
                              </span>
                              <div className="flex items-center border-2 border-slate-300 focus-within:border-primary rounded-xl bg-white overflow-hidden shadow-xs h-11 sm:h-12 transition">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(idx, qty - 1)}
                                  disabled={qty <= 1}
                                  className="w-10 sm:w-12 h-11 sm:h-12 flex items-center justify-center text-xl font-black text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 transition cursor-pointer select-none active:scale-95"
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
                                  className="w-14 sm:w-16 h-11 sm:h-12 text-center font-black text-slate-900 text-lg sm:text-xl focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(idx, qty + 1)}
                                  className="w-10 sm:w-12 h-11 sm:h-12 flex items-center justify-center text-xl font-black text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer select-none active:scale-95"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Individual Discount Input & Toggle */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider bg-slate-200/80 px-2 py-1 rounded-lg shrink-0">
                                DISC
                              </span>
                              <div className="flex items-center border-2 border-slate-300 focus-within:border-primary rounded-xl bg-white overflow-hidden shadow-xs h-11 sm:h-12 transition">
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
                                  className="w-28 sm:w-36 h-11 sm:h-12 px-3 text-right font-black text-slate-900 text-lg sm:text-xl focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleToggleItemDiscountType(idx)}
                                  className="w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center text-base sm:text-lg font-black bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer border-l-2 border-slate-200 shrink-0"
                                  title="Toggle discount type (BDT / %)"
                                >
                                  {itemDiscType === 'amount' ? '৳' : '%'}
                                </button>
                              </div>
                            </div>

                            {/* Line Total */}
                            <div className="text-right shrink-0 min-w-[95px] sm:ml-auto">
                              <span className="text-lg sm:text-xl font-black text-slate-900 block font-mono">
                                ৳{finalAmount.toFixed(2)}
                              </span>
                              {(qty > 1 || itemDiscAmount > 0) && (
                                <span className="text-xs text-slate-400 block -mt-0.5 font-medium">
                                  {itemDiscAmount > 0 ? (
                                    <span className="text-emerald-600 font-bold">
                                      (-৳{itemDiscAmount.toFixed(0)})
                                    </span>
                                  ) : (
                                    <span>৳{unitPrice}×{qty}</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subtotal & Discount Row */}
                <div className="space-y-3 pb-5 border-b border-slate-100 text-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Gross Subtotal ({totalQuantity} unit{totalQuantity > 1 ? 's' : ''}):</span>
                    <span className="font-bold text-slate-900 font-mono text-base">
                      ৳{grossSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Individual Test Discounts Sum */}
                  {totalItemDiscounts > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Per-Item Discounts Total:</span>
                      <span className="font-bold font-mono text-base">-৳{totalItemDiscounts.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Invoice Level / Special Extra Discount */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-slate-600 font-medium">Special Invoice Disc:</span>
                    <div className="flex items-center gap-2 w-56 sm:w-72">
                      <input
                        type="number"
                        min={0}
                        value={discountVal || ''}
                        onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 text-lg text-right font-black text-slate-900 focus:outline-hidden focus:border-primary shadow-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDiscountType(discountType === 'amount' ? 'percent' : 'amount')
                        }
                        className="px-5 h-12 rounded-xl bg-slate-100 text-base font-black text-slate-800 hover:bg-slate-200 transition cursor-pointer shrink-0 border-2 border-slate-200"
                      >
                        {discountType === 'amount' ? 'BDT' : '%'}
                      </button>
                    </div>
                  </div>

                  {calculatedInvoiceDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Invoice Disc Deducted:</span>
                      <span className="font-mono text-base font-bold">-৳{calculatedInvoiceDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total Combined Discount if both exist */}
                  {totalItemDiscounts > 0 && calculatedInvoiceDiscount > 0 && (
                    <div className="flex justify-between text-slate-700 font-bold text-xs sm:text-sm pt-2 border-t border-slate-100">
                      <span>Total Combined Discount:</span>
                      <span className="text-emerald-700 font-mono text-base font-black">-৳{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total Display */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-slate-500 block">
                      Payable Grand Total
                    </span>
                    <span className="text-2xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-primary/10 text-primary font-mono tracking-wider">
                    LAB POS
                  </span>
                </div>

                {/* Paid Amount Received Input & Presets */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      Amount Paid (BDT) *
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickPayment('full')}
                        className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Full
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPayment('half')}
                        className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPayment('due')}
                        className="text-xs font-bold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      >
                        Due All
                      </button>
                    </div>
                  </div>

                  <input
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={grandTotal ? String(grandTotal) : 'Enter paid amount'}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-base sm:text-lg font-black font-mono text-dark focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>

                {/* Balance Due Card */}
                <div
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    dueAmount <= 0
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">
                    {dueAmount <= 0 ? 'Fully Paid' : 'Remaining Due Balance:'}
                  </span>
                  <span className="text-base sm:text-xl font-black font-mono">
                    ৳{dueAmount.toFixed(2)}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Payment Method
                  </label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full h-11 text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash at Counter</SelectItem>
                      <SelectItem value="bKash / MFS">bKash / Mobile Money</SelectItem>
                      <SelectItem value="Nagad">Nagad MFS</SelectItem>
                      <SelectItem value="Card">Debit / Credit Card</SelectItem>
                      <SelectItem value="Bank Wire">Bank Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Receipt className="h-5 w-5" />
                      <span>Complete Order & Print Slip</span>
                    </>
                  )}
                </button>
              </div>
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
