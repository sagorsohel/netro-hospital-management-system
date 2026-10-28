import { baseApi } from './baseApi';

export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  headOfDepartment?: string;
  floor?: string;
  roomNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  doctorsCount?: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DepartmentSingleResponse {
  success: boolean;
  message?: string;
  data: Department;
}

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<
      DepartmentListResponse,
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/departments',
        params: params || undefined,
      }),
      providesTags: ['Departments'],
    }),

    getDepartmentById: builder.query<DepartmentSingleResponse, string>({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Departments', id }],
    }),

    createDepartment: builder.mutation<DepartmentSingleResponse, Partial<Department>>({
      query: (body) => ({
        url: '/departments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Departments'],
    }),

    updateDepartment: builder.mutation<
      DepartmentSingleResponse,
      { id: string; data: Partial<Department> }
    >({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Departments'],
    }),

    deleteDepartment: builder.mutation<{ success: boolean; message: string; deletedId: string }, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),

    uploadDepartmentImage: builder.mutation<{ success: boolean; url: string; message: string }, FormData>({
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
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useUploadDepartmentImageMutation,
} = departmentApi;
