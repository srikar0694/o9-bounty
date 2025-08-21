import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import filtersReducer from '../features/filters/filtersSlice';
import { rtkApi } from '../services/rtkApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    filters: filtersReducer,
    [rtkApi.reducerPath]: rtkApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [rtkApi.util.resetApiState.type],
      },
    }).concat(rtkApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;