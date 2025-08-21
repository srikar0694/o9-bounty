import React, { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { setSession, setProfile, setLoading } from '../features/auth/authSlice';
import { supabase } from '../lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
      
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('users')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single()
          .then(({ data }) => {
            dispatch(setProfile(data));
            dispatch(setLoading(false));
          });
      } else {
        dispatch(setLoading(false));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch(setSession(session));

        if (session?.user && event === 'SIGNED_IN') {
          // Fetch or create user profile
          let { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', session.user.id)
            .single();

          if (!profile) {
            // Create new user profile
            const { data: newProfile } = await supabase
              .from('users')
              .insert({
                auth_uid: session.user.id,
                email: session.user.email || '',
                display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                is_admin: false,
              })
              .select()
              .single();
            profile = newProfile;
          }

          dispatch(setProfile(profile));
        } else if (event === 'SIGNED_OUT') {
          dispatch(setProfile(null));
        }
        
        dispatch(setLoading(false));
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}