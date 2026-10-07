import { create } from 'zustand';

export type UserRole = 'customer' | 'staff' | 'owner';

interface User {
  id: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
