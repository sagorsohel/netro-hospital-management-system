import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { AppointmentsTable } from './components/AppointmentsTable';
import { DoctorsList } from './components/DoctorsList';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { Activity } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfbf6] font-sans text-dark">
      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenModal={() => setIsModalOpen(true)} />

        <main className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary via-primary-hover to-secondary rounded-2xl p-7 text-white shadow-lg shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <Activity className="h-3.5 w-3.5 text-cream" />
                <span>Netro Hospital Healthcare Management</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Hospital Administration System</h2>
              <p className="text-cream/90 text-sm mt-1 max-w-xl">
                Unified operations dashboard for doctors, active patient intake, appointments, and hospital performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">99.8%</div>
                <div className="text-[11px] text-white/80">Uptime</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-24">
                <div className="text-xl font-bold text-cream">12 min</div>
                <div className="text-[11px] text-white/80">Avg. Response</div>
              </div>
            </div>
          </div>

          {/* KPI Statistics */}
          <StatsCards />

          {/* Main Grid: Appointments & Doctors */}
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

export default App;
