import { baseApi } from './baseApi';

export const SHAREHOLDER_STATUSES = ['Draft', 'Pending', 'Active', 'Inactive', 'Rejected'] as const;
export const IDENTITY_TYPES = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'BIRTH_REGISTRATION', label: 'Birth Registration' },
  { value: 'OTHER', label: 'Other' },
] as const;
export const PAYMENT_TYPES = [
  { value: 'FULL_PAYMENT', label: 'Full Payment' },
  { value: 'INSTALLMENT', label: 'Installment' },
] as const;
export const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface ShareholderAddress {
  house?: string;
  area?: string;
  postalCode?: string;
  zilla?: string;
  division?: string;
  country?: string;
}

export interface ShareholderNominee {
  name: string;
  phone?: string;
  sharePercent?: number | string;
  relationship?: string;
  address?: string;
  nid?: string; // optional
  photo?: string; // optional
}

export interface SharePlan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  planYear?: number | null;
  price?: string | number | null;
  currency?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  purchaseCount?: number;
  createdAt?: string;
}

export interface SharePurchase {
  id: string;
  shareholderId: string;
  planId?: string | null;
  planNameSnapshot?: string | null;
  shareNumber: string;
  paymentType: 'FULL_PAYMENT' | 'INSTALLMENT' | string;
  purchaseDate?: string | null;
  referenceName?: string | null;
  quantity?: number | null;
  totalAmount?: string | number | null;
  paidAmount?: string | number | null;
  dueAmount?: string | number | null;
  paymentStatus: PaymentStatus;
  transactionReference?: string | null;
  notes?: string | null;
  createdAt?: string;
}

/** Purchase row as sent with the shareholder form (id = existing row) */
export interface SharePurchaseInput {
  id?: string;
  planId?: string;
  planName?: string;
  shareNumber: string;
  paymentType?: string;
  purchaseDate?: string;
  referenceName?: string;
  quantity?: number;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: string;
  transactionReference?: string;
  notes?: string;
}

export interface PurchaseSummary {
  purchaseCount: number;
  shareNumbers: string[];
  planNames: string[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface ShareholderAccount {
  email: string;
  isActive: boolean;
}

export interface Shareholder {
  id: string;
  shareholderCode?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  identityType?: string | null;
  nid?: string | null;
  nidFrontImage?: string | null;
  nidBackImage?: string | null;
  ownershipPercentage: number | string;
  investmentAmount?: number | string;
  joinedDate?: string | null;
  bankAccountDetails?: string | null;
  status: (typeof SHAREHOLDER_STATUSES)[number] | string;
  notes?: string | null;

  photo?: string | null;
  tinNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  spouseName?: string | null;
  presentAddress?: ShareholderAddress | null;
  permanentAddress?: ShareholderAddress | null;
  nominees?: ShareholderNominee[] | null;

  userId?: string | null;
  account?: ShareholderAccount | null;
  calculatedEarning?: number;
  purchaseSummary?: PurchaseSummary;
  createdAt?: string;
}

export interface ShareholderPayout {
  id: string;
  shareholderId: string;
  shareholderName: string;
  amount: number | string;
  period: string;
  paymentDate: string;
  paymentMethod: string;
  transactionRef?: string;
  status: 'Paid' | 'Pending';
  notes?: string;
  createdAt?: string;
}

export interface ShareholderDetail extends Shareholder {
  purchases: SharePurchase[];
  payouts: ShareholderPayout[];
}

export interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary?: string | null;
  createdAt: string;
}

export interface ShareholderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  planId?: string;
  paymentStatus?: string;
}

export interface ShareSalesSummary {
  sharesSold: number;
  unitsSold: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  overdueAmount: number;
  shareholdersWithDue: number;
  byPlan: { planId: string | null; planName: string; sold: number; total: number; paid: number; due: number }[];
}

export interface ShareholderListResponse {
  success: boolean;
  data: Shareholder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  metrics: {
    totalShareholders: number;
    totalOwnershipAllocated: number;
    availableOwnershipPercentage: number;
    totalCapital: number;
    shareSales: ShareSalesSummary;
    hospitalFinancialSummary: {
      totalIncome: number;
      totalExpense: number;
      netProfit: number;
    };
  };
}

export type ShareholderPayload = Partial<
  Omit<Shareholder, 'id' | 'account' | 'calculatedEarning' | 'purchaseSummary' | 'shareholderCode'>
> & {
  purchases?: SharePurchaseInput[];
  loginEmail?: string;
  loginPassword?: string;
};

export type SharePlanPayload = Partial<Pick<SharePlan, 'code' | 'name' | 'description' | 'planYear' | 'currency' | 'status'>> & {
  price?: number | null;
};

type Msg = { success: boolean; message: string };

const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const shareholderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShareholders: builder.query<ShareholderListResponse, ShareholderListParams | void>({
      query: (params) => ({ url: '/shareholders', params: clean(params || {}) }),
      providesTags: ['Shareholders'],
    }),

    getShareholderById: builder.query<{ success: boolean; data: ShareholderDetail }, string>({
      query: (id) => `/shareholders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Shareholders', id }],
    }),

    getShareholderAuditLogs: builder.query<{ success: boolean; data: AuditLogEntry[] }, string>({
      query: (id) => `/shareholders/${id}/audit-logs`,
      providesTags: (_r, _e, id) => [{ type: 'Shareholders', id }],
    }),

    getMyShareholderProfile: builder.query<{ success: boolean; data: ShareholderDetail }, void>({
      query: () => '/shareholders/me',
      providesTags: ['Shareholders'],
    }),

    createShareholder: builder.mutation<Msg & { data: Shareholder }, ShareholderPayload>({
      query: (body) => ({ url: '/shareholders', method: 'POST', body }),
      invalidatesTags: ['Shareholders', 'SharePlans'],
    }),

    updateShareholder: builder.mutation<Msg & { data: Shareholder }, { id: string; data: ShareholderPayload }>({
      query: ({ id, data }) => ({ url: `/shareholders/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => ['Shareholders', 'SharePlans', { type: 'Shareholders', id }],
    }),

    updateShareholderStatus: builder.mutation<Msg, { id: string; status: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/shareholders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['Shareholders', { type: 'Shareholders', id }],
    }),

    deleteShareholder: builder.mutation<Msg, string>({
      query: (id) => ({ url: `/shareholders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Shareholders', 'SharePlans'],
    }),

    // ---- Login account (admin) ----
    createShareholderAccount: builder.mutation<
      Msg & { data: ShareholderAccount },
      { id: string; email: string; password: string }
    >({
      query: ({ id, ...body }) => ({ url: `/shareholders/${id}/account`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => ['Shareholders', { type: 'Shareholders', id }],
    }),

    updateShareholderAccount: builder.mutation<
      Msg & { data: ShareholderAccount },
      { id: string; email?: string; isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({ url: `/shareholders/${id}/account`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Shareholders', { type: 'Shareholders', id }],
    }),

    resetShareholderPassword: builder.mutation<Msg, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/shareholders/${id}/account/reset-password`,
        method: 'PUT',
        body: { newPassword },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Shareholders', id }],
    }),

    // ---- Share plans ----
    getSharePlans: builder.query<{ success: boolean; data: SharePlan[] }, { status?: string } | void>({
      query: (params) => ({ url: '/share-plans', params: clean(params || {}) }),
      providesTags: ['SharePlans'],
    }),

    createSharePlan: builder.mutation<Msg & { data: SharePlan }, SharePlanPayload>({
      query: (body) => ({ url: '/share-plans', method: 'POST', body }),
      invalidatesTags: ['SharePlans'],
    }),

    updateSharePlan: builder.mutation<Msg & { data: SharePlan }, { id: string; data: SharePlanPayload }>({
      query: ({ id, data }) => ({ url: `/share-plans/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['SharePlans'],
    }),

    updateSharePlanStatus: builder.mutation<Msg & { data: SharePlan }, { id: string; status: SharePlan['status'] }>({
      query: ({ id, status }) => ({ url: `/share-plans/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['SharePlans'],
    }),

    uploadShareholderPhoto: builder.mutation<{ success: boolean; url: string; message?: string }, FormData>({
      query: (formData) => ({ url: '/upload/image', method: 'POST', body: formData }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShareholdersQuery,
  useGetShareholderByIdQuery,
  useGetShareholderAuditLogsQuery,
  useGetMyShareholderProfileQuery,
  useCreateShareholderMutation,
  useUpdateShareholderMutation,
  useUpdateShareholderStatusMutation,
  useDeleteShareholderMutation,
  useCreateShareholderAccountMutation,
  useUpdateShareholderAccountMutation,
  useResetShareholderPasswordMutation,
  useGetSharePlansQuery,
  useCreateSharePlanMutation,
  useUpdateSharePlanMutation,
  useUpdateSharePlanStatusMutation,
  useUploadShareholderPhotoMutation,
} = shareholderApi;

/** Readable random password for new logins / resets (no look-alike characters). */
export const generatePassword = (length = 10): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const symbols = '@#$%';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = Array.from(arr, (n) => chars[n % chars.length]).join('');
  out = out.slice(0, -2) + symbols[arr[0] % symbols.length] + String(arr[1] % 10);
  return out;
};

export const identityTypeLabel = (v?: string | null) =>
  IDENTITY_TYPES.find((t) => t.value === v)?.label || 'National ID';
export const paymentTypeLabel = (v?: string | null) =>
  PAYMENT_TYPES.find((t) => t.value === v)?.label || v || '';

export const money = (v: unknown) => `৳${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PARTIAL: 'bg-amber-100 text-amber-800 border-amber-200',
  UNPAID: 'bg-slate-100 text-slate-700 border-slate-200',
  OVERDUE: 'bg-rose-100 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-50 text-slate-400 border-slate-200 line-through',
};

export const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Pending: 'bg-amber-100 text-amber-800',
  Draft: 'bg-slate-100 text-slate-600',
  Inactive: 'bg-slate-200 text-slate-600',
  Rejected: 'bg-rose-100 text-rose-700',
};
