import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  useCreatePharmacyUserMutation,
  type PharmacyRole,
} from '../../../store/api/pharmacyApi';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface AddPharmacyStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: number;
  pharmacyName?: string;
  onSuccess?: () => void;
}

const ROLES: { id: PharmacyRole; label: string; desc: string }[] = [
  { id: 'pharmacist', label: 'Pharmacist', desc: 'Dispenses medicines, manages inventory & expiry' },
  { id: 'cashier', label: 'Cashier', desc: 'Counter sales, billing & invoice printing' },
  { id: 'manager', label: 'Branch Manager', desc: 'Oversees daily branch operations & shifts' },
  { id: 'staff', label: 'General Staff', desc: 'Store assistant & stock helper' },
  { id: 'owner', label: 'Co-Owner', desc: 'Full administrative access to the pharmacy' },
];

export const AddPharmacyStaffModal: React.FC<AddPharmacyStaffModalProps> = ({
  isOpen,
  onClose,
  pharmacyId,
  pharmacyName,
  onSuccess,
}) => {
  const [createPharmacyUser, { isLoading }] = useCreatePharmacyUserMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PharmacyRole>('pharmacist');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) return setErrorMessage('Staff name is required.');
    if (!phone.trim()) return setErrorMessage('Contact phone number is required (used for login).');
    if (!password.trim() || password.length < 6) {
      return setErrorMessage('Initial password must be at least 6 characters.');
    }

    try {
      await createPharmacyUser({
        pharmacyId,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          role,
          password: password.trim(),
        },
      }).unwrap();

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Failed to add staff member. Check if phone number already exists in this pharmacy.';
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('pharmacist');
    setPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-dark flex items-center gap-2">
                Add Pharmacy Staff
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  #{pharmacyId}
                </span>
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {pharmacyName ? `For ${pharmacyName}` : `Provision login account for Pharmacy #${pharmacyId}`}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Staff Full Name <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Tanvir Ahmed"
                className="h-9.5 text-xs pl-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Phone Number (Login ID) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01811223344"
                  className="h-9.5 text-xs pl-9 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Email (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tanvir@pharmacy.com"
                  className="h-9.5 text-xs pl-9"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Assigned Role <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Controls POS & stock permissions</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${selected ? 'text-emerald-800' : 'text-dark'}`}>
                        {r.label}
                      </span>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-bold text-slate-700">
              Initial Password <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="text-[10px] text-slate-400">
              The staff will log in using Pharmacy Code <span className="font-mono font-bold">#{pharmacyId}</span>, their phone number, and this password.
            </p>
          </div>

          {/* Footer */}
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
                  <span>Adding Staff...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

