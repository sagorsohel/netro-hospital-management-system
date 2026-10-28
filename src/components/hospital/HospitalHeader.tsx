import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Building2, Pill, ArrowLeftRight, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveModule, logout } from '../../store/slices/authSlice';

interface HospitalHeaderProps {
  onOpenModal: () => void;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({ onOpenModal }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
      {/* Search Bar & Workspace Badge */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">
          <Building2 className="h-3.5 w-3.5" />
          <span>Core Hospital System</span>
        </div>

        <div className="relative w-64 sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search patients, doctors, admissions, bills..."
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-secondary text-xs sm:text-sm text-dark rounded-xl"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Switch Module Quick Button */}
        <Button
          onClick={() => dispatch(setActiveModule('pharmacy'))}
          variant="outline"
          className="h-9 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 gap-1.5 cursor-pointer rounded-xl"
        >
          <Pill className="h-3.5 w-3.5 text-primary" />
          <span className="hidden md:inline">Go to Pharmacy POS</span>
          <ArrowLeftRight className="h-3 w-3 opacity-60" />
        </Button>

        {/* New Appointment Button */}
        <Button
          onClick={onOpenModal}
          variant="default"
          className="h-9 px-3.5 text-xs font-semibold bg-secondary hover:bg-secondary-hover text-white gap-1.5 shadow-sm rounded-xl cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Appointment</span>
        </Button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative p-2 rounded-xl text-slate-600 hover:text-secondary hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Info & Quick Logout */}
        <div className="flex items-center gap-2">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-secondary/30"
          />
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
            title="লগআউট"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
