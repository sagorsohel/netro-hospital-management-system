import { baseApi } from './baseApi';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  date: string;
  amount: string;
  purpose?: string;
  category: string;
  billCopy?: string;
  voucherNo?: string;
  paymentMethod?: string;
  paidTo?: string;
  status: 'Paid' | 'Pending' | 'Approved';
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAmount: number;
  };
}

export interface ExpenseStatsResponse {
  success: boolean;
  stats: {
    totalOverall: number;
    countOverall: number;
    totalThisMonth: number;
    countThisMonth: number;
    totalToday: number;
    countToday: number;
    categoryBreakdown: {
      category: string;
      totalAmount: number;
      count: number;
    }[];
  };
}

export interface ExpenseSingleResponse {
  success: boolean;
  message?: string;
  data: Expense;
}

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<
      ExpenseListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      } | void
    >({
      query: (params) => ({
        url: '/expenses',
        params: params || undefined,
      }),
      providesTags: ['Expenses'],
    }),

    getExpenseStats: builder.query<ExpenseStatsResponse, void>({
      query: () => '/expenses/stats',
      providesTags: ['Expenses'],
    }),

    getExpenseById: builder.query<ExpenseSingleResponse, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Expenses', id }],
    }),

    createExpense: builder.mutation<ExpenseSingleResponse, Partial<Expense>>({
      query: (body) => ({
        url: '/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expenses'],
    }),

    updateExpense: builder.mutation<
      ExpenseSingleResponse,
      { id: string; data: Partial<Expense> }
    >({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Expenses', id },
        'Expenses',
      ],
    }),

    deleteExpense: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),

    uploadBillCopy: builder.mutation<
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
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useUploadBillCopyMutation,
} = expenseApi;
