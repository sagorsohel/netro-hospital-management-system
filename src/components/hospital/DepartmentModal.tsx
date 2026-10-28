import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
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
  Building2,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useUploadDepartmentImageMutation,
  type Department,
} from '../../store/api/departmentApi';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
}

const PRESET_ICONS = [
  { name: 'HeartPulse', label: 'Cardio', icon: HeartPulse },
  { name: 'Brain', label: 'Neuro', icon: Brain },
  { name: 'Baby', label: 'Pediatric', icon: Baby },
  { name: 'Bone', label: 'Ortho', icon: Bone },
  { name: 'Sparkles', label: 'Derma', icon: Sparkles },
  { name: 'Scan', label: 'Radiology', icon: Scan },
  { name: 'Ambulance', label: 'Emergency', icon: Ambulance },
  { name: 'HeartHandshake', label: 'Maternity', icon: HeartHandshake },
  { name: 'Stethoscope', label: 'General', icon: Stethoscope },
  { name: 'Activity', label: 'Clinical', icon: Activity },
  { name: 'Building2', label: 'Ward', icon: Building2 },
];

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
}) => {
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadDepartmentImageMutation();

  const isEditing = Boolean(department?.id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [floor, setFloor] = useState('1st Floor');
  const [roomNumber, setRoomNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedIcon, setSelectedIcon] = useState('Stethoscope');
  const [iconImageUrl, setIconImageUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');

  useEffect(() => {
    if (department) {
      setName(department.name || '');
      setDescription(department.description || '');
      setHeadOfDepartment(department.headOfDepartment || '');
      setFloor(department.floor || '1st Floor');
      setRoomNumber(department.roomNumber || '');
      setContactEmail(department.contactEmail || '');
      setContactPhone(department.contactPhone || '');
      setStatus(department.status || 'Active');
      setSelectedIcon(department.icon || 'Stethoscope');
      setIconImageUrl(department.image || '');
    } else {
      setName('');
      setDescription('');
      setHeadOfDepartment('');
      setFloor('1st Floor');
      setRoomNumber('');
      setContactEmail('');
      setContactPhone('');
      setStatus('Active');
      setSelectedIcon('Stethoscope');
      setIconImageUrl('');
    }
    setError('');
    setUploadNotice('');
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadNotice('Uploading icon to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'netro-hospital/department-icons');

      const response = await uploadImage(formData).unwrap();
      if (response.success && response.url) {
        setIconImageUrl(response.url);
        setUploadNotice('✅ Icon image uploaded to Cloudinary successfully!');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Cloudinary upload failed. Check your .env Cloudinary configuration.';
      setError(msg);
      setUploadNotice('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department Name is required.');
      return;
    }

    setError('');

    const payload: Partial<Department> = {
      name: name.trim(),
      description: description.trim(),
      headOfDepartment: headOfDepartment.trim(),
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      status,
      icon: selectedIcon,
      image: iconImageUrl.trim() || undefined,
    };

    try {
      if (isEditing && department?.id) {
        await updateDepartment({
          id: department.id,
          data: payload,
        }).unwrap();
      } else {
        await createDepartment(payload).unwrap();
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        'Failed to save department. Ensure admin authentication.'
      );
    }
  };

  const isSaving = isCreating || isUpdating;

  // Selected preset icon component helper
  const CurrentPresetIcon =
    PRESET_ICONS.find((i) => i.name === selectedIcon)?.icon || Stethoscope;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full max-w-2xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up">
        {/* 1. FIXED HEADER */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="text-xl font-black tracking-tight text-dark">
              {isEditing ? 'Edit Department' : 'Create New Department'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing
                ? 'Update clinical specialization, doctor leads, and icon.'
                : 'Configure department profile, Cloudinary icon, and location.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT BODY */}
        <form
          id="department-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-accent text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Success Alert */}
          {uploadNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-primary text-xs flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* Row 1: Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="dept-name">
                Department Name <span className="text-accent">*</span>
              </Label>
              <Input
                id="dept-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cardiology & Heart Institute"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept-status">Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as 'Active' | 'Inactive')}
              >
                <SelectTrigger id="dept-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-desc">Description</Label>
            <Textarea
              id="dept-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical scope, diagnostic lab equipment, and treatment focus..."
              rows={2}
            />
          </div>

          {/* Row 2: Head of Department & Floor / Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dept-head">Head of Department (Doctor)</Label>
              <Input
                id="dept-head"
                type="text"
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                placeholder="e.g. Dr. Sarah Johnson"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="dept-floor">Floor</Label>
                <Input
                  id="dept-floor"
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="3rd Floor"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dept-room">Room / Suite</Label>
                <Input
                  id="dept-room"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="301"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Contact Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dept-email">Contact Email</Label>
              <Input
                id="dept-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="cardio@netrohospital.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept-phone">Direct Helpline</Label>
              <Input
                id="dept-phone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          {/* Icon or Image Upload (NOT BANNER) */}
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dept-icon-upload">
                Department Icon / Image (Cloudinary)
              </Label>
              <span className="text-[10px] text-slate-400 font-normal">
                Upload image/icon or choose preset
              </span>
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
              {/* Square Icon/Image Preview */}
              <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden flex items-center justify-center shrink-0 relative">
                {iconImageUrl ? (
                  <img
                    src={iconImageUrl}
                    alt="Department Icon"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#EAF8F0] text-primary flex items-center justify-center">
                    <CurrentPresetIcon className="h-8 w-8 stroke-[2]" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Button & URL field */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-dashed border-primary/60 bg-[#EAF8F0]/60 hover:bg-[#EAF8F0] text-primary text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {isUploading
                        ? 'Uploading...'
                        : 'Upload Icon / Image to Cloudinary'}
                    </span>
                    <input
                      id="dept-icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  {iconImageUrl && (
                    <button
                      type="button"
                      onClick={() => setIconImageUrl('')}
                      className="text-xs text-slate-400 hover:text-accent font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <Input
                  type="url"
                  value={iconImageUrl}
                  onChange={(e) => setIconImageUrl(e.target.value)}
                  placeholder="Or paste direct Cloudinary icon/image URL..."
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Preset Icon Selector Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">
                Or select from medical preset icons:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = selectedIcon === item.name && !iconImageUrl;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(item.name);
                        setIconImageUrl(''); // reset custom image so preset is used
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* 3. FIXED FOOTER */}
        <div className="shrink-0 p-4 sm:p-5 px-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/70 z-10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="department-form"
            variant="default"
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span>{isEditing ? 'Update Department' : 'Create Department'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal;
