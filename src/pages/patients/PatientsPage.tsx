import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppointmentsTable } from '../../components/AppointmentsTable';
import type { HospitalOutletContextType } from '../../components/hospital/HospitalLayout';

export const PatientsPage: React.FC = () => {
  const context = useOutletContext<HospitalOutletContextType>();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-dark tracking-tight">
            Registered Patients
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Digital patient records, electronic health profile, IPD admissions, and diagnostic lab reports.
          </p>
        </div>
        <button
          onClick={() => context?.openModal?.()}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          + Register New Patient
        </button>
      </div>
      <AppointmentsTable />
    </div>
  );
};

export default PatientsPage;
