import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutGrid,
  Building2,
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Pill,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';

interface HospitalSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const HospitalSidebar: React.FC<HospitalSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  const handleSignOut = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <aside className="w-56 h-full bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between shrink-0 select-none overflow-hidden">
      {/* Navigation Menu */}
      <nav
        className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 pr-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-slate-600 hover:text-dark hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Sign Out Footer */}
      <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0">

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs ring-1 ring-primary/30 shrink-0">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              : 'RM'}
          </div>
          <div className="overflow-hidden text-left">
            <h5 className="text-xs font-bold text-dark truncate">
              {user?.name || 'Admin User'}
            </h5>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || 'admin@hospital.com'}
            </p>
          </div>
        </div>

        {/* Red Outlined Sign Out Button */}
        <button
          onClick={handleSignOut}
          type="button"
          className="w-full py-2 px-3 rounded-xl border border-accent/40 text-accent hover:bg-accent/10 transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
