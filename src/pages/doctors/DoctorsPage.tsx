import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Plus,
  Search,
  Building2,
  Clock,
  DollarSign,
  Phone,
  DoorOpen,
  Edit2,
  Trash2,
  Users,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  useGetDoctorsQuery,
  useDeleteDoctorMutation,
  type Doctor,
} from '../../store/api/doctorApi';
import { useGetDepartmentsQuery } from '../../store/api/departmentApi';
import { useAppSelector } from '../../store/hooks';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';
import { Pagination } from '../../components/common/Pagination';

export const DoctorsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'On Leave'>('all');

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // APIs
  const { data: deptData } = useGetDepartmentsQuery({ limit: 100 });
  const { data: doctorResponse, isLoading, isFetching } = useGetDoctorsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    departmentId: departmentId !== 'all' ? departmentId : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  const departmentsList = deptData?.data || [];
  const doctorsList = doctorResponse?.data || [];
  const pagination = doctorResponse?.pagination || {
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
  };

  const handleDeleteClick = (doc: Doctor) => {
    setDoctorToDelete(doc);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete?.id) return;
    try {
      await deleteDoctor(doctorToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setDoctorToDelete(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete doctor.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
              Doctors & Clinical Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              {pagination.total} Active Specialists
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time consultation schedules, consultation fees, chamber room numbers, and patient token limits.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/doctors/new"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Doctor</span>
          </Link>
        )}
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search doctor by name, specialty, room, contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-primary text-dark"
          />
        </div>

        {/* Filter by Department */}
        <div className="w-full md:w-56 shrink-0">
          <Select
            value={departmentId}
            onValueChange={(val) => {
              setDepartmentId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentsList.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter by Status */}
        <div className="w-full md:w-40 shrink-0">
          <Select
            value={statusFilter}
            onValueChange={(val: any) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Doctors List Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading specialist doctors...</p>
        </div>
      ) : doctorsList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-primary mx-auto flex items-center justify-center">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-dark">No Doctors Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || departmentId !== 'all'
              ? 'No specialist matches your search criteria. Try clearing search filters.'
              : 'Start by registering your hospital doctors and specialists.'}
          </p>
          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/doctors/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Register First Doctor</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doctorsList.map((doc) => {
            const daysList = Array.isArray(doc.availableDays)
              ? doc.availableDays
              : [];

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Top Profile Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Doctor Avatar */}
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {doc.image ? (
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Stethoscope className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-dark group-hover:text-primary transition-colors">
                          {doc.name}
                        </h3>
                        {doc.isHead && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Head of Dept
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {doc.specialty || 'Medical Specialist'}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          {doc.department}
                        </span>
                        {doc.experience && (
                          <span className="text-slate-500">• {doc.experience}</span>
                        )}
                        {doc.roomNumber && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <DoorOpen className="h-3 w-3 text-slate-400" />
                            {doc.roomNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      doc.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'On Leave'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Mid Details: Timings, Fees, Contacts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  {/* Fees */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Visit Fees
                    </span>
                    <span className="font-bold text-dark text-xs flex items-center gap-1 mt-0.5">
                      <span className="text-emerald-700 font-mono">1st: ৳{doc.firstVisitFee || '1000'}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600 font-mono">2nd: ৳{doc.secondVisitFee || '500'}</span>
                    </span>
                  </div>

                  {/* Patient Limit */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Daily Capacity
                    </span>
                    <span className="font-bold text-dark text-xs flex items-center gap-1 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-secondary" />
                      <span>{doc.dailyPatientLimit || 30} Patients/Day</span>
                    </span>
                  </div>

                  {/* Timings */}
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Consultation Hours
                    </span>
                    <span className="font-semibold text-dark text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {doc.consultationStartTime || '05:00 PM'} - {doc.consultationEndTime || '09:00 PM'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Schedule Days & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Sitting Days & Off Day */}
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Sitting:</span>
                      {daysList.slice(0, 4).map((d) => (
                        <span
                          key={d}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {d.slice(0, 3)}
                        </span>
                      ))}
                      {daysList.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{daysList.length - 4} more
                        </span>
                      )}
                      {doc.offDays && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          Off: {doc.offDays}
                        </span>
                      )}
                    </div>

                    {/* Serial Contact Phone */}
                    {doc.serialContactNumber && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" />
                        <span className="font-semibold text-slate-700">Serial Hotline:</span>{' '}
                        {doc.serialContactNumber}
                      </p>
                    )}
                  </div>

                  {/* Admin Actions: Edit & Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Link
                        to={`/doctors/edit/${doc.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/40 bg-white hover:bg-emerald-50 text-slate-700 hover:text-primary text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteClick(doc)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 text-slate-700 hover:text-accent text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Delete Doctor Profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Global Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Doctor Record"
        itemName={doctorToDelete ? `Dr. ${doctorToDelete.name}` : undefined}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDoctorToDelete(null);
        }}
      />
    </div>
  );
};

export default DoctorsPage;
