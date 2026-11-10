import { baseApi } from './baseApi';

export interface Shareholder {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nid?: string;
  ownershipPercentage: number | string;
  investmentAmount?: number | string;
  joinedDate?: string;
  bankAccountDetails?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  calculatedEarning?: number;
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

export interface ShareholderListResponse {
  success: boolean;
  data: Shareholder[];
  metrics: {
    totalShareholders: number;
    totalOwnershipAllocated: number;
    availableOwnershipPercentage: number;
    hospitalFinancialSummary: {
      totalIncome: number;
      totalExpense: number;
      netProfit: number;
    };
  };
}

const STORAGE_KEY_SHAREHOLDERS = 'netro_hospital_shareholders_v1';
const STORAGE_KEY_PAYOUTS = 'netro_hospital_shareholder_payouts_v1';

const getInitialMockShareholders = (): Shareholder[] => [
  {
    id: 'sh-1',
    name: 'Alhaj Md. Mobarok Hossain',
    phone: '01711-223344',
    email: 'mobarok.hossain@gmail.com',
    nid: '1982567890123',
    ownershipPercentage: 40.0,
    investmentAmount: 5000000,
    joinedDate: '2025-01-01',
    bankAccountDetails: 'Islami Bank Bangladesh Ltd, A/C: 2050123456789',
    status: 'Active',
    notes: 'Founding Chairman & Principal Shareholder',
    calculatedEarning: 240000,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sh-2',
    name: 'Engr. Shafiqul Alam',
    phone: '01819-334455',
    email: 'shafiqul.alam@yahoo.com',
    nid: '1984234567890',
    ownershipPercentage: 25.0,
    investmentAmount: 3000000,
    joinedDate: '2025-01-15',
    bankAccountDetails: 'Dutch-Bangla Bank PLC, A/C: 1151200034567',
    status: 'Active',
    notes: 'Director (Operations)',
    calculatedEarning: 150000,
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'sh-3',
    name: 'Dr. Tariqul Islam',
    phone: '01912-445566',
    email: 'tariqul.ophthalmology@gmail.com',
    nid: '1979345678901',
    ownershipPercentage: 20.0,
    investmentAmount: 2500000,
    joinedDate: '2025-02-01',
    bankAccountDetails: 'City Bank Ltd, A/C: 3102345678001',
    status: 'Active',
    notes: 'Clinical Director & Chief Ophthalmologist',
    calculatedEarning: 120000,
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

const getStoredShareholders = (): Shareholder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHAREHOLDERS);
    if (!raw) {
      const initial = getInitialMockShareholders();
      localStorage.setItem(STORAGE_KEY_SHAREHOLDERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockShareholders();
  }
};

const saveStoredShareholders = (list: Shareholder[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SHAREHOLDERS, JSON.stringify(list));
  } catch (err) {
    console.error(err);
  }
};

export const shareholderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShareholders: builder.query<ShareholderListResponse, void>({
      queryFn: async () => {
        const list = getStoredShareholders();
        const totalOwnershipAllocated = list.reduce(
          (sum, s) => sum + Number(s.ownershipPercentage || 0),
          0
        );

        // Simulated Hospital Net Profit for demonstration
        const totalIncome = 1250000;
        const totalExpense = 450000;
        const netProfit = totalIncome - totalExpense;

        const enriched = list.map((s) => ({
          ...s,
          calculatedEarning: Math.round((netProfit * Number(s.ownershipPercentage || 0)) / 100),
        }));

        return {
          data: {
            success: true,
            data: enriched,
            metrics: {
              totalShareholders: list.length,
              totalOwnershipAllocated,
              availableOwnershipPercentage: Math.max(0, 100 - totalOwnershipAllocated),
              hospitalFinancialSummary: {
                totalIncome,
                totalExpense,
                netProfit,
              },
            },
          },
        };
      },
      providesTags: ['Stats'],
    }),

    createShareholder: builder.mutation<
      { success: boolean; message: string; data: Shareholder },
      Partial<Shareholder>
    >({
      queryFn: async (payload) => {
        const list = getStoredShareholders();
        const id = `sh-${Date.now()}`;
        const newRecord: Shareholder = {
          id,
          name: payload.name || 'Unnamed Shareholder',
          phone: payload.phone || '',
          email: payload.email,
          nid: payload.nid,
          ownershipPercentage: Number(payload.ownershipPercentage || 0),
          investmentAmount: Number(payload.investmentAmount || 0),
          joinedDate: payload.joinedDate || new Date().toISOString().slice(0, 10),
          bankAccountDetails: payload.bankAccountDetails || '',
          status: payload.status || 'Active',
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
        };

        const updated = [...list, newRecord];
        saveStoredShareholders(updated);

        return {
          data: {
            success: true,
            message: 'Shareholder added successfully',
            data: newRecord,
          },
        };
      },
      invalidatesTags: ['Stats'],
    }),

    updateShareholder: builder.mutation<
      { success: boolean; message: string; data: Shareholder },
      { id: string; data: Partial<Shareholder> }
    >({
      queryFn: async ({ id, data }) => {
        const list = getStoredShareholders();
        const idx = list.findIndex((s) => s.id === id);
        if (idx === -1) {
          return { error: { status: 404, data: { message: 'Shareholder not found' } } };
        }
        const updatedRecord = { ...list[idx], ...data };
        list[idx] = updatedRecord;
        saveStoredShareholders(list);

        return {
          data: {
            success: true,
            message: 'Shareholder updated successfully',
            data: updatedRecord,
          },
        };
      },
      invalidatesTags: ['Stats'],
    }),

    deleteShareholder: builder.mutation<{ success: boolean; message: string }, string>({
      queryFn: async (id) => {
        const list = getStoredShareholders();
        const filtered = list.filter((s) => s.id !== id);
        saveStoredShareholders(filtered);
        return {
          data: {
            success: true,
            message: 'Shareholder deleted successfully',
          },
        };
      },
      invalidatesTags: ['Stats'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShareholdersQuery,
  useCreateShareholderMutation,
  useUpdateShareholderMutation,
  useDeleteShareholderMutation,
} = shareholderApi;

