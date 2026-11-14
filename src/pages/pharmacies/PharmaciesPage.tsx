import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  Users,
  Eye,
  Edit2,
  KeyRound,
  Power,
  Lock,
  Building2,
  ShieldAlert,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  useGetPharmaciesQuery,
  useUpdatePharmacyStatusMutation,
  type Pharmacy,
} from '../../store/api/pharmacyApi';
import { CreatePharmacyModal } from './components/CreatePharmacyModal';
import { EditPharmacyModal } from './components/EditPharmacyModal';
import { PharmacyDetailsModal } from './components/PharmacyDetailsModal';
import { ResetOwnerPasswordModal } from './components/ResetOwnerPasswordModal';
import { Pagination } from '../../components/common/Pagination';

export const PharmaciesPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPharmacy, setEditPharmacy] = useState<Pharmacy | null>(null);
  const [detailsPharmacyId, setDetailsPharmacyId] = useState<number | null>(null);
  const [resetPasswordPharmacy, setResetPasswordPharmacy] = useState<{ id: number; name: string } | null>(null);

  // Status mutation
  const [updatePharmacyStatus, { isLoading: isUpdatingStatus }] = useUpdatePharmacyStatusMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Query API
  const { data: response, isLoading, isFetching } = useGetPharmaciesQuery({
    page,
    limit,
    search: search.trim() || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const pharmaciesList: Pharmacy[] = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Calculate quick metrics
  const totalOutlets = pagination.total || 0;
  const activeCount = pharmaciesList.filter((p) => p.isActive).length;
  const inactiveCount = pharmaciesList.filter((p) => !p.isActive).length;
  const totalStaffInView = pharmaciesList.reduce((acc, p) => acc + (p.userCount || 0), 0);

  const handleToggleStatus = async (pharmacy: Pharmacy) => {
    setActionError(null);
    setActionSuccess(null);
    const nextStatus = !pharmacy.isActive;
    const confirmMsg = nextStatus
      ? `Activate Pharmacy #${pharmacy.id} (${pharmacy.name})?`
      : `Deactivate Pharmacy #${pharmacy.id} (${pharmacy.name})? Staff from this branch will NOT be able to log in.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updatePharmacyStatus({ id: pharmacy.id, isActive: nextStatus }).unwrap();
      setActionSuccess(`Pharmacy #${pharmacy.id} is now ${nextStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err?.data?.message || 'Failed to update pharmacy status.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark flex items-center gap-2.5">
              <Store className="h-6 w-6 text-emerald-600" />
              <span>Pharmacy Outlets</span>
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {totalOutlets} Outlets Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage hospital retail pharmacy branches, drug licenses, owner provisioning & outlet statuses.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            type="button"
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Pharmacy</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Hospital Admin Only</span>
          </div>
        )}
      </div>

      {/* Action Notification banners */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outlets
            </div>
            <div className="text-xl font-black text-dark mt-0.5">{totalOutlets}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Assigned from #1001</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Active Branches
            </div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{activeCount}</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Operational & POS Live</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inactive Branches
            </div>
            <div className="text-xl font-black text-slate-600 mt-0.5">{inactiveCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Staff login suspended</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Branch Staff
            </div>
            <div className="text-xl font-black text-dark mt-0.5">{totalStaffInView}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across displayed outlets</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, license, phone or #ID..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-dark placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full md:w-auto overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Outlets' },
              { id: 'active', label: 'Active Only' },
              { id: 'inactive', label: 'Inactive Only' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-dark shadow-2xs'
                  : 'text-slate-500 hover:text-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table / List Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading || isFetching ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <div className="h-7 w-7 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
            <span>Loading registered pharmacies...</span>
          </div>
        ) : pharmaciesList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark">No pharmacies found</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {search ? 'Try clearing your search query.' : 'Register your first pharmacy outlet using the button above.'}
              </p>
            </div>
            {isAdmin && !search && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Register Pharmacy</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Pharmacy & License</th>
                  <th className="py-3.5 px-4">Contact & Address</th>
                  <th className="py-3.5 px-4 text-center">Staff Count</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmaciesList.map((pharmacy) => (
                  <tr
                    key={pharmacy.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-dark whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                        #{pharmacy.id}
                      </span>
                    </td>

                    {/* Pharmacy & License */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-dark text-xs">{pharmacy.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <FileBadge className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pharmacy.licenseNo}</span>
                      </div>
                    </td>

                    {/* Contact & Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 font-medium text-dark text-[11px]">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{pharmacy.phone}</span>
                        {pharmacy.email && (
                          <span className="text-slate-400 truncate text-[10px]">
                            • {pharmacy.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{pharmacy.address}</span>
                      </div>
                    </td>

                    {/* Staff Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{pharmacy.userCount ?? 0}</span>
                      </span>
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pharmacy)}
                        disabled={isUpdatingStatus}
                        title={`Click to ${pharmacy.isActive ? 'Deactivate' : 'Activate'}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          pharmacy.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            pharmacy.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{pharmacy.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setDetailsPharmacyId(pharmacy.id)}
                          title="View Details & Owners"
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/70 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Pharmacy */}
                        <button
                          type="button"
                          onClick={() => setEditPharmacy(pharmacy)}
                          title="Edit Details"
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 border border-slate-200/70 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Reset Owner Password */}
                        <button
                          type="button"
                          onClick={() =>
                            setResetPasswordPharmacy({ id: pharmacy.id, name: pharmacy.name })
                          }
                          title="Reset Owner Password"
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200/70 transition-colors cursor-pointer"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>

                        {/* Power Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pharmacy)}
                          title={pharmacy.isActive ? 'Deactivate Pharmacy' : 'Activate Pharmacy'}
                          className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
                            pharmacy.isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200/70'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200/70'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.total}
              itemsPerPage={limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePharmacyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => {
          setActionSuccess(`Pharmacy #${id} successfully created!`);
          setTimeout(() => setActionSuccess(null), 3500);
        }}
      />

      <EditPharmacyModal
        isOpen={!!editPharmacy}
        onClose={() => setEditPharmacy(null)}
        pharmacy={editPharmacy}
        onSuccess={() => {
          setActionSuccess('Pharmacy details updated successfully.');
          setTimeout(() => setActionSuccess(null), 3000);
        }}
      />

      <PharmacyDetailsModal
        isOpen={!!detailsPharmacyId}
        onClose={() => setDetailsPharmacyId(null)}
        pharmacyId={detailsPharmacyId}
        onEdit={(pharm) => setEditPharmacy(pharm)}
        onResetPassword={(pharm) => setResetPasswordPharmacy({ id: pharm.id, name: pharm.name })}
      />

      <ResetOwnerPasswordModal
        isOpen={!!resetPasswordPharmacy}
        onClose={() => setResetPasswordPharmacy(null)}
        pharmacy={resetPasswordPharmacy}
        onSuccess={() => {
          setActionSuccess('Owner password reset successfully.');
          setTimeout(() => setActionSuccess(null), 3000);
        }}
      />
    </div>
  );
};

export default PharmaciesPage;
