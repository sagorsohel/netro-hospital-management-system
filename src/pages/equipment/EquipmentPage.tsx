import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  Phone,
  FileText,
  ShieldCheck,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Camera,
} from 'lucide-react';
import {
  useGetEquipmentQuery,
  useGetEquipmentStatsQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useGetMaintenanceLogsQuery,
  useCreateMaintenanceLogMutation,
  useUploadEquipmentImageMutation,
  type Equipment,
  type MaintenanceLog,
} from '../../store/api/equipmentApi';
import { useGetDepartmentsQuery } from '../../store/api/departmentApi';
import { useAppSelector } from '../../store/hooks';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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

export const EQUIPMENT_CATEGORIES = [
  'Diagnostic Imaging',
  'Surgical & OT',
  'Intensive Care (ICU)',
  'Laboratory & Pathology',
  'Emergency & Life Support',
  'Cardiology & ECG',
  'General Facility & Electrical',
];

export const EQUIPMENT_STATUSES = [
  'Functional',
  'Under Maintenance',
  'Non-functional',
];

export const EquipmentPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isShareholder = user?.role === 'shareholder';

  // Active Tab: 'inventory' | 'maintenance'
  const [activeTab, setActiveTab] = useState<'inventory' | 'maintenance'>('inventory');

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modals
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedForLog, setSelectedForLog] = useState<Equipment | null>(null);

  // Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [equipToDelete, setEquipToDelete] = useState<Equipment | null>(null);

  // APIs
  const { data: deptData } = useGetDepartmentsQuery({ limit: 100 });
  const departmentsList = deptData?.data || [];

  const { data: statsData } = useGetEquipmentStatsQuery();
  const stats = statsData?.stats;

  const { data: equipResponse, isLoading } = useGetEquipmentQuery({
    page,
    limit,
    search: search.trim() || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department: deptFilter !== 'all' ? deptFilter : undefined,
  });

  const equipmentList = equipResponse?.data || [];
  const pagination = equipResponse?.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 };

  const { data: logsResponse, isLoading: isLoadingLogs } = useGetMaintenanceLogsQuery();
  const maintenanceLogsList = logsResponse?.data || [];

  // Mutations
  const [createEquipment, { isLoading: isCreating }] = useCreateEquipmentMutation();
  const [updateEquipment, { isLoading: isUpdating }] = useUpdateEquipmentMutation();
  const [deleteEquipment, { isLoading: isDeleting }] = useDeleteEquipmentMutation();
  const [createMaintenanceLog, { isLoading: isLogging }] = useCreateMaintenanceLogMutation();
  const [uploadEquipmentImage, { isLoading: isUploadingImage }] = useUploadEquipmentImageMutation();

  // Photo viewer modal state
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [activeViewerIndex, setActiveViewerIndex] = useState(0);
  const [viewerEquipmentName, setViewerEquipmentName] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Form states
  const [equipForm, setEquipForm] = useState<{
    name: string;
    modelNo: string;
    serialNumber: string;
    category: string;
    quantity: number;
    price: string;
    roomNumber: string;
    floor: string;
    department: string;
    manufacturer: string;
    purchaseDate: string;
    warrantyExpiry: string;
    status: 'Functional' | 'Under Maintenance' | 'Non-functional';
    lastServiceDate: string;
    nextServiceDate: string;
    serviceNotes: string;
    technicianContact: string;
    photo: string;
    images: string[];
  }>({
    name: '',
    modelNo: '',
    serialNumber: '',
    category: EQUIPMENT_CATEGORIES[0],
    quantity: 1,
    price: '',
    roomNumber: 'Room 101',
    floor: '1st Floor',
    department: '',
    manufacturer: '',
    purchaseDate: '',
    warrantyExpiry: '',
    status: 'Functional',
    lastServiceDate: '',
    nextServiceDate: '',
    serviceNotes: '',
    technicianContact: '',
    photo: '',
    images: [],
  });

  const [logForm, setLogForm] = useState({
    equipmentId: '',
    equipmentName: '',
    serviceDate: new Date().toISOString().slice(0, 10),
    servicedBy: '',
    cost: '0',
    description: '',
    statusAfterService: 'Functional' as const,
    nextScheduledDate: '',
  });

  // Multiple Image Upload Handler
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 8 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large (max 8MB).`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file);
      formData.append('folder', 'netro-hospital/equipment');

      try {
        const res = await uploadEquipmentImage(formData).unwrap();
        if (res.success && res.url) {
          newUrls.push(res.url);
        }
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        setUploadError(err?.data?.message || err?.message || 'Error uploading some images.');
      }
    }

    if (newUrls.length > 0) {
      setEquipForm((prev) => {
        const updatedImages = [...prev.images, ...newUrls];
        return {
          ...prev,
          images: updatedImages,
          photo: prev.photo || updatedImages[0] || '',
        };
      });
    }

    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setEquipForm((prev) => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        photo: updatedImages[0] || '',
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setEquipForm((prev) => {
      const target = prev.images[index];
      if (!target) return prev;
      const reordered = [target, ...prev.images.filter((_, idx) => idx !== index)];
      return {
        ...prev,
        images: reordered,
        photo: target,
      };
    });
  };

  const handleOpenPhotoViewer = (equipmentName: string, images: string[], startIndex: number = 0) => {
    if (!images || images.length === 0) return;
    setViewerEquipmentName(equipmentName);
    setViewerImages(images);
    setActiveViewerIndex(startIndex);
    setIsPhotoViewerOpen(true);
  };

  // Open Edit Equipment Modal
  const handleEdit = (item: Equipment) => {
    setEditingEquip(item);
    const itemImages = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.photo
      ? [item.photo]
      : [];

    setEquipForm({
      name: item.name,
      modelNo: item.modelNo || '',
      serialNumber: item.serialNumber || '',
      category: item.category,
      quantity: item.quantity || 1,
      price: item.price !== undefined && item.price !== null ? String(item.price) : '',
      roomNumber: item.roomNumber || '',
      floor: item.floor || '',
      department: item.department,
      manufacturer: item.manufacturer || '',
      purchaseDate: item.purchaseDate || '',
      warrantyExpiry: item.warrantyExpiry || '',
      status: item.status,
      lastServiceDate: item.lastServiceDate || '',
      nextServiceDate: item.nextServiceDate || '',
      serviceNotes: item.serviceNotes || '',
      technicianContact: item.technicianContact || '',
      photo: item.photo || (itemImages[0] || ''),
      images: itemImages,
    });
    setUploadError('');
    setIsEquipModalOpen(true);
  };

  // Open Log Maintenance Modal
  const handleOpenLogModal = (item: Equipment) => {
    setSelectedForLog(item);
    setLogForm({
      equipmentId: item.id,
      equipmentName: item.name,
      serviceDate: new Date().toISOString().slice(0, 10),
      servicedBy: item.technicianContact ? item.technicianContact.split('(')[0].trim() : 'Bio-Medical Support Eng.',
      cost: '2500',
      description: 'Routine preventive calibration, sensor health check, and filter cleaning.',
      statusAfterService: 'Functional',
      nextScheduledDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setIsLogModalOpen(true);
  };

  // Submit Equipment Save
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipForm.name || !equipForm.category || !equipForm.department) {
      alert('Please fill out Name, Category, and Department.');
      return;
    }

    try {
      const payload = {
        ...equipForm,
        price: equipForm.price ? String(equipForm.price) : '0.00',
        images: equipForm.images,
        photo: equipForm.images[0] || equipForm.photo || '',
      };

      if (editingEquip) {
        await updateEquipment({ id: editingEquip.id, data: payload }).unwrap();
      } else {
        await createEquipment(payload).unwrap();
      }
      setIsEquipModalOpen(false);
      setEditingEquip(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error saving equipment record.');
    }
  };

  // Submit Maintenance Log Save
  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.servicedBy || !logForm.description) {
      alert('Please enter Serviced By and Description.');
      return;
    }

    try {
      await createMaintenanceLog(logForm).unwrap();
      setIsLogModalOpen(false);
      setSelectedForLog(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Error saving maintenance log.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!equipToDelete?.id) return;
    try {
      await deleteEquipment(equipToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setEquipToDelete(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete equipment.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans pb-16">
      {isShareholder && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-4 py-2.5 flex items-center gap-2">
          <Eye className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            <strong>View only:</strong> you are signed in as a shareholder. You can see all hospital equipment and maintenance history, but cannot add, edit or delete.
          </span>
        </div>
      )}
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
                Medical Equipment & Asset Tracking
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-primary border border-emerald-200 text-xs font-bold">
                {stats?.total || 0} Assets
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Equipment inventory, functional status tracking, room allocations & preventive maintenance history.
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={() => {
              setEditingEquip(null);
              setEquipForm({
                name: '',
                modelNo: '',
                serialNumber: '',
                category: EQUIPMENT_CATEGORIES[0],
                quantity: 1,
                price: '',
                roomNumber: 'OT Complex Room 1',
                floor: '2nd Floor',
                department: departmentsList[0]?.name || 'Cardiology & ICU',
                manufacturer: 'GE Healthcare Ltd.',
                purchaseDate: new Date().toISOString().slice(0, 10),
                warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                status: 'Functional',
                lastServiceDate: new Date().toISOString().slice(0, 10),
                nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                serviceNotes: '',
                technicianContact: '+880 1711-XXXXXX',
                photo: '',
                images: [],
              });
              setUploadError('');
              setIsEquipModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Register Equipment</span>
          </Button>
        )}
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Medical Assets
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-dark font-mono">
              {stats?.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Logged in hospital inventory</p>
          </div>
        </div>

        {/* Functional (Green) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Functional (Operational)
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-emerald-700 font-mono">
              {stats?.functional || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Ready for patient procedures</p>
          </div>
        </div>

        {/* Under Maintenance (Amber) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Under Maintenance
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-amber-600 font-mono">
              {stats?.underMaintenance || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Technician servicing in progress</p>
          </div>
        </div>

        {/* Non-functional (Red) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs relative overflow-hidden group hover:border-red-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Non-Functional
            </span>
            <div className="h-8 w-8 rounded-xl bg-red-50 text-accent flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-accent font-mono">
              {stats?.nonFunctional || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Faulty or parts replacement awaited</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200/90 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'inventory'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Equipment Inventory</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'maintenance'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-dark'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Maintenance & Servicing Logs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {maintenanceLogsList.length}
          </span>
        </button>
      </div>

      {/* 4. TAB 1: EQUIPMENT INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by equipment name, model, serial #, room, vendor..."
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
                  {EQUIPMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
                  <SelectItem value="Functional">Functional</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Non-functional">Non-functional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment Cards Grid */}
          {isLoading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
              <div className="h-7 w-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading equipment inventory...</p>
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary mx-auto flex items-center justify-center">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-dark">No Equipment Found</h3>
              <p className="text-xs text-slate-400">Adjust filters or register new medical equipment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentList.map((item) => {
                const cardImages = Array.isArray(item.images) && item.images.length > 0
                  ? item.images
                  : item.photo
                  ? [item.photo]
                  : [];

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-3">
                      {/* Multiple Photos / Primary Image Banner */}
                      {cardImages.length > 0 ? (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 group/img border border-slate-200/80">
                          <img
                            src={cardImages[0]}
                            alt={item.name}
                            className="w-full h-40 object-cover group-hover/img:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => handleOpenPhotoViewer(item.name, cardImages, 0)}
                          />
                          {/* Photos count badge */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                            <Camera className="h-3 w-3 text-emerald-400" />
                            <span>{cardImages.length} {cardImages.length === 1 ? 'Photo' : 'Photos'}</span>
                          </div>

                          {/* Quick view button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoViewer(item.name, cardImages, 0)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-xs opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                            title="View Fullscreen"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Multiple photos thumbnail row if > 1 */}
                          {cardImages.length > 1 && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              {cardImages.slice(1, 4).map((thumb, tIdx) => (
                                <img
                                  key={tIdx}
                                  src={thumb}
                                  alt="thumbnail"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPhotoViewer(item.name, cardImages, tIdx + 1);
                                  }}
                                  className="h-6 w-6 rounded-md object-cover border-2 border-white shadow-xs cursor-pointer hover:scale-110 transition-transform"
                                />
                              ))}
                              {cardImages.length > 4 && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPhotoViewer(item.name, cardImages, 0);
                                  }}
                                  className="h-6 px-1.5 rounded-md bg-slate-900/80 text-white text-[9px] font-bold flex items-center justify-center cursor-pointer border border-white"
                                >
                                  +{cardImages.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-24 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400">
                          <ImageIcon className="h-5 w-5 opacity-40" />
                          <span className="text-[10px]">No photos uploaded</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-dark mt-1 group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.manufacturer || 'Hospital Asset'} {item.modelNo ? `• ${item.modelNo}` : ''}
                          </p>
                        </div>

                        {/* Status Badges */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                            item.status === 'Functional'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'Under Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-accent border border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Location, Floor, Room & Price */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                        {/* Price / Asset Value */}
                        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-emerald-600" />
                            Purchase Price / Value:
                          </span>
                          <span className="font-bold font-mono text-emerald-700 text-xs">
                            {item.price !== undefined && item.price !== null && Number(item.price) > 0
                              ? `৳ ${Number(item.price).toLocaleString()}`
                              : 'Not Specified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-semibold text-dark">
                            {item.roomNumber || 'Room N/A'}, {item.floor || 'Ground'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Department:</span>
                          <span className="font-medium text-slate-700">{item.department}</span>
                        </div>
                        {item.serialNumber && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Serial No:</span>
                            <span className="font-mono text-[10px] text-slate-700 font-bold">{item.serialNumber}</span>
                          </div>
                        )}
                      </div>

                    {/* Maintenance Date Trackers */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] text-slate-400 block">Last Serviced</span>
                        <span className="font-bold text-slate-700">{item.lastServiceDate || 'Not Recorded'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                        <span className="text-[10px] text-slate-400 block">Next Due Date</span>
                        <span className="font-bold text-secondary">{item.nextServiceDate || 'Schedule Due'}</span>
                      </div>
                    </div>

                    {item.serviceNotes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 bg-slate-50 p-2 rounded-lg">
                        &quot;{item.serviceNotes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!isShareholder && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLogModal(item)}
                      className="text-xs h-8 gap-1.5 text-secondary border-blue-200 hover:bg-blue-50"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>Log Service</span>
                    </Button>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
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
                            setEquipToDelete(item);
                            setIsDeleteOpen(true);
                          }}
                          className="text-xs h-8 text-accent hover:text-accent border-red-200 hover:bg-red-50 gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* 5. TAB 2: SERVICING & MAINTENANCE LOGS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-dark">Servicing & Preventive Maintenance History</h3>
              <p className="text-xs text-slate-400">Audit logs of engineering repairs, inspections, and costs.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
            {isLoadingLogs ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading service logs...</div>
            ) : maintenanceLogsList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Wrench className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-dark">No Maintenance Logs</h4>
                <p className="text-xs text-slate-400">Click &apos;Log Service&apos; on any equipment card to register repairs.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Equipment Name</th>
                    <th className="py-3 px-4">Service Date</th>
                    <th className="py-3 px-4">Serviced By (Engineer/Vendor)</th>
                    <th className="py-3 px-4">Service Description & Repairs</th>
                    <th className="py-3 px-4">Service Cost</th>
                    <th className="py-3 px-4">Status After Service</th>
                    <th className="py-3 px-4">Next Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {maintenanceLogsList.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-dark">{log.equipmentName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{log.serviceDate}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{log.servicedBy}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-sm">{log.description}</td>
                      <td className="py-3 px-4 font-bold font-mono text-emerald-700">
                        ৳{Number(log.cost || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.statusAfterService === 'Functional'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.statusAfterService === 'Under Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-accent border border-red-200'
                          }`}
                        >
                          {log.statusAfterService}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{log.nextScheduledDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER / EDIT EQUIPMENT */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">
                {editingEquip ? 'Edit Medical Equipment' : 'Register Medical Equipment'}
              </h3>
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Equipment Name *</Label>
                <Input
                  required
                  placeholder="e.g. GE Carestation 650 Anaesthesia Delivery System"
                  value={equipForm.name}
                  onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category / Type *</Label>
                  <Select
                    value={equipForm.category}
                    onValueChange={(val) => setEquipForm({ ...equipForm, category: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Department *</Label>
                  <Select
                    value={equipForm.department}
                    onValueChange={(val) => setEquipForm({ ...equipForm, department: val })}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Model Number</Label>
                  <Input
                    placeholder="e.g. CS-650"
                    value={equipForm.modelNo}
                    onChange={(e) => setEquipForm({ ...equipForm, modelNo: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Serial Number</Label>
                  <Input
                    placeholder="e.g. GE-2023-9912"
                    value={equipForm.serialNumber}
                    onChange={(e) => setEquipForm({ ...equipForm, serialNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Room / Ward</Label>
                  <Input
                    placeholder="OT Room 2"
                    value={equipForm.roomNumber}
                    onChange={(e) => setEquipForm({ ...equipForm, roomNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Floor</Label>
                  <Input
                    placeholder="2nd Floor"
                    value={equipForm.floor}
                    onChange={(e) => setEquipForm({ ...equipForm, floor: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Status *</Label>
                  <Select
                    value={equipForm.status}
                    onValueChange={(val: any) => setEquipForm({ ...equipForm, status: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Functional">Functional</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Non-functional">Non-functional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={equipForm.quantity}
                    onChange={(e) => setEquipForm({ ...equipForm, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    Purchase Price / Asset Value (৳)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 350000"
                    value={equipForm.price}
                    onChange={(e) => setEquipForm({ ...equipForm, price: e.target.value })}
                    className="font-mono font-medium text-dark"
                  />
                </div>
              </div>

              {/* Equipment Pictures (Multiple Images Upload) */}
              <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Equipment Pictures (Multiple Upload Supported)
                  </Label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {equipForm.images.length} {equipForm.images.length === 1 ? 'picture' : 'pictures'} attached
                  </span>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                )}

                {/* Upload Trigger Area */}
                <label className="border-2 border-dashed border-slate-300 hover:border-primary rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white transition-colors group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium py-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading pictures to cloud storage...</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-primary flex items-center justify-center transition-colors">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-primary">
                        Click to select & upload multiple photos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Supports selecting multiple JPG, PNG, WEBP files (Max 8MB each)
                      </span>
                    </>
                  )}
                </label>

                {/* Uploaded Images Preview Thumbnails */}
                {equipForm.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                    {equipForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group/thumb rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                      >
                        <img
                          src={imgUrl}
                          alt={`Equipment preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer shadow-xs"
                          title="Remove picture"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-bold">
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-slate-900/80 text-white text-[9px] font-medium opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-slate-900 cursor-pointer"
                            title="Set as primary"
                          >
                            Set Main
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Manufacturer / Vendor</Label>
                  <Input
                    placeholder="e.g. Philips Healthcare"
                    value={equipForm.manufacturer}
                    onChange={(e) => setEquipForm({ ...equipForm, manufacturer: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Engineer / Vendor Contact</Label>
                  <Input
                    placeholder="+880 1711-XXXXXX"
                    value={equipForm.technicianContact}
                    onChange={(e) => setEquipForm({ ...equipForm, technicianContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Last Service Date</Label>
                  <Input
                    type="date"
                    value={equipForm.lastServiceDate}
                    onChange={(e) => setEquipForm({ ...equipForm, lastServiceDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Next Service Due Date</Label>
                  <Input
                    type="date"
                    value={equipForm.nextServiceDate}
                    onChange={(e) => setEquipForm({ ...equipForm, nextServiceDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Service & Operational Notes</Label>
                <Textarea
                  rows={2}
                  placeholder="Calibration notes, replaced sensors, power board condition..."
                  value={equipForm.serviceNotes}
                  onChange={(e) => setEquipForm({ ...equipForm, serviceNotes: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEquipModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  {editingEquip ? 'Update Equipment' : 'Register Equipment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG MAINTENANCE SERVICE */}
      {isLogModalOpen && selectedForLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark">Log Equipment Servicing</h3>
                <p className="text-[11px] text-slate-400">{selectedForLog.name}</p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Service Date *</Label>
                  <Input
                    type="date"
                    value={logForm.serviceDate}
                    onChange={(e) => setLogForm({ ...logForm, serviceDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Service Cost (৳)</Label>
                  <Input
                    type="number"
                    value={logForm.cost}
                    onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Serviced By (Engineer / Agency) *</Label>
                <Input
                  required
                  placeholder="e.g. Engr. Shafiqul (GE Healthcare)"
                  value={logForm.servicedBy}
                  onChange={(e) => setLogForm({ ...logForm, servicedBy: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Status After Service</Label>
                  <Select
                    value={logForm.statusAfterService}
                    onValueChange={(val: any) => setLogForm({ ...logForm, statusAfterService: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Functional">Functional</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Non-functional">Non-functional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Next Scheduled Service</Label>
                  <Input
                    type="date"
                    value={logForm.nextScheduledDate}
                    onChange={(e) => setLogForm({ ...logForm, nextScheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Maintenance Details & Tasks *</Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Describe repair work, parts replaced, calibration readings..."
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLogModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLogging}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Record Maintenance Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PHOTO VIEWER LIGHTBOX */}
      {isPhotoViewerOpen && viewerImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center justify-center">
            {/* Header / Info bar */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-2">
              <div>
                <h3 className="text-sm font-bold text-white">{viewerEquipmentName}</h3>
                <p className="text-xs text-slate-400">
                  Photo {activeViewerIndex + 1} of {viewerImages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoViewerOpen(false)}
                className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Active Image Display */}
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
              <img
                src={viewerImages[activeViewerIndex]}
                alt={`${viewerEquipmentName} photo ${activeViewerIndex + 1}`}
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl"
              />

              {/* Prev button */}
              {viewerImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveViewerIndex((prev) =>
                      prev === 0 ? viewerImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Next button */}
              {viewerImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveViewerIndex((prev) =>
                      prev === viewerImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Thumbnails strip below */}
            {viewerImages.length > 1 && (
              <div className="flex items-center gap-2 pt-4 max-w-full overflow-x-auto px-2">
                {viewerImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onClick={() => setActiveViewerIndex(idx)}
                    className={`h-14 w-14 object-cover rounded-lg cursor-pointer transition-all border-2 shrink-0 ${
                      activeViewerIndex === idx
                        ? 'border-emerald-500 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Equipment Record"
        itemName={equipToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setEquipToDelete(null);
        }}
      />
    </div>
  );
};

export default EquipmentPage;
