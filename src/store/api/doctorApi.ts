import { baseApi } from './baseApi';

export interface Doctor {
  id: string;
  name: string;
  departmentId?: string;
  department: string;
  specialty?: string;
  experience?: string;
  isHead?: boolean;
  contactNumber?: string;
  roomNumber?: string;
  serialContactNumber?: string;
  firstVisitFee?: string;
  secondVisitFee?: string;
  dailyPatientLimit?: number;
  consultationStartTime?: string;
  consultationEndTime?: string;
  reportConsultationTime?: string;
  availableDays?: string[];
  offDays?: string;
  image?: string;
  email?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  rating?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorListResponse {
  success: boolean;
  data: Doctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DoctorSingleResponse {
  success: boolean;
  message?: string;
  data: Doctor;
}

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<
      DoctorListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        departmentId?: string;
        department?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: '/doctors',
        params: params || undefined,
      }),
      providesTags: ['Doctors'],
    }),

    getDoctorById: builder.query<DoctorSingleResponse, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Doctors', id }],
    }),

    createDoctor: builder.mutation<DoctorSingleResponse, Partial<Doctor>>({
      query: (body) => ({
        url: '/doctors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Doctors', 'Departments'],
    }),

    updateDoctor: builder.mutation<
      DoctorSingleResponse,
      { id: string; data: Partial<Doctor> }
    >({
      query: ({ id, data }) => ({
        url: `/doctors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Doctors', id },
        'Doctors',
        'Departments',
      ],
    }),

    deleteDoctor: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Doctors', 'Departments'],
    }),

    uploadDoctorImage: builder.mutation<
      { success: boolean; message?: string; url: string; public_id?: string },
      FormData
    >({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useUploadDoctorImageMutation,
} = doctorApi;
