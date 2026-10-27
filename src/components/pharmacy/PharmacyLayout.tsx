import React, { useState } from 'react';
import { PharmacySidebar } from './PharmacySidebar';
import { PharmacyHeader } from './PharmacyHeader';
import { PharmacyDashboard } from './PharmacyDashboard';

export const PharmacyLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans text-dark">
      {/* Fixed Left Pharmacy Navigation Sidebar */}
      <PharmacySidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Scrollable Right Pharmacy Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <PharmacyHeader />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <PharmacyDashboard />
        </main>
      </div>
    </div>
  );
};
