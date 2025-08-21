import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  bugDetailId: string | null;
  suggestUsersOpen: boolean;
  toasts: Toast[];
  activeTab: string;
}

const initialState: UIState = {
  bugDetailId: null,
  suggestUsersOpen: false,
  toasts: [],
  activeTab: 'open-bugs',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBugDetailId: (state, action: PayloadAction<string | null>) => {
      state.bugDetailId = action.payload;
    },
    setSuggestUsersOpen: (state, action: PayloadAction<boolean>) => {
      state.suggestUsersOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setBugDetailId,
  setSuggestUsersOpen,
  addToast,
  removeToast,
  setActiveTab,
} = uiSlice.actions;

// Selectors
export const selectBugDetailId = (state: RootState) => state.ui.bugDetailId;
export const selectSuggestUsersOpen = (state: RootState) => state.ui.suggestUsersOpen;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectActiveTab = (state: RootState) => state.ui.activeTab;

export default uiSlice.reducer;