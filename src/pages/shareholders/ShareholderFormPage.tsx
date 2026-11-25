import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Ticket,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import {
  generatePassword,
  IDENTITY_TYPES,
  money,
  PAYMENT_STATUS_STYLE,
  PAYMENT_TYPES,
  SHAREHOLDER_STATUSES,
  useCreateShareholderMutation,
  useGetShareholderByIdQuery,
  useGetSharePlansQuery,
  useUpdateShareholderMutation,
  type ShareholderAddress,
  type ShareholderPayload,
  type SharePlan,
} from '../../store/api/shareholderApi';
import { ShareholderAccountModal } from '../../components/shareholders/ShareholderAccountModal';
import { ImageUploadField } from '../../components/shareholders/ImageUploadField';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const RELIGIONS = ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other'];
const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const emptyAddress: ShareholderAddress = { house: '', area: '', postalCode: '', zilla: '', division: '' };

interface NomineeRow {
  clientId: string;
  name: string;
  phone: string;
  sharePercent: string;
  relationship: string;
  address: string;
  nid: string;
  photo: string;
}
const emptyNominee = (): NomineeRow => ({
  clientId: uid(),
  name: '',
  phone: '',
  sharePercent: '',
  relationship: '',
  address: '',
  nid: '',
  photo: '',
});

interface PurchaseRow {
  clientId: string;
  id?: string; // saved purchase
  planId: string;
  planName?: string; // legacy rows without a plan
  shareNumber: string;
  paymentType: string;
  purchaseDate: string;
  referenceName: string;
  quantity: string;
  totalAmount: string;
  paidAmount: string;
  overdue: boolean;
  transactionReference: string;
  notes: string;
}
const emptyPurchase = (): PurchaseRow => ({
  clientId: uid(),
  planId: '',
  shareNumber: '',
  paymentType: 'FULL_PAYMENT',
  purchaseDate: today(),
  referenceName: '',
  quantity: '1',
  totalAmount: '',
  paidAmount: '',
  overdue: false,
  transactionReference: '',
  notes: '',
});

const STEPS = [
  { key: 'personal', label: 'Personal & ID', icon: User },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'nominees', label: 'Nominees', icon: Users },
  { key: 'shares', label: 'Shares & Payment', icon: Ticket },
  { key: 'account', label: 'Investment & Login', icon: KeyRound },
] as const;

// ---------- small form primitives ----------
const inputCls =
  'w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 focus:outline-hidden transition disabled:bg-slate-50 disabled:text-slate-400';

const Field: React.FC<{
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, required, optional, hint, error, className, children }) => (
  <label className={`block space-y-1 ${className || ''}`}>
    <span className="text-[11px] font-semibold text-slate-600">
      {label} {required && <span className="text-rose-500">*</span>}
      {optional && <span className="font-normal text-slate-400">(optional)</span>}
    </span>
    {children}
    {error ? (
      <span className="block text-[10px] font-medium text-rose-600">{error}</span>
    ) : (
      hint && <span className="block text-[10px] text-slate-400">{hint}</span>
    )}
  </label>
);

const GroupTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex items-end justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
    <div>
      <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);

const AddressFields: React.FC<{
  value: ShareholderAddress;
  onChange: (v: ShareholderAddress) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const set = (k: keyof ShareholderAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="House / Village / Road" className="col-span-2">
        <input className={inputCls} disabled={disabled} value={value.house || ''} onChange={set('house')} placeholder="e.g. Bali Darun, Shaherbanu Ethimkhana" />
      </Field>
      <Field label="Area / Thana">
        <input className={inputCls} disabled={disabled} value={value.area || ''} onChange={set('area')} placeholder="e.g. Netrokona Sadar" />
      </Field>
      <Field label="Postal Code">
        <input className={inputCls} disabled={disabled} value={value.postalCode || ''} onChange={set('postalCode')} placeholder="2400" inputMode="numeric" />
      </Field>
      <Field label="Zilla (District)">
        <input className={inputCls} disabled={disabled} value={value.zilla || ''} onChange={set('zilla')} placeholder="e.g. Netrakona" />
      </Field>
      <Field label="Division">
        <select className={inputCls} disabled={disabled} value={value.division || ''} onChange={set('division')}>
          <option value="">Select division</option>
          {DIVISIONS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
    </div>
  );
};

type Errors = Record<string, string>;
const STEP_OF_FIELD = (key: string): number => {
  if (key.startsWith('nominee')) return 2;
  if (key.startsWith('purchase')) return 3;
  if (key.startsWith('login') || key === 'ownershipPercentage') return 4;
  return 0;
};

// ---------- page ----------
export const ShareholderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { data: existingRes, isLoading: isLoadingExisting } = useGetShareholderByIdQuery(id!, { skip: !isEditing });
  const { data: plansRes } = useGetSharePlansQuery();
  const [createShareholder, { isLoading: isCreating }] = useCreateShareholderMutation();
  const [updateShareholder, { isLoading: isUpdating }] = useUpdateShareholderMutation();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    identityType: 'NATIONAL_ID',
    nid: '',
    nidFrontImage: '',
    nidBackImage: '',
    tinNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    religion: 'Islam',
    maritalStatus: 'Married',
    fatherName: '',
    motherName: '',
    spouseName: '',
    photo: '',
    ownershipPercentage: '',
    investmentAmount: '',
    joinedDate: today(),
    bankAccountDetails: '',
    status: 'Active',
    notes: '',
  });
  const [presentAddress, setPresentAddress] = useState<ShareholderAddress>(emptyAddress);
  const [permanentAddress, setPermanentAddress] = useState<ShareholderAddress>(emptyAddress);
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [nominees, setNominees] = useState<NomineeRow[]>([emptyNominee()]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([emptyPurchase()]);

  // Login (create mode)
  const [createLogin, setCreateLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginEmailTouched, setLoginEmailTouched] = useState(false);
  const [loginPassword, setLoginPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [accountModal, setAccountModal] = useState<'create' | 'reset' | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');

  const existing = existingRes?.data;
  const plans = plansRes?.data || [];
  const planById = useMemo(() => new Map(plans.map((p) => [p.id, p])), [plans]);
  const loadedId = useRef<string | null>(null);

  // Fill the form once per shareholder (later refetches, e.g. after a password reset, must not wipe edits)
  useEffect(() => {
    if (!existing || loadedId.current === existing.id) return;
    loadedId.current = existing.id;
    setForm({
      name: existing.name || '',
      phone: existing.phone || '',
      email: existing.email || '',
      identityType: existing.identityType || 'NATIONAL_ID',
      nid: existing.nid || '',
      nidFrontImage: existing.nidFrontImage || '',
      nidBackImage: existing.nidBackImage || '',
      tinNumber: existing.tinNumber || '',
      gender: existing.gender || 'Male',
      dateOfBirth: existing.dateOfBirth || '',
      religion: existing.religion || 'Islam',
      maritalStatus: existing.maritalStatus || 'Married',
      fatherName: existing.fatherName || '',
      motherName: existing.motherName || '',
      spouseName: existing.spouseName || '',
      photo: existing.photo || '',
      ownershipPercentage: String(existing.ownershipPercentage ?? ''),
      investmentAmount: String(existing.investmentAmount ?? ''),
      joinedDate: existing.joinedDate || '',
      bankAccountDetails: existing.bankAccountDetails || '',
      status: existing.status || 'Active',
      notes: existing.notes || '',
    });
    const pa = { ...emptyAddress, ...(existing.presentAddress || {}) };
    const pe = { ...emptyAddress, ...(existing.permanentAddress || {}) };
    setPresentAddress(pa);
    setPermanentAddress(pe);
    setSameAsPresent(JSON.stringify(pa) === JSON.stringify(pe) && !!pa.house);
    setNominees(
      existing.nominees?.length
        ? existing.nominees.map((n) => ({
            clientId: uid(),
            name: n.name || '',
            phone: n.phone || '',
            sharePercent: n.sharePercent != null ? String(n.sharePercent) : '',
            relationship: n.relationship || '',
            address: n.address || '',
            nid: n.nid || '',
            photo: n.photo || '',
          }))
        : [emptyNominee()]
    );
    const live = (existing.purchases || []).filter((p) => p.paymentStatus !== 'CANCELLED');
    setPurchases(
      live.length
        ? live.map((p) => ({
            clientId: uid(),
            id: p.id,
            planId: p.planId || '',
            planName: p.planNameSnapshot || undefined,
            shareNumber: p.shareNumber,
            paymentType: p.paymentType || 'FULL_PAYMENT',
            purchaseDate: p.purchaseDate || '',
            referenceName: p.referenceName || '',
            quantity: String(p.quantity ?? 1),
            totalAmount: p.totalAmount != null ? String(Number(p.totalAmount)) : '',
            paidAmount: p.paidAmount != null ? String(Number(p.paidAmount)) : '',
            overdue: p.paymentStatus === 'OVERDUE',
            transactionReference: p.transactionReference || '',
            notes: p.notes || '',
          }))
        : [emptyPurchase()]
    );
  }, [existing]);

  // Login email follows the contact email until the admin edits it
  useEffect(() => {
    if (!loginEmailTouched) setLoginEmail(form.email);
  }, [form.email, loginEmailTouched]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const setValue = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ----- nominees -----
  const filledNominees = nominees.filter((n) => n.name.trim());
  const nomineeTotal = filledNominees.reduce((s, n) => s + (Number(n.sharePercent) || 0), 0);
  const nomineeOk = nomineeTotal <= 100.001; // share % is optional; just can't exceed 100
  const updateNominee = (cid: string, k: keyof NomineeRow, v: string) =>
    setNominees((list) => list.map((n) => (n.clientId === cid ? { ...n, [k]: v } : n)));
  const removeNominee = (cid: string) => {
    const n = nominees.find((x) => x.clientId === cid);
    if (n?.name.trim() && !confirm(`Remove nominee "${n.name}"?`)) return;
    setNominees((l) => (l.length === 1 ? [emptyNominee()] : l.filter((x) => x.clientId !== cid)));
  };

  // ----- purchases -----
  const updatePurchase = (cid: string, patch: Partial<PurchaseRow>) =>
    setPurchases((list) => list.map((p) => (p.clientId === cid ? { ...p, ...patch } : p)));
  const choosePlan = (row: PurchaseRow, planId: string) => {
    const plan = planById.get(planId);
    const qty = Number(row.quantity) || 1;
    updatePurchase(row.clientId, {
      planId,
      planName: undefined,
      // prefill total from the plan price when the admin hasn't typed one
      totalAmount: row.totalAmount === '' && plan?.price != null ? String(Number(plan.price) * qty) : row.totalAmount,
    });
  };
  const removePurchase = (row: PurchaseRow) => {
    if (row.id && !confirm(`Share ${row.shareNumber} is saved. Removing it will mark it CANCELLED (history is kept). Continue?`)) return;
    setPurchases((l) => (l.length === 1 ? [emptyPurchase()] : l.filter((x) => x.clientId !== row.clientId)));
  };
  const rowAmounts = (p: PurchaseRow) => {
    const total = Number(p.totalAmount) || 0;
    const paid = Number(p.paidAmount) || 0;
    const due = Math.max(0, total - paid);
    const status = total > 0 && due === 0 ? 'PAID' : p.overdue && due > 0 ? 'OVERDUE' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    return { total, paid, due, status };
  };
  const filledPurchases = purchases.filter((p) => p.shareNumber.trim() || p.planId);
  const purchaseTotals = filledPurchases.reduce(
    (acc, p) => {
      const a = rowAmounts(p);
      return { total: acc.total + a.total, paid: acc.paid + a.paid, due: acc.due + a.due };
    },
    { total: 0, paid: 0, due: 0 }
  );

  const planOptionsFor = (row: PurchaseRow): SharePlan[] =>
    plans.filter((p) => p.status === 'ACTIVE' || p.id === row.planId);

  // ----- validation -----
  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Applicant name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^\+?[0-9\s-]{6,20}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.dateOfBirth && form.dateOfBirth > today()) e.dateOfBirth = 'Date of birth cannot be in the future.';

    filledNominees.forEach((n, i) => {
      if (n.sharePercent.trim() === '') return; // optional
      const pct = Number(n.sharePercent);
      if (!(pct > 0 && pct <= 100)) e[`nominee.${n.clientId}`] = `Nominee ${i + 1}: share % must be between 0 and 100.`;
    });
    if (!nomineeOk) e.nominees = `Nominee shares cannot add up to more than 100% (now ${Number(nomineeTotal.toFixed(2))}%).`;

    const seen = new Set<string>();
    filledPurchases.forEach((p, i) => {
      const k = `purchase.${p.clientId}`;
      if (!p.planId && !p.planName) e[k] = `Share ${i + 1}: select a share plan.`;
      else if (!p.shareNumber.trim()) e[k] = `Share ${i + 1}: share number is required.`;
      else if (seen.has(p.shareNumber.trim().toLowerCase())) e[k] = `Share ${i + 1}: share number ${p.shareNumber} is entered twice.`;
      else if (Number(p.paidAmount) > Number(p.totalAmount || 0) && Number(p.totalAmount) > 0)
        e[k] = `Share ${i + 1}: paid amount is more than the total.`;
      seen.add(p.shareNumber.trim().toLowerCase());
    });

    const pct = form.ownershipPercentage === '' ? 0 : Number(form.ownershipPercentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) e.ownershipPercentage = 'Ownership share must be between 0 and 100%.';
    if (!isEditing && createLogin) {
      if (!/^\S+@\S+\.\S+$/.test(loginEmail.trim())) e.loginEmail = 'Enter a valid login email, or turn off "Create login".';
      if (loginPassword.length < 6) e.loginPassword = 'Password must be at least 6 characters.';
    }
    return e;
  };

  const stepErrors = useMemo(() => {
    const out = [0, 0, 0, 0, 0];
    Object.keys(errors).forEach((k) => (out[STEP_OF_FIELD(k)] += 1));
    return out;
  }, [errors]);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(`Email: ${loginEmail}\nPassword: ${loginPassword}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setServerError('');
    const v = validate();
    setErrors(v);
    const keys = Object.keys(v);
    if (keys.length) {
      setStep(Math.min(...keys.map(STEP_OF_FIELD)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: ShareholderPayload = {
      ...form,
      ownershipPercentage: form.ownershipPercentage === '' ? 0 : Number(form.ownershipPercentage),
      investmentAmount: Number(form.investmentAmount) || 0,
      spouseName: form.maritalStatus === 'Married' ? form.spouseName : '',
      presentAddress,
      permanentAddress: sameAsPresent ? presentAddress : permanentAddress,
      nominees: filledNominees.map(({ clientId: _c, sharePercent, ...n }) => ({
        ...n,
        ...(sharePercent.trim() !== '' && { sharePercent: Number(sharePercent) }),
      })),
      purchases: filledPurchases.map((p) => ({
        ...(p.id && { id: p.id }),
        ...(p.planId ? { planId: p.planId } : { planName: p.planName }),
        shareNumber: p.shareNumber.trim(),
        paymentType: p.paymentType,
        purchaseDate: p.purchaseDate || undefined,
        referenceName: p.referenceName,
        quantity: Number(p.quantity) || 1,
        totalAmount: Number(p.totalAmount) || 0,
        paidAmount: Number(p.paidAmount) || 0,
        paymentStatus: p.overdue ? 'OVERDUE' : undefined,
        transactionReference: p.transactionReference,
        notes: p.notes,
      })),
    };
    if (!payload.dateOfBirth) delete payload.dateOfBirth;

    try {
      if (isEditing) {
        await updateShareholder({ id: id!, data: payload }).unwrap();
      } else {
        await createShareholder({
          ...payload,
          ...(createLogin && { loginEmail: loginEmail.trim(), loginPassword }),
        }).unwrap();
        if (createLogin) {
          alert(`Shareholder saved.\n\nLogin details — give these to ${form.name}:\nEmail: ${loginEmail.trim()}\nPassword: ${loginPassword}`);
        }
      }
      navigate('/shareholders');
    } catch (err: any) {
      const details = err?.data?.errors?.map?.((x: any) => x.message).join(' ');
      setServerError([details || err?.data?.message || 'Failed to save shareholder.', err?.data?.cause].filter(Boolean).join(' — '));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isEditing && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading shareholder...
      </div>
    );
  }

  const saving = isCreating || isUpdating;
  const isLast = step === STEPS.length - 1;
  const errorList = Object.values(errors);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16 text-slate-900">
      {/* Header */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/shareholders"
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            title="Back to shareholders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              {isEditing ? form.name || 'Edit Shareholder' : 'Add New Shareholder'}
              {existing?.shareholderCode && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold">
                  {existing.shareholderCode}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              {isEditing ? 'Edit any group, then save once.' : 'Fill the groups in order — only name and phone are required.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isEditing ? 'Save changes' : 'Save shareholder'}
        </button>
      </div>

      {/* Stepper */}
      <nav className="bg-white rounded-2xl border border-slate-100 shadow-xs p-1.5 grid grid-cols-5 gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          const bad = stepErrors[i] > 0;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`relative flex items-center justify-center sm:justify-start gap-2 rounded-xl px-2 sm:px-3 py-2.5 text-left transition cursor-pointer ${
                active ? 'bg-teal-600 text-white shadow-xs' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span
                className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                  active
                    ? 'bg-white/20 text-white'
                    : bad
                    ? 'bg-rose-100 text-rose-700'
                    : done
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {bad && !active ? '!' : done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="hidden sm:block min-w-0">
                <span className={`block text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-teal-100' : 'text-slate-400'}`}>
                  Step {i + 1}
                </span>
                <span className="block text-xs font-bold truncate">{s.label}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {(serverError || errorList.length > 0) && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <div className="space-y-0.5">
            {serverError && <p>{serverError}</p>}
            {errorList.slice(0, 5).map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Enter on an earlier step moves on instead of saving
          if (isLast) handleSubmit();
          else setStep((st) => st + 1);
        }}
        className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6">
        {/* ===== STEP 1: PERSONAL & ID ===== */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
              <ImageUploadField label="Photograph" value={form.photo} onChange={setValue('photo')} shape="portrait" hint="Passport size, max 5 MB" />
              <div>
                <GroupTitle title="Personal Details" subtitle="As on the shareholder application form" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Applicant Name" required error={errors.name} className="sm:col-span-2">
                    <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Md Abu Ehsan Rahmatullah" />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input className={`${inputCls} font-mono`} type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="name@gmail.com" />
                  </Field>
                  <Field label="Gender">
                    <select className={inputCls} value={form.gender} onChange={set('gender')}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </Field>
                  <Field label="Date of Birth" error={errors.dateOfBirth}>
                    <input className={inputCls} type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} max={today()} />
                  </Field>
                  <Field label="Religion">
                    <select className={inputCls} value={form.religion} onChange={set('religion')}>
                      {RELIGIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Marital Status">
                    <select className={inputCls} value={form.maritalStatus} onChange={set('maritalStatus')}>
                      <option>Married</option>
                      <option>Unmarried</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </Field>
                  <Field label="Father's Name">
                    <input className={inputCls} value={form.fatherName} onChange={set('fatherName')} />
                  </Field>
                  <Field label="Mother's Name">
                    <input className={inputCls} value={form.motherName} onChange={set('motherName')} />
                  </Field>
                  {form.maritalStatus === 'Married' && (
                    <Field label="Spouse Name" className="sm:col-span-2">
                      <input className={inputCls} value={form.spouseName} onChange={set('spouseName')} />
                    </Field>
                  )}
                </div>
              </div>
            </div>

            <div>
              <GroupTitle title="Identity Document" subtitle="Number is masked in lists; card images are optional" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                <Field label="Document Type">
                  <select className={inputCls} value={form.identityType} onChange={set('identityType')}>
                    {IDENTITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Document Number">
                  <input className={`${inputCls} font-mono`} value={form.nid} onChange={set('nid')} placeholder="NID / passport / birth reg. no." />
                </Field>
                <Field label="TIN Number" optional>
                  <input className={`${inputCls} font-mono`} value={form.tinNumber} onChange={set('tinNumber')} />
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-6">
                <ImageUploadField label="Front side" optional value={form.nidFrontImage} onChange={setValue('nidFrontImage')} shape="card" />
                <ImageUploadField label="Back side" optional value={form.nidBackImage} onChange={setValue('nidBackImage')} shape="card" />
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: ADDRESS ===== */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <GroupTitle title="Present Address" />
              <AddressFields value={presentAddress} onChange={setPresentAddress} />
            </div>
            <div>
              <GroupTitle
                title="Permanent Address"
                right={
                  <label className="flex items-center gap-1.5 text-[11px] text-teal-700 font-semibold cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="accent-teal-600"
                      checked={sameAsPresent}
                      onChange={(e) => {
                        setSameAsPresent(e.target.checked);
                        // copy once; unticking keeps the copy so it can be edited
                        if (!e.target.checked) setPermanentAddress(presentAddress);
                      }}
                    />
                    Same as present
                  </label>
                }
              />
              <AddressFields
                value={sameAsPresent ? presentAddress : permanentAddress}
                onChange={setPermanentAddress}
                disabled={sameAsPresent}
              />
            </div>
          </div>
        )}

        {/* ===== STEP 3: NOMINEES ===== */}
        {step === 2 && (
          <div>
            <GroupTitle
              title="Nominee Information"
              subtitle="Share %, photo and NID are optional. Shares given can't total more than 100%."
              right={
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono border ${
                    nomineeTotal === 0
                      ? 'bg-slate-50 text-slate-400 border-slate-200'
                      : !nomineeOk
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : Math.abs(nomineeTotal - 100) < 0.01
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  Total: {Number(nomineeTotal.toFixed(2))}%
                </span>
              }
            />
            <div className="space-y-3">
              {nominees.map((n, i) => (
                <div
                  key={n.clientId}
                  className={`rounded-xl border p-4 ${errors[`nominee.${n.clientId}`] ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/40'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Nominee {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeNominee(n.clientId)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    <ImageUploadField label="Photo" optional value={n.photo} onChange={(v) => updateNominee(n.clientId, 'photo', v)} shape="avatar" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-3">
                      <Field label="Name" className="col-span-2">
                        <input className={inputCls} value={n.name} onChange={(e) => updateNominee(n.clientId, 'name', e.target.value)} />
                      </Field>
                      <Field label="Share %" optional>
                        <input
                          className={`${inputCls} font-mono`}
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={n.sharePercent}
                          onChange={(e) => updateNominee(n.clientId, 'sharePercent', e.target.value)}
                        />
                      </Field>
                      <Field label="Relationship">
                        <select className={inputCls} value={n.relationship} onChange={(e) => updateNominee(n.clientId, 'relationship', e.target.value)}>
                          <option value="">Select</option>
                          {RELATIONSHIPS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Phone">
                        <input className={`${inputCls} font-mono`} value={n.phone} onChange={(e) => updateNominee(n.clientId, 'phone', e.target.value)} />
                      </Field>
                      <Field label="NID / Birth Reg." optional>
                        <input className={`${inputCls} font-mono`} value={n.nid} onChange={(e) => updateNominee(n.clientId, 'nid', e.target.value)} />
                      </Field>
                      <Field label="Address" className="col-span-2">
                        <input className={inputCls} value={n.address} onChange={(e) => updateNominee(n.clientId, 'address', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                  {errors[`nominee.${n.clientId}`] && <p className="mt-2 text-[11px] text-rose-600">{errors[`nominee.${n.clientId}`]}</p>}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNominees((l) => [...l, emptyNominee()])}
                disabled={nominees.length >= 10}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-200 text-teal-700 hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Add Nominee
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: SHARES & PAYMENT ===== */}
        {step === 3 && (
          <div>
            <GroupTitle
              title="Shares Purchased"
              subtitle="Each share number must be unique. Removing a saved share cancels it (history is kept)."
              right={
                <Link to="/shareholders/plans" className="text-[11px] font-semibold text-teal-700 hover:underline whitespace-nowrap">
                  Manage share plans →
                </Link>
              }
            />
            {plans.filter((p) => p.status === 'ACTIVE').length === 0 && (
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2">
                No active share plan yet. <Link to="/shareholders/plans" className="font-bold underline">Create a plan</Link> first (e.g. "Single (2026)").
              </div>
            )}
            <div className="space-y-3">
              {purchases.map((p, i) => {
                const a = rowAmounts(p);
                const err = errors[`purchase.${p.clientId}`];
                return (
                  <div key={p.clientId} className={`rounded-xl border p-4 ${err ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        Share {i + 1}
                        {p.id && <span className="px-1.5 py-px rounded bg-slate-200 text-slate-600 text-[10px] font-semibold">saved</span>}
                        <span className={`px-1.5 py-px rounded border text-[10px] font-bold ${PAYMENT_STATUS_STYLE[a.status]}`}>{a.status}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removePurchase(p)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {p.id ? 'Cancel share' : 'Remove'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-3">
                      <Field label="Package / Plan" required>
                        <select className={inputCls} value={p.planId} onChange={(e) => choosePlan(p, e.target.value)}>
                          <option value="">{p.planName ? `${p.planName} (old entry)` : 'Select plan'}</option>
                          {planOptionsFor(p).map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.name}
                              {pl.price != null ? ` — ${money(pl.price)}` : ''}
                              {pl.status !== 'ACTIVE' ? ' (inactive)' : ''}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Share No" required>
                        <input className={`${inputCls} font-mono`} value={p.shareNumber} onChange={(e) => updatePurchase(p.clientId, { shareNumber: e.target.value })} placeholder="00025804" />
                      </Field>
                      <Field label="Payment">
                        <select className={inputCls} value={p.paymentType} onChange={(e) => updatePurchase(p.clientId, { paymentType: e.target.value })}>
                          {PAYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Purchased">
                        <input className={inputCls} type="date" value={p.purchaseDate} onChange={(e) => updatePurchase(p.clientId, { purchaseDate: e.target.value })} />
                      </Field>
                      <Field label="Total Amount (৳)">
                        <input className={`${inputCls} font-mono`} type="number" min={0} value={p.totalAmount} onChange={(e) => updatePurchase(p.clientId, { totalAmount: e.target.value })} />
                      </Field>
                      <Field label="Paid Amount (৳)">
                        <input className={`${inputCls} font-mono`} type="number" min={0} value={p.paidAmount} onChange={(e) => updatePurchase(p.clientId, { paidAmount: e.target.value })} />
                      </Field>
                      <Field label="Due (৳)">
                        <div className={`h-9 px-3 rounded-lg border flex items-center font-mono text-[13px] font-bold ${a.due > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {money(a.due)}
                        </div>
                      </Field>
                      <Field label="Reference">
                        <input className={inputCls} value={p.referenceName} onChange={(e) => updatePurchase(p.clientId, { referenceName: e.target.value })} placeholder="Referred by" />
                      </Field>
                      <Field label="Transaction Ref." optional className="col-span-2">
                        <input className={inputCls} value={p.transactionReference} onChange={(e) => updatePurchase(p.clientId, { transactionReference: e.target.value })} placeholder="Bank / bKash transaction ID" />
                      </Field>
                      <Field label="Admin note" optional className="col-span-2" hint="Not shown to the shareholder">
                        <input className={inputCls} value={p.notes} onChange={(e) => updatePurchase(p.clientId, { notes: e.target.value })} />
                      </Field>
                    </div>
                    {a.due > 0 && (
                      <label className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold cursor-pointer">
                        <input type="checkbox" className="accent-rose-600" checked={p.overdue} onChange={(e) => updatePurchase(p.clientId, { overdue: e.target.checked })} />
                        Mark payment as overdue
                      </label>
                    )}
                    {err && <p className="mt-2 text-[11px] text-rose-600">{err}</p>}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setPurchases((l) => [...l, emptyPurchase()])}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-200 text-teal-700 hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Share
              </button>
            </div>
            {filledPurchases.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  ['Total', purchaseTotals.total, 'text-slate-900'],
                  ['Paid', purchaseTotals.paid, 'text-emerald-700'],
                  ['Due', purchaseTotals.due, purchaseTotals.due > 0 ? 'text-amber-700' : 'text-slate-500'],
                ].map(([label, v, cls]) => (
                  <div key={label as string} className="rounded-xl border border-slate-200 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label as string}</div>
                    <div className={`font-mono font-black text-sm ${cls}`}>{money(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 5: INVESTMENT & LOGIN ===== */}
        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <GroupTitle title="Investment & Payout" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Ownership Share (%)" hint="Used for the profit-share figure" error={errors.ownershipPercentage}>
                  <input className={`${inputCls} font-mono`} type="number" step="0.01" min={0} max={100} value={form.ownershipPercentage} onChange={set('ownershipPercentage')} placeholder="e.g. 2.5" />
                </Field>
                <Field label="Capital Invested (৳)">
                  <input className={`${inputCls} font-mono`} type="number" min={0} value={form.investmentAmount} onChange={set('investmentAmount')} placeholder="e.g. 500000" />
                </Field>
                <Field label="Joined Date">
                  <input className={inputCls} type="date" value={form.joinedDate} onChange={set('joinedDate')} />
                </Field>
                <Field label="Status" hint="Draft / Pending while documents are checked">
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    {SHAREHOLDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Bank details for dividend payout" className="col-span-2">
                  <input className={inputCls} value={form.bankAccountDetails} onChange={set('bankAccountDetails')} placeholder="Bank, branch, A/C no. or bKash number" />
                </Field>
                <Field label="Admin notes" optional className="col-span-2" hint="Not shown to the shareholder">
                  <textarea className={`${inputCls} h-auto py-2`} rows={3} value={form.notes} onChange={set('notes')} />
                </Field>
              </div>
            </div>

            <div>
              <GroupTitle title="Login Access" subtitle="Shareholder sees their own shares + hospital expenses & equipment, view only" />
              {isEditing ? (
                existing?.account ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
                      <span className="text-slate-500">Login email</span>
                      <div className="font-mono font-semibold break-all text-sm">{existing.account.email}</div>
                      <span
                        className={`mt-1 inline-block px-1.5 py-px rounded text-[10px] font-bold ${
                          existing.account.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {existing.account.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAccountModal('reset')}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reset password
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAccountModal('create')}
                    className="w-full px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Create login
                  </button>
                )
              ) : (
                <div className="space-y-3">
                  <label className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-semibold cursor-pointer">
                    Create login for this shareholder
                    <input type="checkbox" className="accent-indigo-600 h-4 w-4" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
                  </label>
                  {createLogin && (
                    <>
                      <Field label="Login email" required error={errors.loginEmail}>
                        <input
                          className={inputCls}
                          type="email"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmailTouched(true);
                            setLoginEmail(e.target.value);
                          }}
                          placeholder="shareholder@email.com"
                        />
                      </Field>
                      <Field label="Password" required error={errors.loginPassword} hint="Min 6 characters. Give it to the shareholder.">
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <input
                              className={`${inputCls} font-mono pr-8`}
                              type={showPassword ? 'text' : 'password'}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-2.5 text-slate-400 cursor-pointer">
                              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <button type="button" onClick={() => setLoginPassword(generatePassword())} title="Generate" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={copyPassword} title="Copy email & password" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </Field>
                      {copied && <p className="text-[11px] text-emerald-600 font-semibold">Copied login details</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="text-[11px] text-slate-400">
            Step {step + 1} of {STEPS.length}
          </span>
          {isLast ? (
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isEditing ? 'Save changes' : 'Save shareholder'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep((s) => s + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              Next: {STEPS[step + 1].label} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {isEditing && existing && accountModal && (
        <ShareholderAccountModal shareholder={existing} mode={accountModal} onClose={() => setAccountModal(null)} />
      )}

      <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <Landmark className="h-3 w-3" /> Every change is recorded in the shareholder's activity log.
      </p>
    </div>
  );
};

export default ShareholderFormPage;
