import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      setUser: (user: User | null) => {
        if (user) {
          set({
            isAuthenticated: true,
            user: {
              id: user.id,
              email: user.email!,
              isEmailVerified: user.email_confirmed_at !== null,
            },
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
          });
        }
      },

      login: async (email: string, password: string) => {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            if (error.message === 'Invalid login credentials') {
              throw new Error('Invalid email or password. Please try again.');
            }
            throw error;
          }

          if (data.user) {
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                email: data.user.email!,
                isEmailVerified: data.user.email_confirmed_at !== null,
              },
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      signup: async (email: string, password: string) => {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                email: data.user.email!,
                isEmailVerified: data.user.email_confirmed_at !== null,
              },
            });
          }
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }

          set({
            isAuthenticated: false,
            user: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            set((state) => ({
              user: state.user ? {
                ...state.user,
                isEmailVerified: true,
              } : null,
            }));
          }
        } catch (error) {
          console.error('Email verification error:', error);
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        if (!email) {
          throw new Error('Email is required');
        }

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error('Password reset error:', error);
          throw error;
        }
      },

      loginWithProvider: async (provider: 'google' | 'github') => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth`,
              skipBrowserRedirect: false,
            }
          });

          if (error) {
            throw error;
          }

          return data;
        } catch (error) {
          console.error('OAuth login error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    store.setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    store.setUser(null);
  }
});