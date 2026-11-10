import { baseApi } from './baseApi';

export interface DoctorSerial {
  id: string;
  tokenNo: string;
  serialNumber: number;
  doctorId: string;
  doctorName: string;
  doctorDepartment: string;
  doctorRoomNumber: string;
  doctorSerialContact?: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | string;
  patientGender?: 'Male' | 'Female' | 'Other' | string;
  patientAddress?: string;
  appointmentDate: string; // YYYY-MM-DD
  estimatedTime: string; // e.g. "05:30 PM"
  visitType: 'First Visit' | 'Follow-up' | 'Report Show' | 'Emergency';
  consultationFee: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Card';
  symptoms?: string;
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface SerialQueryParams {
  search?: string;
  doctorId?: string;
  date?: string;
  status?: string;
  patientPhone?: string;
  page?: number;
  limit?: number;
}

export interface CreateSerialPayload {
  doctorId: string;
  doctorName: string;
  doctorDepartment?: string;
  doctorRoomNumber?: string;
  doctorSerialContact?: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | string;
  patientGender?: string;
  patientAddress?: string;
  appointmentDate: string;
  estimatedTime?: string;
  visitType: 'First Visit' | 'Follow-up' | 'Report Show' | 'Emergency';
  consultationFee: number;
  discount?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partial';
  paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Card';
  symptoms?: string;
  status?: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
}

const STORAGE_KEY = 'netro_hospital_doctor_serials_v1';

const getInitialMockSerials = (): DoctorSerial[] => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: 'srl-001',
      tokenNo: `SRL-${today.replace(/-/g, '')}-001`,
      serialNumber: 1,
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. Tariqul Islam',
      doctorDepartment: 'Ophthalmology',
      doctorRoomNumber: 'Room 301 (3rd Floor)',
      doctorSerialContact: '01711-002233',
      patientId: 'PAT-2026-0001',
      patientName: 'Mohammad Rahim Uddin',
      patientPhone: '01712-345678',
      patientAge: 58,
      patientGender: 'Male',
      patientAddress: 'Dhanmondi, Dhaka',
      appointmentDate: today,
      estimatedTime: '05:00 PM',
      visitType: 'Follow-up',
      consultationFee: 500,
      discount: 0,
      paidAmount: 500,
      dueAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      symptoms: 'Post-op Phaco cataract follow-up, mild itching in left eye',
      status: 'Completed',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'srl-002',
      tokenNo: `SRL-${today.replace(/-/g, '')}-002`,
      serialNumber: 2,
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. Tariqul Islam',
      doctorDepartment: 'Ophthalmology',
      doctorRoomNumber: 'Room 301 (3rd Floor)',
      doctorSerialContact: '01711-002233',
      patientId: 'PAT-2026-0002',
      patientName: 'Begum Rokeya Sultana',
      patientPhone: '01819-234567',
      patientAge: 46,
      patientGender: 'Female',
      patientAddress: 'Uttara Sector 7, Dhaka',
      appointmentDate: today,
      estimatedTime: '05:20 PM',
      visitType: 'First Visit',
      consultationFee: 1200,
      discount: 0,
      paidAmount: 1200,
      dueAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'bKash',
      symptoms: 'Blurry distance vision & dry eyes while reading',
      status: 'In Consultation',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'srl-003',
      tokenNo: `SRL-${today.replace(/-/g, '')}-003`,
      serialNumber: 3,
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. Tariqul Islam',
      doctorDepartment: 'Ophthalmology',
      doctorRoomNumber: 'Room 301 (3rd Floor)',
      doctorSerialContact: '01711-002233',
      patientId: 'PAT-2026-0003',
      patientName: 'Kazi Mofazzal Hossain',
      patientPhone: '01911-889900',
      patientAge: 62,
      patientGender: 'Male',
      patientAddress: 'Mirpur-10, Dhaka',
      appointmentDate: today,
      estimatedTime: '05:40 PM',
      visitType: 'First Visit',
      consultationFee: 1200,
      discount: 200,
      paidAmount: 1000,
      dueAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      symptoms: 'Diabetic retinopathy screening report consultation',
      status: 'Waiting',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'srl-004',
      tokenNo: `SRL-${today.replace(/-/g, '')}-004`,
      serialNumber: 4,
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. Tariqul Islam',
      doctorDepartment: 'Ophthalmology',
      doctorRoomNumber: 'Room 301 (3rd Floor)',
      doctorSerialContact: '01711-002233',
      patientId: 'PAT-2026-0004',
      patientName: 'Nusrat Jahan',
      patientPhone: '01678-554433',
      patientAge: 29,
      patientGender: 'Female',
      patientAddress: 'Gulshan-1, Dhaka',
      appointmentDate: today,
      estimatedTime: '06:00 PM',
      visitType: 'First Visit',
      consultationFee: 1200,
      discount: 0,
      paidAmount: 1200,
      dueAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Nagad',
      symptoms: 'Sudden eye redness and watering since morning',
      status: 'Waiting',
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'srl-005',
      tokenNo: `SRL-${today.replace(/-/g, '')}-001`,
      serialNumber: 1,
      doctorId: 'doc-2',
      doctorName: 'Dr. Mahbubur Rahman',
      doctorDepartment: 'Cornea & Vitreo-Retina',
      doctorRoomNumber: 'Room 204 (2nd Floor)',
      doctorSerialContact: '01722-114455',
      patientId: 'PAT-2026-0005',
      patientName: 'Abdul Alim',
      patientPhone: '01733-445566',
      patientAge: 51,
      patientGender: 'Male',
      patientAddress: 'Mohakhali, Dhaka',
      appointmentDate: today,
      estimatedTime: '06:30 PM',
      visitType: 'First Visit',
      consultationFee: 1000,
      discount: 0,
      paidAmount: 1000,
      dueAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      symptoms: 'Corneal irritation after foreign body sensation',
      status: 'Waiting',
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ];
};

export const getStoredSerials = (): DoctorSerial[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMockSerials();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getInitialMockSerials();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch {
    return getInitialMockSerials();
  }
};

export const saveStoredSerials = (list: DoctorSerial[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save serials to localStorage', err);
  }
};

export const serialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctorSerials: builder.query<
      {
        success: boolean;
        data: DoctorSerial[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
        queueMetrics?: {
          totalBooked: number;
          waitingCount: number;
          completedCount: number;
          currentServingSerial: number | null;
          nextSerialToCall: number | null;
        };
      },
      SerialQueryParams | void
    >({
      // We query backend /appointments with query params
      queryFn: async (params = {}) => {
        const stored = getStoredSerials();

        const search = (params?.search || '').toLowerCase().trim();
        const docId = params?.doctorId;
        const date = params?.date;
        const status = params?.status;
        const phone = (params?.patientPhone || '').trim();

        let filtered = stored.filter((item) => {
          if (docId && docId !== 'all' && item.doctorId !== docId) return false;
          if (date && date !== 'all' && item.appointmentDate !== date) return false;
          if (status && status !== 'all' && item.status !== status) return false;
          if (phone && !item.patientPhone.includes(phone)) return false;

          if (search) {
            const matchName = item.patientName.toLowerCase().includes(search);
            const matchPhone = item.patientPhone.toLowerCase().includes(search);
            const matchToken = item.tokenNo.toLowerCase().includes(search);
            const matchDoc = item.doctorName.toLowerCase().includes(search);
            const matchSerial = String(item.serialNumber) === search;
            const matchId = (item.patientId || '').toLowerCase().includes(search);
            if (!matchName && !matchPhone && !matchToken && !matchDoc && !matchSerial && !matchId) {
              return false;
            }
          }
          return true;
        });

        // Sort: by date desc, then serialNumber asc
        filtered.sort((a, b) => {
          if (a.appointmentDate !== b.appointmentDate) {
            return b.appointmentDate.localeCompare(a.appointmentDate);
          }
          return a.serialNumber - b.serialNumber;
        });

        // Queue metrics for currently active filter
        const currentActiveDocSerials = stored.filter(
          (s) =>
            (!docId || docId === 'all' || s.doctorId === docId) &&
            (!date || date === 'all' || s.appointmentDate === date)
        );

        const waiting = currentActiveDocSerials.filter((s) => s.status === 'Waiting');
        const inConsultation = currentActiveDocSerials.find((s) => s.status === 'In Consultation');
        const completed = currentActiveDocSerials.filter((s) => s.status === 'Completed');

        const queueMetrics = {
          totalBooked: currentActiveDocSerials.length,
          waitingCount: waiting.length,
          completedCount: completed.length,
          currentServingSerial: inConsultation ? inConsultation.serialNumber : null,
          nextSerialToCall: waiting.length > 0 ? waiting[0].serialNumber : null,
        };

        return {
          data: {
            success: true,
            data: filtered,
            pagination: {
              total: filtered.length,
              page: params?.page || 1,
              limit: params?.limit || 50,
              totalPages: 1,
            },
            queueMetrics,
          },
        };
      },
      providesTags: ['Appointments'],
    }),

    createDoctorSerial: builder.mutation<
      { success: boolean; message: string; data: DoctorSerial },
      CreateSerialPayload
    >({
      queryFn: async (payload) => {
        const stored = getStoredSerials();
        const date = payload.appointmentDate || new Date().toISOString().slice(0, 10);

        // Find max serial number for this doctor on this date
        const forSameDocDate = stored.filter(
          (s) => s.doctorId === payload.doctorId && s.appointmentDate === date
        );
        const maxSerial = forSameDocDate.reduce((max, s) => Math.max(max, s.serialNumber || 0), 0);
        const assignedSerial = maxSerial + 1;

        const dateClean = date.replace(/[^0-9]/g, '');
        const tokenNo = `SRL-${dateClean}-${String(assignedSerial).padStart(3, '0')}`;
        const newId = `srl-${Date.now()}`;

        // Compute estimated time based on default 5:00 PM start + 15 mins per patient
        const defaultTime = payload.estimatedTime || (() => {
          const baseHour = 17; // 5 PM
          const totalMinutes = (assignedSerial - 1) * 15;
          const targetHour = Math.floor(baseHour + totalMinutes / 60);
          const mins = totalMinutes % 60;
          const period = targetHour >= 12 ? 'PM' : 'AM';
          const displayHour = targetHour > 12 ? targetHour - 12 : targetHour;
          return `${String(displayHour).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
        })();

        const disc = payload.discount || 0;
        const fee = payload.consultationFee || 1000;
        const grandTotal = Math.max(0, fee - disc);
        const paid = payload.paidAmount !== undefined ? payload.paidAmount : grandTotal;
        const due = Math.max(0, grandTotal - paid);

        const newSerial: DoctorSerial = {
          id: newId,
          tokenNo,
          serialNumber: assignedSerial,
          doctorId: payload.doctorId,
          doctorName: payload.doctorName,
          doctorDepartment: payload.doctorDepartment || 'General Medicine',
          doctorRoomNumber: payload.doctorRoomNumber || 'Room 101',
          doctorSerialContact: payload.doctorSerialContact || '01700-000000',
          patientId: payload.patientId || `PAT-${Date.now().toString().slice(-4)}`,
          patientName: payload.patientName,
          patientPhone: payload.patientPhone,
          patientAge: payload.patientAge,
          patientGender: payload.patientGender || 'Male',
          patientAddress: payload.patientAddress || '',
          appointmentDate: date,
          estimatedTime: defaultTime,
          visitType: payload.visitType || 'First Visit',
          consultationFee: fee,
          discount: disc,
          paidAmount: paid,
          dueAmount: due,
          paymentStatus: due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
          paymentMethod: payload.paymentMethod || 'Cash',
          symptoms: payload.symptoms || '',
          status: payload.status || 'Waiting',
          createdAt: new Date().toISOString(),
        };

        const updatedList = [newSerial, ...stored];
        saveStoredSerials(updatedList);

        return {
          data: {
            success: true,
            message: `Serial #${assignedSerial} confirmed successfully!`,
            data: newSerial,
          },
        };
      },
      invalidatesTags: ['Appointments'],
    }),

    updateDoctorSerialStatus: builder.mutation<
      { success: boolean; message: string; data: DoctorSerial },
      { id: string; status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' }
    >({
      queryFn: async ({ id, status }) => {
        const stored = getStoredSerials();
        const index = stored.findIndex((s) => s.id === id);
        if (index === -1) {
          return { error: { status: 404, data: { message: 'Serial record not found' } } };
        }

        const updated: DoctorSerial = {
          ...stored[index],
          status,
          updatedAt: new Date().toISOString(),
        };

        // If this one is moving to "In Consultation", set any other serial for the same doctor that was "In Consultation" to "Completed"
        let newList = [...stored];
        if (status === 'In Consultation') {
          newList = newList.map((item) => {
            if (
              item.id !== id &&
              item.doctorId === updated.doctorId &&
              item.appointmentDate === updated.appointmentDate &&
              item.status === 'In Consultation'
            ) {
              return { ...item, status: 'Completed', updatedAt: new Date().toISOString() };
            }
            return item;
          });
        }

        const targetIdx = newList.findIndex((s) => s.id === id);
        newList[targetIdx] = updated;
        saveStoredSerials(newList);

        return {
          data: {
            success: true,
            message: `Serial #${updated.serialNumber} marked as ${status}`,
            data: updated,
          },
        };
      },
      invalidatesTags: ['Appointments'],
    }),

    deleteDoctorSerial: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      queryFn: async (id) => {
        const stored = getStoredSerials();
        const filtered = stored.filter((s) => s.id !== id);
        saveStoredSerials(filtered);
        return {
          data: {
            success: true,
            message: 'Serial booking cancelled and removed',
          },
        };
      },
      invalidatesTags: ['Appointments'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDoctorSerialsQuery,
  useCreateDoctorSerialMutation,
  useUpdateDoctorSerialStatusMutation,
  useDeleteDoctorSerialMutation,
} = serialApi;

