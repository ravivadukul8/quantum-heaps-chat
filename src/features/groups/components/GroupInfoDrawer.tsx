import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsGroupInfoDrawerOpen,
  toggleGroupInfoDrawer,
  openAddMemberModal,
} from '../groupsSlice';
import {
  selectActiveConversation,
  removeGroupMember,
  setActiveConversation,
} from '../../conversations/conversationsSlice';
import {
  selectCurrentUser,
  selectUsersEntities,
} from '../../auth/usersSlice';
import { showToast } from '../../settings/uiSlice';
import { isGroupConversation } from '../../../types';
import { GroupInfo } from './GroupInfo';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const GroupInfoDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsGroupInfoDrawerOpen);
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const usersEntities = useAppSelector(selectUsersEntities);

  const [memberToRemoveId, setMemberToRemoveId] = useState<string | null>(null);

  if (!isOpen || !activeConversation || !isGroupConversation(activeConversation) || !currentUser) {
    return null;
  }

  const handleClose = () => {
    dispatch(toggleGroupInfoDrawer(false));
    setMemberToRemoveId(null);
  };

  const handleRequestRemove = (userId: string) => {
    setMemberToRemoveId(userId);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemoveId) return;

    const targetUser = usersEntities[memberToRemoveId];
    const targetName = targetUser?.name || 'Member';

    dispatch(
      removeGroupMember({
        groupId: activeConversation.id,
        userId: memberToRemoveId,
      })
    );

    dispatch(
      showToast({
        message: `Removed ${targetName} from ${activeConversation.name}`,
        type: 'info',
      })
    );

    setMemberToRemoveId(null);
  };

  const handleLeaveGroup = () => {
    dispatch(
      removeGroupMember({
        groupId: activeConversation.id,
        userId: currentUser.id,
      })
    );
    dispatch(
      showToast({
        message: `You left ${activeConversation.name}`,
        type: 'info',
      })
    );
    dispatch(setActiveConversation(null));
    handleClose();
  };

  const targetMemberUser = memberToRemoveId ? usersEntities[memberToRemoveId] : undefined;

  return (
    <>
      <aside
        aria-label="Group Information"
        className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#202c33]/50">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Group Details</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close group details"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body with Reusable GroupInfo */}
        <div className="flex-1 overflow-y-auto p-5">
          <GroupInfo
            group={activeConversation}
            currentUserId={currentUser.id}
            usersEntities={usersEntities}
            onAddMemberClick={() => dispatch(openAddMemberModal(activeConversation.id))}
            onRemoveMember={handleRequestRemove}
            onLeaveGroup={handleLeaveGroup}
          />
        </div>
      </aside>

      {/* Confirmation Dialog for Member Removal (Task 22) */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemoveId)}
        title={`Remove ${targetMemberUser?.name || 'member'}?`}
        description={`Are you sure you want to remove ${targetMemberUser?.name || 'this member'} from ${activeConversation.name}? They will no longer have access to this conversation.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberToRemoveId(null)}
      />
    </>
  );
};

export default GroupInfoDrawer;
