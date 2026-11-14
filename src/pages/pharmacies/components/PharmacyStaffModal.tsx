import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Clock,
  KeyRound,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';
import {
  useGetPharmacyUsersQuery,
  useUpdatePharmacyUserMutation,
  useResetPharmacyUserPasswordMutation,
  useDeletePharmacyUserMutation,
  type PharmacyUser,
  type PharmacyRole,
} from '../../../store/api/pharmacyApi';
import { AddPharmacyStaffModal } from './AddPharmacyStaffModal';

interface PharmacyStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: number | null;
  pharmacyName?: string;
}

const ROLE_COLORS: Record<PharmacyRole, { bg: string; text: string; border: string }> = {
  owner: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  manager: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  pharmacist: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cashier: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  staff: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const PharmacyStaffModal: React.FC<PharmacyStaffModalProps> = ({
  isOpen,
  onClose,
  pharmacyId,
  pharmacyName,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | PharmacyRole>('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Password reset inline state
  const [resettingUser, setResettingUser] = useState<PharmacyUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Editing user state
  const [editingUser, setEditingUser] = useState<PharmacyUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<PharmacyRole>('staff');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: response, isLoading, isFetching } = useGetPharmacyUsersQuery(
    {
      pharmacyId: pharmacyId!,
      search: search.trim() || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
    },
    { skip: !isOpen || !pharmacyId }
  );

  const [updateUser, { isLoading: isUpdating }] = useUpdatePharmacyUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPharmacyUserPasswordMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeletePharmacyUserMutation();

  if (!isOpen || !pharmacyId) return null;

  const usersList: PharmacyUser[] = response?.data || [];

  const handleToggleActive = async (user: PharmacyUser) => {
    try {
      await updateUser({
        pharmacyId,
        userId: user.id,
        data: { isActive: !user.isActive },
      }).unwrap();
      setNotification({
        type: 'success',
        message: `${user.name} is now ${!user.isActive ? 'Active' : 'Inactive'}.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to update user status.',
      });
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword.trim() || newPassword.length < 6) return;
    try {
      await resetPassword({
        pharmacyId,
        userId: resettingUser.id,
        newPassword: newPassword.trim(),
      }).unwrap();
      setNotification({
        type: 'success',
        message: `Password reset successfully for ${resettingUser.name}.`,
      });
      setResettingUser(null);
      setNewPassword('');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to reset password.',
      });
    }
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser({
        pharmacyId,
        userId: editingUser.id,
        data: {
          name: editName.trim(),
          phone: editPhone.trim(),
          role: editRole,
        },
      }).unwrap();
      setNotification({
        type: 'success',
        message: `Updated profile for ${editName}.`,
      });
      setEditingUser(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to update user profile.',
      });
    }
  };

  const handleDelete = async (user: PharmacyUser) => {
    if (!window.confirm(`Are you sure you want to remove ${user.name} from Pharmacy #${pharmacyId}?`)) {
      return;
    }
    try {
      await deleteUser({ pharmacyId, userId: user.id }).unwrap();
      setNotification({
        type: 'success',
        message: `${user.name} was removed from the pharmacy.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to remove user.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-dark">
                  Pharmacy Staff Directory
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Outlet #{pharmacyId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {pharmacyName ? `${pharmacyName} • ` : ''}Manage staff members, roles, permissions and passwords from Hospital Admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddStaffOpen(true)}
              type="button"
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff</span>
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-dark hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Search & Role Filters Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name or phone..."
              className="w-full h-8.5 pl-8.5 pr-3 rounded-xl bg-white border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'owner', label: 'Owners' },
                { id: 'manager', label: 'Managers' },
                { id: 'pharmacist', label: 'Pharmacists' },
                { id: 'cashier', label: 'Cashiers' },
                { id: 'staff', label: 'Staff' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-white text-dark shadow-2xs'
                    : 'text-slate-500 hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff List Body */}
        <div className="overflow-y-auto p-6 space-y-3 flex-1 text-xs">
          {isLoading || isFetching ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
              <span>Loading pharmacy staff...</span>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-dark">No staff members found</p>
              <p className="text-[11px] text-slate-400">
                Click "+ Add Staff" to provision a new staff account for this pharmacy.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {usersList.map((user) => {
                const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.staff;
                return (
                  <div
                    key={user.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2.5 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-500/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark text-xs">{user.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full border capitalize ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {user.role}
                          </span>
                          {!user.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-mono font-medium">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {user.phone}
                          </span>
                          {user.email && (
                            <span className="flex items-center gap-1 text-slate-400 truncate max-w-xs">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {user.email}
                            </span>
                          )}
                          {user.lastLoginAt ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-300" />
                              {new Date(user.lastLoginAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Never logged in</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        title={`Click to ${user.isActive ? 'Deactivate' : 'Activate'}`}
                        className={`h-8 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(user);
                          setEditName(user.name);
                          setEditPhone(user.phone);
                          setEditRole(user.role);
                        }}
                        title="Edit profile & role"
                        className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Reset password button */}
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(user);
                          setNewPassword('');
                        }}
                        title="Reset staff password"
                        className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-600 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete button (owner cannot be deleted if last) */}
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        title="Remove staff from pharmacy"
                        className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400">
            Total Staff: <span className="font-bold text-dark">{usersList.length}</span> members
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AddPharmacyStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        pharmacyId={pharmacyId}
        pharmacyName={pharmacyName}
        onSuccess={() => {
          setNotification({
            type: 'success',
            message: 'New staff member successfully added!',
          });
          setTimeout(() => setNotification(null), 3000);
        }}
      />

      {/* Reset Password Mini Dialog */}
      {resettingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-600" />
                <h3 className="font-black text-dark text-sm">Reset Password</h3>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Set a new login password for <span className="font-bold text-dark">{resettingUser.name}</span>.
            </p>
            <form onSubmit={handleConfirmResetPassword} className="space-y-3">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="h-8.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="h-8.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  {isResetting ? 'Saving...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Mini Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-primary" />
                <h3 className="font-black text-dark text-sm">Edit Staff Profile</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-xl border border-slate-200 text-xs mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600">Phone (Login ID)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-xl border border-slate-200 text-xs font-mono mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full h-8.5 px-2.5 rounded-xl border border-slate-200 text-xs mt-1 bg-white"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="cashier">Cashier</option>
                  <option value="staff">General Staff</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-8.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-8.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  {isUpdating ? 'Saving...' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
