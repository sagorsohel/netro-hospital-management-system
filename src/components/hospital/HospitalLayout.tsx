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

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-secondary via-secondary-hover to-slate-900 rounded-2xl p-7 text-white shadow-lg shadow-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <Building2 className="h-3.5 w-3.5 text-cream" />
                <span>Core Hospital Administration & Clinical Suite</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Hospital Management System (HMS)</h2>
              <p className="text-cream/90 text-sm mt-1 max-w-xl">
                সেন্ট্রাল পেশেন্ট রেজিস্ট্রেশন, বারকোড ল্যাব টেস্ট বিলিং, ইনডোর বেড বরাদ্দ ও ডাক্তারদের ফ্রি সিরিয়াল কিউ ব্যবস্থাপনা।
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">৮৪%</div>
                <div className="text-[11px] text-white/80">বেড অকুপেন্সি</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">৪৮ জন</div>
                <div className="text-[11px] text-white/80">অন-ডিউটি ডাক্তার</div>
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
                <h4 className="text-xs font-bold text-slate-800">বারকোড ল্যাব বিলিং</h4>
                <p className="text-[11px] text-slate-500">টেস্ট স্ট্যাটাস আপডেট ও স্বয়ংক্রিয় SMS</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">ফ্রি সিরিয়াল ও কিউ সিস্টেম</h4>
                <p className="text-[11px] text-slate-500">রোগীর কাছে তারিখ ও সময় কনফার্মেশন</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">IPD অ্যাডমিশন ও বেড চার্জ</h4>
                <p className="text-[11px] text-slate-500">দৈনিক ভাড়া ও ওটি বিলিং ট্র্যাকিং</p>
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
