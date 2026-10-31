import { baseApi } from './baseApi';

export interface ExtraCharge {
  key: string;
  value: number;
  unit?: string;
}

export type RoomStatus = 'Available' | 'Booked' | 'Maintenance' | 'Cleaning';

export interface HospitalRoom {
  id: string;
  name: string;
  roomNumber: string;
  floor: string;
  roomType: string;
  department: string;
  perDayCharge: string | number;
  bedCount: number;
  occupiedBeds: number;
  status: RoomStatus;
  patientName?: string | null;
  admissionId?: string | null;
  bedNumbers?: string[];
  extraCharges: ExtraCharge[];
  amenities: string[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomStats {
  totalRooms: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  availableRooms: number;
  bookedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  floorCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export interface RoomListResponse {
  success: boolean;
  data: HospitalRoom[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoomStatsResponse {
  success: boolean;
  stats: RoomStats;
}

export interface SingleRoomResponse {
  success: boolean;
  data: HospitalRoom;
  message?: string;
}

export interface RoomQueryParams {
  search?: string;
  floor?: string;
  status?: string;
  roomType?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<RoomListResponse, RoomQueryParams | void>({
      query: (params) => ({
        url: '/rooms',
        params: params || undefined,
      }),
      providesTags: ['Rooms'],
    }),

    getRoomStats: builder.query<RoomStatsResponse, void>({
      query: () => '/rooms/stats',
      providesTags: ['Rooms'],
    }),

    getRoomById: builder.query<SingleRoomResponse, string>({
      query: (id) => `/rooms/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Rooms', id }],
    }),

    createRoom: builder.mutation<SingleRoomResponse, Partial<HospitalRoom>>({
      query: (roomData) => ({
        url: '/rooms',
        method: 'POST',
        body: roomData,
      }),
      invalidatesTags: ['Rooms'],
    }),

    updateRoom: builder.mutation<
      SingleRoomResponse,
      { id: string; data: Partial<HospitalRoom> }
    >({
      query: ({ id, data }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Rooms'],
    }),

    toggleRoomStatus: builder.mutation<
      SingleRoomResponse,
      {
        id: string;
        status: RoomStatus;
        patientName?: string | null;
        admissionId?: string | null;
        occupiedBeds?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Rooms'],
    }),

    deleteRoom: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rooms'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomsQuery,
  useGetRoomStatsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useToggleRoomStatusMutation,
  useDeleteRoomMutation,
} = roomApi;
