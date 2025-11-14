import { create } from 'zustand';
import * as api from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; role: 'director' | 'teacher' } | null;
  login: (dni: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (dni, password) => {
    try {
      const result = await api.login(dni, password);
      if (result) {
        set({ isAuthenticated: true, user: result.user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },
  logout: () => {
    api.logout(); // In a real app, this might invalidate a server session
    set({ isAuthenticated: false, user: null });
  },
}));
