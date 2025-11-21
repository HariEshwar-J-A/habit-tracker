import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const getBaseUrl = () => {
  return window.location.origin || window.location.href.split('/auth')[0];
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    redirectTo: `${getBaseUrl()}/auth/callback`,
  },
});

// Handle both OAuth and email verification callbacks
export const handleAuthCallback = async () => {
  try {
    // Check if this is an OAuth callback (has 'code' parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const code = urlParams.get('code');
    const emailToken = hashParams.get('confirmation_token');
    
    if (code) {
      // OAuth callback - exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('OAuth callback error:', error);
        throw new Error('Failed to complete sign in. Please try again.');
      }
      
      return { user: data.user, type: 'oauth' };
    } else if (emailToken) {
      // Email verification callback
      const { error } = await supabase.auth.verifyOtp({
        token_hash: emailToken,
        type: 'email',
      });
      
      if (error) {
        console.error('Email verification error:', error);
        throw new Error('Email verification failed. Please try again.');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      return { user, type: 'email' };
    }
    
    return { user: null, type: 'unknown' };
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

// Keep the old function for backwards compatibility
export const handleEmailVerification = async () => {
  const result = await handleAuthCallback();
  return result;
};
