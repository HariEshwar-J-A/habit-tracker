import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the base URL for redirects, handling WebContainer environment
const getBaseUrl = () => {
  // In WebContainer, window.location.origin might not be reliable
  // Use the current URL path as fallback
  return window.location.origin || window.location.href.split('/auth')[0];
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    // Use dynamic base URL for redirects
    redirectTo: `${getBaseUrl()}/auth/callback`,
  },
});