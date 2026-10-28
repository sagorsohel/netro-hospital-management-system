import React from 'react';
import { BarChart3, Download, TrendingUp } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const metrics = [
    { title: 'Monthly Admissions', value: '1,420', change: '+8.4%', period: 'vs last month' },
    { title: 'Bed Occupancy Rate', value: '88.5%', change: '+3.2%', period: 'vs last month' },
    { title: 'Consultation Volume', value: '4,890', change: '+12.1%', period: 'vs last month' },
    { title: 'Avg. Patient Length of Stay', value: '3.4 Days', change: '-0.5 days', period: 'improved' },
  ];

  const reportFiles = [
    { name: 'Monthly_Hospital_Operations_October_2026.pdf', size: '2.4 MB', date: 'Oct 28, 2026' },
    { name: 'Clinical_Outcomes_and_Department_Efficiency_Q3.pdf', size: '4.1 MB', date: 'Oct 25, 2026' },
    { name: 'Financial_Revenue_and_Diagnostic_Invoicing_Summary.xlsx', size: '1.2 MB', date: 'Oct 20, 2026' },
    { name: 'Departmental_Bed_Turnover_and_Sterilization_Log.csv', size: '740 KB', date: 'Oct 18, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-dark tracking-tight">
            Reports & Hospital Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational KPIs, patient turnover metrics, departmental revenue, and statutory health reports.
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export All Reports
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/90">
            <span className="text-xs font-medium text-slate-400">{m.title}</span>
            <div className="text-2xl font-black text-dark mt-2">{m.value}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {m.change} <span className="text-slate-400 font-normal">({m.period})</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/90">
        <h3 className="text-sm font-bold text-dark mb-4">Generated Operational Documents</h3>
        <div className="space-y-3">
          {reportFiles.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark">{f.name}</h4>
                  <p className="text-[10px] text-slate-400">Generated on {f.date} • {f.size}</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1">
                <Download className="h-3 w-3 text-slate-500" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
