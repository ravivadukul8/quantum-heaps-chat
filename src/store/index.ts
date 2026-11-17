import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, type RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Re-export actions & selectors for centralized store access
export * from '../features/auth/usersSlice';
export * from '../features/conversations/conversationsSlice';
export * from '../features/conversations/conversationsSelectors';
export * from '../features/messages/messagesSlice';
export * from '../features/messages/messagesSelectors';
export * from '../features/groups/groupsSlice';
export * from '../features/settings/uiSlice';
