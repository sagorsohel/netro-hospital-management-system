import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AppModule = 'hospital' | 'pharmacy' | 'selection';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  branchName?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  activeModule: AppModule | null;
}

const savedAuth = (() => {
  try {
    const raw = localStorage.getItem('netro_auth_state');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
})();

const initialState: AuthState = savedAuth || {
  isAuthenticated: false,
  token: null,
  user: null,
  activeModule: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: UserProfile; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.activeModule = 'selection';

      try {
        localStorage.setItem('netro_auth_state', JSON.stringify(state));
        localStorage.setItem('token', action.payload.token);
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.activeModule = null;
      try {
        localStorage.removeItem('netro_auth_state');
        localStorage.removeItem('token');
      } catch {
        // ignore
      }
    },
    setActiveModule: (state, action: PayloadAction<AppModule>) => {
      state.activeModule = action.payload;
      try {
        localStorage.setItem('netro_auth_state', JSON.stringify(state));
      } catch {
        // ignore
      }
    },
  },
});

export const { loginSuccess, logout, setActiveModule } = authSlice.actions;
export default authSlice.reducer;
