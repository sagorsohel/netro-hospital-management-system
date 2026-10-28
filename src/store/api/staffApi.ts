import { baseApi } from './baseApi';

export interface StaffDocument {
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  departmentId?: string;
  department: string;
  phone: string;
  email?: string;
  address?: string;
  photo?: string;
  joiningDate?: string;
  salary?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  qualification?: string;
  documents?: StaffDocument[];
  status: 'Active' | 'On Leave' | 'Resigned';
  createdAt?: string;
  updatedAt?: string;
}

export interface DutyRoster {
  id: string;
  staffId: string;
  staffName: string;
  staffRole?: string;
  department: string;
  shift: string;
  date: string;
  wardOrRoom?: string;
  status: 'Scheduled' | 'Present' | 'Completed' | 'Absent';
  notes?: string;
  createdAt?: string;
}

export interface Payroll {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  basicSalary: string;
  bonus?: string;
  deduction?: string;
  netSalary: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate?: string;
  paymentMethod?: string;
  remarks?: string;
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  createdAt?: string;
}

export interface StaffListResponse {
  success: boolean;
  data: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StaffStatsResponse {
  success: boolean;
  stats: {
    totalStaff: number;
    monthlyPayrollTotal: number;
    onDutyToday: number;
    pendingLeaves: number;
  };
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Staff Directory
    getStaff: builder.query<
      StaffListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        department?: string;
        designation?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: '/staff',
        params: params || undefined,
      }),
      providesTags: ['Staff'],
    }),

    getStaffStats: builder.query<StaffStatsResponse, void>({
      query: () => '/staff/stats',
      providesTags: ['Staff', 'Rosters', 'Leaves', 'Payrolls'],
    }),

    getStaffById: builder.query<{ success: boolean; data: Staff }, string>({
      query: (id) => `/staff/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Staff', id }],
    }),

    createStaff: builder.mutation<{ success: boolean; data: Staff; message?: string }, Partial<Staff>>({
      query: (body) => ({
        url: '/staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    updateStaff: builder.mutation<
      { success: boolean; data: Staff; message?: string },
      { id: string; data: Partial<Staff> }
    >({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Staff', id }, 'Staff'],
    }),

    deleteStaff: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),

    // Duty Rosters
    getDutyRosters: builder.query<
      { success: boolean; data: DutyRoster[] },
      { date?: string; shift?: string; department?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/staff/rosters',
        params: params || undefined,
      }),
      providesTags: ['Rosters'],
    }),

    createDutyRoster: builder.mutation<
      { success: boolean; data: DutyRoster; message?: string },
      Partial<DutyRoster>
    >({
      query: (body) => ({
        url: '/staff/rosters',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rosters', 'Staff'],
    }),

    updateDutyRoster: builder.mutation<
      { success: boolean; data: DutyRoster; message?: string },
      { id: string; data: Partial<DutyRoster> }
    >({
      query: ({ id, data }) => ({
        url: `/staff/rosters/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Rosters'],
    }),

    deleteDutyRoster: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/staff/rosters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rosters'],
    }),

    // Payrolls
    getPayrolls: builder.query<
      { success: boolean; data: Payroll[] },
      { month?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/staff/payrolls',
        params: params || undefined,
      }),
      providesTags: ['Payrolls'],
    }),

    createPayroll: builder.mutation<
      { success: boolean; data: Payroll; message?: string },
      Partial<Payroll>
    >({
      query: (body) => ({
        url: '/staff/payrolls',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payrolls', 'Staff'],
    }),

    // Leaves
    getLeaveRequests: builder.query<
      { success: boolean; data: LeaveRequest[] },
      { status?: string } | void
    >({
      query: (params) => ({
        url: '/staff/leaves',
        params: params || undefined,
      }),
      providesTags: ['Leaves'],
    }),

    createLeaveRequest: builder.mutation<
      { success: boolean; data: LeaveRequest; message?: string },
      Partial<LeaveRequest>
    >({
      query: (body) => ({
        url: '/staff/leaves',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves', 'Staff'],
    }),

    updateLeaveStatus: builder.mutation<
      { success: boolean; data: LeaveRequest; message?: string },
      { id: string; status: 'Approved' | 'Rejected' | 'Pending'; approvedBy?: string }
    >({
      query: ({ id, status, approvedBy }) => ({
        url: `/staff/leaves/${id}/status`,
        method: 'PATCH',
        body: { status, approvedBy },
      }),
      invalidatesTags: ['Leaves', 'Staff'],
    }),

    uploadStaffFile: builder.mutation<
      { success: boolean; url: string; name?: string; size?: number; mimetype?: string; message?: string },
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
  useGetStaffQuery,
  useGetStaffStatsQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useGetDutyRostersQuery,
  useCreateDutyRosterMutation,
  useUpdateDutyRosterMutation,
  useDeleteDutyRosterMutation,
  useGetPayrollsQuery,
  useCreatePayrollMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useUploadStaffFileMutation,
} = staffApi;
