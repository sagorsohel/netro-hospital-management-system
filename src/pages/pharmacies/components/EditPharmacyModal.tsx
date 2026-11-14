import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  useUpdatePharmacyMutation,
  type Pharmacy,
} from '../../../store/api/pharmacyApi';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface EditPharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  onSuccess?: () => void;
}

export const EditPharmacyModal: React.FC<EditPharmacyModalProps> = ({
  isOpen,
  onClose,
  pharmacy,
  onSuccess,
}) => {
  const [updatePharmacy, { isLoading }] = useUpdatePharmacyMutation();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (pharmacy) {
      setName(pharmacy.name || '');
      setAddress(pharmacy.address || '');
      setPhone(pharmacy.phone || '');
      setEmail(pharmacy.email || '');
      setLicenseNo(pharmacy.licenseNo || '');
      setErrorMessage(null);
    }
  }, [pharmacy]);

  if (!isOpen || !pharmacy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) return setErrorMessage('Pharmacy name is required.');
    if (!address.trim()) return setErrorMessage('Physical address is required.');
    if (!phone.trim()) return setErrorMessage('Pharmacy contact phone is required.');
    if (!licenseNo.trim()) return setErrorMessage('Drug license number is required.');

    try {
      await updatePharmacy({
        id: pharmacy.id,
        data: {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          licenseNo: licenseNo.trim(),
        },
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Failed to update pharmacy details. Please check the values and try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-dark flex items-center gap-2">
                Edit Pharmacy #{pharmacy.id}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {pharmacy.name}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Update outlet identity, contact numbers and drug license information.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
              Pharmacy Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9.5 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Drug License Number <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <FileBadge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="h-9.5 text-xs pl-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9.5 text-xs pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Email Address (Optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9.5 text-xs pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Address / Location <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9.5 text-xs pl-9"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-sm shadow-primary/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
