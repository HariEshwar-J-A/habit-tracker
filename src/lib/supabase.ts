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

// Handle email verification callback
export const handleEmailVerification = async () => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const token = params.get('confirmation_token');
  
  if (token) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    
    if (error) {
      throw error;
    }
  }
};