import React from 'react';
import { Search, Bell, Plus, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HeaderProps {
  onOpenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
        <Input
          placeholder="Search patients, doctors, appointments..."
          className="pl-9 bg-slate-50/70 border-slate-200 focus:bg-white focus:border-primary text-dark"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onOpenModal}
          variant="default"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Appointment</span>
        </Button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-600 hover:text-secondary hover:bg-cream/40 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Admin"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-dark flex items-center gap-1">
              Dr. Sohel Sagor
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xs text-slate-500">Hospital Director</div>
          </div>
        </div>
      </div>
    </header>
  );
};
