import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveModule, logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  PackagePlus,
  AlertOctagon,
  Users2,
  Bike,
  GitBranch,
  BarChart3,
  Building2,
  LogOut,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PharmacySidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const PharmacySidebar: React.FC<PharmacySidebarProps> = ({ currentTab, setCurrentTab }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const menuItems = [
    { id: 'dashboard', label: 'Pharmacy Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, badge: 'Counter' },
    { id: 'inventory', label: 'Multi-Unit Stock', icon: Boxes, badge: 'Live' },
    { id: 'purchases', label: 'Stock-In & Purchases', icon: PackagePlus },
    { id: 'alerts', label: 'Expiry & Low Stock', icon: AlertOctagon, badge: '3 FEFO' },
    { id: 'members', label: 'Customers & Members', icon: Users2 },
    { id: 'delivery', label: 'Home Delivery & Tracking', icon: Bike },
    { id: 'branches', label: 'Multi-Branch Outlets', icon: GitBranch, badge: '2 Active' },
    { id: 'reports', label: 'Sales & Profit Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-68 bg-slate-950 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none overflow-hidden z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              NETRO <span className="text-emerald-300 font-semibold text-[10px] px-1.5 py-0.2 rounded-full bg-primary/40 border border-primary">PHARMA</span>
            </h1>
            <p className="text-[11px] text-slate-400">Inventory & POS System</p>
          </div>
        </div>
      </div>

      {/* Module Switcher Quick Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2 shrink-0">
        <button
          onClick={() => {
            dispatch(setActiveModule('hospital'));
            navigate('/dashboard');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-sky-300 border border-secondary/40 text-xs font-semibold transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Switch to Core HMS</span>
          </div>
          <ArrowLeftRight className="h-3 w-3 text-sky-400 opacity-70 group-hover:opacity-100" />
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
          Pharmacy Operations
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
                  ? 'bg-primary text-white shadow-md shadow-primary/30 font-semibold'
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
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge.includes('FEFO')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Branch & User Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950 shrink-0">
        {/* Branch Selector Pill */}
        <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <div className="text-[11px] font-semibold text-slate-200">Main Hospital Pharmacy</div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
            Outlet #1
          </span>
        </div>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[11px] text-slate-300 font-medium">POS Online</span>
          </div>
          <button
            onClick={() => dispatch(logout())}
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
            className="h-7 w-7 rounded-full object-cover ring-1 ring-primary"
          />
          <div className="text-left overflow-hidden">
            <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
              {user?.name || 'Dr. Sohel Sagor'}
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400 truncate">Super Admin / Pharmacist</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
