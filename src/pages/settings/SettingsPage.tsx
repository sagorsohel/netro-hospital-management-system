import React, { useState } from 'react';
import {
  Bed,
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  Eye,
  DollarSign,
  Layers,
  HeartPulse,
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  User,
  X,
  ChevronRight,
  Info,
  Check,
  Tag,
  Stethoscope,
  Activity,
  ArrowUpDown,
  RefreshCw,
  Hash,
} from 'lucide-react';
import {
  useGetRoomsQuery,
  useGetRoomStatsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useToggleRoomStatusMutation,
  useDeleteRoomMutation,
  type HospitalRoom,
  type RoomStatus,
  type ExtraCharge,
} from '../../store/api/roomApi';
import { useAppSelector } from '../../store/hooks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';

const PRESET_CHARGES = [
  { key: 'Oxygen Cylinder Support', value: 500, unit: 'per day' },
  { key: 'Specialist Nursing Care', value: 350, unit: 'per shift' },
  { key: 'Attendant Bed & Linen', value: 300, unit: 'one-time' },
  { key: 'AC & Generator Backup', value: 200, unit: 'per day' },
  { key: 'Ward Sanitization & UV Clean', value: 150, unit: 'per day' },
  { key: 'Cardiac Telemetry Monitor', value: 1200, unit: 'per day' },
];

const AMENITY_OPTIONS = [
  'Oxygen Pipeline',
  'Cardiac Monitor',
  'Air Conditioned',
  'Attached Washroom',
  'Nurse Call Bell',
  'Smart LED TV',
  'Refrigerator',
  'Sofa Bed for Attendant',
  'Ventilator Compatible',
  'Curtain Partitions',
];

const ROOM_TYPE_OPTIONS = [
  'General Ward',
  'Single Cabin',
  'Deluxe Cabin',
  'VIP Suite',
  'ICU (Intensive Care)',
  'CCU (Coronary Care)',
  'NICU (Neonatal ICU)',
  'Post-Op Recovery Ward',
  'Emergency Observation',
];

const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '2nd Floor (Critical Care)',
  '3rd Floor',
  '4th Floor',
  '4th Floor (VIP Wing)',
  '5th Floor',
];

export const SettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'rooms' | 'general' | 'billing' | 'security'>('rooms');

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  // API Queries
  const { data: roomListData, isLoading: isRoomsLoading, refetch } = useGetRoomsQuery({
    search: searchTerm || undefined,
    floor: floorFilter !== 'all' ? floorFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    roomType: roomTypeFilter !== 'all' ? roomTypeFilter : undefined,
  });

  const { data: statsData, isLoading: isStatsLoading } = useGetRoomStatsQuery();
  const rooms = roomListData?.data || [];
  const stats = statsData?.stats;

  // Mutations
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HospitalRoom | null>(null);
  const [viewingRoom, setViewingRoom] = useState<HospitalRoom | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    floor: FLOOR_OPTIONS[1],
    roomType: ROOM_TYPE_OPTIONS[0],
    department: 'Inpatient (IPD)',
    perDayCharge: '1500',
    bedCount: 1,
    occupiedBeds: 0,
    status: 'Available' as RoomStatus,
    bedNumbers: ['A1'] as string[],
    notes: '',
    amenities: [] as string[],
    extraCharges: [] as ExtraCharge[],
  });

  // Open modal for new room (default Available, no manual admission inputs)
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      roomNumber: '',
      floor: FLOOR_OPTIONS[1],
      roomType: ROOM_TYPE_OPTIONS[0],
      department: 'Inpatient (IPD)',
      perDayCharge: '1500',
      bedCount: 1,
      occupiedBeds: 0,
      status: 'Available',
      bedNumbers: ['A1'],
      notes: '',
      amenities: ['Oxygen Pipeline', 'Attached Washroom', 'Nurse Call Bell'],
      extraCharges: [
        { key: 'Oxygen Cylinder Support', value: 500, unit: 'per day' },
      ],
    });
    setIsFormModalOpen(true);
  };

  // Open modal for editing room
  const handleOpenEditModal = (room: HospitalRoom) => {
    setEditingRoom(room);

    // Initialize bedNumbers
    const initialBeds =
      Array.isArray(room.bedNumbers) && room.bedNumbers.length > 0
        ? [...room.bedNumbers]
        : Array.from({ length: room.bedCount || 1 }, (_, i) => `A${i + 1}`);

    setFormData({
      name: room.name,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomType: room.roomType,
      department: room.department,
      perDayCharge: String(room.perDayCharge),
      bedCount: room.bedCount,
      occupiedBeds: room.occupiedBeds || 0,
      status: room.status,
      bedNumbers: initialBeds,
      notes: room.notes || '',
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      extraCharges: Array.isArray(room.extraCharges) ? room.extraCharges : [],
    });
    setIsFormModalOpen(true);
  };

  // Handle Bed Count change and sync bedNumbers array
  const handleBedCountChange = (newCount: number) => {
    const count = Math.max(1, newCount);
    setFormData((prev) => {
      let updatedBeds = [...prev.bedNumbers];
      if (updatedBeds.length < count) {
        // Add new bed labels
        for (let i = updatedBeds.length; i < count; i++) {
          updatedBeds.push(`A${i + 1}`);
        }
      } else if (updatedBeds.length > count) {
        updatedBeds = updatedBeds.slice(0, count);
      }
      return {
        ...prev,
        bedCount: count,
        bedNumbers: updatedBeds,
      };
    });
  };

  // Update specific Bed Identifier (e.g. A1, B3, etc.)
  const handleBedNumberChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.bedNumbers];
      updated[index] = value;
      return { ...prev, bedNumbers: updated };
    });
  };

  // Auto-fill bed numbering helpers
  const handleAutoNumberBeds = (prefix: string) => {
    setFormData((prev) => ({
      ...prev,
      bedNumbers: Array.from({ length: prev.bedCount }, (_, i) => `${prefix}${i + 1}`),
    }));
  };

  // Add Dynamic Extra Charge Key-Value
  const handleAddExtraChargeRow = () => {
    setFormData((prev) => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { key: '', value: 0, unit: 'per day' }],
    }));
  };

  // Update Dynamic Extra Charge Row
  const handleUpdateExtraCharge = (
    index: number,
    field: 'key' | 'value' | 'unit',
    val: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...prev.extraCharges];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, extraCharges: updated };
    });
  };

  // Remove Dynamic Extra Charge Row
  const handleRemoveExtraCharge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index),
    }));
  };

  // Add Preset Charge with 1-click
  const handleAddPresetCharge = (preset: { key: string; value: number; unit: string }) => {
    if (formData.extraCharges.some((c) => c.key.toLowerCase() === preset.key.toLowerCase())) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { ...preset }],
    }));
  };

  // Toggle Amenity Checkbox
  const handleToggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Submit Form (Clean - No manual patient/admission inputs)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.roomNumber.trim()) {
      alert('Please provide room name and room number.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        roomNumber: formData.roomNumber.trim(),
        floor: formData.floor,
        roomType: formData.roomType,
        department: formData.department,
        perDayCharge: Number(formData.perDayCharge) || 0,
        bedCount: Number(formData.bedCount) || 1,
        occupiedBeds: editingRoom ? editingRoom.occupiedBeds : 0,
        status: formData.status || 'Available',
        bedNumbers: formData.bedNumbers.map((b) => b.trim()).filter(Boolean),
        amenities: formData.amenities,
        extraCharges: formData.extraCharges.filter((c) => c.key.trim() !== ''),
        notes: formData.notes.trim() || null,
      };

      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, data: payload }).unwrap();
      } else {
        await createRoom(payload).unwrap();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save room details.');
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRoom(deleteTargetId).unwrap();
      setDeleteTargetId(null);
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete room.');
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case 'Booked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Booked
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Maintenance
          </span>
        );
      case 'Cleaning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Cleaning
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Navigation Tabs */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Hospital Administration & System Preferences</span>
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight">
            Hospital Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hospital wards, clinical room tariffs, custom charge rules, and facility preferences.
          </p>
        </div>

        {/* Tab Pill Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Bed className="h-4 w-4" />
            <span>Rooms & Beds</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
              {rooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Hospital Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Billing Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </button>
        </div>
      </div>

      {/* 2. TAB 1: ROOMS & BEDS MANAGEMENT */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Rooms</p>
                <h3 className="text-xl font-black text-dark">{stats?.totalRooms || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Bed className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Beds</p>
                <h3 className="text-xl font-black text-dark">{stats?.totalBeds || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Available</p>
                <h3 className="text-xl font-black text-emerald-600">{stats?.availableRooms || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Booked Beds</p>
                <h3 className="text-xl font-black text-rose-600">{stats?.occupiedBeds || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Occupancy</p>
                <h3 className="text-xl font-black text-amber-600">{stats?.occupancyRate || 0}%</h3>
              </div>
            </div>
          </div>

          {/* Action Bar: Search, Filters & Add Room Button */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by room name, room number..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-dark placeholder:text-slate-400 transition-all outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">All Floors</option>
                {FLOOR_OPTIONS.map((floor) => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Available">Available (Vacant)</option>
                <option value="Booked">Booked (Occupied)</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning / Sanitizing</option>
              </select>

              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">All Room Types</option>
                {ROOM_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => refetch()}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-dark hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh rooms"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <Button
                type="button"
                onClick={handleOpenAddModal}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add Room / Bed</span>
              </Button>
            </div>
          </div>

          {/* 3. COMPACT ROOMS GRID (MAIN ESSENTIALS ONLY) */}
          {isRoomsLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <Activity className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">
                Loading hospital rooms & beds...
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Bed className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-dark">No Hospital Rooms Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start by adding your hospital wards, deluxe cabins, and intensive care beds.
              </p>
              <Button
                type="button"
                onClick={handleOpenAddModal}
                className="h-9 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {rooms.map((room) => {
                const bedNumbers = Array.isArray(room.bedNumbers) ? room.bedNumbers : [];

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                  >
                    {/* Top Row: Room Number, Floor, Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono shrink-0">
                            #{room.roomNumber}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 truncate">
                            {room.floor}
                          </span>
                        </div>
                        <div className="shrink-0">{getStatusBadge(room.status)}</div>
                      </div>

                      {/* Room Name & Category */}
                      <div>
                        <h4 className="text-sm font-bold text-dark tracking-tight truncate" title={room.name}>
                          {room.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {room.roomType} • {room.department}
                        </p>
                      </div>

                      {/* Pricing & Bed Count Strip */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/90 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase block">
                            Rate
                          </span>
                          <span className="font-extrabold text-primary text-xs sm:text-sm">
                            ৳{Number(room.perDayCharge || 0).toLocaleString()}
                            <span className="text-[9px] font-normal text-slate-400 ml-0.5">/day</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium uppercase block">
                            Capacity
                          </span>
                          <span className="font-bold text-dark flex items-center justify-end gap-1 text-xs">
                            <Bed className="h-3.5 w-3.5 text-slate-400" />
                            <span>{room.bedCount} Bed{room.bedCount > 1 ? 's' : ''}</span>
                          </span>
                        </div>
                      </div>

                      {/* Bed Identifiers Chips (e.g. A1, B3, etc.) */}
                      {bedNumbers.length > 0 && (
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            Beds:
                          </span>
                          <div className="flex flex-wrap gap-1 min-w-0">
                            {bedNumbers.slice(0, 3).map((bedTag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200/60"
                              >
                                {bedTag}
                              </span>
                            ))}
                            {bedNumbers.length > 3 && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-bold">
                                +{bedNumbers.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Eye Details Button + Edit / Delete */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* EYE ICON: OPEN FULL DETAILS MODAL */}
                      <button
                        type="button"
                        onClick={() => setViewingRoom(room)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-primary/40 bg-white hover:bg-emerald-50 text-slate-700 hover:text-primary transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        title="View Full Details & Extra Charges"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Details</span>
                      </button>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(room)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-dark hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Edit Room"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(room.id);
                            setDeleteTargetName(`${room.name} (#${room.roomNumber})`);
                          }}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. DETAILS VIEW MODAL (TRIGGERED BY EYE ICON) */}
      {viewingRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                    #{viewingRoom.roomNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {viewingRoom.floor}
                  </span>
                  {getStatusBadge(viewingRoom.status)}
                </div>
                <h3 className="text-lg font-black text-dark">
                  {viewingRoom.name}
                </h3>
                <p className="text-xs text-secondary font-semibold">
                  {viewingRoom.roomType} • {viewingRoom.department}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingRoom(null)}
                className="text-slate-400 hover:text-dark p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Per Day Charge
                </span>
                <span className="text-base font-extrabold text-primary">
                  ৳{Number(viewingRoom.perDayCharge || 0).toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">/day</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Bed Capacity
                </span>
                <span className="text-sm font-bold text-dark flex items-center gap-1 mt-0.5">
                  <Bed className="h-4 w-4 text-slate-500" />
                  <span>{viewingRoom.bedCount} Bed{viewingRoom.bedCount > 1 ? 's' : ''}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Current Status
                </span>
                <span className="text-xs font-bold text-dark mt-0.5 block">
                  {viewingRoom.status}
                </span>
              </div>
            </div>

            {/* Configured Bed Identifiers (e.g. A1, B3, etc.) */}
            {Array.isArray(viewingRoom.bedNumbers) && viewingRoom.bedNumbers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <span>Configured Bed Numbers / Identifiers ({viewingRoom.bedNumbers.length})</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {viewingRoom.bedNumbers.map((bedTag, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center"
                    >
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Bed #{idx + 1}
                      </span>
                      <span className="font-mono font-bold text-sm text-dark">
                        {bedTag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Others Exclude Charges Section */}
            {Array.isArray(viewingRoom.extraCharges) && viewingRoom.extraCharges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-secondary" />
                  <span>Additional / Others Exclude Charges ({viewingRoom.extraCharges.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {viewingRoom.extraCharges.map((charge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
                    >
                      <div className="font-semibold text-slate-800">{charge.key}</div>
                      <div className="font-bold font-mono text-primary">
                        ৳{Number(charge.value).toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({charge.unit || 'per day'})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities & Amenities */}
            {Array.isArray(viewingRoom.amenities) && viewingRoom.amenities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Room Facilities & Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingRoom.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {viewingRoom.notes && (
              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block">Clinical Guidelines / Notes:</span>
                <p className="text-slate-600 leading-relaxed italic">{viewingRoom.notes}</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const target = viewingRoom;
                  setViewingRoom(null);
                  handleOpenEditModal(target);
                }}
                className="h-9 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" /> Edit Room
              </Button>

              <Button
                type="button"
                onClick={() => setViewingRoom(null)}
                className="h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT ROOM MODAL (CLEAN - NO MANUAL ADMISSION FIELDS) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Bed className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-dark">
                    {editingRoom ? 'Edit Hospital Room' : 'Add New Hospital Room / Bed'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure room details, tariffs, custom bed identifiers, and exclude charges.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-dark p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Room Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Deluxe Cabin 302, General Ward 102"
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Room Number */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 302, 102-B, ICU-04"
                    className="h-10 rounded-xl font-mono font-bold"
                  />
                </div>

                {/* Floor Number */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Floor Number <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                  >
                    {FLOOR_OPTIONS.map((fl) => (
                      <option key={fl} value={fl}>{fl}</option>
                    ))}
                  </select>
                </div>

                {/* Room Type */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Type / Category</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                  >
                    {ROOM_TYPE_OPTIONS.map((rt) => (
                      <option key={rt} value={rt}>{rt}</option>
                    ))}
                  </select>
                </div>

                {/* Per Day Charge */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Per Day Charge (৳ BDT) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.perDayCharge}
                    onChange={(e) => setFormData({ ...formData, perDayCharge: e.target.value })}
                    placeholder="1500"
                    className="h-10 rounded-xl font-mono font-bold text-primary"
                  />
                </div>

                {/* Bed Count */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Bed Count (Capacity) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.bedCount}
                    onChange={(e) => handleBedCountChange(parseInt(e.target.value) || 1)}
                    className="h-10 rounded-xl font-mono font-bold"
                  />
                </div>

                {/* Status (Default Available) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="Available">🟢 Available (Vacant - Default)</option>
                    <option value="Maintenance">🟡 Under Maintenance</option>
                    <option value="Cleaning">🔵 Cleaning / Sanitizing</option>
                    <option value="Booked">🔴 Booked / Occupied</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Clinical Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Inpatient (IPD), Surgery, etc."
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* CUSTOM BED NUMBERS / IDENTIFIERS SECTION */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span>Custom Bed Numbers / Identifiers ({formData.bedCount} Beds)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Give custom labels like A1, B3, Bed-1, etc. as desired.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAutoNumberBeds('A')}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-dark text-[10px] font-bold"
                    >
                      Auto A1, A2..
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoNumberBeds('Bed-')}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-dark text-[10px] font-bold"
                    >
                      Auto Bed-1..
                    </button>
                  </div>
                </div>

                {/* Bed Inputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {formData.bedNumbers.map((bedTag, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">
                        Bed #{idx + 1} Label
                      </label>
                      <Input
                        value={bedTag}
                        onChange={(e) => handleBedNumberChange(idx, e.target.value)}
                        placeholder={`e.g. A${idx + 1} or B3`}
                        className="h-8 rounded-lg font-mono font-bold text-xs bg-white"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC CUSTOM KEY-VALUE CHARGES (OTHERS EXCLUDE CHARGES) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span>Others Exclude Charges (Custom Key-Value Fees)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add optional extra clinical fees (Oxygen support, Nursing, AC, Attendant, etc.).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtraChargeRow}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold text-[11px] flex items-center gap-1 shadow-xs hover:bg-primary-hover cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Charge</span>
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">
                    1-Click Add Popular Presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CHARGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetCharge(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3 text-emerald-600" />
                        <span>{preset.key}</span>
                        <span className="font-bold text-primary font-mono">(৳{preset.value})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key-Value Inputs List */}
                {formData.extraCharges.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {formData.extraCharges.map((charge, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                      >
                        <div className="flex-1">
                          <Input
                            value={charge.key}
                            onChange={(e) => handleUpdateExtraCharge(idx, 'key', e.target.value)}
                            placeholder="Charge Name (e.g. Oxygen Cylinder)"
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            type="number"
                            value={charge.value}
                            onChange={(e) =>
                              handleUpdateExtraCharge(idx, 'value', parseFloat(e.target.value) || 0)
                            }
                            placeholder="৳ 500"
                            className="h-8 rounded-lg font-mono font-bold text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <select
                            value={charge.unit || 'per day'}
                            onChange={(e) => handleUpdateExtraCharge(idx, 'unit', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-[10px] font-semibold bg-white"
                          >
                            <option value="per day">per day</option>
                            <option value="per shift">per shift</option>
                            <option value="one-time">one-time</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraCharge(idx)}
                          className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove Charge"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Room Facilities & Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Special Notes & Guidelines</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special clinical instructions, cleaning routine, observation notes..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-dark placeholder:text-slate-400 outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
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
                  {isCreating || isUpdating ? 'Saving...' : editingRoom ? 'Update Room' : 'Save Room'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. TAB 2: GENERAL HOSPITAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-dark">Hospital Profile & General Details</h3>
            <p className="text-xs text-slate-500">
              Update institutional metadata, default branch name, and emergency contact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Hospital Legal Name</label>
              <Input defaultValue="Netro Central Hospital Ltd." className="h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Main Branch / Campus</label>
              <Input defaultValue="Central Campus (Branch #1)" className="h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Emergency Hotline</label>
              <Input defaultValue="+880 1700-000001" className="h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Operational Currency</label>
              <Input defaultValue="BDT (৳ - Bangladeshi Taka)" disabled className="h-10 rounded-xl bg-slate-50" />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700">Physical Address</label>
              <Input defaultValue="House 42, Road 11, Dhanmondi, Dhaka - 1205, Bangladesh" className="h-10 rounded-xl" />
            </div>
          </div>

          <Button type="button" className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5">
            Save General Preferences
          </Button>
        </div>
      )}

      {/* 7. TAB 3: BILLING & TARIFFS */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-dark">Hospital Tariffs & Admission Rates</h3>
            <p className="text-xs text-slate-500">
              Configure baseline admission processing fee, taxes, and automatic bed charge cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Inpatient (IPD) Admission Processing Fee</label>
              <Input defaultValue="500" className="h-10 rounded-xl font-mono" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Bed Charge Calculation Cycle</label>
              <select className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold">
                <option>24 Hours Cycle (Calculated from admission time)</option>
                <option>Fixed Midnight Cut-off (12:00 AM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Hospital VAT / Service Tax (%)</label>
              <Input defaultValue="0" className="h-10 rounded-xl font-mono" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Emergency Triage Consultation Base Fee</label>
              <Input defaultValue="1000" className="h-10 rounded-xl font-mono" />
            </div>
          </div>

          <Button type="button" className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5">
            Update Billing Rules
          </Button>
        </div>
      )}

      {/* 8. TAB 4: SECURITY & USER ACCESS */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-dark">Admin Password & Session Security</h3>
            <p className="text-xs text-slate-500">
              Logged in as <strong className="text-dark">{user?.name}</strong> ({user?.email}) with role: <strong className="text-primary uppercase">{user?.role}</strong>.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Current Password</label>
              <Input type="password" placeholder="••••••••" className="h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">New Password</label>
              <Input type="password" placeholder="••••••••" className="h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" className="h-10 rounded-xl" />
            </div>
          </div>

          <Button type="button" className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5">
            Update Password
          </Button>
        </div>
      )}

      {/* 9. DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Hospital Room?"
        message={`Are you sure you want to permanently delete room "${deleteTargetName}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SettingsPage;
