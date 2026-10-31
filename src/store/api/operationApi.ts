import { baseApi } from './baseApi';

export interface SurgicalOperation {
  id: string;
  name: string;
  category: string;
  price: string | number;
  canDiscount: boolean;
  maxDiscountPercent: string | number;
  doctorId?: string | null;
  doctorName?: string | null;
  roomNumber?: string | null;
  duration: string;
  anesthesiaType: string;
  description?: string | null;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface OperationListResponse {
  success: boolean;
  data: SurgicalOperation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OperationQueryParams {
  search?: string;
  category?: string;
  doctorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const operationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperations: builder.query<OperationListResponse, OperationQueryParams | void>({
      query: (params) => ({
        url: '/operations',
        params: params || undefined,
      }),
      providesTags: ['Operations'],
    }),

    getOperationById: builder.query<{ success: boolean; data: SurgicalOperation }, string>({
      query: (id) => `/operations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Operations', id }],
    }),

    createOperation: builder.mutation<
      { success: boolean; message: string; data: SurgicalOperation },
      Partial<SurgicalOperation>
    >({
      query: (body) => ({
        url: '/operations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Operations'],
    }),

    updateOperation: builder.mutation<
      { success: boolean; message: string; data: SurgicalOperation },
      { id: string; data: Partial<SurgicalOperation> }
    >({
      query: ({ id, data }) => ({
        url: `/operations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Operations'],
    }),

    deleteOperation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/operations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Operations'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOperationsQuery,
  useGetOperationByIdQuery,
  useCreateOperationMutation,
  useUpdateOperationMutation,
  useDeleteOperationMutation,
} = operationApi;
