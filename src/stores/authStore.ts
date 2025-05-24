import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        // Mock login
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            email,
            isEmailVerified: true
          }
        });
      },

      signup: async (email: string, password: string) => {
        // Mock signup
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            email,
            isEmailVerified: false
          }
        });
      },

      logout: async () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            set({
              isAuthenticated: false,
              user: null
            });
            resolve();
          }, 500); // Simulate API delay
        });
      },

      verifyEmail: async (token: string) => {
        // Mock email verification
        set((state) => ({
          user: state.user ? {
            ...state.user,
            isEmailVerified: true
          } : null
        }));
      },

      loginWithProvider: async (provider: 'google' | 'github') => {
        // Mock OAuth login
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            email: `user@${provider}.com`,
            isEmailVerified: true
          }
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);