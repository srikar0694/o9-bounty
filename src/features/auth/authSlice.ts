import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';
import type { UserRow } from '../../types/database';
import type { RootState } from '../../app/store';

interface AuthState {
  session: Session | null;
  profile: UserRow | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  session: null,
  profile: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.isLoading = false;
    },
    setProfile: (state, action: PayloadAction<UserRow | null>) => {
      state.profile = action.payload;
    },
    clearSession: (state) => {
      state.session = null;
      state.profile = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSession, setProfile, clearSession, setLoading } = authSlice.actions;

// Selectors
export const selectSession = (state: RootState) => state.auth.session;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.session;
export const selectIsAdmin = (state: RootState) => state.auth.profile?.is_admin ?? false;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;