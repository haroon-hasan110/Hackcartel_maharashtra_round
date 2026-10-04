import { createClient } from '@supabase/supabase-js';

const normalizeEnv = (value: string | undefined): string =>
  (value ?? '')
    .trim()
    .replace(/^\\?['"]/, '')
    .replace(/\\?['"]$/, '');

const supabaseUrl = normalizeEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = normalizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);
const supabaseRedirectUrl = normalizeEnv(import.meta.env.VITE_SUPABASE_REDIRECT_URL);

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const hasPlaceholderSupabaseUrl = /your-project\.supabase\.co/i.test(supabaseUrl);
export const hasValidSupabaseConfig = hasSupabaseConfig && !hasPlaceholderSupabaseUrl;

export const getSupabaseOAuthRedirectUrl = (): string | null => {
  if (supabaseRedirectUrl.trim()) {
    return supabaseRedirectUrl.trim();
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/`;
  }

  return null;
};

export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
