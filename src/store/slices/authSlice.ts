import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AppModule = 'hospital' | 'pharmacy' | 'selection';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Hospital Director' | 'Pharmacist' | 'Receptionist';
  avatar: string;
  branchName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
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
  user: null,
  activeModule: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ email: string; name?: string; role?: UserProfile['role'] }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        id: 'usr-admin-01',
        name: action.payload.name || 'Dr. Sohel Sagor',
        email: action.payload.email,
        role: action.payload.role || 'Hospital Director',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        branchName: 'Main Hospital Branch',
      };
      // Once logged in, show module selection screen
      state.activeModule = 'selection';

      try {
        localStorage.setItem('netro_auth_state', JSON.stringify(state));
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.activeModule = null;
      try {
        localStorage.removeItem('netro_auth_state');
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

export const { login, logout, setActiveModule } = authSlice.actions;
export default authSlice.reducer;
