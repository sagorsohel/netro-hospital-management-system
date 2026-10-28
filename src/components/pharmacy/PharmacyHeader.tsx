import React from 'react';
import { Search, Bell, ShoppingCart, Building2, ArrowLeftRight, LogOut, Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveModule, logout } from '../../store/slices/authSlice';

interface PharmacyHeaderProps {
  onOpenQuickSale?: () => void;
}

export const PharmacyHeader: React.FC<PharmacyHeaderProps> = ({ onOpenQuickSale }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
      {/* Search Bar & Workspace Badge */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-emerald-800 text-xs font-semibold">
          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
          <span>Pharmacy & POS Operations</span>
        </div>

        <div className="relative w-64 sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search medicine by name, generic, barcode..."
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary text-xs sm:text-sm text-dark rounded-xl"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Switch Module Quick Button */}
        <Button
          onClick={() => dispatch(setActiveModule('hospital'))}
          variant="outline"
          className="h-9 px-3 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-300 gap-1.5 cursor-pointer rounded-xl"
        >
          <Building2 className="h-3.5 w-3.5 text-secondary" />
          <span className="hidden md:inline">Go to Core HMS</span>
          <ArrowLeftRight className="h-3 w-3 opacity-60" />
        </Button>

        {/* Quick Sale Button */}
        <Button
          onClick={onOpenQuickSale}
          variant="default"
          className="h-9 px-3.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5 shadow-sm rounded-xl cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New POS Sale</span>
        </Button>

        {/* Expiry / Low Stock Alert Notifications */}
        <button
          title="3 FEFO Expiry Alerts"
          className="relative p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Info & Quick Logout */}
        <div className="flex items-center gap-2">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
          />
          <button
            onClick={() => dispatch(logout())}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
