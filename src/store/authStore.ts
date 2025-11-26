import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  getAuth: () => User | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUserLocation: (latitude: number, longitude: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      getAuth: () => get().user,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateUserLocation: (latitude, longitude) =>
        set((state) => ({
          user: state.user ? { ...state.user, latitude, longitude } : null,
        })),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
