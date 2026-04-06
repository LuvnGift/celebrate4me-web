'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@celebrate4me/shared';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearAuth: () => {
        set({ user: null });
        clearSessionCookie();
      },
    }),
    { name: 'auth-user' },
  ),
);
