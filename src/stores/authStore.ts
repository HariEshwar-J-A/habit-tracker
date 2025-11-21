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
  resendVerificationEmail: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            if (error.message.includes('Email not confirmed')) {
              throw new Error('Please verify your email before logging in');
            }
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password');
            }
            throw new Error('Login failed. Please try again');
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
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Login failed. Please try again');
        }
      },

      signup: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

          if (error) {
            if (error.message.includes('already registered')) {
              throw new Error('This email is already registered');
            }
            throw new Error('Signup failed. Please try again');
          }

          if (data.user) {
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                email: data.user.email!,
                isEmailVerified: false,
              },
            });
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Signup failed. Please try again');
        }
      },

    logout: async         () => {
      // Always clear local state, regardless of API call success
      // This handles cases where the session doesn't exist on the server
      try {
        await supabase.auth.signOut();
      } catch (error) {
        // Ignore signOut errors - we'll clear local state anyway
        console.error('SignOut API error (clearing local state anyway):', error);
      }
      
      // Always clear authentication state
      set({
        isAuthenticated: false,
        user: null,
      });
    
      },

      verifyEmail: async (token: string) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            throw new Error('Email verification failed. Please try again');
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
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Email verification failed. Please try again');
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
          if (error) {
            throw new Error('Password reset failed. Please try again');
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Password reset failed. Please try again');
        }
      },

      resendVerificationEmail: async () => {
        const currentUser = get().user;
        if (!currentUser?.email) {
          throw new Error('No user email found');
        }

        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: currentUser.email,
          });

          if (error) {
            throw new Error('Failed to resend verification email');
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Failed to resend verification email');
        }
      },

      loginWithProvider: async (provider: 'google' | 'github') => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
      // redirectTo is already configured in the Supabase client
    }}
          });

          if (error) {
            throw new Error('OAuth login failed. Please try again');
          }

          return data;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('OAuth login failed. Please try again');
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
