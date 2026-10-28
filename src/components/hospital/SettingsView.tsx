import React from 'react';
import { Settings, Shield, Bell, Database, Globe, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-dark tracking-tight">
            Hospital System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hospital profile configuration, emergency hotline, localization, security, and backup privileges.
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5">
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-dark">Hospital Facility Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Hospital Legal Name</label>
              <Input defaultValue="Netro Specialized Hospital Ltd." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Registration / License Code</label>
              <Input defaultValue="DGHS-DH-2026-991" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">24/7 Emergency Hotline</label>
              <Input defaultValue="+880 1800-NETRO-99" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Official Contact Email</label>
              <Input defaultValue="emergency@netrohospital.com" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Physical Address</label>
              <Input defaultValue="House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh" />
            </div>
          </div>
        </div>

        {/* Right Column: Security & Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-bold text-dark">Security & Audits</h3>
            </div>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                <span>Two-Factor Authentication</span>
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
              </label>
              <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                <span>Role-Based Access (RBAC)</span>
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
              </label>
              <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                <span>Automatic Session Timeout</span>
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-dark">Database & Cloud Backups</h3>
            </div>
            <p className="text-xs text-slate-500">
              PostgreSQL Neon DB automatically snapshots daily at 02:00 AM UTC.
            </p>
            <button className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors">
              Trigger Manual Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
