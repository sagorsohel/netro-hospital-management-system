import React, { useState } from 'react';
import {
  Bed,
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Activity,
  RefreshCw,
  Hash,
  X,
  Check,
  Tag,
} from 'lucide-react';
import {
  useGetRoomsQuery,
  useGetRoomStatsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  type HospitalRoom,
  type RoomStatus,
  type ExtraCharge,
} from '../../../store/api/roomApi';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DeleteConfirmModal } from '../../../components/common/DeleteConfirmModal';

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

export const RoomsBedsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  const { data: roomListData, isLoading: isRoomsLoading, refetch } = useGetRoomsQuery({
    search: searchTerm || undefined,
    floor: floorFilter !== 'all' ? floorFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    roomType: roomTypeFilter !== 'all' ? roomTypeFilter : undefined,
  });

  const { data: statsData } = useGetRoomStatsQuery();
  const rooms = roomListData?.data || [];
  const stats = statsData?.stats;

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HospitalRoom | null>(null);
  const [viewingRoom, setViewingRoom] = useState<HospitalRoom | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

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
      extraCharges: [{ key: 'Oxygen Cylinder Support', value: 500, unit: 'per day' }],
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (room: HospitalRoom) => {
    setEditingRoom(room);
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

  const handleBedCountChange = (newCount: number) => {
    const count = Math.max(1, newCount);
    setFormData((prev) => {
      let updatedBeds = [...prev.bedNumbers];
      if (updatedBeds.length < count) {
        for (let i = updatedBeds.length; i < count; i++) {
          updatedBeds.push(`A${i + 1}`);
        }
      } else if (updatedBeds.length > count) {
        updatedBeds = updatedBeds.slice(0, count);
      }
      return { ...prev, bedCount: count, bedNumbers: updatedBeds };
    });
  };

  const handleBedNumberChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.bedNumbers];
      updated[index] = value;
      return { ...prev, bedNumbers: updated };
    });
  };

  const handleAutoNumberBeds = (prefix: string) => {
    setFormData((prev) => ({
      ...prev,
      bedNumbers: Array.from({ length: prev.bedCount }, (_, i) => `${prefix}${i + 1}`),
    }));
  };

  const handleAddExtraChargeRow = () => {
    setFormData((prev) => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { key: '', value: 0, unit: 'per day' }],
    }));
  };

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

  const handleRemoveExtraCharge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index),
    }));
  };

  const handleAddPresetCharge = (preset: { key: string; value: number; unit: string }) => {
    if (formData.extraCharges.some((c) => c.key.toLowerCase() === preset.key.toLowerCase())) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { ...preset }],
    }));
  };

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
    <div className="space-y-6">
      {/* KPI Cards */}
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

      {/* Filter and Action Bar */}
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
          <div className="w-40 shrink-0">
            <Select
              value={floorFilter}
              onValueChange={(val) => setFloorFilter(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {FLOOR_OPTIONS.map((floor) => (
                  <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available (Vacant)</SelectItem>
                <SelectItem value="Booked">Booked (Occupied)</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Cleaning">Cleaning / Sanitizing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44 shrink-0">
            <Select
              value={roomTypeFilter}
              onValueChange={(val) => setRoomTypeFilter(val)}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Room Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {ROOM_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

      {/* 3. Rooms Table View */}
      {isRoomsLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="inline-block animate-spin text-primary">
            <RefreshCw className="h-8 w-8" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Loading hospital rooms directory...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bed className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-dark">No rooms configured</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or click &quot;Add Room&quot; to configure a new room.
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-primary text-white uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 text-white font-bold">Room & Number</th>
                  <th className="py-3.5 px-4 text-white font-bold">Floor & Department</th>
                  <th className="py-3.5 px-4 text-white font-bold">Room Type</th>
                  <th className="py-3.5 px-4 text-white font-bold">Bed Capacity & Identifiers</th>
                  <th className="py-3.5 px-4 text-white font-bold">Per Day Charge</th>
                  <th className="py-3.5 px-4 text-center text-white font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rooms.map((room, idx) => {
                  const bedNumbers = Array.isArray(room.bedNumbers) ? room.bedNumbers : [];

                  return (
                    <tr
                      key={room.id}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'
                      } hover:bg-emerald-50/60 transition-colors group`}
                    >
                      {/* Room & Number */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono shrink-0">
                              #{room.roomNumber}
                            </span>
                            <span className="font-bold text-dark group-hover:text-primary transition-colors text-sm">
                              {room.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Floor & Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            <span>{room.floor}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">{room.department}</span>
                        </div>
                      </td>

                      {/* Room Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {room.roomType}
                        </span>
                      </td>

                      {/* Capacity & Beds */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-bold text-dark text-xs">
                            <Bed className="h-3.5 w-3.5 text-slate-400" />
                            <span>{room.bedCount} Bed{room.bedCount > 1 ? 's' : ''}</span>
                          </div>
                          {bedNumbers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {bedNumbers.map((bedTag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200/60"
                                >
                                  {bedTag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Per Day Charge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-sm font-black text-primary font-mono block">
                            ৳ {Number(room.perDayCharge || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">per day</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(room.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingRoom(room)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Room Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(room)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-secondary hover:bg-secondary/10 flex items-center justify-center transition-colors cursor-pointer"
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
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Room"
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

      {/* EYE DETAILS MODAL */}
      {viewingRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                    #{viewingRoom.roomNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{viewingRoom.floor}</span>
                  {getStatusBadge(viewingRoom.status)}
                </div>
                <h3 className="text-lg font-black text-dark">{viewingRoom.name}</h3>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Per Day Rate</span>
                <span className="text-base font-extrabold text-primary">
                  ৳{Number(viewingRoom.perDayCharge || 0).toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">/day</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Capacity</span>
                <span className="text-sm font-bold text-dark flex items-center gap-1 mt-0.5">
                  <Bed className="h-4 w-4 text-slate-500" />
                  <span>{viewingRoom.bedCount} Bed{viewingRoom.bedCount > 1 ? 's' : ''}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Status</span>
                <span className="text-xs font-bold text-dark mt-0.5 block">{viewingRoom.status}</span>
              </div>
            </div>

            {Array.isArray(viewingRoom.bedNumbers) && viewingRoom.bedNumbers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <span>Configured Bed Identifiers ({viewingRoom.bedNumbers.length})</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {viewingRoom.bedNumbers.map((bedTag, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Bed #{idx + 1}
                      </span>
                      <span className="font-mono font-bold text-sm text-dark">{bedTag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(viewingRoom.extraCharges) && viewingRoom.extraCharges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-secondary" />
                  <span>Additional / Others Exclude Charges</span>
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

            {Array.isArray(viewingRoom.amenities) && viewingRoom.amenities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Facilities & Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingRoom.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewingRoom.notes && (
              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block">Guidelines / Notes:</span>
                <p className="text-slate-600 leading-relaxed italic">{viewingRoom.notes}</p>
              </div>
            )}

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

      {/* ADD / EDIT MODAL */}
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
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Name <span className="text-red-500">*</span></label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Deluxe Cabin 302, General Ward 102"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Number <span className="text-red-500">*</span></label>
                  <Input
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 302, 102-B, ICU-04"
                    className="h-10 rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Floor Number <span className="text-red-500">*</span></label>
                  <Select
                    value={formData.floor}
                    onValueChange={(val) => setFormData({ ...formData, floor: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOOR_OPTIONS.map((fl) => (
                        <SelectItem key={fl} value={fl}>{fl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Type / Category</label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(val) => setFormData({ ...formData, roomType: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPE_OPTIONS.map((rt) => (
                        <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Per Day Charge (৳ BDT) <span className="text-red-500">*</span></label>
                  <Input
                    type="number"
                    required
                    value={formData.perDayCharge}
                    onChange={(e) => setFormData({ ...formData, perDayCharge: e.target.value })}
                    placeholder="1500"
                    className="h-10 rounded-xl font-mono font-bold text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Bed Count (Capacity) <span className="text-red-500">*</span></label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.bedCount}
                    onChange={(e) => handleBedCountChange(parseInt(e.target.value) || 1)}
                    className="h-10 rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Room Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val as RoomStatus })}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">🟢 Available (Vacant - Default)</SelectItem>
                      <SelectItem value="Maintenance">🟡 Under Maintenance</SelectItem>
                      <SelectItem value="Cleaning">🔵 Cleaning / Sanitizing</SelectItem>
                      <SelectItem value="Booked">🔴 Booked / Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

              {/* Custom Bed Numbers */}
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

              {/* Dynamic Extra Charges */}
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
                        <div className="w-28 shrink-0">
                          <Select
                            value={charge.unit || 'per day'}
                            onValueChange={(val) => handleUpdateExtraCharge(idx, 'unit', val)}
                          >
                            <SelectTrigger className="h-8 rounded-lg text-[10px] font-semibold bg-white border-slate-200 px-2">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per day">per day</SelectItem>
                              <SelectItem value="per shift">per shift</SelectItem>
                              <SelectItem value="one-time">one-time</SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* Delete Confirmation Modal */}
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

export default RoomsBedsTab;
