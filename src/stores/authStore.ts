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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
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
      },

      signup: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
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
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }

        set({
          isAuthenticated: false,
          user: null,
        });
      },

      verifyEmail: async (token: string) => {
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
      },

      loginWithProvider: async (provider: 'google' | 'github') => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
        });

        if (error) {
          throw error;
        }

        // OAuth redirects to the provider, so we don't set state here
        // State will be updated when the user returns via the auth listener
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
    store.login(session.user.email!, ''); // Password not needed as user is already authenticated
  } else if (event === 'SIGNED_OUT') {
    store.logout();
  }
});