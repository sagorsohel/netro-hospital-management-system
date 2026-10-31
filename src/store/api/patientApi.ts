import { baseApi } from './baseApi';

export interface PatientMetrics {
  totalAdmissions: number;
  totalDiagnostics: number;
  totalAppointments: number;
  totalVisits: number;
  totalBilled: string;
  totalPaid: string;
  totalDue: string;
}

export interface PatientAdmissionRecord {
  id: string;
  admissionNo: string;
  admissionDate: string;
  dischargeDate?: string | null;
  status: string;
  roomId?: string;
  roomNumber?: string;
  roomName?: string;
  bedNumber?: string;
  perDayCharge: string | number;
  doctorName?: string;
  department?: string;
  operationName?: string;
  operationPrice?: string | number;
  grandTotal: string | number;
  advancePayment: string | number;
  dueAmount: string | number;
  paymentStatus: string;
  paymentMethod: string;
  diagnosis?: string;
  notes?: string;
}

export interface PatientDiagnosticRecord {
  id: string;
  orderNo: string;
  testName: string;
  category?: string;
  price: string | number;
  discountAmount?: string | number;
  finalAmount: string | number;
  sampleStatus: string;
  deliveryDate?: string;
  doctorName?: string;
  createdAt: string;
}

export interface PatientAppointmentRecord {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  type?: string;
}

export interface PatientProfile {
  id: string;
  patientId: string;
  name: string;
  age?: number | null;
  dob?: string | null;
  gender?: string | null;
  phone: string;
  email?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  emergencyContact?: string | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  allergies?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  admissions?: PatientAdmissionRecord[];
  diagnostics?: PatientDiagnosticRecord[];
  appointments?: PatientAppointmentRecord[];
  metrics?: PatientMetrics;
}

export interface PatientListResponse {
  success: boolean;
  data: PatientProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SinglePatientResponse {
  success: boolean;
  data: PatientProfile;
  message?: string;
}

export interface PatientQueryParams {
  search?: string;
  gender?: string;
  bloodGroup?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PatientListResponse, PatientQueryParams | void>({
      query: (params) => ({
        url: '/patients',
        params: params || undefined,
      }),
      providesTags: ['Patients'],
    }),

    getPatientById: builder.query<SinglePatientResponse, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Patients', id }],
    }),

    createPatient: builder.mutation<SinglePatientResponse, Partial<PatientProfile>>({
      query: (body) => ({
        url: '/patients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Patients'],
    }),

    updatePatient: builder.mutation<
      SinglePatientResponse,
      { id: string; data: Partial<PatientProfile> }
    >({
      query: ({ id, data }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Patients'],
    }),

    deletePatient: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patients'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
