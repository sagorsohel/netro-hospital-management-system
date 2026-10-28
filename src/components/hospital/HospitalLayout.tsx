import React, { useState } from 'react';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader } from './HospitalHeader';
import { StatsCards } from '../StatsCards';
import { AppointmentsTable } from '../AppointmentsTable';
import { DoctorsList } from '../DoctorsList';
import { NewAppointmentModal } from '../NewAppointmentModal';
import { Activity, Building2, Barcode, BedDouble, CalendarCheck } from 'lucide-react';

export const HospitalLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfbf6] font-sans text-dark">
      {/* Fixed Left Hospital Sidebar Navigation */}
      <HospitalSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Scrollable Right Hospital Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <HospitalHeader onOpenModal={() => setIsModalOpen(true)} />

        <main
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-secondary via-secondary-hover to-slate-900 rounded-2xl p-7 text-white shadow-lg shadow-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <Building2 className="h-3.5 w-3.5 text-cream" />
                <span>Core Hospital Administration & Clinical Suite</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Hospital Management System (HMS)</h2>
              <p className="text-cream/90 text-sm mt-1 max-w-xl">
                Central patient registration, barcoded diagnostic labs, indoor bed allocation, and automated doctor queue serials.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">84%</div>
                <div className="text-[11px] text-white/80">Bed Occupancy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">48 Active</div>
                <div className="text-[11px] text-white/80">On-Duty Doctors</div>
              </div>
            </div>
          </div>

          {/* Quick Feature Badges (Proposal Alignment) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-sky-50 text-secondary flex items-center justify-center shrink-0">
                <Barcode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Barcoded Lab Billing</h4>
                <p className="text-[11px] text-slate-500">Fast test tracking & auto SMS notification</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Doctor Serials & Queue</h4>
                <p className="text-[11px] text-slate-500">Live booking with date & time confirmation</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">IPD Admission & Beds</h4>
                <p className="text-[11px] text-slate-500">Daily room charges & OT billing tracking</p>
              </div>
            </div>
          </div>

          {/* Hospital KPI Statistics Cards */}
          <StatsCards />

          {/* Appointments Table & Doctors List */}
          <div className="space-y-8">
            <AppointmentsTable />
            <DoctorsList />
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
