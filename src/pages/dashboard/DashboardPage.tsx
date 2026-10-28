import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Receipt,
  UserCheck,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  Check,
  X,
  Clock,
  Activity,
  Building2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [revenueTab, setRevenueTab] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [patientTab, setPatientTab] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [selectedDate, setSelectedDate] = useState(19);

  // 1. KPI Stats Cards Data (from screenshot)
  const stats = [
    {
      id: 'patients',
      title: 'Total Patients',
      value: '1,105',
      trend: '+1.5%',
      subtitle: '20 more than yesterday',
      icon: Users,
    },
    {
      id: 'appointments',
      title: 'Appointments',
      value: '145',
      trend: '+1.5%',
      subtitle: '20 more than yesterday',
      icon: Calendar,
    },
    {
      id: 'invoices',
      title: 'Invoices',
      value: '347',
      trend: '+1.5%',
      subtitle: '20 more than yesterday',
      icon: Receipt,
    },
    {
      id: 'staff',
      title: 'Staff on duty',
      value: '24',
      trend: '+1.5%',
      subtitle: '20 more than yesterday',
      icon: UserCheck,
    },
  ];

  // 2. Today's Appointments Data (from screenshot)
  const todayAppointments = [
    {
      id: '1',
      name: 'Robert Brown',
      doctor: 'Dr. Michael Chen',
      dept: 'Cardiology',
      time: '09:00 AM',
      status: 'Confirmed',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Swati Jain',
      doctor: 'Dr. Michael Chen',
      dept: 'Cardiology',
      time: '09:00 AM',
      status: 'In Progress',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Youth Patel',
      doctor: 'Dr. Michael Chen',
      dept: 'Cardiology',
      time: '09:00 AM',
      status: 'Waiting',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Shaileja Desai',
      doctor: 'Dr. Michael Chen',
      dept: 'Cardiology',
      time: '09:00 AM',
      status: 'Confirmed',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      name: 'Ritu Arora',
      doctor: 'Dr. Michael Chen',
      dept: 'Cardiology',
      time: '09:00 AM',
      status: 'Confirmed',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // 3. Schedule Timeline Tasks (from screenshot)
  const timelineTasks = [
    {
      id: 'task-1',
      title: 'Morning Staff Meeting',
      time: '08:00 AM',
      description: 'Discuss team task for the day.',
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'task-2',
      title: 'Patient Consultation',
      time: '08:00 AM',
      description: 'Discuss team task for the day.',
      avatars: [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'task-3',
      title: 'Meeting with Guards',
      time: '08:00 AM',
      description: 'Discuss team task for the day.',
      avatars: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'task-4',
      title: 'Surgery',
      time: '08:00 AM',
      description: 'Discuss team task for the day.',
      avatars: [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      ],
    },
  ];

  // 4. Bar Chart Weekdays Data
  const barChartData = [
    { day: 'Sun', primary: 35, secondary: 20 },
    { day: 'Mon', primary: 60, secondary: 30 },
    { day: 'Tue', primary: 75, secondary: 45 },
    { day: 'Wed', primary: 65, secondary: 50 },
    { day: 'Thu', primary: 55, secondary: 35 },
    { day: 'Fri', primary: 40, secondary: 25 },
    { day: 'Sat', primary: 70, secondary: 45 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-primary border border-emerald-200/60';
      case 'In Progress':
        return 'bg-blue-50 text-secondary border border-blue-200/60';
      case 'Waiting':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header Row: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-dark">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/departments"
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/25 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Building2 className="h-4 w-4 text-white" />
            <span>Manage Departments</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                </div>
                <button
                  type="button"
                  title="Options"
                  className="text-slate-300 hover:text-slate-600 p-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-dark tracking-tight">
                  {stat.value}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-[#EAF8F0] px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1.5">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Main Body Grid: Left Content (Charts + Appointments) vs Right Column (Calendar + Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Charts Row: Revenue & Patient Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: Revenue Wave/Spline Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm font-bold text-dark hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Revenue</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg p-0.5 text-[11px]">
                  {(['Week', 'Month', 'Year'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRevenueTab(tab)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        revenueTab === tab
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>incomes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                  <span>incomes</span>
                </div>
              </div>

              {/* Spline Wave SVG Chart */}
              <div className="relative h-44 w-full">
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300">
                  <span>100k</span>
                  <span>75k</span>
                  <span>50k</span>
                  <span>25k</span>
                  <span>0</span>
                </div>

                {/* Chart SVG */}
                <svg
                  className="w-full h-full pl-7 pb-6"
                  viewBox="0 0 350 140"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="primaryWave" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#008A3D" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#008A3D" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Grid Lines */}
                  <line
                    x1="0"
                    y1="10"
                    x2="350"
                    y2="10"
                    stroke="#F1F5F9"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="40"
                    x2="350"
                    y2="40"
                    stroke="#F1F5F9"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="75"
                    x2="350"
                    y2="75"
                    stroke="#F1F5F9"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="110"
                    x2="350"
                    y2="110"
                    stroke="#F1F5F9"
                    strokeDasharray="3 3"
                  />

                  {/* Smooth Sine/Spline Wave 1 (Darker Green) */}
                  <path
                    d="M 0 70 C 40 75, 70 45, 110 30 C 135 15, 150 75, 180 80 C 210 85, 230 35, 260 40 C 290 45, 320 65, 350 60 L 350 135 L 0 135 Z"
                    fill="url(#primaryWave)"
                  />
                  <path
                    d="M 0 70 C 40 75, 70 45, 110 30 C 135 15, 150 75, 180 80 C 210 85, 230 35, 260 40 C 290 45, 320 65, 350 60"
                    fill="none"
                    stroke="#008A3D"
                    strokeWidth="2.2"
                  />

                  {/* Smooth Sine/Spline Wave 2 (Lighter Mint Curve) */}
                  <path
                    d="M 0 80 C 40 85, 70 70, 100 65 C 130 60, 150 30, 175 45 C 200 60, 225 105, 255 75 C 285 45, 320 70, 350 75"
                    fill="none"
                    stroke="#6EE7B7"
                    strokeWidth="2.2"
                  />
                </svg>

                {/* X-axis Day Labels */}
                <div className="absolute left-7 right-0 bottom-0 flex justify-between text-[10px] text-slate-400">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Patient Overview Grouped Bar Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm font-bold text-dark hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Patient Overview</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg p-0.5 text-[11px]">
                  {(['Week', 'Month', 'Year'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPatientTab(tab)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        patientTab === tab
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>incomes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                  <span>incomes</span>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="h-44 flex flex-col justify-end">
                <div className="h-36 flex items-end justify-between px-2 gap-2 border-b border-slate-100 pb-2">
                  {barChartData.map((item) => (
                    <div
                      key={item.day}
                      className="flex-1 flex items-end justify-center gap-1 h-full"
                    >
                      {/* Secondary Bar */}
                      <div
                        style={{ height: `${item.secondary}%` }}
                        className="w-2 sm:w-2.5 bg-emerald-300 rounded-t-md transition-all duration-300"
                        title={`Outpatient: ${item.secondary}`}
                      />
                      {/* Primary Bar */}
                      <div
                        style={{ height: `${item.primary}%` }}
                        className="w-2 sm:w-2.5 bg-primary rounded-t-md transition-all duration-300"
                        title={`Inpatient: ${item.primary}`}
                      />
                    </div>
                  ))}
                </div>

                {/* X-axis Days */}
                <div className="flex justify-between px-2 pt-2 text-[10px] text-slate-400">
                  {barChartData.map((item) => (
                    <span key={item.day} className="flex-1 text-center">
                      {item.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Today's Appointments & Alerts / Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Appointments Card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark">Today's Appointments</h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Upcoming and ongoing appointments
                </p>

                <div className="space-y-3">
                  {todayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.avatar}
                          alt={app.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-dark">{app.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {app.doctor} • {app.dept}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-slate-300" />
                          {app.time}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Notifications + Bed / Staff Metrics Card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark">Alerts & Notifications</h3>
                <p className="text-[11px] text-slate-400 mb-4">Important updates</p>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2.5 text-xs text-slate-700">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span>Low stock alert: Paracetamol tablets</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2.5 text-xs text-slate-700">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span>3 appointments pending confirmation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2.5 text-xs text-slate-700">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span>Equipment maintenance due: MRI Machine</span>
                  </div>
                </div>
              </div>

              {/* Bottom Occupancy & Shift Metrics */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-dark">Bed Occupancy</h5>
                    <p className="text-[10px] text-slate-400">248/300 beds</p>
                  </div>
                  <span className="text-sm font-extrabold text-primary">83%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-dark">Staff on Duty</h5>
                    <p className="text-[10px] text-slate-400">Today's shift</p>
                  </div>
                  <span className="text-sm font-extrabold text-primary">165</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: 4 Columns (Calendar Widget & Schedule Timeline) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Calendar Card Widget */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="text-slate-400 hover:text-dark p-1 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h4 className="text-xs font-bold text-dark">September 2026</h4>
              <button
                type="button"
                className="text-slate-400 hover:text-dark p-1 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-medium">
              <span className="text-slate-200">29</span>
              <span className="text-slate-200">30</span>
              <span className="text-slate-200">31</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>

              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>

              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>

              {/* Selected Day 19 with Primary Green Circle */}
              <button
                onClick={() => setSelectedDate(19)}
                className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer ${
                  selectedDate === 19
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-dark hover:bg-slate-100'
                }`}
              >
                19
              </button>

              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              <span>25</span>

              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>
              <span className="text-slate-200">1</span>
              <span className="text-slate-200">2</span>
            </div>
          </div>

          {/* Schedule Timeline with Vertical Line & Green Task Cards */}
          <div className="relative pl-6 space-y-4">
            {/* Vertical Connecting Line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-emerald-200"></div>

            {timelineTasks.map((task, index) => (
              <div key={task.id} className="relative">
                {/* Timeline Node Dot */}
                <div className="absolute -left-6 top-3 h-3 w-3 rounded-full bg-primary ring-4 ring-[#EAF8F0]"></div>

                {/* Green Task Card */}
                <div className="bg-primary text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{task.title}</h4>
                    <span className="text-[10px] text-cream font-medium bg-black/15 px-2 py-0.5 rounded-full">
                      {task.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-cream/80 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Overlapping Avatars Stack */}
                    <div className="flex -space-x-2">
                      {task.avatars.map((avatar, i) => (
                        <img
                          key={i}
                          src={avatar}
                          alt="Doctor"
                          className="h-6 w-6 rounded-full object-cover ring-2 ring-primary"
                        />
                      ))}
                    </div>

                    {/* Action Buttons: Cross and Check */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Dismiss"
                        className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Mark Complete"
                        className="h-6 w-6 rounded-md bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
