import { combineReducers } from '@reduxjs/toolkit';
import usersReducer from '../features/auth/usersSlice';
import conversationsReducer from '../features/conversations/conversationsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import groupsReducer from '../features/groups/groupsSlice';
import uiReducer from '../features/settings/uiSlice';

export const rootReducer = combineReducers({
  users: usersReducer,
  conversations: conversationsReducer,
  messages: messagesReducer,
  groups: groupsReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
