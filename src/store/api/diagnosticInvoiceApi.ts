import { baseApi } from './baseApi';
import type { PatientProfile } from './patientApi';

export interface DiagnosticInvoiceItem {
  testId?: string;
  testName: string;
  category?: string;
  price: number | string;
  discountAmount?: number | string;
  finalAmount: number | string;
  deliveryDate?: string;
  roomNumber?: string | null;
  sampleType?: string;
}

export interface DiagnosticInvoice {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientUniqueId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  items: DiagnosticInvoiceItem[];
  testsCount: number;
  subtotal: string | number;
  discountAmount: string | number;
  grandTotal: string | number;
  paidAmount: string | number;
  dueAmount: string | number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  sampleStatus: string;
  deliveryDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  patientProfile?: PatientProfile | null;
}

export interface DiagnosticInvoiceListResponse {
  success: boolean;
  data: DiagnosticInvoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleDiagnosticInvoiceResponse {
  success: boolean;
  data: DiagnosticInvoice;
  message?: string;
}

export interface CreateDiagnosticInvoicePayload {
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

  // Doctor
  doctorId?: string;
  doctorName?: string;

  // Items & Financials
  items: DiagnosticInvoiceItem[];
  subtotal?: number;
  discountAmount?: number;
  grandTotal?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentMethod?: string;
  sampleStatus?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface DiagnosticInvoiceQueryParams {
  search?: string;
  paymentStatus?: string;
  sampleStatus?: string;
  page?: number;
  limit?: number;
}

export interface SettleDiagnosticDuePayload {
  additionalPayment: number;
  paymentMethod?: string;
}

export const diagnosticInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiagnosticInvoices: builder.query<
      DiagnosticInvoiceListResponse,
      DiagnosticInvoiceQueryParams | void
    >({
      query: (params) => ({
        url: '/diagnostic-invoices',
        params: params || undefined,
      }),
      providesTags: ['DiagnosticInvoices'],
    }),

    getDiagnosticInvoiceById: builder.query<SingleDiagnosticInvoiceResponse, string>({
      query: (id) => `/diagnostic-invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DiagnosticInvoices', id }],
    }),

    createDiagnosticInvoice: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { invoice: DiagnosticInvoice; patient: PatientProfile };
      },
      CreateDiagnosticInvoicePayload
    >({
      query: (body) => ({
        url: '/diagnostic-invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DiagnosticInvoices', 'Patients'],
    }),

    settleDiagnosticDue: builder.mutation<
      SingleDiagnosticInvoiceResponse,
      { id: string; data: SettleDiagnosticDuePayload }
    >({
      query: ({ id, data }) => ({
        url: `/diagnostic-invoices/${id}/due`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['DiagnosticInvoices', 'Patients'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDiagnosticInvoicesQuery,
  useGetDiagnosticInvoiceByIdQuery,
  useCreateDiagnosticInvoiceMutation,
  useSettleDiagnosticDueMutation,
} = diagnosticInvoiceApi;
