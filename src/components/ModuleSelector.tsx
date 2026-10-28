import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveModule, logout } from '../store/slices/authSlice';
import {
  Building2,
  Pill,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Layers,
  Sparkles,
  Barcode,
  CalendarCheck,
  Receipt,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Button } from './ui/button';

export const ModuleSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background Lighting */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-secondary/25 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">NETRO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/30 text-emerald-300 border border-primary/40">
                ECOSYSTEM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Integrated Healthcare Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/40"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center gap-1">
                {user?.name || 'Dr. Sohel Sagor'}
                <ShieldCheck className="h-3 w-3 text-primary" />
              </div>
              <div className="text-[10px] text-slate-400">{user?.role || 'Hospital Director'}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => dispatch(logout())}
            className="text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-1.5 cursor-pointer px-3 py-1.5 h-auto rounded-lg"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center relative z-10">
        {/* Header Heading */}
        <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/20 text-emerald-300 border border-primary/30 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Login Successful • Select Your Module</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Which System Would You Like to Access?
          </h2>
          <p className="text-sm text-slate-300">
            Select one of the modules below to enter your workspace. You can switch modules at any time from your profile.
          </p>
        </div>

        {/* 2 Big Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Core Hospital Management */}
          <div
            onClick={() => dispatch(setActiveModule('hospital'))}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-slate-700/80 hover:border-secondary rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Top Tag & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-secondary/20 text-sky-300 border border-secondary/40 tracking-wide uppercase">
                  Hospital Admin & Clinical
                </span>
                <div className="h-14 w-14 rounded-2xl bg-secondary/20 group-hover:bg-secondary text-sky-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-md">
                  <Building2 className="h-7 w-7" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-2">
                  Core Hospital Management (HMS)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Permanent patient digital profile, barcode lab diagnostics, IPD admission & bed charges, doctor scheduling and queue booking.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Barcode className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Barcode Diagnostic Billing & SMS Report Alerts</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CalendarCheck className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Doctor Profile & Automatic Free Serial Queue Booking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>IPD Cabin/Bed Allocation & Consolidated Billing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Hospital Expenses, HR Staff Scheduling & Asset Logs</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 mt-6 border-t border-slate-700/60">
              <Button
                variant="default"
                className="w-full bg-secondary hover:bg-secondary-hover text-white font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-secondary/30 transition-all text-sm group-hover:gap-3"
              >
                <span>Enter Core Hospital Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Card 2: Pharmacy Management & POS */}
          <div
            onClick={() => dispatch(setActiveModule('pharmacy'))}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-slate-700/80 hover:border-primary rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Top Tag & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary/20 text-emerald-300 border border-primary/40 tracking-wide uppercase">
                  Inventory & Point-of-Sale
                </span>
                <div className="h-14 w-14 rounded-2xl bg-primary/20 group-hover:bg-primary text-emerald-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-md">
                  <Pill className="h-7 w-7" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                  Pharmacy Management & POS
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Fast counter billing, multi-unit stock tracking (Carton ➔ Strip ➔ Piece), FEFO expiry alerts, WhatsApp PDF invoices & multi-branch.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Receipt className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Rapid POS Sales, Phone Registration & Receipt Printing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Multi-Unit Auto Conversion (Carton ➔ Strip ➔ Piece)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <AlertTriangle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>FEFO Expiry Notifications & Low-Stock Reminders</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Send className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Send PDF Invoices to Customer WhatsApp & SMS Summary</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 mt-6 border-t border-slate-700/60">
              <Button
                variant="default"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all text-sm group-hover:gap-3"
              >
                <span>Enter Pharmacy POS Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>As Super Administrator, you have full privileges and access to both modules.</span>
        </div>
      </main>
    </div>
  );
};
