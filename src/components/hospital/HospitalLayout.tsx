import React from "react";
import { Outlet } from "react-router-dom";
import { HospitalSidebar } from "./HospitalSidebar";
import { HospitalHeader } from "./HospitalHeader";

export const HospitalLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-dark flex flex-col gap-4 font-sans select-none">
      {/* 1. Ultra Clean Top Floating Navigation Bar - Fixed */}
      <HospitalHeader />

      {/* 2. Main Content Canvas: Fixed Sidebar + Scrollable Content */}
      <div className="flex-1 flex gap-4 lg:gap-5 items-stretch min-h-0 overflow-hidden">
        {/* Left Fixed Floating Rounded Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <HospitalSidebar />
        </div>

        {/* Right Scrollable Dashboard Canvas - Content Scrolls smoothly via Outlet */}
        <main
          className="flex-1 h-full overflow-y-auto no-scrollbar pr-1 pb-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
