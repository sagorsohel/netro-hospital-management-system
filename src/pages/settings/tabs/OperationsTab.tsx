import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Activity,
  RefreshCw,
  Clock,
  User,
  Building,
  Percent,
  X,
  Stethoscope,
} from 'lucide-react';
import {
  useGetOperationsQuery,
  useCreateOperationMutation,
  useUpdateOperationMutation,
  useDeleteOperationMutation,
  type SurgicalOperation,
} from '../../../store/api/operationApi';
import { useGetDoctorsQuery } from '../../../store/api/doctorApi';
import { useGetRoomsQuery } from '../../../store/api/roomApi';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Pagination } from '../../../components/common/Pagination';
import { DeleteConfirmModal } from '../../../components/common/DeleteConfirmModal';

const OPERATION_CATEGORIES = [
  'General Surgery',
  'Orthopedic Surgery',
  'Gynecology & Obstetrics',
  'Cardiology & Vascular',
  'Ophthalmology',
  'ENT Surgery',
  'Urology & Nephrology',
  'Neurosurgery',
  'Pediatric Surgery',
  'Dental & Maxillofacial',
  'Plastic & Reconstructive',
];

const ANESTHESIA_TYPES = [
  'General Anesthesia',
  'Spinal Anesthesia',
  'Epidural Anesthesia',
  'Local Anesthesia',
  'Sedation / Twilight',
  'Topical / None',
];

const DURATION_PRESETS = [
  '30 mins',
  '45 mins',
  '60 mins (1 hr)',
  '90 mins (1.5 hrs)',
  '120 mins (2 hrs)',
  '180 mins (3 hrs)',
  '240 mins (4 hrs)',
];

interface OperationFormData {
  name: string;
  category: string;
  price: string | number;
  canDiscount: boolean;
  maxDiscountPercent: string | number;
  doctorId: string;
  doctorName: string;
  roomNumber: string;
  duration: string;
  anesthesiaType: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const initialFormData: OperationFormData = {
  name: '',
  category: 'General Surgery',
  price: '',
  canDiscount: true,
  maxDiscountPercent: 10,
  doctorId: '',
  doctorName: '',
  roomNumber: 'OT-01',
  duration: '60 mins (1 hr)',
  anesthesiaType: 'General Anesthesia',
  description: '',
  status: 'Active',
};

export const OperationsTab: React.FC = () => {
  // Query parameters state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'discountable' | 'fixed'>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingOperation, setViewingOperation] = useState<SurgicalOperation | null>(null);
  const [editingOperation, setEditingOperation] = useState<SurgicalOperation | null>(null);
  const [formData, setFormData] = useState<OperationFormData>(initialFormData);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  // Fetch operations from API
  const { data: operationsResponse, isLoading, isFetching, refetch } = useGetOperationsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Fetch doctors directory for lead surgeon selector
  const { data: doctorsResponse } = useGetDoctorsQuery({ limit: 100 });
  const doctorsList = doctorsResponse?.data || [];

  // Fetch rooms directory for OT selector
  const { data: roomsResponse } = useGetRoomsQuery({ limit: 100 });
  const roomsList = roomsResponse?.data || [];

  // Mutations
  const [createOperation, { isLoading: isCreating }] = useCreateOperationMutation();
  const [updateOperation, { isLoading: isUpdating }] = useUpdateOperationMutation();
  const [deleteOperation, { isLoading: isDeleting }] = useDeleteOperationMutation();

  const operations = operationsResponse?.data || [];
  const pagination = operationsResponse?.pagination;

  // Filter client-side for discountFilter if selected
  const filteredOperations = operations.filter((op) => {
    if (discountFilter === 'discountable') return op.canDiscount;
    if (discountFilter === 'fixed') return !op.canDiscount;
    return true;
  });

  // KPI Calculations
  const totalCount = pagination?.total ?? operations.length;
  const activeCount = operations.filter((op) => op.status === 'Active').length;
  const discountableCount = operations.filter((op) => op.canDiscount).length;

  const handleOpenAddModal = () => {
    setEditingOperation(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (op: SurgicalOperation) => {
    setEditingOperation(op);
    setFormData({
      name: op.name,
      category: op.category,
      price: op.price,
      canDiscount: op.canDiscount,
      maxDiscountPercent: op.maxDiscountPercent ?? 10,
      doctorId: op.doctorId || '',
      doctorName: op.doctorName || '',
      roomNumber: op.roomNumber || '',
      duration: op.duration || '60 mins',
      anesthesiaType: op.anesthesiaType || 'General Anesthesia',
      description: op.description || '',
      status: op.status,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (op: SurgicalOperation) => {
    setViewingOperation(op);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (op: SurgicalOperation) => {
    setDeleteTargetId(op.id);
    setDeleteTargetName(op.name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteOperation(deleteTargetId).unwrap();
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete operation');
    }
  };

  const handleDoctorChange = (docId: string) => {
    if (!docId || docId === 'none') {
      setFormData((prev) => ({ ...prev, doctorId: '', doctorName: '' }));
      return;
    }
    const foundDoc = doctorsList.find((d) => d.id === docId);
    setFormData((prev) => ({
      ...prev,
      doctorId: docId,
      doctorName: foundDoc ? foundDoc.name : '',
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Operation Name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Please enter a valid operation price.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        canDiscount: formData.canDiscount,
        maxDiscountPercent: formData.canDiscount ? Number(formData.maxDiscountPercent) || 0 : 0,
        doctorId: formData.doctorId || null,
        doctorName: formData.doctorName || null,
        roomNumber: formData.roomNumber.trim() || null,
        duration: formData.duration.trim() || '60 mins',
        anesthesiaType: formData.anesthesiaType,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      if (editingOperation) {
        await updateOperation({ id: editingOperation.id, data: payload }).unwrap();
      } else {
        await createOperation(payload).unwrap();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save operation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Operations</p>
            <h3 className="text-xl font-black text-dark">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Procedures</p>
            <h3 className="text-xl font-black text-emerald-600">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Discountable</p>
            <h3 className="text-xl font-black text-purple-600">{discountableCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Surgeons Linked</p>
            <h3 className="text-xl font-black text-blue-600">{doctorsList.length}</h3>
          </div>
        </div>
      </div>

      {/* 2. Filter & Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by operation name, surgeon, room..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-dark placeholder:text-slate-400 transition-all outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Specialty Filter */}
          <div className="w-44 shrink-0">
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {OPERATION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount Filter */}
          <div className="w-40 shrink-0">
            <Select
              value={discountFilter}
              onValueChange={(val: any) => setDiscountFilter(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Discount Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="discountable">Discountable Only</SelectItem>
                <SelectItem value="fixed">Fixed Price Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-36 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active Procedures</SelectItem>
                <SelectItem value="Inactive">Inactive Procedures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-dark hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          </button>

          <Button
            type="button"
            onClick={handleOpenAddModal}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Operation</span>
          </Button>
        </div>
      </div>

      {/* 3. Operations Table View */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="inline-block animate-spin text-primary">
            <RefreshCw className="h-8 w-8" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Loading surgical operations catalog...</p>
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Scissors className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-dark">No surgical operations found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or click &quot;Add Operation&quot; to configure a new procedure.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-primary text-white uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-white font-bold">Operation & Category</th>
                  <th className="py-3.5 px-4 text-white font-bold">Assigned Surgeon</th>
                  <th className="py-3.5 px-4 text-white font-bold">OT / Room</th>
                  <th className="py-3.5 px-4 text-white font-bold">Duration & Anesthesia</th>
                  <th className="py-3.5 px-4 text-white font-bold">Price & Discount</th>
                  <th className="py-3.5 px-4 text-center text-white font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOperations.map((op, idx) => {
                  const priceNum = Number(op.price) || 0;
                  const discountPct = Number(op.maxDiscountPercent) || 0;
                  const minDiscountPrice = op.canDiscount ? Math.round(priceNum * (1 - discountPct / 100)) : priceNum;

                  return (
                    <tr
                      key={op.id}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'
                      } hover:bg-emerald-50/60 transition-colors group`}
                    >
                      {/* Operation & Category */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-dark group-hover:text-primary transition-colors block text-sm">
                            {op.name}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {op.category}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Surgeon */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-dark text-xs block">
                              {op.doctorName ? `Dr. ${op.doctorName}` : 'Any Qualified Specialist'}
                            </span>
                            <span className="text-[11px] text-slate-400">Lead Surgeon</span>
                          </div>
                        </div>
                      </td>

                      {/* OT / Room */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{op.roomNumber || 'OT Assigned'}</span>
                        </div>
                      </td>

                      {/* Duration & Anesthesia */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{op.duration || '60 mins'}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {op.anesthesiaType}
                          </span>
                        </div>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-sm font-black text-dark font-mono block">
                            ৳ {priceNum.toLocaleString()}
                          </span>
                          {op.canDiscount ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                              <Percent className="h-2.5 w-2.5" />
                              Up to {op.maxDiscountPercent}% off (min ৳{minDiscountPrice.toLocaleString()})
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Fixed Price</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            op.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              op.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {op.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(op)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Procedure Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(op)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-secondary hover:bg-secondary/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Operation"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(op)}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Operation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-xs">
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* 5. ADD / EDIT OPERATION MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark">
                    {editingOperation ? 'Edit Surgical Operation' : 'Add New Surgical Operation'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure OT procedure pricing, assigned specialist, room and duration.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-dark hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Operation Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Laparoscopic Cholecystectomy"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Specialty / Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Price and Discount Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Procedure Price (৳) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="৳ 25,000"
                    className="h-10 rounded-xl font-mono font-bold bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Discount Permitted?</label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.canDiscount}
                        onChange={(e) => setFormData({ ...formData, canDiscount: e.target.checked })}
                        className="h-4 w-4 rounded-sm text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="font-bold text-xs text-slate-700">
                        {formData.canDiscount ? 'Yes (Can Discount)' : 'No (Fixed Fee)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Max Discount (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!formData.canDiscount}
                    value={formData.maxDiscountPercent}
                    onChange={(e) => setFormData({ ...formData, maxDiscountPercent: e.target.value })}
                    placeholder="10"
                    className={`h-10 rounded-xl font-mono font-bold bg-white ${
                      !formData.canDiscount ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {formData.canDiscount && Number(formData.price) > 0 && (
                  <div className="sm:col-span-3 text-[11px] font-semibold text-purple-700 flex items-center justify-between pt-1 border-t border-purple-200/60">
                    <span>
                      Max Discount: ৳{' '}
                      {Math.round(
                        (Number(formData.price) * (Number(formData.maxDiscountPercent) || 0)) / 100
                      ).toLocaleString()}{' '}
                      ({formData.maxDiscountPercent}%)
                    </span>
                    <span>
                      Minimum Floor Price: ৳{' '}
                      {Math.round(
                        Number(formData.price) * (1 - (Number(formData.maxDiscountPercent) || 0) / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Row 3: Assigned Doctor and Room Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Primary Surgeon / Doctor</label>
                  <Select
                    value={formData.doctorId || 'none'}
                    onValueChange={(val) => handleDoctorChange(val)}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Qualified Surgeon (On-Call)</SelectItem>
                      {doctorsList.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          Dr. {doc.name} - {doc.department || 'Specialist'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Operation Theatre / Room Number</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g. OT-01, Minor OT"
                      className="h-10 rounded-xl flex-1"
                    />
                    <div className="w-36 shrink-0">
                      <Select
                        value={formData.roomNumber || undefined}
                        onValueChange={(val) => setFormData({ ...formData, roomNumber: val })}
                      >
                        <SelectTrigger className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Presets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OT-01 (General)">OT-01 (General)</SelectItem>
                          <SelectItem value="OT-02 (Cardiac)">OT-02 (Cardiac)</SelectItem>
                          <SelectItem value="OT-03 (Neuro)">OT-03 (Neuro)</SelectItem>
                          <SelectItem value="Minor OT-1">Minor OT-1</SelectItem>
                          {roomsList.slice(0, 5).map((r) => (
                            <SelectItem key={r.id} value={`Room ${r.roomNumber}`}>
                              Room {r.roomNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Duration and Anesthesia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Estimated Duration</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 90 mins"
                      className="h-10 rounded-xl flex-1"
                    />
                    <div className="w-36 shrink-0">
                      <Select
                        value={formData.duration || undefined}
                        onValueChange={(val) => setFormData({ ...formData, duration: val })}
                      >
                        <SelectTrigger className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Presets" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_PRESETS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Anesthesia Protocol</label>
                  <Select
                    value={formData.anesthesiaType}
                    onValueChange={(val) => setFormData({ ...formData, anesthesiaType: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Anesthesia" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANESTHESIA_TYPES.map((anes) => (
                        <SelectItem key={anes} value={anes}>
                          {anes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Description / Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Procedure Notes & Pre-Op Instructions</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical preparation, required fasting hours, included OT consumables..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Row 6: Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-bold text-slate-700">Procedure Status</span>
                  <p className="text-[11px] text-slate-500">
                    Inactive procedures will not show in billing or surgical scheduling.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      formData.status === 'Active'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      formData.status === 'Inactive'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                  className="h-10 rounded-xl px-4 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="h-10 rounded-xl px-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer"
                >
                  {isCreating || isUpdating
                    ? 'Saving...'
                    : editingOperation
                    ? 'Update Operation'
                    : 'Save Operation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DETAILS VIEW MODAL (Eye Icon) */}
      {isDetailsModalOpen && viewingOperation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Scissors className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-dark">{viewingOperation.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        viewingOperation.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {viewingOperation.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{viewingOperation.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-dark hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Financial Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-slate-50 border border-primary/10 space-y-3">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Financial & Discount Terms
                </span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Base Procedure Price</span>
                    <span className="text-xl font-black text-dark font-mono">
                      ৳ {Number(viewingOperation.price).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Discount Status</span>
                    {viewingOperation.canDiscount ? (
                      <div>
                        <span className="text-sm font-bold text-purple-700">
                          Up to {viewingOperation.maxDiscountPercent}%
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Floor price: ৳{' '}
                          {Math.round(
                            Number(viewingOperation.price) *
                              (1 - (Number(viewingOperation.maxDiscountPercent) || 0) / 100)
                          ).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-600">Fixed (No Discount)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clinical Setup Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold">Assigned Specialist</span>
                  </div>
                  <p className="font-bold text-dark text-xs">
                    {viewingOperation.doctorName ? `Dr. ${viewingOperation.doctorName}` : 'Any Available Surgeon'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-semibold">OT / Surgical Room</span>
                  </div>
                  <p className="font-bold text-dark text-xs">
                    {viewingOperation.roomNumber || 'Assigned on Scheduling'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-semibold">Estimated Duration</span>
                  </div>
                  <p className="font-bold text-dark text-xs">{viewingOperation.duration || '60 mins'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold">Anesthesia Protocol</span>
                  </div>
                  <p className="font-bold text-dark text-xs">{viewingOperation.anesthesiaType}</p>
                </div>
              </div>

              {/* Description & Clinical Notes */}
              {viewingOperation.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Clinical Notes</span>
                  <p className="text-slate-700 leading-relaxed">{viewingOperation.description}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="h-9 px-5 rounded-xl bg-dark text-white text-xs font-bold cursor-pointer"
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Operation?"
        message={`Are you sure you want to permanently remove "${deleteTargetName}" from the surgical catalog? This will affect upcoming operation scheduling.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OperationsTab;
