import { baseApi } from './baseApi';

export interface DiagnosticTest {
  id: string;
  name: string;
  code?: string | null;
  category: string;
  price: string | number;
  isDiscountable: boolean;
  discountPercent: string | number;
  roomNumber?: string | null;
  sampleType: string;
  deliveryTime: string;
  normalRange?: string | null;
  description?: string | null;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface TestListResponse {
  success: boolean;
  data: DiagnosticTest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TestQueryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const testApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTests: builder.query<TestListResponse, TestQueryParams | void>({
      query: (params) => ({
        url: '/tests',
        params: params || undefined,
      }),
      providesTags: ['Tests'],
    }),

    getTestById: builder.query<{ success: boolean; data: DiagnosticTest }, string>({
      query: (id) => `/tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tests', id }],
    }),

    createTest: builder.mutation<
      { success: boolean; message: string; data: DiagnosticTest },
      Partial<DiagnosticTest>
    >({
      query: (body) => ({
        url: '/tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tests'],
    }),

    updateTest: builder.mutation<
      { success: boolean; message: string; data: DiagnosticTest },
      { id: string; data: Partial<DiagnosticTest> }
    >({
      query: ({ id, data }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Tests'],
    }),

    deleteTest: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tests'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTestsQuery,
  useGetTestByIdQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
} = testApi;
