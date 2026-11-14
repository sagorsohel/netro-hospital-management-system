import React from 'react';
import {
  X,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  Calendar,
  Users,
  ShieldCheck,
  KeyRound,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { useGetPharmacyByIdQuery } from '../../../store/api/pharmacyApi';

interface PharmacyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: number | null;
  onEdit?: (pharmacy: any) => void;
  onResetPassword?: (pharmacy: any) => void;
}

export const PharmacyDetailsModal: React.FC<PharmacyDetailsModalProps> = ({
  isOpen,
  onClose,
  pharmacyId,
  onEdit,
  onResetPassword,
}) => {
  const { data: response, isLoading } = useGetPharmacyByIdQuery(pharmacyId!, {
    skip: !isOpen || !pharmacyId,
  });

  if (!isOpen || !pharmacyId) return null;

  const pharmacy = response?.data;
  const owners = pharmacy?.owners || [];
  const staffByRole = pharmacy?.staffByRole || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-dark">
                  {pharmacy?.name || `Pharmacy #${pharmacyId}`}
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  #{pharmacyId}
                </span>
                {pharmacy && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      pharmacy.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {pharmacy.isActive ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {pharmacy.isActive ? 'Active Outlet' : 'Deactivated'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Detailed outlet identity, owner accounts, and staff role allocations.
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

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-7 w-7 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
              <span>Loading pharmacy profile...</span>
            </div>
          ) : !pharmacy ? (
            <div className="py-8 text-center text-slate-500">Pharmacy details not found.</div>
          ) : (
            <>
              {/* Outlet Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileBadge className="h-3.5 w-3.5 text-slate-500" />
                    Drug License Number
                  </div>
                  <div className="text-xs font-mono font-bold text-dark">{pharmacy.licenseNo}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    Contact Phone
                  </div>
                  <div className="text-xs font-bold text-dark">{pharmacy.phone}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    Email
                  </div>
                  <div className="text-xs font-medium text-dark">
                    {pharmacy.email || 'No email specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Registered On
                  </div>
                  <div className="text-xs font-medium text-dark">
                    {new Date(pharmacy.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    Physical Location / Address
                  </div>
                  <div className="text-xs font-medium text-dark">{pharmacy.address}</div>
                </div>
              </div>

              {/* Staff by Role Counts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                    Staff Distribution By Role
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    Total: {Object.values(staffByRole).reduce((a, b) => a + b, 0)} Members
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['owner', 'manager', 'pharmacist', 'cashier', 'staff'] as const).map((r) => {
                    const count = staffByRole[r] || 0;
                    return (
                      <div
                        key={r}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center"
                      >
                        <div className="text-lg font-black text-dark">{count}</div>
                        <div className="text-[10px] font-bold text-slate-500 capitalize">{r}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pharmacy Owners Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Registered Owner Accounts ({owners.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Can manage branch staff</span>
                </div>

                {owners.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No active owner account assigned. Use the reset password or admin tool to provision an owner.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {owners.map((owner) => (
                      <div
                        key={owner.id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-500/20">
                            {owner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-dark text-xs">{owner.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                                Owner
                              </span>
                              {!owner.isActive && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {owner.phone}
                              </span>
                              {owner.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {owner.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {owner.lastLoginAt ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Login: {new Date(owner.lastLoginAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Never logged in</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onResetPassword?.(pharmacy);
                            }}
                            className="h-8 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                            <span>Reset Password</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Outlet Code: <span className="font-mono font-bold text-dark">#{pharmacyId}</span>
          </div>

          <div className="flex items-center gap-2">
            {pharmacy && (
              <button
                type="button"
                onClick={() => {
                  onEdit?.(pharmacy);
                  onClose();
                }}
                className="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Edit Details</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

