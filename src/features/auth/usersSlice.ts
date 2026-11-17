import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { User, UserStatus } from '../../types';
import { mockUsers, mockUsersById, CURRENT_USER_ID } from '../../mock/users.mock';

export interface UsersState {
  currentUserId: string;
  entities: Record<string, User>;
  ids: string[];
  loading: boolean;
  error: string | null;
}

const initialEntities: Record<string, User> = { ...mockUsersById };
const initialIds: string[] = mockUsers.map(u => u.id);

const initialState: UsersState = {
  currentUserId: CURRENT_USER_ID,
  entities: initialEntities,
  ids: initialIds,
  loading: false,
  error: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUserStatus: (state, action: PayloadAction<UserStatus>) => {
      const user = state.entities[state.currentUserId];
      if (user) {
        user.status = action.payload;
        if (action.payload === 'offline') {
          user.lastSeen = new Date().toISOString();
        }
      }
    },
    updateCurrentUserProfile: (
      state,
      action: PayloadAction<{ name?: string; customBio?: string; avatarUrl?: string }>
    ) => {
      const user = state.entities[state.currentUserId];
      if (user) {
        if (action.payload.name !== undefined) user.name = action.payload.name;
        if (action.payload.customBio !== undefined) user.customBio = action.payload.customBio;
        if (action.payload.avatarUrl !== undefined) user.avatarUrl = action.payload.avatarUrl;
      }
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; status: UserStatus; lastSeen?: string }>
    ) => {
      const user = state.entities[action.payload.userId];
      if (user) {
        user.status = action.payload.status;
        if (action.payload.lastSeen) {
          user.lastSeen = action.payload.lastSeen;
        } else if (action.payload.status === 'offline') {
          user.lastSeen = new Date().toISOString();
        }
      }
    },
  },
});

export const { setCurrentUserStatus, updateCurrentUserProfile, updateUserStatus } =
  usersSlice.actions;

// Type-safe root state interface accessor
interface HasUsersState {
  users: UsersState;
}

export const selectUsersState = (state: HasUsersState) => state.users;

export const selectCurrentUserId = (state: HasUsersState) => state.users.currentUserId;

export const selectUsersEntities = (state: HasUsersState) => state.users.entities;

export const selectCurrentUser = createSelector(
  [selectUsersEntities, selectCurrentUserId],
  (entities, currentUserId) => entities[currentUserId]
);

export const selectAllUsers = createSelector(
  [selectUsersEntities, (state: HasUsersState) => state.users.ids],
  (entities, ids) => ids.map(id => entities[id]).filter((u): u is User => Boolean(u))
);

export const selectUserById = (userId: string) => (state: HasUsersState): User | undefined =>
  state.users.entities[userId];

export default usersSlice.reducer;
