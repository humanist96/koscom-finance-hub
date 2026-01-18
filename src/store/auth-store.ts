import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  assignedCompanyIds: string[];
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateAssignedCompanies: (companyIds: string[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (user) => set({ user, isLoggedIn: true }),

      logout: () => set({ user: null, isLoggedIn: false }),

      updateAssignedCompanies: (companyIds) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, assignedCompanyIds: companyIds }
            : null,
        })),
    }),
    {
      name: 'koscom-hub-auth',
    }
  )
);
