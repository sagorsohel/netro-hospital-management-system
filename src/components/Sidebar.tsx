import React from 'react';
import {
  LayoutDashboard,
  UserRoundCheck,
  CalendarCheck,
  Users,
  Building2,
  Pill,
  CreditCard,
  Settings,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: UserRoundCheck, badge: '48' },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck, badge: '12 new' },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-dark text-white flex flex-col min-h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            NETRO <span className="text-cream font-semibold text-xs px-2 py-0.5 rounded-full bg-primary/30 border border-primary">HMS</span>
          </h1>
          <p className="text-xs text-slate-400">Hospital Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-secondary'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-secondary text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-secondary ${
            currentTab === 'settings' ? 'bg-slate-800 text-white' : ''
          }`}
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span>System Settings</span>
        </button>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium">Server Online (v1.0.0)</span>
        </div>
      </div>
    </aside>
  );
};
