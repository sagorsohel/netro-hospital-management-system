import { baseApi } from './baseApi';

export type PharmacyRole = 'owner' | 'manager' | 'pharmacist' | 'cashier' | 'staff';

export interface PharmacyOwner {
  id: string;
  pharmacyId: number;
  name: string;
  phone: string;
  email?: string | null;
  role: PharmacyRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyUser {
  id: string;
  pharmacyId: number;
  name: string;
  phone: string;
  email?: string | null;
  role: PharmacyRole;
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

export interface CreatePharmacyUserPayload {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: PharmacyRole;
}

export interface UpdatePharmacyUserPayload {
  name?: string;
  phone?: string;
  email?: string | null;
  role?: PharmacyRole;
  isActive?: boolean;
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

export interface PharmacyUserListResponse {
  success: boolean;
  data: PharmacyUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PharmacyUserSingleResponse {
  success: boolean;
  message?: string;
  data: PharmacyUser;
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

    // ========== Pharmacy Staff & User Management (Hospital Admin has full access) ==========
    getPharmacyUsers: builder.query<
      PharmacyUserListResponse,
      { pharmacyId: number | string; page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }
    >({
      query: ({ pharmacyId, ...params }) => ({
        url: `/pharmacies/${pharmacyId}/users`,
        params: params || undefined,
      }),
      providesTags: (_res, _err, { pharmacyId }) => [
        { type: 'Pharmacies', id: `USERS_${pharmacyId}` },
        { type: 'Pharmacies', id: pharmacyId },
      ],
    }),

    createPharmacyUser: builder.mutation<
      PharmacyUserSingleResponse,
      { pharmacyId: number | string; data: CreatePharmacyUserPayload }
    >({
      query: ({ pharmacyId, data }) => ({
        url: `/pharmacies/${pharmacyId}/users`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_res, _err, { pharmacyId }) => [
        { type: 'Pharmacies', id: `USERS_${pharmacyId}` },
        { type: 'Pharmacies', id: pharmacyId },
        { type: 'Pharmacies', id: 'LIST' },
      ],
    }),

    updatePharmacyUser: builder.mutation<
      PharmacyUserSingleResponse,
      { pharmacyId: number | string; userId: string; data: UpdatePharmacyUserPayload }
    >({
      query: ({ pharmacyId, userId, data }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { pharmacyId }) => [
        { type: 'Pharmacies', id: `USERS_${pharmacyId}` },
        { type: 'Pharmacies', id: pharmacyId },
        { type: 'Pharmacies', id: 'LIST' },
      ],
    }),

    resetPharmacyUserPassword: builder.mutation<
      { success: boolean; message: string },
      { pharmacyId: number | string; userId: string; newPassword: string }
    >({
      query: ({ pharmacyId, userId, newPassword }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
      invalidatesTags: (_res, _err, { pharmacyId }) => [
        { type: 'Pharmacies', id: `USERS_${pharmacyId}` },
      ],
    }),

    deletePharmacyUser: builder.mutation<
      { success: boolean; message: string },
      { pharmacyId: number | string; userId: string }
    >({
      query: ({ pharmacyId, userId }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { pharmacyId }) => [
        { type: 'Pharmacies', id: `USERS_${pharmacyId}` },
        { type: 'Pharmacies', id: pharmacyId },
        { type: 'Pharmacies', id: 'LIST' },
      ],
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
  useGetPharmacyUsersQuery,
  useCreatePharmacyUserMutation,
  useUpdatePharmacyUserMutation,
  useResetPharmacyUserPasswordMutation,
  useDeletePharmacyUserMutation,
} = pharmacyApi;
