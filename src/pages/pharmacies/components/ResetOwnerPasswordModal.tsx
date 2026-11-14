import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useResetOwnerPasswordMutation } from '../../../store/api/pharmacyApi';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface ResetOwnerPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export const ResetOwnerPasswordModal: React.FC<ResetOwnerPasswordModalProps> = ({
  isOpen,
  onClose,
  pharmacy,
  onSuccess,
}) => {
  const [resetOwnerPassword, { isLoading }] = useResetOwnerPasswordMutation();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !pharmacy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword.trim() || newPassword.length < 6) {
      return setErrorMessage('New password must be at least 6 characters long.');
    }

    try {
      const response = await resetOwnerPassword({
        id: pharmacy.id,
        data: { newPassword: newPassword.trim() },
      }).unwrap();

      setSuccessMessage(response.message || 'Owner password successfully updated!');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1400);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Failed to reset owner password. Please verify the pharmacy has an active owner.';
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-dark">Reset Owner Password</h2>
              <p className="text-xs text-slate-500">
                Pharmacy #{pharmacy.id} • {pharmacy.name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-600">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              This immediately changes the password for the pharmacy's primary owner account. The owner must use this new password along with their phone number to log in.
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-bold text-slate-700">
              New Password <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter minimum 6 characters"
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
              disabled={isLoading || !!successMessage}
              className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm shadow-amber-600/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
