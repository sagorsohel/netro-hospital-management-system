import { baseApi } from './baseApi';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  experience?: string;
  rating?: number;
  patientsCount?: number;
  status?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  patientId: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  phone: string;
  admissionStatus: string;
  department?: string;
  bedNumber?: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  department: string;
  status: string;
}

export const hospitalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<{ success: boolean; data: Doctor[]; count: number }, void>({
      query: () => '/doctors',
      providesTags: ['Doctors'],
    }),
    getPatients: builder.query<{ success: boolean; data: Patient[]; count: number }, void>({
      query: () => '/patients',
      providesTags: ['Patients'],
    }),
    getAppointments: builder.query<{ success: boolean; data: Appointment[]; count: number }, void>({
      query: () => '/appointments',
      providesTags: ['Appointments'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDoctorsQuery,
  useGetPatientsQuery,
  useGetAppointmentsQuery,
} = hospitalApi;
