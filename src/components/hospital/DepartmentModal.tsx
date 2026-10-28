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
  const [imageUrl, setImageUrl] = useState('');
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
      setImageUrl(department.image || '');
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
      setImageUrl('');
    }
    setError('');
    setUploadNotice('');
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadNotice('Uploading image to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'netro-hospital/departments');

      const response = await uploadImage(formData).unwrap();
      if (response.success && response.url) {
        setImageUrl(response.url);
        setUploadNotice('✅ Uploaded to Cloudinary successfully!');
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
      image: imageUrl.trim() || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black tracking-tight text-dark">
              {isEditing ? 'Edit Department' : 'Create New Department'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing
                ? 'Update clinical specialization, doctor leads, and facilities.'
                : 'Configure department profile, Cloudinary banner, and location.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Department Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cardiology & Heart Institute"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm text-dark placeholder:text-slate-400 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm text-dark outline-hidden bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical scope, diagnostic lab equipment, and treatment focus..."
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm text-dark placeholder:text-slate-400 outline-hidden"
            />
          </div>

          {/* Row 2: Head of Department & Floor / Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Head of Department (Doctor)
              </label>
              <input
                type="text"
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                placeholder="e.g. Dr. Sarah Johnson"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm text-dark placeholder:text-slate-400 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Floor</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="3rd Floor"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-dark placeholder:text-slate-400 outline-hidden"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Room / Suite</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="301"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-dark placeholder:text-slate-400 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Contact Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="cardio@netrohospital.com"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-dark placeholder:text-slate-400 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Direct Helpline</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs text-dark placeholder:text-slate-400 outline-hidden"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Choose Department Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloudinary Image & Banner Upload */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Department Image / Banner (Cloudinary)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Supported: PNG, JPG, WebP
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Image Preview Box */}
              <div className="h-20 w-32 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Input & URL fallback */}
              <div className="flex-1 w-full space-y-2">
                <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-primary/50 bg-[#EAF8F0]/50 hover:bg-[#EAF8F0] text-primary text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading to Cloudinary...' : 'Upload Image to Cloudinary'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste direct Cloudinary / Image URL..."
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 focus:border-primary text-xs text-dark placeholder:text-slate-400 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm shadow-primary/25 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Department' : 'Create Department'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
