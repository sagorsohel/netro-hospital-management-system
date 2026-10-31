import { baseApi } from './baseApi';
import type { PatientProfile } from './patientApi';

export interface AdmissionExtraCharge {
  key: string;
  value: number;
  unit?: string;
}

export interface InpatientAdmission {
  id: string;
  admissionNo: string;
  patientId: string;
  patientUniqueId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  status: 'Admitted' | 'Discharged' | 'Under Observation' | 'Transferred';
  roomId?: string | null;
  roomNumber?: string | null;
  roomName?: string | null;
  bedNumber?: string | null;
  perDayCharge: string | number;
  doctorId?: string | null;
  doctorName?: string | null;
  department?: string | null;
  operationId?: string | null;
  operationName?: string | null;
  operationPrice: string | number;
  extraCharges: AdmissionExtraCharge[];
  admissionFee: string | number;
  roomCharge: string | number;
  operationCharge: string | number;
  extraChargesTotal: string | number;
  subtotal: string | number;
  discountAmount: string | number;
  grandTotal: string | number;
  advancePayment: string | number;
  dueAmount: string | number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  diagnosis?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  patientProfile?: PatientProfile | null;
}

export interface AdmissionListResponse {
  success: boolean;
  data: InpatientAdmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleAdmissionResponse {
  success: boolean;
  data: InpatientAdmission;
  message?: string;
}

export interface CreateAdmissionPayload {
  isNewPatient?: boolean;
  patientId?: string;
  patientUniqueId?: string;
  patientName: string;
  patientPhone?: string;
  patientAge?: number | null;
  patientGender?: string;
  dob?: string;
  patientEmail?: string;
  patientAddress?: string;
  patientBloodGroup?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  emergencyContact?: string;
  allergies?: string;
  maritalStatus?: string;
  occupation?: string;

  // Room & Bed
  roomId?: string;
  roomNumber?: string;
  roomName?: string;
  bedNumber?: string;
  perDayCharge?: number;

  // Doctor & Department
  doctorId?: string;
  doctorName?: string;
  department?: string;

  // Surgical Operation
  operationId?: string;
  operationName?: string;
  operationPrice?: number;

  // POS Financial Charges
  extraCharges?: AdmissionExtraCharge[];
  admissionFee?: number;
  roomCharge?: number;
  operationCharge?: number;
  extraChargesTotal?: number;
  subtotal?: number;
  discountAmount?: number;
  grandTotal?: number;
  advancePayment?: number;
  dueAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;

  // Clinical
  diagnosis?: string;
  notes?: string;
}

export interface AdmissionQueryParams {
  search?: string;
  status?: string;
  roomId?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
}

export interface DischargePayload {
  dischargeNotes?: string;
  settleDue?: boolean;
  finalPaymentMethod?: string;
}

export const admissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissions: builder.query<AdmissionListResponse, AdmissionQueryParams | void>({
      query: (params) => ({
        url: '/admissions',
        params: params || undefined,
      }),
      providesTags: ['Admissions'],
    }),

    getAdmissionById: builder.query<SingleAdmissionResponse, string>({
      query: (id) => `/admissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Admissions', id }],
    }),

    createAdmission: builder.mutation<
      { success: boolean; message: string; data: { admission: InpatientAdmission; patient: PatientProfile } },
      CreateAdmissionPayload
    >({
      query: (body) => ({
        url: '/admissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Admissions', 'Patients', 'Rooms'],
    }),

    dischargeAdmission: builder.mutation<
      SingleAdmissionResponse,
      { id: string; data: DischargePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admissions/${id}/discharge`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admissions', 'Patients', 'Rooms'],
    }),

    updateAdmission: builder.mutation<
      SingleAdmissionResponse,
      { id: string; data: Partial<InpatientAdmission> }
    >({
      query: ({ id, data }) => ({
        url: `/admissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Admissions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionsQuery,
  useGetAdmissionByIdQuery,
  useCreateAdmissionMutation,
  useDischargeAdmissionMutation,
  useUpdateAdmissionMutation,
} = admissionApi;
