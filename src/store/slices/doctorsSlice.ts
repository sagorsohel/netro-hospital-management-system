import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  experience: string;
  rating: number;
  patientsCount: number;
  status: 'Active' | 'On Leave' | 'In Surgery';
  phone: string;
  email: string;
  avatar: string;
}

interface DoctorsState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  loading: boolean;
}

const initialState: DoctorsState = {
  doctors: [
    {
      id: "doc-1",
      name: "Dr. Sarah Johnson",
      specialty: "Senior Cardiologist",
      department: "Cardiology",
      experience: "14 Years",
      rating: 4.9,
      patientsCount: 1420,
      status: "Active",
      phone: "+1 (555) 019-2831",
      email: "sarah.j@netrohospital.com",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "doc-2",
      name: "Dr. Michael Chen",
      specialty: "Chief Neurologist",
      department: "Neurology",
      experience: "16 Years",
      rating: 4.8,
      patientsCount: 1105,
      status: "Active",
      phone: "+1 (555) 018-9943",
      email: "michael.c@netrohospital.com",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "doc-3",
      name: "Dr. Emily Taylor",
      specialty: "Pediatric Specialist",
      department: "Pediatrics",
      experience: "9 Years",
      rating: 4.95,
      patientsCount: 890,
      status: "In Surgery",
      phone: "+1 (555) 017-3421",
      email: "emily.t@netrohospital.com",
      avatar: "https://images.unsplash.com/photo-1594824813575-d227b94b05a7?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "doc-4",
      name: "Dr. James Wilson",
      specialty: "Orthopedic Surgeon",
      department: "Orthopedics",
      experience: "11 Years",
      rating: 4.75,
      patientsCount: 960,
      status: "On Leave",
      phone: "+1 (555) 016-8821",
      email: "james.w@netrohospital.com",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
    }
  ],
  selectedDoctor: null,
  loading: false
};

export const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    addDoctor: (state, action: PayloadAction<Doctor>) => {
      state.doctors.unshift(action.payload);
    },
    selectDoctor: (state, action: PayloadAction<string>) => {
      state.selectedDoctor = state.doctors.find(d => d.id === action.payload) || null;
    },
    updateDoctorStatus: (state, action: PayloadAction<{ id: string; status: Doctor['status'] }>) => {
      const doc = state.doctors.find(d => d.id === action.payload.id);
      if (doc) doc.status = action.payload.status;
    }
  }
});

export const { addDoctor, selectDoctor, updateDoctorStatus } = doctorsSlice.actions;
export default doctorsSlice.reducer;
