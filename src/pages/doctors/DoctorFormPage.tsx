import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  Phone,
  DoorOpen,
  DollarSign,
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  Upload,
  AlertCircle,
  Save,
  Check,
} from 'lucide-react';
import {
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useUploadDoctorImageMutation,
} from '../../store/api/doctorApi';
import { useGetDepartmentsQuery } from '../../store/api/departmentApi';
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

const ALL_DAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const DoctorFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // APIs
  const { data: doctorData, isLoading: isLoadingDoctor } = useGetDoctorByIdQuery(
    id as string,
    { skip: !isEditing }
  );
  const { data: deptData } = useGetDepartmentsQuery({ limit: 100 });
  const [createDoctor, { isLoading: isCreating }] = useCreateDoctorMutation();
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadDoctorImageMutation();

  const departmentsList = deptData?.data || [];

  // Form States
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [department, setDepartment] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('5 Years');
  const [isHead, setIsHead] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [serialContactNumber, setSerialContactNumber] = useState('');
  const [firstVisitFee, setFirstVisitFee] = useState('1000');
  const [secondVisitFee, setSecondVisitFee] = useState('500');
  const [dailyPatientLimit, setDailyPatientLimit] = useState(30);
  const [consultationStartTime, setConsultationStartTime] = useState('05:00 PM');
  const [consultationEndTime, setConsultationEndTime] = useState('09:00 PM');
  const [reportConsultationTime, setReportConsultationTime] = useState('06:00 PM - 07:00 PM');
  const [availableDays, setAvailableDays] = useState<string[]>([
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ]);
  const [offDays, setOffDays] = useState('Friday');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'On Leave'>('Active');
  const [error, setError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');

  // Prefill when editing
  useEffect(() => {
    if (isEditing && doctorData?.data) {
      const doc = doctorData.data;
      setName(doc.name || '');
      setDepartmentId(doc.departmentId || '');
      setDepartment(doc.department || '');
      setSpecialty(doc.specialty || '');
      setExperience(doc.experience || '5 Years');
      setIsHead(Boolean(doc.isHead));
      setContactNumber(doc.contactNumber || '');
      setRoomNumber(doc.roomNumber || '');
      setSerialContactNumber(doc.serialContactNumber || '');
      setFirstVisitFee(doc.firstVisitFee ? String(doc.firstVisitFee) : '1000');
      setSecondVisitFee(doc.secondVisitFee ? String(doc.secondVisitFee) : '500');
      setDailyPatientLimit(doc.dailyPatientLimit || 30);
      setConsultationStartTime(doc.consultationStartTime || '05:00 PM');
      setConsultationEndTime(doc.consultationEndTime || '09:00 PM');
      setReportConsultationTime(doc.reportConsultationTime || '06:00 PM - 07:00 PM');
      if (Array.isArray(doc.availableDays) && doc.availableDays.length > 0) {
        setAvailableDays(doc.availableDays);
      }
      setOffDays(doc.offDays || 'Friday');
      setImage(doc.image || '');
      setEmail(doc.email || '');
      setStatus(doc.status || 'Active');
    }
  }, [isEditing, doctorData]);

  // Handle department select
  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    const selected = departmentsList.find((d) => d.id === deptId);
    if (selected) {
      setDepartment(selected.name);
    }
  };

  // Toggle day in available days
  const handleToggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  // Handle image upload to Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadNotice('Uploading doctor photograph...');
      setError('');
      const res = await uploadImage(formData).unwrap();
      if (res.success && res.url) {
        setImage(res.url);
        setUploadNotice('Photograph uploaded successfully!');
        setTimeout(() => setUploadNotice(''), 3000);
      } else {
        throw new Error(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Error uploading photo');
      setUploadNotice('');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError("Please enter the doctor's full name.");
      return;
    }

    if (!department.trim()) {
      setError('Please select or assign a department.');
      return;
    }

    const payload = {
      name: name.trim(),
      departmentId: departmentId || undefined,
      department: department.trim(),
      specialty: specialty.trim(),
      experience: experience.trim(),
      isHead,
      contactNumber: contactNumber.trim(),
      roomNumber: roomNumber.trim(),
      serialContactNumber: serialContactNumber.trim(),
      firstVisitFee,
      secondVisitFee,
      dailyPatientLimit: Number(dailyPatientLimit) || 30,
      consultationStartTime: consultationStartTime.trim(),
      consultationEndTime: consultationEndTime.trim(),
      reportConsultationTime: reportConsultationTime.trim(),
      availableDays,
      offDays: offDays.trim(),
      image: image || undefined,
      email: email.trim() || undefined,
      status,
    };

    try {
      if (isEditing && id) {
        await updateDoctor({ id, data: payload }).unwrap();
      } else {
        await createDoctor(payload).unwrap();
      }
      navigate('/doctors');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to save doctor profile');
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isEditing && isLoadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading doctor record...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctors"
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Doctors List"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-dark tracking-tight">
              {isEditing ? `Edit Doctor: ${name || 'Specialist'}` : 'Add New Doctor Profile'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure specialist credentials, department affiliation, room numbers, visit fees, and live consultation hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/doctors"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            form="doctor-form"
            disabled={isSaving || isUploading}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Update Doctor Profile' : 'Save & Register Doctor'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-accent text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form id="doctor-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Doctor Profile & Department */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-dark">Personal Credentials & Department</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Doctor Full Name <span className="text-accent">*</span>
              </Label>
              <Input
                placeholder="e.g. Dr. Md. Rafiqul Islam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Department Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Assigned Department <span className="text-accent">*</span>
              </Label>
              {departmentsList.length > 0 ? (
                <Select
                  value={departmentId}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select hospital department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsList.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} {d.floor ? `(${d.floor})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="e.g. Cardiology"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Specialty / Designation */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Specialty & Designation
              </Label>
              <Input
                placeholder="e.g. Senior Consultant, Interventional Cardiologist"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Clinical Experience
              </Label>
              <Input
                placeholder="e.g. 12 Years, MBBS, FCPS"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            {/* Head of Department or Not (Radio as specified) */}
            <div className="space-y-2 md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Label className="text-xs font-bold text-dark block">
                Is this Doctor the Head of Department? <span className="text-accent">*</span>
              </Label>
              <p className="text-[11px] text-slate-400">
                Head of Department has clinical leadership privileges and is highlighted on department rosters.
              </p>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isHeadRadio"
                    checked={isHead === true}
                    onChange={() => setIsHead(true)}
                    className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Yes (Department Head)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isHeadRadio"
                    checked={isHead === false}
                    onChange={() => setIsHead(false)}
                    className="h-4 w-4 text-slate-400 focus:ring-primary cursor-pointer"
                  />
                  <span>No (Consultant / Specialist)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact, Room & Serial Numbers */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="h-4 w-4 text-secondary" />
            <h3 className="text-sm font-bold text-dark">Contact & Room Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Consultation Room Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                Room / Chamber Number
              </Label>
              <Input
                placeholder="e.g. Room 402 (4th Floor)"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>

            {/* Direct Contact Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Doctor's Direct Contact
              </Label>
              <Input
                placeholder="e.g. +880 1712-345678"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            {/* Serial / Hotline Contact Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Serial / Appointment Contact Number
              </Label>
              <Input
                placeholder="e.g. +880 1800-HOTLINE-1"
                value={serialContactNumber}
                onChange={(e) => setSerialContactNumber(e.target.value)}
              />
            </div>

            {/* Doctor Email */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Official Email (Optional)
              </Label>
              <Input
                type="email"
                placeholder="e.g. dr.rafiqul@netrohospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Duty Status
              </Label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active (On Duty)</SelectItem>
                  <SelectItem value="On Leave">On Leave / Vacation</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 3: Visit Fees & Daily Patient Limit */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-dark">Consultation Fees & Patient Intake Limit</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1st Visit Fee */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                1st Visit Consultation Fee (৳ / $) <span className="text-accent">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="1000"
                  value={firstVisitFee}
                  onChange={(e) => setFirstVisitFee(e.target.value)}
                  className="font-bold font-mono text-dark"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400">Standard initial consultation charge.</p>
            </div>

            {/* 2nd Visit Fee */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                2nd Visit / Follow-up Fee (৳ / $) <span className="text-accent">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="500"
                  value={secondVisitFee}
                  onChange={(e) => setSecondVisitFee(e.target.value)}
                  className="font-bold font-mono text-dark"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400">Discounted return visit within 30 days.</p>
            </div>

            {/* Daily Patient Limit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Max Patients Per Day <span className="text-accent">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="30"
                  value={dailyPatientLimit}
                  onChange={(e) => setDailyPatientLimit(Number(e.target.value))}
                  className="font-bold font-mono text-dark"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400">Serial token booking stops when limit is reached.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Timings & Sitting Schedule */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-dark">Duty Timings & Weekly Sitting Days</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Consultation Start Time */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Consultation Start Time <span className="text-accent">*</span>
              </Label>
              <Input
                placeholder="e.g. 05:00 PM"
                value={consultationStartTime}
                onChange={(e) => setConsultationStartTime(e.target.value)}
                required
              />
            </div>

            {/* Consultation End Time */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Consultation End Time <span className="text-accent">*</span>
              </Label>
              <Input
                placeholder="e.g. 09:00 PM"
                value={consultationEndTime}
                onChange={(e) => setConsultationEndTime(e.target.value)}
                required
              />
            </div>

            {/* Report Consultation Time */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Report Consultation Time Slot
              </Label>
              <Input
                placeholder="e.g. 06:00 PM - 07:00 PM"
                value={reportConsultationTime}
                onChange={(e) => setReportConsultationTime(e.target.value)}
              />
            </div>

            {/* Available Sitting Days */}
            <div className="space-y-2 md:col-span-2 pt-2">
              <Label className="text-xs font-bold text-dark block">
                Available Sitting Days (Kon Kon Din Bose)
              </Label>
              <p className="text-[11px] text-slate-400">
                Click to toggle days when this doctor is available for consultations.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_DAYS.map((day) => {
                  const isSelected = availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      <span>{day}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Off Day / Holiday */}
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-slate-700">
                Off Day / Holiday (Kon Din Chuti)
              </Label>
              <Input
                placeholder="e.g. Friday"
                value={offDays}
                onChange={(e) => setOffDays(e.target.value)}
              />
              <p className="text-[10px] text-slate-400">Default weekly closure day.</p>
            </div>
          </div>
        </div>

        {/* Section 5: Doctor Photograph Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Upload className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-dark">Doctor Profile Photograph</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Image Preview Box */}
            <div className="h-24 w-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {image ? (
                <img src={image} alt="Doctor" className="h-full w-full object-cover" />
              ) : (
                <Stethoscope className="h-10 w-10 text-slate-300" />
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-2 flex-1">
              <label className="inline-block px-4 py-2 rounded-xl border border-slate-200 hover:border-primary/40 bg-slate-50 hover:bg-emerald-50/50 text-slate-700 hover:text-primary text-xs font-semibold cursor-pointer transition-all">
                <span>{isUploading ? 'Uploading to Cloudinary...' : 'Upload Doctor Photograph'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <p className="text-[11px] text-slate-400">
                JPEG, PNG or WebP format up to 5MB. Hosted securely on Cloudinary CDN.
              </p>
              {uploadNotice && (
                <p className="text-xs text-emerald-600 font-semibold">{uploadNotice}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100/90 shadow-xs flex items-center justify-end gap-3">
          <Link
            to="/doctors"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving Doctor Record...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Confirm & Register Doctor'}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorFormPage;
