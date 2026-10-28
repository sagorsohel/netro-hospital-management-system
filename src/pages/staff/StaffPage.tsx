import React, { useState, useRef } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Award,
  Building2,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  BadgeCheck,
  UserCheck,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Layers,
  Upload,
  Camera,
  ExternalLink,
  Eye,
  Paperclip,
  Loader2,
} from 'lucide-react';
import {
  useGetStaffQuery,
  useGetStaffStatsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useGetDutyRostersQuery,
  useCreateDutyRosterMutation,
  useDeleteDutyRosterMutation,
  useGetPayrollsQuery,
  useCreatePayrollMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useUploadStaffFileMutation,
  type Staff,
  type StaffDocument,
  type DutyRoster,
  type Payroll,
  type LeaveRequest,
} from '../../store/api/staffApi';
import { useGetDepartmentsQuery } from '../../store/api/departmentApi';
import { useAppSelector } from '../../store/hooks';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

export const STAFF_DESIGNATIONS = [
  'Senior ICU Nurse',
  'Staff Nurse',
  'Head Nurse / Matron',
  'Lead OT Technician',
  'OT Assistant',
  'Senior Radiographer',
  'Medical Lab Technologist',
  'Ward Supervisor',
  'Ward Boy / Attendant',
  'Receptionist & Cashier',
  'Biomedical Engineer',
  'Security Supervisor',
  'Cleaning & Hygiene Staff',
];

export const SHIFT_OPTIONS = [
  'Morning (08:00 AM - 04:00 PM)',
  'Evening (04:00 PM - 12:00 AM)',
  'Night (12:00 AM - 08:00 AM)',
];

export const LEAVE_TYPES = [
  'Casual Leave',
  'Sick Leave',
  'Annual Leave',
  'Maternity Leave',
  'Emergency Leave',
];

export const StaffPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Active Tab: 'profiles' | 'rosters' | 'payrolls' | 'leaves'
  const [activeTab, setActiveTab] = useState<'profiles' | 'rosters' | 'payrolls' | 'leaves'>('profiles');

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().slice(0, 10));
  const [rosterShift, setRosterShift] = useState('all');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedStaffDocs, setSelectedStaffDocs] = useState<Staff | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // APIs
  const { data: deptData } = useGetDepartmentsQuery({ limit: 100 });
  const departmentsList = deptData?.data || [];

  const { data: statsData } = useGetStaffStatsQuery();
  const stats = statsData?.stats;

  // 1. Staff query
  const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffQuery({
    page,
    limit,
    search: search.trim() || undefined,
    department: deptFilter !== 'all' ? deptFilter : undefined,
    designation: designationFilter !== 'all' ? designationFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const staffList = staffResponse?.data || [];
  const pagination = staffResponse?.pagination || { total: 0, page: 1, limit: 8, totalPages: 1 };

  // 2. Rosters query
  const { data: rosterResponse, isLoading: isLoadingRosters } = useGetDutyRostersQuery({
    date: rosterDate || undefined,
    shift: rosterShift !== 'all' ? rosterShift : undefined,
    department: deptFilter !== 'all' ? deptFilter : undefined,
  });
  const rostersList = rosterResponse?.data || [];

  // 3. Payrolls query
  const { data: payrollResponse, isLoading: isLoadingPayrolls } = useGetPayrollsQuery();
  const payrollsList = payrollResponse?.data || [];

  // 4. Leaves query
  const { data: leaveResponse, isLoading: isLoadingLeaves } = useGetLeaveRequestsQuery();
  const leavesList = leaveResponse?.data || [];

  // Mutations
  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdatingStaff }] = useUpdateStaffMutation();
  const [deleteStaff, { isLoading: isDeletingStaff }] = useDeleteStaffMutation();
  const [createRoster, { isLoading: isCreatingRoster }] = useCreateDutyRosterMutation();
  const [deleteRoster] = useDeleteDutyRosterMutation();
  const [createPayroll, { isLoading: isCreatingPayroll }] = useCreatePayrollMutation();
  const [createLeave, { isLoading: isCreatingLeave }] = useCreateLeaveRequestMutation();
  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();
  const [uploadStaffFile] = useUploadStaffFileMutation();

  // Upload states & refs
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [uploadDocProgress, setUploadDocProgress] = useState('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Form states for modals
  const [staffForm, setStaffForm] = useState<{
    name: string;
    designation: string;
    department: string;
    phone: string;
    email: string;
    address: string;
    photo: string;
    documents: StaffDocument[];
    salary: string;
    bloodGroup: string;
    emergencyContact: string;
    qualification: string;
    status: 'Active' | 'On Leave' | 'Resigned';
  }>({
    name: '',
    designation: STAFF_DESIGNATIONS[0],
    department: '',
    phone: '',
    email: '',
    address: '',
    photo: '',
    documents: [],
    salary: '25000',
    bloodGroup: 'B+',
    emergencyContact: '',
    qualification: '',
    status: 'Active',
  });

  const [rosterForm, setRosterForm] = useState({
    staffId: '',
    staffName: '',
    staffRole: '',
    department: '',
    shift: SHIFT_OPTIONS[0],
    date: new Date().toISOString().slice(0, 10),
    wardOrRoom: 'ICU Ward',
    notes: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    staffId: '',
    staffName: '',
    month: 'October 2026',
    basicSalary: '25000',
    bonus: '0',
    deduction: '0',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid' as const,
    remarks: 'Regular monthly salary disbursement',
  });

  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    staffName: '',
    leaveType: LEAVE_TYPES[0],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    totalDays: 1,
    reason: '',
  });

  // Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Profile photo size must be less than 8MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file);
      formData.append('folder', 'netro-hospital/staff');
      const res = await uploadStaffFile(formData).unwrap();
      if (res.success && res.url) {
        setStaffForm((prev) => ({ ...prev, photo: res.url }));
      } else {
        throw new Error(res.message || 'Photo upload failed');
      }
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error uploading profile photo');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Multiple Documents upload
  const handleDocumentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingDocs(true);
    setUploadDocProgress(`Uploading ${files.length} document${files.length > 1 ? 's' : ''}...`);

    const uploadedDocs: StaffDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 15MB limit.`);
        continue;
      }

      try {
        setUploadDocProgress(`Uploading (${i + 1}/${files.length}): ${file.name}...`);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('image', file);
        formData.append('folder', 'netro-hospital/staff_documents');
        const res = await uploadStaffFile(formData).unwrap();
        if (res.success && res.url) {
          uploadedDocs.push({
            name: file.name,
            url: res.url,
            size: file.size,
            type: file.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        alert(`Failed to upload "${file.name}": ` + (err?.data?.message || err?.message || 'Server error'));
      }
    }

    if (uploadedDocs.length > 0) {
      setStaffForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...uploadedDocs],
      }));
    }

    setIsUploadingDocs(false);
    setUploadDocProgress('');
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleRemoveDoc = (index: number) => {
    setStaffForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, idx) => idx !== index),
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Open Edit Staff Modal
  const handleEditStaff = (member: Staff) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      designation: member.designation,
      department: member.department,
      phone: member.phone,
      email: member.email || '',
      address: member.address || '',
      photo: member.photo || '',
      documents: member.documents || [],
      salary: member.salary ? String(member.salary) : '25000',
      bloodGroup: member.bloodGroup || 'B+',
      emergencyContact: member.emergencyContact || '',
      qualification: member.qualification || '',
      status: member.status,
    });
    setIsStaffModalOpen(true);
  };

  // Submit Staff Form
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.department || !staffForm.phone) {
      alert('Please fill out Name, Department, and Phone.');
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff({ id: editingStaff.id, data: staffForm }).unwrap();
      } else {
        await createStaff(staffForm).unwrap();
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error saving staff member.');
    }
  };

  // Submit Roster Form
  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterForm.staffName || !rosterForm.department || !rosterForm.date) {
      alert('Please select Staff, Department, and Date.');
      return;
    }

    try {
      await createRoster(rosterForm).unwrap();
      setIsRosterModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error assigning shift.');
    }
  };

  // Submit Payroll Form
  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollForm.staffName || !payrollForm.month || !payrollForm.basicSalary) {
      alert('Please enter Staff Name, Month, and Basic Salary.');
      return;
    }

    try {
      await createPayroll(payrollForm).unwrap();
      setIsPayrollModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error recording payroll.');
    }
  };

  // Submit Leave Form
  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.staffName || !leaveForm.reason) {
      alert('Please select Staff and provide a reason for leave.');
      return;
    }

    try {
      await createLeave(leaveForm).unwrap();
      setIsLeaveModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error submitting leave.');
    }
  };

  // Delete Staff Confirm
  const handleConfirmDelete = async () => {
    if (!staffToDelete?.id) return;
    try {
      await deleteStaff(staffToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setStaffToDelete(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete staff member.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans pb-16">
      {/* 1. Page Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
                Staff & Human Resources
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-primary border border-emerald-200 text-xs font-bold">
                {stats?.totalStaff || 0} Employees
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Staff directory, duty shift rosters, salary payroll ledger & leave management.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  name: '',
                  designation: STAFF_DESIGNATIONS[0],
                  department: departmentsList[0]?.name || 'Cardiology & ICU',
                  phone: '',
                  email: '',
                  address: '',
                  photo: '',
                  documents: [],
                  salary: '25000',
                  bloodGroup: 'B+',
                  emergencyContact: '',
                  qualification: '',
                  status: 'Active',
                });
                setIsStaffModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRosterModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border-slate-200 text-slate-700 hover:text-dark text-xs font-semibold flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5 text-secondary" />
              <span>Assign Shift</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. Top HR KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Employees
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-dark font-mono">
              {stats?.totalStaff || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              Registered clinical & support staff
            </p>
          </div>
        </div>

        {/* On Duty Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-secondary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              On Duty Today
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-secondary flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-secondary font-mono">
              {stats?.onDutyToday || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              Active shifts scheduled for today
            </p>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-amber-600 font-mono">
              {stats?.pendingLeaves || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              Awaiting admin / supervisor review
            </p>
          </div>
        </div>

        {/* Monthly Payroll Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Payroll
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-purple-700 font-mono">
              ৳ {stats ? Number(stats.monthlyPayrollTotal).toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              Estimated monthly base salaries
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200/90 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'profiles'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Directory</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rosters')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'rosters'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Duty Rosters & Shifts</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {rostersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payrolls')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'payrolls'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Salary & Payroll</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {payrollsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'leaves'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Leave Requests</span>
          {stats?.pendingLeaves ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">
              {stats.pendingLeaves}
            </span>
          ) : null}
        </button>
      </div>

      {/* 4. TAB 1: STAFF DIRECTORY */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff by name, role, department, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 text-xs bg-slate-50 border-slate-200 text-dark"
              />
            </div>

            <div className="w-full md:w-52 shrink-0">
              <Select
                value={deptFilter}
                onValueChange={(val) => {
                  setDeptFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsList.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-44 shrink-0">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
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
                  <SelectItem value="Resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staff Cards Grid */}
          {isLoadingStaff ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
              <div className="h-7 w-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading staff directory...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary mx-auto flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-dark">No Staff Records Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or register a new staff member.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {person.photo ? (
                          <img
                            src={person.photo}
                            alt={person.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-dark group-hover:text-primary transition-colors">
                          {person.name}
                        </h4>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold mt-0.5">
                          {person.designation}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{person.department}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        person.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : person.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {person.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold text-dark">{person.phone}</span>
                    </div>
                    {person.qualification && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Qualification:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">
                          {person.qualification}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Salary:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        ৳{Number(person.salary || 0).toLocaleString()}
                      </span>
                    </div>
                    {person.bloodGroup && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200 text-[10px]">
                          {person.bloodGroup}
                        </span>
                      </div>
                    )}
                  </div>

                  {person.documents && person.documents.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffDocs(person)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-primary border border-emerald-200/80 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Paperclip className="h-3 w-3 text-primary" />
                        <span>{person.documents.length} Document{person.documents.length > 1 ? 's' : ''} Attached</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStaffDocs(person)}
                        className="text-[11px] text-slate-500 hover:text-primary flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStaff(person)}
                        className="text-xs h-8 gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStaffToDelete(person);
                          setIsDeleteOpen(true);
                        }}
                        className="text-xs h-8 text-accent hover:text-accent border-red-200 hover:bg-red-50 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: DUTY ROSTERS & SHIFT PLANNING */}
      {activeTab === 'rosters' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Roster Date</span>
                <Input
                  type="date"
                  value={rosterDate}
                  onChange={(e) => setRosterDate(e.target.value)}
                  className="h-10 text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-1 w-52">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shift Filter</span>
                <Select value={rosterShift} onValueChange={(val) => setRosterShift(val)}>
                  <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {SHIFT_OPTIONS.map((sh) => (
                      <SelectItem key={sh} value={sh}>
                        {sh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isAdmin && (
              <Button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Shift to Roster</span>
              </Button>
            )}
          </div>

          {/* Roster Cards / Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
            {isLoadingRosters ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading duty rosters...</div>
            ) : rostersList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-dark">No Shift Schedules Found</h4>
                <p className="text-xs text-slate-400">No staff scheduled for this selected date and shift.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Staff Name & Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assigned Shift</th>
                    <th className="py-3 px-4">Ward / Room</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Notes</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rostersList.map((roster) => (
                    <tr key={roster.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-dark block">{roster.staffName}</span>
                        <span className="text-[10px] text-slate-400">{roster.staffRole || 'Clinical Staff'}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{roster.department}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-secondary font-bold text-[10px] border border-blue-200">
                          {roster.shift}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{roster.wardOrRoom || 'General Ward'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            roster.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {roster.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{roster.notes || '—'}</td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteRoster(roster.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-accent cursor-pointer"
                            title="Delete Roster Shift"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 3: SALARY & PAYROLL MANAGEMENT */}
      {activeTab === 'payrolls' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-dark">Staff Salary & Payroll Ledger</h3>
              <p className="text-xs text-slate-400">Monthly remuneration records, allowances, and payment methods.</p>
            </div>

            {isAdmin && (
              <Button
                type="button"
                onClick={() => setIsPayrollModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Record Salary Payment</span>
              </Button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
            {isLoadingPayrolls ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading payroll history...</div>
            ) : payrollsList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <DollarSign className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-dark">No Payroll Records</h4>
                <p className="text-xs text-slate-400">Record employee salaries and bonus disbursements.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Pay Month</th>
                    <th className="py-3 px-4">Basic Salary</th>
                    <th className="py-3 px-4">Bonus / Allowances</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Paid Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payrollsList.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-dark">{pay.staffName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{pay.month}</td>
                      <td className="py-3 px-4 font-mono">৳{Number(pay.basicSalary).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">+৳{Number(pay.bonus || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-accent">-৳{Number(pay.deduction || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold font-mono text-dark text-sm">
                        ৳{Number(pay.netSalary).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{pay.paymentMethod || 'Bank Transfer'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {pay.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 7. TAB 4: LEAVE MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-dark">Staff Leave Applications & Approval</h3>
              <p className="text-xs text-slate-400">Casual, sick, annual leaves & supervisor authorization.</p>
            </div>

            <Button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Leave Request</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
            {isLoadingLeaves ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading leave requests...</div>
            ) : leavesList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-dark">No Leave Applications</h4>
                <p className="text-xs text-slate-400">All hospital staff are present or no leaves pending.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Approval Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leavesList.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-dark">{leave.staffName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-dark">{leave.totalDays} Days</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs">{leave.reason}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : leave.status === 'Rejected'
                              ? 'bg-red-50 text-accent border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {leave.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => updateLeaveStatus({ id: leave.id, status: 'Approved' })}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateLeaveStatus({ id: leave.id, status: 'Rejected' })}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-accent border border-red-200 text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STAFF */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark">
                  {editingStaff ? 'Edit Staff Profile' : 'Register New Hospital Staff'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Update employee biodata, profile photo, and credentials.
                </p>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 overflow-y-auto">
              {/* Profile Photo Uploader Section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="relative group shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
                    {staffForm.photo ? (
                      <img
                        src={staffForm.photo}
                        alt="Staff Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-9 w-9 text-slate-300" />
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                    title="Upload Profile Picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dark">Staff Profile Photo</span>
                    {staffForm.photo && (
                      <button
                        type="button"
                        onClick={() => setStaffForm((prev) => ({ ...prev, photo: '' }))}
                        className="text-[11px] text-accent hover:underline font-semibold cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload professional portrait picture (JPG, PNG, WebP up to 8MB).
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                      className="h-7 text-xs font-semibold px-2.5 gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3 w-3 text-primary" />
                      <span>{isUploadingPhoto ? 'Uploading...' : staffForm.photo ? 'Change Photo' : 'Upload Photo'}</span>
                    </Button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Farhana Yasmin"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Designation *</Label>
                  <Select
                    value={staffForm.designation}
                    onValueChange={(val) => setStaffForm({ ...staffForm, designation: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_DESIGNATIONS.map((desig) => (
                        <SelectItem key={desig} value={desig}>
                          {desig}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Department *</Label>
                  <Select
                    value={staffForm.department}
                    onValueChange={(val) => setStaffForm({ ...staffForm, department: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsList.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Contact Phone *</Label>
                  <Input
                    required
                    placeholder="+880 1711-XXXXXX"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="staff@hospital.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Monthly Salary</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={staffForm.salary}
                    onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Blood Group</Label>
                  <Input
                    placeholder="B+"
                    value={staffForm.bloodGroup}
                    onChange={(e) => setStaffForm({ ...staffForm, bloodGroup: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select
                    value={staffForm.status}
                    onValueChange={(val: any) => setStaffForm({ ...staffForm, status: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Education / Qualification</Label>
                <Input
                  placeholder="e.g. B.Sc in Nursing (Dhaka University)"
                  value={staffForm.qualification}
                  onChange={(e) => setStaffForm({ ...staffForm, qualification: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Residential Address</Label>
                <Input
                  placeholder="City, Area, Flat..."
                  value={staffForm.address}
                  onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                />
              </div>

              {/* Multiple Documents / Certificates Upload Section */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-dark flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      <span>Documents & Credentials (Certificates, NID, License, CV)</span>
                    </Label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload educational certificates, medical licenses, NID, or resume. Multiple files can be selected.
                    </p>
                  </div>
                  {staffForm.documents && staffForm.documents.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-primary border border-emerald-200 text-[11px] font-bold">
                      {staffForm.documents.length} File{staffForm.documents.length > 1 ? 's' : ''} Attached
                    </span>
                  )}
                </div>

                {/* Dropzone Upload Button */}
                <div
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-primary/60 hover:bg-emerald-50/20 rounded-xl p-4 text-center cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-100 group-hover:bg-primary/10 text-slate-400 group-hover:text-primary mx-auto flex items-center justify-center transition-colors">
                    {isUploadingDocs ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
                      {isUploadingDocs ? uploadDocProgress : 'Click to browse & upload multiple certificates / documents'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports PDF, JPG, PNG, DOC, DOCX up to 15MB each
                    </p>
                  </div>
                  <input
                    ref={docInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                    className="hidden"
                    onChange={handleDocumentsUpload}
                    disabled={isUploadingDocs}
                  />
                </div>

                {/* Attached Documents List */}
                {staffForm.documents && staffForm.documents.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {staffForm.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200/60 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-dark truncate max-w-xs">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2">
                              {doc.size ? <span>{formatFileSize(doc.size)}</span> : null}
                              <span>• Attached Credential</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3 text-slate-500" />
                            <span>View</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(idx)}
                            className="h-7 w-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-accent flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingStaff || isUpdatingStaff || isUploadingPhoto || isUploadingDocs}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer"
                >
                  {isCreatingStaff || isUpdatingStaff
                    ? 'Saving...'
                    : editingStaff
                    ? 'Update Profile'
                    : 'Save Staff'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN DUTY SHIFT */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">Assign Shift Schedule</h3>
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Staff Member *</Label>
                <Select
                  value={rosterForm.staffId}
                  onValueChange={(staffId) => {
                    const st = staffList.find((s) => s.id === staffId);
                    setRosterForm({
                      ...rosterForm,
                      staffId,
                      staffName: st?.name || '',
                      staffRole: st?.designation || '',
                      department: st?.department || '',
                    });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name} ({st.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Shift Timing *</Label>
                <Select
                  value={rosterForm.shift}
                  onValueChange={(val) => setRosterForm({ ...rosterForm, shift: val })}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map((sh) => (
                      <SelectItem key={sh} value={sh}>
                        {sh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Duty Date *</Label>
                  <Input
                    type="date"
                    value={rosterForm.date}
                    onChange={(e) => setRosterForm({ ...rosterForm, date: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Ward / Room</Label>
                  <Input
                    placeholder="e.g. ICU Bed 1-6"
                    value={rosterForm.wardOrRoom}
                    onChange={(e) => setRosterForm({ ...rosterForm, wardOrRoom: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Special Duty Instructions</Label>
                <Input
                  placeholder="e.g. Post-op patient monitoring"
                  value={rosterForm.notes}
                  onChange={(e) => setRosterForm({ ...rosterForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingRoster}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Confirm Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD PAYROLL DISBURSEMENT */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">Disburse Monthly Salary</h3>
              <button
                onClick={() => setIsPayrollModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayroll} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Staff Recipient *</Label>
                <Select
                  value={payrollForm.staffId}
                  onValueChange={(staffId) => {
                    const st = staffList.find((s) => s.id === staffId);
                    setPayrollForm({
                      ...payrollForm,
                      staffId,
                      staffName: st?.name || '',
                      basicSalary: st?.salary ? String(st.salary) : '25000',
                    });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name} ({st.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Salary Month *</Label>
                  <Input
                    placeholder="e.g. October 2026"
                    value={payrollForm.month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Basic Salary *</Label>
                  <Input
                    type="number"
                    value={payrollForm.basicSalary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, basicSalary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Bonus / Allowance</Label>
                  <Input
                    type="number"
                    value={payrollForm.bonus}
                    onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Deduction</Label>
                  <Input
                    type="number"
                    value={payrollForm.deduction}
                    onChange={(e) => setPayrollForm({ ...payrollForm, deduction: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Channel</Label>
                <Select
                  value={payrollForm.paymentMethod}
                  onValueChange={(val) => setPayrollForm({ ...payrollForm, paymentMethod: val })}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingPayroll}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBMIT LEAVE REQUEST */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">Submit Leave Application</h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeave} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Staff Member *</Label>
                <Select
                  value={leaveForm.staffId}
                  onValueChange={(staffId) => {
                    const st = staffList.find((s) => s.id === staffId);
                    setLeaveForm({
                      ...leaveForm,
                      staffId,
                      staffName: st?.name || '',
                    });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select staff applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name} ({st.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Leave Type *</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(val) => setLeaveForm({ ...leaveForm, leaveType: val })}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((lt) => (
                      <SelectItem key={lt} value={lt}>
                        {lt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Start Date *</Label>
                  <Input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">End Date *</Label>
                  <Input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Reason for Absence *</Label>
                <Input
                  required
                  placeholder="Clinical rest, family event, personal emergency..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingLeave}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Apply Leave
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW STAFF DOCUMENTS & CERTIFICATES */}
      {selectedStaffDocs && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedStaffDocs.photo ? (
                    <img
                      src={selectedStaffDocs.photo}
                      alt={selectedStaffDocs.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">{selectedStaffDocs.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedStaffDocs.designation} • {selectedStaffDocs.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDocs(null)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-dark flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Attached Credentials & Certificates ({selectedStaffDocs.documents?.length || 0})</span>
                </h4>
              </div>

              {(!selectedStaffDocs.documents || selectedStaffDocs.documents.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <Paperclip className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Attached Documents</p>
                  <p className="text-[11px] text-slate-400">No certificates or credentials uploaded yet for this staff member.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStaffDocs.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200/80 text-primary flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-dark truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-2">
                            {doc.size ? <span>{formatFileSize(doc.size)}</span> : null}
                            <span>• Verified Credential</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View Document</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedStaffDocs(null)}
                className="text-xs px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Staff Member"
        itemName={staffToDelete?.name}
        isLoading={isDeletingStaff}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setStaffToDelete(null);
        }}
      />
    </div>
  );
};

export default StaffPage;
