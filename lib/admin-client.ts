import { supabaseAdmin } from './supabase';

/**
 * Helper function to ensure supabaseAdmin is available
 * Throws an error if the admin client is not configured
 */
export function ensureSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
  }
  return supabaseAdmin;
}
