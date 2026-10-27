import React, { useState } from 'react';
import { X, Calendar, User, Stethoscope, DollarSign } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addAppointment } from '../store/slices/appointmentsSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: '11:00 AM',
    type: 'In-Person' as const,
    amount: '$140'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) return;

    dispatch(
      addAppointment({
        id: `APT-2026-${Math.floor(100 + Math.random() * 900)}`,
        patientName: formData.patientName,
        patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        doctorName: formData.doctorName,
        department: formData.department,
        date: formData.date,
        time: formData.time,
        status: 'Confirmed',
        type: formData.type,
        amount: formData.amount
      })
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Schedule New Appointment</h3>
            <p className="text-xs text-slate-500">Book patient consultation slot</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                required
                placeholder="e.g. Maria Gonzalez"
                className="pl-9"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Doctor
              </label>
              <select
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.doctorName}
                onChange={(e) => {
                  const doc = e.target.value;
                  let dept = 'Cardiology';
                  if (doc.includes('Chen')) dept = 'Neurology';
                  if (doc.includes('Taylor')) dept = 'Pediatrics';
                  if (doc.includes('Wilson')) dept = 'Orthopedics';
                  setFormData({ ...formData, doctorName: doc, department: dept });
                }}
              >
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson (Cardiology)</option>
                <option value="Dr. Michael Chen">Dr. Michael Chen (Neurology)</option>
                <option value="Dr. Emily Taylor">Dr. Emily Taylor (Pediatrics)</option>
                <option value="Dr. James Wilson">Dr. James Wilson (Orthopedics)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultation Type
              </label>
              <select
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="In-Person">In-Person</option>
                <option value="Telehealth">Telehealth</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date
              </label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Time Slot
              </label>
              <Input
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm & Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
