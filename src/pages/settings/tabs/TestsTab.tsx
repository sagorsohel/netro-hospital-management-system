import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Activity,
  RefreshCw,
  Clock,
  Building,
  Percent,
  X,
  Microscope,
} from 'lucide-react';
import {
  useGetTestsQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  type DiagnosticTest,
} from '../../../store/api/testApi';
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

const TEST_CATEGORIES = [
  'Hematology',
  'Biochemistry',
  'Radiology & Imaging',
  'Pathology & Histology',
  'Microbiology & Serology',
  'Immunology',
  'Cardiology Diagnostics',
  'Endocrinology / Hormones',
  'Urine & Stool Analysis',
];

const SAMPLE_TYPES = [
  'Blood (Serum / Plasma)',
  'Blood (Whole Blood)',
  'Urine Sample',
  'Stool Sample',
  'Sputum',
  'Tissue / Biopsy',
  'Swab / Culture',
  'None (Imaging / Scan)',
];

const DELIVERY_TIMES = [
  '1 Hour (STAT / Urgent)',
  '2 - 4 Hours (Same Day)',
  'Same Day (Evening)',
  '24 Hours (Next Day)',
  '48 Hours',
  '3 - 5 Days (Culture/Biopsy)',
];

interface TestFormData {
  name: string;
  code: string;
  category: string;
  price: string | number;
  isDiscountable: boolean;
  discountPercent: string | number;
  roomNumber: string;
  sampleType: string;
  deliveryTime: string;
  normalRange: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const initialFormData: TestFormData = {
  name: '',
  code: '',
  category: 'Biochemistry',
  price: '',
  isDiscountable: true,
  discountPercent: 10,
  roomNumber: '',
  sampleType: 'Blood (Serum / Plasma)',
  deliveryTime: 'Same Day (Evening)',
  normalRange: '',
  description: '',
  status: 'Active',
};

export const TestsTab: React.FC = () => {
  // Query state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'discountable' | 'fixed'>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingTest, setViewingTest] = useState<DiagnosticTest | null>(null);
  const [editingTest, setEditingTest] = useState<DiagnosticTest | null>(null);
  const [formData, setFormData] = useState<TestFormData>(initialFormData);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  // Fetch tests query
  const { data: testsResponse, isLoading, isFetching, refetch } = useGetTestsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Rooms query for optional room suggestions
  const { data: roomsResponse } = useGetRoomsQuery({ limit: 100 });
  const roomsList = roomsResponse?.data || [];

  // Mutations
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();

  const tests = testsResponse?.data || [];
  const pagination = testsResponse?.pagination;

  // Filter client-side for discountFilter
  const filteredTests = tests.filter((t) => {
    if (discountFilter === 'discountable') return t.isDiscountable;
    if (discountFilter === 'fixed') return !t.isDiscountable;
    return true;
  });

  // KPI Calculations
  const totalCount = pagination?.total ?? tests.length;
  const activeCount = tests.filter((t) => t.status === 'Active').length;
  const discountableCount = tests.filter((t) => t.isDiscountable).length;

  const handleOpenAddModal = () => {
    setEditingTest(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (t: DiagnosticTest) => {
    setEditingTest(t);
    setFormData({
      name: t.name,
      code: t.code || '',
      category: t.category,
      price: t.price,
      isDiscountable: t.isDiscountable,
      discountPercent: t.discountPercent ?? 10,
      roomNumber: t.roomNumber || '',
      sampleType: t.sampleType || 'Blood (Serum / Plasma)',
      deliveryTime: t.deliveryTime || 'Same Day (Evening)',
      normalRange: t.normalRange || '',
      description: t.description || '',
      status: t.status,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (t: DiagnosticTest) => {
    setViewingTest(t);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (t: DiagnosticTest) => {
    setDeleteTargetId(t.id);
    setDeleteTargetName(t.name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteTest(deleteTargetId).unwrap();
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete diagnostic test.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Test Name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Please enter a valid price for the test.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        category: formData.category,
        price: Number(formData.price),
        isDiscountable: formData.isDiscountable,
        discountPercent: formData.isDiscountable ? Number(formData.discountPercent) || 0 : 0,
        roomNumber: formData.roomNumber.trim() || null,
        sampleType: formData.sampleType.trim() || 'Blood',
        deliveryTime: formData.deliveryTime.trim() || 'Same Day',
        normalRange: formData.normalRange.trim() || null,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      if (editingTest) {
        await updateTest({ id: editingTest.id, data: payload }).unwrap();
      } else {
        await createTest(payload).unwrap();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save diagnostic test.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Tests</p>
            <h3 className="text-xl font-black text-dark">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Tests</p>
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
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Microscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Categories</p>
            <h3 className="text-xl font-black text-sky-600">{TEST_CATEGORIES.length}</h3>
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
            placeholder="Search by test name, code, lab room..."
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
          {/* Category Filter */}
          <div className="w-44 shrink-0">
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing / Discount Filter */}
          <div className="w-40 shrink-0">
            <Select
              value={discountFilter}
              onValueChange={(val: any) => setDiscountFilter(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="discountable">Discountable (%)</SelectItem>
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
                <SelectItem value="Active">Active Tests</SelectItem>
                <SelectItem value="Inactive">Inactive Tests</SelectItem>
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
            <span>Add Test</span>
          </Button>
        </div>
      </div>

      {/* 3. Diagnostic Tests Table View */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="inline-block animate-spin text-primary">
            <RefreshCw className="h-8 w-8" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Loading diagnostic test directory...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-dark">No diagnostic tests found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or click &quot;Add Test&quot; to configure a new diagnostic procedure.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-primary text-white uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-white font-bold">Test Name & Code</th>
                  <th className="py-3.5 px-4 text-white font-bold">Department / Category</th>
                  <th className="py-3.5 px-4 text-white font-bold">Sample Specimen</th>
                  <th className="py-3.5 px-4 text-white font-bold">Lab / Room</th>
                  <th className="py-3.5 px-4 text-white font-bold">Turnaround Time</th>
                  <th className="py-3.5 px-4 text-white font-bold">Price & Discount</th>
                  <th className="py-3.5 px-4 text-center text-white font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTests.map((t, idx) => {
                  const priceNum = Number(t.price) || 0;
                  const discountPct = Number(t.discountPercent) || 0;
                  const minDiscountPrice = t.isDiscountable ? Math.round(priceNum * (1 - discountPct / 100)) : priceNum;

                  return (
                    <tr
                      key={t.id}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'
                      } hover:bg-emerald-50/60 transition-colors group`}
                    >
                      {/* Test Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {t.code && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-white shrink-0">
                                {t.code}
                              </span>
                            )}
                            <span className="font-bold text-dark group-hover:text-primary transition-colors text-sm">
                              {t.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.category}
                        </span>
                      </td>

                      {/* Sample Specimen */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <FlaskConical className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.sampleType || 'Specimen'}</span>
                        </div>
                      </td>

                      {/* Lab / Room */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.roomNumber || 'General Lab'}</span>
                        </div>
                      </td>

                      {/* Turnaround Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.deliveryTime || 'Same Day'}</span>
                        </div>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-sm font-black text-dark font-mono block">
                            ৳ {priceNum.toLocaleString()}
                          </span>
                          {t.isDiscountable && discountPct > 0 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                              <Percent className="h-2.5 w-2.5" />
                              -{discountPct}% (৳{minDiscountPrice.toLocaleString()})
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
                            t.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              t.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(t)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Test Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-secondary hover:bg-secondary/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Test"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(t)}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Test"
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

      {/* 5. ADD / EDIT TEST MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark">
                    {editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure test pricing, discountable rate, optional room number and delivery time.
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

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Name, Code, and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Test Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CBC-01"
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Category and Sample Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category / Department</label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Sample Specimen Type</label>
                  <Select
                    value={formData.sampleType}
                    onValueChange={(val) => setFormData({ ...formData, sampleType: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Sample Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Price and Discountable as Percentage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Test Price (৳) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="৳ 450"
                    className="h-10 rounded-xl font-mono font-bold bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Discountable?</label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isDiscountable}
                        onChange={(e) => setFormData({ ...formData, isDiscountable: e.target.checked })}
                        className="h-4 w-4 rounded-sm text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="font-bold text-xs text-slate-700">
                        {formData.isDiscountable ? 'Yes (Can Discount %)' : 'No (Fixed)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Discount Percentage (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!formData.isDiscountable}
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    placeholder="10"
                    className={`h-10 rounded-xl font-mono font-bold bg-white ${
                      !formData.isDiscountable ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {formData.isDiscountable && Number(formData.price) > 0 && (
                  <div className="sm:col-span-3 text-[11px] font-semibold text-purple-700 flex items-center justify-between pt-1 border-t border-purple-200/60">
                    <span>
                      Discount Allowance: ৳{' '}
                      {Math.round(
                        (Number(formData.price) * (Number(formData.discountPercent) || 0)) / 100
                      ).toLocaleString()}{' '}
                      ({formData.discountPercent}%)
                    </span>
                    <span>
                      Net Price After Discount: ৳{' '}
                      {Math.round(
                        Number(formData.price) * (1 - (Number(formData.discountPercent) || 0) / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Row 4: Room Number (Optional) & Delivery Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Room Number / Lab Counter</label>
                    <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g. Lab-102, Room 204"
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
                          <SelectItem value="Lab-101 (Hematology)">Lab-101</SelectItem>
                          <SelectItem value="Lab-102 (Biochemistry)">Lab-102</SelectItem>
                          <SelectItem value="Radiology (Room 105)">Radiology</SelectItem>
                          <SelectItem value="USG Room 201">USG Room</SelectItem>
                          {roomsList.slice(0, 4).map((r) => (
                            <SelectItem key={r.id} value={`Room ${r.roomNumber}`}>
                              Room {r.roomNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Report Turnaround Time</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      placeholder="e.g. 4 Hours, Next Day"
                      className="h-10 rounded-xl flex-1"
                    />
                    <div className="w-36 shrink-0">
                      <Select
                        value={formData.deliveryTime || undefined}
                        onValueChange={(val) => setFormData({ ...formData, deliveryTime: val })}
                      >
                        <SelectTrigger className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Presets" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TIMES.map((dt) => (
                            <SelectItem key={dt} value={dt}>
                              {dt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Reference / Normal Range */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Normal / Reference Range</label>
                  <span className="text-[10px] text-slate-400 font-semibold">(Optional for report generation)</span>
                </div>
                <Input
                  value={formData.normalRange}
                  onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                  placeholder="e.g. Fasting: 70 - 99 mg/dL, 2 hrs post-meal: < 140 mg/dL"
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Row 6: Description & Patient Instructions */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Patient Preparation & Clinical Instructions</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10-12 hours overnight fasting required. Water is permitted..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Row 7: Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-bold text-slate-700">Test Active Status</span>
                  <p className="text-[11px] text-slate-500">
                    Inactive tests will not appear in reception billing or doctor prescription order sets.
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
                  {isCreating || isUpdating ? 'Saving...' : editingTest ? 'Update Test' : 'Save Test'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DETAILS VIEW MODAL (Eye Icon) */}
      {isDetailsModalOpen && viewingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-dark">{viewingTest.name}</h3>
                    {viewingTest.code && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-white">
                        {viewingTest.code}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        viewingTest.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {viewingTest.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{viewingTest.category}</p>
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
                  Test Fee & Discount Policy
                </span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Regular Test Price</span>
                    <span className="text-xl font-black text-dark font-mono">
                      ৳ {Number(viewingTest.price).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Discount Allowance</span>
                    {viewingTest.isDiscountable ? (
                      <div>
                        <span className="text-sm font-bold text-purple-700">
                          {viewingTest.discountPercent}% Discountable
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Discounted fee: ৳{' '}
                          {Math.round(
                            Number(viewingTest.price) *
                              (1 - (Number(viewingTest.discountPercent) || 0) / 100)
                          ).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-600">Fixed (No Discount)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lab Setup Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-semibold">Room / Lab Counter</span>
                  </div>
                  <p className="font-bold text-dark text-xs">
                    {viewingTest.roomNumber ? viewingTest.roomNumber : 'General Pathology Counter'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-semibold">Delivery Turnaround</span>
                  </div>
                  <p className="font-bold text-dark text-xs">{viewingTest.deliveryTime || 'Same Day'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold">Sample Specimen</span>
                  </div>
                  <p className="font-bold text-dark text-xs">{viewingTest.sampleType}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Activity className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-[11px] font-semibold">Category</span>
                  </div>
                  <p className="font-bold text-dark text-xs">{viewingTest.category}</p>
                </div>
              </div>

              {/* Reference Range */}
              {viewingTest.normalRange && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Standard Reference Range</span>
                  <p className="font-mono font-medium text-slate-800 text-xs">{viewingTest.normalRange}</p>
                </div>
              )}

              {/* Instructions / Preparation */}
              {viewingTest.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Preparation & Guidelines</span>
                  <p className="text-slate-700 leading-relaxed">{viewingTest.description}</p>
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
        title="Delete Diagnostic Test?"
        message={`Are you sure you want to permanently remove test "${deleteTargetName}"? This will remove it from future billing and test catalog orders.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TestsTab;
