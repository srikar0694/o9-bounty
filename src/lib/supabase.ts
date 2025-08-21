import { createClient } from '@supabase/supabase-js';
import type { UserRow } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get current user profile
export const getCurrentUserProfile = async (): Promise<UserRow | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', session.user.id)
    .single();

  return profile;
};

// Helper to check if user is admin
export const checkIsAdmin = async (): Promise<boolean> => {
  const profile = await getCurrentUserProfile();
  return profile?.is_admin ?? false;
};