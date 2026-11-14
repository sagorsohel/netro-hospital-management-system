import { baseApi } from './baseApi';

export interface PharmacyOwner {
  id: string;
  pharmacyId: number;
  name: string;
  phone: string;
  email?: string | null;
  role: 'owner' | 'manager' | 'pharmacist' | 'cashier' | 'staff';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  licenseNo: string;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  owners?: PharmacyOwner[];
  staffByRole?: Record<string, number>;
}

export interface CreatePharmacyPayload {
  name: string;
  address: string;
  phone: string;
  email?: string;
  licenseNo: string;
  owner: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  };
}

export interface UpdatePharmacyPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string | null;
  licenseNo?: string;
}

export interface ResetOwnerPasswordPayload {
  newPassword: string;
}

export interface PharmacyListResponse {
  success: boolean;
  data: Pharmacy[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PharmacySingleResponse {
  success: boolean;
  message?: string;
  data: Pharmacy;
}

export const pharmacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPharmacies: builder.query<
      PharmacyListResponse,
      { page?: number; limit?: number; search?: string; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: '/pharmacies',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Pharmacies' as const, id })),
              { type: 'Pharmacies', id: 'LIST' },
            ]
          : [{ type: 'Pharmacies', id: 'LIST' }],
    }),

    getPharmacyById: builder.query<PharmacySingleResponse, number | string>({
      query: (id) => `/pharmacies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pharmacies', id }],
    }),

    createPharmacy: builder.mutation<PharmacySingleResponse, CreatePharmacyPayload>({
      query: (body) => ({
        url: '/pharmacies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Pharmacies', id: 'LIST' }],
    }),

    updatePharmacy: builder.mutation<
      PharmacySingleResponse,
      { id: number | string; data: UpdatePharmacyPayload }
    >({
      query: ({ id, data }) => ({
        url: `/pharmacies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Pharmacies', id: 'LIST' },
        { type: 'Pharmacies', id },
      ],
    }),

    updatePharmacyStatus: builder.mutation<
      PharmacySingleResponse,
      { id: number | string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/pharmacies/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Pharmacies', id: 'LIST' },
        { type: 'Pharmacies', id },
      ],
    }),

    resetOwnerPassword: builder.mutation<
      { success: boolean; message: string },
      { id: number | string; data: ResetOwnerPasswordPayload }
    >({
      query: ({ id, data }) => ({
        url: `/pharmacies/${id}/reset-owner-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Pharmacies', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPharmaciesQuery,
  useGetPharmacyByIdQuery,
  useCreatePharmacyMutation,
  useUpdatePharmacyMutation,
  useUpdatePharmacyStatusMutation,
  useResetOwnerPasswordMutation,
} = pharmacyApi;
