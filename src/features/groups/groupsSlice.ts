import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GroupsState {
  isGroupInfoDrawerOpen: boolean;
  isAddMemberModalOpen: boolean;
  isCreateGroupModalOpen: boolean;
  selectedGroupId: string | null;
}

const initialState: GroupsState = {
  isGroupInfoDrawerOpen: false,
  isAddMemberModalOpen: false,
  isCreateGroupModalOpen: false,
  selectedGroupId: null,
};

export const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    toggleGroupInfoDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isGroupInfoDrawerOpen =
        action.payload !== undefined ? action.payload : !state.isGroupInfoDrawerOpen;
    },
    openAddMemberModal: (state, action: PayloadAction<string | undefined>) => {
      state.isAddMemberModalOpen = true;
      if (action.payload) {
        state.selectedGroupId = action.payload;
      }
    },
    closeAddMemberModal: state => {
      state.isAddMemberModalOpen = false;
    },
    openCreateGroupModal: state => {
      state.isCreateGroupModalOpen = true;
    },
    closeCreateGroupModal: state => {
      state.isCreateGroupModalOpen = false;
    },
    setSelectedGroupId: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
    },
  },
});

export const {
  toggleGroupInfoDrawer,
  openAddMemberModal,
  closeAddMemberModal,
  openCreateGroupModal,
  closeCreateGroupModal,
  setSelectedGroupId,
} = groupsSlice.actions;

interface HasGroupsState {
  groups: GroupsState;
}

export const selectIsGroupInfoDrawerOpen = (state: HasGroupsState): boolean =>
  state.groups.isGroupInfoDrawerOpen;

export const selectIsAddMemberModalOpen = (state: HasGroupsState): boolean =>
  state.groups.isAddMemberModalOpen;

export const selectIsCreateGroupModalOpen = (state: HasGroupsState): boolean =>
  state.groups.isCreateGroupModalOpen;

export const selectSelectedGroupId = (state: HasGroupsState): string | null =>
  state.groups.selectedGroupId;

export default groupsSlice.reducer;
