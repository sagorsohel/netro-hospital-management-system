import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  CreditCard,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Eye,
  X,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import {
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useUploadBillCopyMutation,
} from '../../store/api/expenseApi';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export const EXPENSE_CATEGORIES = [
  'Utility Bills (Electricity, Water, Gas)',
  'Medical Equipment & Tools',
  'Facility & Lift Maintenance',
  'Diagnostic & Lab Reagents',
  'Office Supplies & Stationery',
  'Generator & Ambulance Fuel',
  'Cleaning & Waste Disposal',
  'Staff Refreshments & Canteen',
  'Emergency & Miscellaneous',
];

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Cheque',
  'Mobile Banking (bKash/Nagad)',
];

export const ExpenseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // APIs
  const { data: expenseData, isLoading: isLoadingExpense } = useGetExpenseByIdQuery(
    id as string,
    { skip: !isEditing }
  );
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [uploadBill, { isLoading: isUploading }] = useUploadBillCopyMutation();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [billCopy, setBillCopy] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidTo, setPaidTo] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Approved'>('Paid');
  const [error, setError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Prefill when editing
  useEffect(() => {
    if (isEditing && expenseData?.data) {
      const exp = expenseData.data;
      setTitle(exp.title || '');
      setDescription(exp.description || '');
      setDate(exp.date || new Date().toISOString().slice(0, 10));
      setAmount(exp.amount ? String(exp.amount) : '');
      setPurpose(exp.purpose || '');
      setCategory(exp.category || EXPENSE_CATEGORIES[0]);
      setBillCopy(exp.billCopy || '');
      setLocalPreview(exp.billCopy || '');
      setVoucherNo(exp.voucherNo || '');
      setPaymentMethod(exp.paymentMethod || 'Cash');
      setPaidTo(exp.paidTo || '');
      setStatus(exp.status || 'Paid');
    }
  }, [isEditing, expenseData]);

  // Handle Bill Copy upload to Cloudinary with instant preview
  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Bill copy image file size must be less than 8MB.');
      return;
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    formData.append('folder', 'netro-hospital/expenses');

    try {
      setUploadNotice('Uploading voucher scan to cloud storage...');
      setError('');
      const res = await uploadBill(formData).unwrap();
      if (res.success && res.url) {
        setBillCopy(res.url);
        setLocalPreview(res.url);
        setUploadNotice('Bill copy voucher uploaded and attached successfully!');
        setTimeout(() => setUploadNotice(''), 3500);
      } else {
        throw new Error(res.message || 'Bill copy upload failed');
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Error uploading bill voucher');
      setUploadNotice('');
    }
  };

  const handleRemoveBill = () => {
    setBillCopy('');
    setLocalPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide an expense title or voucher heading.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid expense amount greater than 0.");
      return;
    }

    if (!category.trim()) {
      setError("Please select an expense category.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      amount: String(amount),
      purpose: purpose.trim(),
      category: category.trim(),
      billCopy: billCopy || undefined,
      voucherNo: voucherNo.trim() || undefined,
      paymentMethod: paymentMethod.trim(),
      paidTo: paidTo.trim(),
      status,
    };

    try {
      if (isEditing && id) {
        await updateExpense({ id, data: payload }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      navigate("/expenses");
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to save expense record.",
      );
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isEditing && isLoadingExpense) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading expense voucher...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Top Header & Navigation */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/expenses"
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Expenses Ledger"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-dark tracking-tight">
              {isEditing
                ? `Edit Expense: ${voucherNo || title}`
                : "Record New Hospital Expense"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter expense details, attached bill voucher copies,
              categorization, and vendor audit information.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/expenses"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            form="expense-form"
            disabled={isSaving || isUploading}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEditing ? "Update Expense" : "Save Expense"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-accent text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Expense Information */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-dark">Expense Particulars</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Expense Title / Heading <span className="text-accent">*</span>
              </Label>
              <Input
                placeholder="e.g. Emergency Generator Diesel Purchase (400 Liters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Expense Category <span className="text-accent">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Amount (৳ / $) <span className="text-accent">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-bold font-mono text-dark"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Date of Expense <span className="text-accent">*</span>
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Purpose / Objective
              </Label>
              <Input
                placeholder="e.g. Continuous power backup for ICU, CCU & OT wards"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Detailed Description / Itemized Notes
              </Label>
              <Textarea
                rows={3}
                placeholder="Include invoice notes, quantity, rates, delivery challan reference..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vendor, Voucher & Payment Details */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-dark">
              Payment & Vendor Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voucher Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Voucher / Cash Memo No.
              </Label>
              <Input
                placeholder="Leave empty to auto-generate"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
              />
              <p className="text-[10px] text-slate-400">
                Internal or physical cash memo ID.
              </p>
            </div>

            {/* Paid To / Vendor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Paid To (Vendor / Company / Staff)
              </Label>
              <Input
                placeholder="e.g. Meghna Petroleum Depot Ltd."
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Payment Method
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm} value={pm}>
                      {pm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Payment Status
              </Label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Approved">
                    Approved (Awaiting Disbursement)
                  </SelectItem>
                  <SelectItem value="Pending">
                    Pending (Draft / Review)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 3: Attached Bill Copy / Voucher Receipt Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Upload className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-dark">
              Attached Bill Copy Photo / Voucher Receipt
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Upload a clear photograph or digital scan of the paper bill, cash
              memo, or payment voucher for financial auditing.
            </p>

            {localPreview || billCopy ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
                {/* Thumbnail Preview with Click-to-Zoom */}
                <div
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="h-28 w-28 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group relative shadow-xs"
                  title="Click to view full voucher preview"
                >
                  <img
                    src={localPreview || billCopy}
                    alt="Attached Bill"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 z-10">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Upload Status & Actions */}
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>
                      {isUploading
                        ? 'Uploading voucher to secure storage...'
                        : 'Bill copy voucher attached & preview ready'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click the thumbnail or &apos;View Receipt&apos; to inspect full resolution. Image is synced to Cloudinary CDN.
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Receipt</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs h-8 gap-1.5 text-slate-700 hover:text-dark"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Replace Photo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveBill}
                      disabled={isUploading}
                      className="text-xs h-8 text-accent hover:text-accent border-red-200 hover:bg-red-50 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-emerald-50/20 rounded-2xl p-8 text-center bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="h-12 w-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-xs border border-slate-200 group-hover:scale-105 group-hover:border-primary/40 transition-all">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary group-hover:underline">
                      {isUploading
                        ? 'Uploading voucher...'
                        : 'Click to Upload Bill Copy / Voucher Photo'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, WebP up to 8MB. Direct mobile camera photos supported.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden File Input for both initial upload and replacement */}
            <input
              id="bill-copy-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBillUpload}
              className="hidden"
              disabled={isUploading}
            />

            {uploadNotice && (
              <p className="text-xs text-emerald-600 font-semibold">{uploadNotice}</p>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100/90 shadow-xs flex items-center justify-end gap-3">
          <Link
            to="/expenses"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Confirm & Record Expense'}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Bill Preview Modal */}
      {isPreviewModalOpen && (localPreview || billCopy) && (
        <div
          onClick={() => setIsPreviewModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-dark">Attached Bill Voucher Scan</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-dark flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/60">
              <img
                src={localPreview || billCopy}
                alt="Bill Preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              {billCopy && (
                <a
                  href={billCopy}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
                >
                  Open Original File ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFormPage;
