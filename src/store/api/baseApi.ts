import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // 1. Try to read token from Redux auth slice state
      const state = getState() as RootState;
      let token = state?.auth?.token;

      // 2. Fallback to localStorage if state is rehydrating
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        try {
          const raw = localStorage.getItem('netro_auth_state');
          if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed?.token || null;
          }
        } catch {
          // ignore
        }
      }

      // 3. Attach Bearer token if present
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('accept', 'application/json');

      return headers;
    },
  }),
  tagTypes: ['Auth', 'Doctors', 'Patients', 'Appointments', 'Medicines', 'Invoices', 'Stats', 'Departments', 'Expenses'],

  endpoints: () => ({}),
});
