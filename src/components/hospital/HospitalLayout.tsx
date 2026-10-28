import React, { useState } from 'react';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader } from './HospitalHeader';
import { HospitalDashboardView } from './HospitalDashboardView';
import { AppointmentsTable } from '../AppointmentsTable';
import { DoctorsList } from '../DoctorsList';
import { NewAppointmentModal } from '../NewAppointmentModal';
import { useAppDispatch } from '../../store/hooks';
import { setActiveModule } from '../../store/slices/authSlice';

export const HospitalLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleTabChange = (tab: string) => {
    if (tab === 'pharmacy') {
      dispatch(setActiveModule('pharmacy'));
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-dark flex flex-col p-3 sm:p-5 lg:p-6 gap-4 font-sans select-none">
      {/* 1. Ultra Clean Top Floating Navigation Bar - Fixed */}
      <HospitalHeader onOpenModal={() => setIsModalOpen(true)} />

      {/* 2. Main Content Canvas: Fixed Sidebar + Scrollable Content */}
      <div className="flex-1 flex gap-4 lg:gap-5 items-stretch min-h-0 overflow-hidden">
        {/* Left Fixed Floating Rounded Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <HospitalSidebar currentTab={currentTab} setCurrentTab={handleTabChange} />
        </div>

        {/* Right Scrollable Dashboard Canvas - Content Scrolls smoothly */}
        <main
          className="flex-1 h-full overflow-y-auto no-scrollbar pr-1 pb-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >

          {currentTab === 'dashboard' && (
            <HospitalDashboardView
              onOpenNewAppointment={() => setIsModalOpen(true)}
              onOpenRegisterPatient={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'doctors' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-dark">Doctors & Clinical Roster</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live schedule, department roster, and patient queues.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Add Doctor Schedule
                </button>
              </div>
              <DoctorsList />
            </div>
          )}

          {currentTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-dark">Appointments & Serials</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time doctor appointment queue with SMS & barcode confirmation.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Book Appointment
                </button>
              </div>
              <AppointmentsTable />
            </div>
          )}

          {currentTab === 'patients' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-dark">Registered Patients</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Digital health profile, IPD admissions, and diagnostic lab reports.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Register New Patient
                </button>
              </div>
              <AppointmentsTable />
            </div>
          )}

          {currentTab === 'billing' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center space-y-3">
              <h3 className="text-lg font-bold text-dark">Diagnostic & IPD Billing</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Barcoded billing, itemized bed charges, lab test invoices, and automated patient receipts.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {['reports', 'settings'].includes(currentTab) && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center space-y-3">
              <h3 className="text-lg font-bold text-dark capitalize">{currentTab} Overview</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hospital management analytics, department performance, and administrative privileges.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Appointment / Register Patient Modal */}
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
