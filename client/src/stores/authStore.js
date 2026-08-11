import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
const useAuthStore = create()(
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
          const res = await api.get('/auth/me');
          const data = res.data.data;
          set({ user: data ?? null });
          return data ?? null;
        } finally {
          set({ loading: false });
        }
      },
      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
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
function clearAuthOnExpiry() {
  window.addEventListener('auth:expired', () => {
    useAuthStore.setState({ user: null });
    window.location.href = '/login';
  });
}
export { clearAuthOnExpiry, useAuthStore };
