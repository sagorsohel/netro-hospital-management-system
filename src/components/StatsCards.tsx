import React from 'react';
import { Users, UserCheck, CalendarDays, DollarSign, ArrowUpRight, Bed } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { Card, CardContent } from './ui/card';

export const StatsCards: React.FC = () => {
  const stats = useAppSelector((state) => state.stats);

  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      subtext: stats.patientsTrend,
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600"
    },
    {
      title: "Available Doctors",
      value: stats.availableDoctors.toString(),
      subtext: stats.doctorsTrend,
      icon: UserCheck,
      color: "from-emerald-600 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      subtext: stats.appointmentsTrend,
      icon: CalendarDays,
      color: "from-violet-600 to-purple-600",
      iconBg: "bg-purple-50 text-purple-600"
    },
    {
      title: "Hospital Revenue",
      value: stats.hospitalRevenue,
      subtext: stats.revenueTrend,
      icon: DollarSign,
      color: "from-amber-600 to-orange-600",
      iconBg: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>{card.subtext}</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
