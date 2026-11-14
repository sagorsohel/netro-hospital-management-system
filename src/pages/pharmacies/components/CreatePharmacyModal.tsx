import React, { useState } from 'react';
import {
  X,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCreatePharmacyMutation } from '../../../store/api/pharmacyApi';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface CreatePharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pharmacyId: number) => void;
}

export const CreatePharmacyModal: React.FC<CreatePharmacyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createPharmacy, { isLoading }] = useCreatePharmacyMutation();

  // Pharmacy details
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNo, setLicenseNo] = useState('');

  // Initial owner details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) return setErrorMessage('Pharmacy name is required.');
    if (!address.trim()) return setErrorMessage('Physical address is required.');
    if (!phone.trim()) return setErrorMessage('Pharmacy contact phone is required.');
    if (!licenseNo.trim()) return setErrorMessage('Drug license number is required.');
    if (!ownerName.trim()) return setErrorMessage('Owner full name is required.');
    if (!ownerPhone.trim()) return setErrorMessage('Owner phone number is required (for login).');
    if (!ownerPassword.trim() || ownerPassword.length < 6) {
      return setErrorMessage('Owner initial password must be at least 6 characters.');
    }

    try {
      const response = await createPharmacy({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        licenseNo: licenseNo.trim(),
        owner: {
          name: ownerName.trim(),
          phone: ownerPhone.trim(),
          email: ownerEmail.trim() || undefined,
          password: ownerPassword.trim(),
        },
      }).unwrap();

      if (response.success) {
        onSuccess?.(response.data.id);
        handleClose();
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Failed to register pharmacy. Please check the license number and try again.';
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setLicenseNo('');
    setOwnerName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setOwnerPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-dark flex items-center gap-2">
                Register New Pharmacy Outlet
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Code #100X
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Creates an independent retail pharmacy branch and provisions its initial owner.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-dark hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Pharmacy Outlet Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                  1. Outlet Details & License
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Pharmacy Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Netro Care Pharmacy - Dhanmondi Branch"
                    className="h-9.5 text-xs pl-3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Drug License Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <FileBadge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="e.g. DRUG-DH-2026-9876"
                    className="h-9.5 text-xs pl-9 font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400">Must be unique across the hospital platform.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Outlet Contact Phone <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01711000001"
                    className="h-9.5 text-xs pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Outlet Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dhanmondi@netropharmacy.com"
                    className="h-9.5 text-xs pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Physical Address / Location <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                    className="h-9.5 text-xs pl-9"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Initial Pharmacy Owner Profile */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                  2. Initial Owner Account
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Login Role: Owner</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-800">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                The owner logs in at <span className="font-mono font-bold">/pharmacy-auth/login</span> using their{' '}
                <span className="font-bold">Pharmacy ID</span> and <span className="font-bold">Phone Number</span>.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Owner Full Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Md. Rafiqul Islam"
                    className="h-9.5 text-xs pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Owner Phone (Login Username) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="e.g. 01711998877"
                    className="h-9.5 text-xs pl-9 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Owner Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="e.g. rafiq@gmail.com"
                    className="h-9.5 text-xs pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Initial Password <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="h-9.5 text-xs pl-9 pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Outlet...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create Pharmacy & Owner</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

