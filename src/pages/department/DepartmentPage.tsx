import React, { useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Scan,
  Ambulance,
  HeartHandshake,
  Stethoscope,
  Activity,
  Edit2,
  Trash2,
  MapPin,
  User,
  ShieldCheck,
  Lock,
  Layers,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
  type Department,
} from '../../store/api/departmentApi';
import { DepartmentModal } from './components/DepartmentModal';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';
import { Pagination } from '../../components/common/Pagination';

// Helper to render Lucide icon dynamically from string name
const renderDepartmentIcon = (iconName?: string) => {
  const iconProps = { className: 'h-5 w-5 text-primary stroke-[2]' };
  switch (iconName) {
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'Brain':
      return <Brain {...iconProps} />;
    case 'Baby':
      return <Baby {...iconProps} />;
    case 'Bone':
      return <Bone {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'Scan':
      return <Scan {...iconProps} />;
    case 'Ambulance':
      return <Ambulance {...iconProps} />;
    case 'HeartHandshake':
      return <HeartHandshake {...iconProps} />;
    case 'Stethoscope':
      return <Stethoscope {...iconProps} />;
    case 'Activity':
      return <Activity {...iconProps} />;
    default:
      return <Building2 {...iconProps} />;
  }
};

export const DepartmentPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Delete Confirmation Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  // API Hooks
  const { data, isLoading, isFetching, error } = useGetDepartmentsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

  const handleOpenCreate = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setDeptToDelete(dept);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete?.id) return;
    try {
      await deleteDepartment(deptToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setDeptToDelete(null);
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const departmentsList = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 8, totalPages: 1 };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header with Title & Role-Based Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-dark">
              Clinical Departments
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {pagination.total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Specialized medical institutes, diagnostic units, doctor rosters & facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* RBAC Notice / Add Department Button */}
          {isAdmin ? (
            <button
              onClick={handleOpenCreate}
              type="button"
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/25 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>View Only ({user?.role || 'Staff'})</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to page 1 on search
            }}
            placeholder="Search department name, head doctor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-xs sm:text-sm text-dark placeholder:text-slate-400 outline-hidden transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold w-full sm:w-auto justify-center">
          {(['all', 'Active', 'Inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                statusFilter === filter
                  ? 'bg-white text-dark shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Department Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse p-4 space-y-3"
            >
              <div className="h-32 bg-slate-100 rounded-2xl" />
              <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : departmentsList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-[#EAF8F0] text-primary flex items-center justify-center mx-auto">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-dark">No departments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? `No departments matching "${search}". Try adjusting your query.`
              : 'Start by creating clinical departments to organize hospital operations.'}
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Department</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {departmentsList.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-300 group"
            >
              {/* Top Row: Icon/Image + Status Badge (NO BANNER) */}
              <div className="flex items-start justify-between gap-3">
                {/* Department Icon or Image Badge */}
                <div className="h-13 w-13 rounded-2xl bg-[#EAF8F0] border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {dept.image ? (
                    <img
                      src={dept.image}
                      alt={dept.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    renderDepartmentIcon(dept.icon)
                  )}
                </div>

                {/* Status Pill Badge */}
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    dept.status === 'Active'
                      ? 'bg-emerald-50 text-primary border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="pt-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black tracking-tight text-dark group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || 'Specialized clinical care unit and diagnostic laboratories.'}
                  </p>
                </div>


                {/* Metadata Info Rows */}
                <div className="pt-2 border-t border-slate-100/80 space-y-2 text-[11px] text-slate-500">
                  {dept.headOfDepartment && (
                    <div className="flex items-center gap-2 truncate">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">
                        {dept.headOfDepartment}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>
                        {dept.floor || '1st Floor'} {dept.roomNumber ? `• Rm ${dept.roomNumber}` : ''}
                      </span>
                    </span>

                    {dept.doctorsCount ? (
                      <span className="font-bold text-dark bg-slate-50 px-2 py-0.5 rounded-md">
                        {dept.doctorsCount} Doctors
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Actions Footer: Admin gets Edit & Delete, Others get Info Badge */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary hover:bg-[#EAF8F0] border border-slate-200/80 hover:border-primary/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleOpenDelete(dept)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-accent hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center py-1 rounded-xl bg-slate-50 text-[11px] font-semibold text-slate-400">
                      Standard Viewing Mode
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Global 1 2 3 4 Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* 5. Create / Edit Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDept}
      />

      {/* 6. Global Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Department"
        itemName={deptToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeptToDelete(null);
        }}
      />
    </div>
  );
};

export default DepartmentPage;
