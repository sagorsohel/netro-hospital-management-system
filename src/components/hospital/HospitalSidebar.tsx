import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveModule, logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard,
  UserRoundCheck,
  CalendarCheck,
  Users,
  Building2,
  Barcode,
  BedDouble,
  ReceiptText,
  Briefcase,
  Wrench,
  PieChart,
  LogOut,
  Pill,
  Activity,
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';

interface HospitalSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const HospitalSidebar: React.FC<HospitalSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const menuItems = [
    { id: 'dashboard', label: 'HMS Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors & Roster', icon: UserRoundCheck, badge: '48' },
    { id: 'appointments', label: 'Appointments & Serials', icon: CalendarCheck, badge: '12 new' },
    { id: 'patients', label: 'Patients & Records', icon: Users },
    { id: 'diagnostics', label: 'Diagnostics & Barcode', icon: Barcode, badge: 'Lab' },
    { id: 'admissions', label: 'IPD Bed Admissions', icon: BedDouble },
    { id: 'expenses', label: 'Hospital Expenses', icon: ReceiptText },
    { id: 'hr', label: 'Staff & HR Roster', icon: Briefcase },
    { id: 'equipment', label: 'Equipment Tracking', icon: Wrench },
    { id: 'shareholders', label: 'Shareholder Reports', icon: PieChart, badge: 'Read-only' },
  ];

  return (
    <aside className="w-68 bg-dark text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none overflow-hidden z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/40">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              NETRO <span className="text-sky-300 font-semibold text-[10px] px-1.5 py-0.2 rounded-full bg-secondary/40 border border-secondary">HMS</span>
            </h1>
            <p className="text-[11px] text-slate-400">Core Hospital System</p>
          </div>
        </div>
      </div>

      {/* Module Switcher Quick Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2 shrink-0">
        <button
          onClick={() => dispatch(setActiveModule('pharmacy'))}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-emerald-300 border border-primary/40 text-xs font-semibold transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Switch to Pharmacy POS</span>
          </div>
          <ArrowLeftRight className="h-3 w-3 text-emerald-400 opacity-70 group-hover:opacity-100" />
        </button>

        <button
          onClick={() => dispatch(setActiveModule('selection'))}
          className="w-full text-center text-[11px] text-slate-400 hover:text-white transition-colors py-0.5 cursor-pointer"
        >
          ← Change Workspace
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Hospital Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-secondary text-white shadow-md shadow-secondary/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Logout Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60 shrink-0">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] text-slate-300 font-medium">Core HMS Live</span>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
            title="Logout"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="User"
            className="h-7 w-7 rounded-full object-cover ring-1 ring-secondary"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
              {user?.name || 'Dr. Sohel Sagor'}
              <ShieldCheck className="h-3 w-3 text-sky-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Hospital Director'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
