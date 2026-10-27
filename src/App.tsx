import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { AppointmentsTable } from './components/AppointmentsTable';
import { DoctorsList } from './components/DoctorsList';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { Activity, ShieldAlert, Award, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-900">
      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenModal={() => setIsModalOpen(true)} />

        <main className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-7 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <Activity className="h-3.5 w-3.5 text-cyan-300" />
                <span>Netro Hospital Operational Dashboard</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Hospital Administration System</h2>
              <p className="text-blue-100 text-sm mt-1 max-w-xl">
                Unified overview of hospital departments, doctor availability, live patient intake, and digital consultations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
                <div className="text-xl font-bold">99.8%</div>
                <div className="text-[11px] text-blue-200">ICU Uptime</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center">
                <div className="text-xl font-bold">12 min</div>
                <div className="text-[11px] text-blue-200">Avg. Wait Time</div>
              </div>
            </div>
          </div>

          {/* KPI Statistics */}
          <StatsCards />

          {/* Main Grid: Appointments & Side Widgets */}
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
