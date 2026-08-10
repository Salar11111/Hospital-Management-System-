import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { ApiResponse, User } from '../lib/types';

interface AuthState {
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: true,
      loading: false,

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        const { user } = get();
        if (user) return user;
        set({ loading: true });
        try {
const res = await api.get<ApiResponse<User>>('/auth/me');
        const data = res.data.data;
        set({ user: data ?? null });
        return data ?? null;
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        const res = await api.post<ApiResponse<User>>('/auth/login', { email, password });
        const data = res.data.data;
        if (!data) throw new Error('Login response missing user data');
        set({ user: data });
        return data;
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          set({ user: null });
        }
      },
    }),
    {
      name: 'medicore-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export function clearAuthOnExpiry() {
  window.addEventListener('auth:expired', () => {
    useAuthStore.setState({ user: null });
    window.location.href = '/login';
  });
}