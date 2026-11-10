import React, { useState } from 'react';
import {
  Bed,
  Scissors,
  FlaskConical,
  Building,
  CreditCard,
  Shield,
  Settings as SettingsIcon,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { RoomsBedsTab } from './tabs/RoomsBedsTab';
import { OperationsTab } from './tabs/OperationsTab';
import { TestsTab } from './tabs/TestsTab';
import { GeneralTab } from './tabs/GeneralTab';
import { BillingTab } from './tabs/BillingTab';
import { SecurityTab } from './tabs/SecurityTab';
import { UsersRBACTab } from './tabs/UsersRBACTab';
import { SMSGatewayTab } from './tabs/SMSGatewayTab';

type SettingsTab =
  | 'rooms'
  | 'operations'
  | 'tests'
  | 'general'
  | 'billing'
  | 'security'
  | 'users'
  | 'sms';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('rooms');

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Navigation Tabs */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Hospital Administration & System Preferences</span>
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight">
            Hospital Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hospital wards & beds, surgical operations catalog, diagnostic test rates, and tariffs.
          </p>
        </div>

        {/* Tab Pill Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'rooms'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Bed className="h-4 w-4" />
            <span>Rooms & Beds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'operations'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Scissors className="h-4 w-4" />
            <span>Operations Manage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tests'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>Tests Manage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'general'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Hospital Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Billing Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Users & RBAC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'sms'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>SMS Gateway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-dark hover:bg-white/60'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </button>
        </div>
      </div>

      {/* 2. Active Tab Content Rendering */}
      <div>
        {activeTab === 'rooms' && <RoomsBedsTab />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'tests' && <TestsTab />}
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'users' && <UsersRBACTab />}
        {activeTab === 'sms' && <SMSGatewayTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
