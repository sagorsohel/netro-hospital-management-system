import React from 'react';
import { Search, Bell, Settings, Activity } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

interface HospitalHeaderProps {
  onOpenModal?: () => void;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="w-full bg-white rounded-2xl px-6 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Brand Logo & Medical Cross */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#EAF8F0] text-primary flex items-center justify-center font-black shadow-xs">
          <Activity className="h-5 w-5 text-primary stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black tracking-tight text-dark">Netro</span>
          <span className="text-lg font-bold tracking-tight text-primary">Hospital</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointments, doctors, patients, records..."
            className="w-full pl-11 pr-4 py-2 bg-[#F8FAFC] hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-full text-xs sm:text-sm text-dark placeholder:text-slate-400 transition-all outline-hidden"
          />
        </div>
      </div>

      {/* Right Controls: Settings, Notifications, Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Settings Button */}
        <button
          type="button"
          title="Hospital Settings"
          className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Notifications with alert dot */}
        <button
          type="button"
          title="Notifications"
          className="relative h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-dark hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1594824813589-9a25ab8a4c17?w=120&auto=format&fit=crop&q=80'
            }
            alt={user?.name || 'Admin User'}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shadow-xs"
          />
        </div>
      </div>
    </header>
  );
};
