import { baseApi } from './baseApi';

export interface Equipment {
  id: string;
  name: string;
  modelNo?: string;
  serialNumber?: string;
  category: string;
  quantity: number;
  roomNumber?: string;
  floor?: string;
  department: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status: 'Functional' | 'Under Maintenance' | 'Non-functional';
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceNotes?: string;
  technicianContact?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  serviceDate: string;
  servicedBy: string;
  cost?: string;
  description: string;
  statusAfterService: 'Functional' | 'Under Maintenance' | 'Non-functional';
  nextScheduledDate?: string;
  createdAt?: string;
}

export interface EquipmentListResponse {
  success: boolean;
  data: Equipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EquipmentStatsResponse {
  success: boolean;
  stats: {
    total: number;
    functional: number;
    underMaintenance: number;
    nonFunctional: number;
  };
}

export const equipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEquipment: builder.query<
      EquipmentListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        status?: string;
        department?: string;
      } | void
    >({
      query: (params) => ({
        url: '/equipment',
        params: params || undefined,
      }),
      providesTags: ['Equipment'],
    }),

    getEquipmentStats: builder.query<EquipmentStatsResponse, void>({
      query: () => '/equipment/stats',
      providesTags: ['Equipment', 'Maintenance'],
    }),

    getEquipmentById: builder.query<{ success: boolean; data: Equipment }, string>({
      query: (id) => `/equipment/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Equipment', id }],
    }),

    createEquipment: builder.mutation<
      { success: boolean; data: Equipment; message?: string },
      Partial<Equipment>
    >({
      query: (body) => ({
        url: '/equipment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Equipment'],
    }),

    updateEquipment: builder.mutation<
      { success: boolean; data: Equipment; message?: string },
      { id: string; data: Partial<Equipment> }
    >({
      query: ({ id, data }) => ({
        url: `/equipment/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Equipment', id }, 'Equipment'],
    }),

    deleteEquipment: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/equipment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Equipment'],
    }),

    // Maintenance Logs
    getMaintenanceLogs: builder.query<
      { success: boolean; data: MaintenanceLog[] },
      { equipmentId?: string } | void
    >({
      query: (params) => ({
        url: '/equipment/maintenance',
        params: params || undefined,
      }),
      providesTags: ['Maintenance'],
    }),

    createMaintenanceLog: builder.mutation<
      { success: boolean; data: MaintenanceLog; message?: string },
      Partial<MaintenanceLog>
    >({
      query: (body) => ({
        url: '/equipment/maintenance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Maintenance', 'Equipment'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEquipmentQuery,
  useGetEquipmentStatsQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useGetMaintenanceLogsQuery,
  useCreateMaintenanceLogMutation,
} = equipmentApi;
