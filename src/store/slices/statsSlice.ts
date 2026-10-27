import { createSlice } from '@reduxjs/toolkit';

interface StatsState {
  totalPatients: number;
  patientsTrend: string;
  availableDoctors: number;
  doctorsTrend: string;
  todayAppointments: number;
  appointmentsTrend: string;
  hospitalRevenue: string;
  revenueTrend: string;
  bedOccupancyRate: number;
  emergencyCases: number;
}

const initialState: StatsState = {
  totalPatients: 3840,
  patientsTrend: "+12.5% this month",
  availableDoctors: 48,
  doctorsTrend: "4 on call now",
  todayAppointments: 68,
  appointmentsTrend: "14 completed",
  hospitalRevenue: "$124,500",
  revenueTrend: "+8.4% vs last week",
  bedOccupancyRate: 78,
  emergencyCases: 6
};

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {}
});

export default statsSlice.reducer;
