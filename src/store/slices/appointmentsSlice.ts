import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  type: 'In-Person' | 'Telehealth' | 'Emergency';
  amount: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  filterStatus: string;
}

const initialState: AppointmentsState = {
  appointments: [
    {
      id: "APT-2026-001",
      patientName: "John Doe",
      patientId: "PAT-8812",
      doctorName: "Dr. Sarah Johnson",
      department: "Cardiology",
      date: "Oct 28, 2026",
      time: "09:30 AM",
      status: "Confirmed",
      type: "In-Person",
      amount: "$150"
    },
    {
      id: "APT-2026-002",
      patientName: "Sarah Jenkins",
      patientId: "PAT-4392",
      doctorName: "Dr. Michael Chen",
      department: "Neurology",
      date: "Oct 28, 2026",
      time: "10:15 AM",
      status: "Pending",
      type: "Telehealth",
      amount: "$120"
    },
    {
      id: "APT-2026-003",
      patientName: "Robert Davis",
      patientId: "PAT-9102",
      doctorName: "Dr. James Wilson",
      department: "Orthopedics",
      date: "Oct 28, 2026",
      time: "11:00 AM",
      status: "Confirmed",
      type: "In-Person",
      amount: "$180"
    },
    {
      id: "APT-2026-004",
      patientName: "Emma Watson",
      patientId: "PAT-1204",
      doctorName: "Dr. Emily Taylor",
      department: "Pediatrics",
      date: "Oct 28, 2026",
      time: "02:30 PM",
      status: "Completed",
      type: "In-Person",
      amount: "$95"
    },
    {
      id: "APT-2026-005",
      patientName: "David Miller",
      patientId: "PAT-6711",
      doctorName: "Dr. Sarah Johnson",
      department: "Cardiology",
      date: "Oct 29, 2026",
      time: "03:45 PM",
      status: "Confirmed",
      type: "Telehealth",
      amount: "$130"
    }
  ],
  filterStatus: 'All'
};

export const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.unshift(action.payload);
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    updateStatus: (state, action: PayloadAction<{ id: string; status: Appointment['status'] }>) => {
      const apt = state.appointments.find(a => a.id === action.payload.id);
      if (apt) apt.status = action.payload.status;
    }
  }
});

export const { addAppointment, setFilterStatus, updateStatus } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
