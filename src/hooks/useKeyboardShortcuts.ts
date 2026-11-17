import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectIsKeyboardShortcutsModalOpen,
  selectIsUserProfileModalOpen,
  selectIsSearchInChatOpen,
  toggleKeyboardShortcutsModal,
  toggleUserProfileModal,
  toggleSearchInChat,
} from '../features/settings/uiSlice';
import {
  selectIsGroupInfoDrawerOpen,
  selectIsAddMemberModalOpen,
  selectIsCreateGroupModalOpen,
  toggleGroupInfoDrawer,
  closeAddMemberModal,
  closeCreateGroupModal,
} from '../features/groups/groupsSlice';
import {
  selectReplyingToMessage,
  setReplyingTo,
} from '../features/messages/messagesSlice';

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();

  const isShortcutsOpen = useAppSelector(selectIsKeyboardShortcutsModalOpen);
  const isProfileOpen = useAppSelector(selectIsUserProfileModalOpen);
  const isChatSearchOpen = useAppSelector(selectIsSearchInChatOpen);
  const isGroupInfoOpen = useAppSelector(selectIsGroupInfoDrawerOpen);
  const isAddMemberOpen = useAppSelector(selectIsAddMemberModalOpen);
  const isCreateGroupOpen = useAppSelector(selectIsCreateGroupModalOpen);
  const replyingTo = useAppSelector(selectReplyingToMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      // 1. Focus conversation search: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const searchInput =
          (document.getElementById('conversation-search-input') as HTMLInputElement | null) ||
          document.querySelector<HTMLInputElement>('input[aria-label="Search conversations"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 2. Open chat message search: "/" (when not typing in an input)
      if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch(toggleSearchInChat(true));
        return;
      }

      // 3. Open shortcuts cheat sheet: "?" (Shift + "/")
      if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch(toggleKeyboardShortcutsModal(true));
        return;
      }

      // 4. Escape: Close active modals, drawers, or cancel reply
      if (e.key === 'Escape') {
        const anyModalOrDrawerOpen =
          isShortcutsOpen ||
          isProfileOpen ||
          isChatSearchOpen ||
          isGroupInfoOpen ||
          isAddMemberOpen ||
          isCreateGroupOpen;

        if (anyModalOrDrawerOpen) {
          e.preventDefault();
          if (isShortcutsOpen) dispatch(toggleKeyboardShortcutsModal(false));
          if (isProfileOpen) dispatch(toggleUserProfileModal(false));
          if (isChatSearchOpen) dispatch(toggleSearchInChat(false));
          if (isGroupInfoOpen) dispatch(toggleGroupInfoDrawer(false));
          if (isAddMemberOpen) dispatch(closeAddMemberModal());
          if (isCreateGroupOpen) dispatch(closeCreateGroupModal());
          return;
        }

        // Cancel active reply if no modal is open
        if (replyingTo) {
          e.preventDefault();
          dispatch(setReplyingTo(null));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    dispatch,
    isShortcutsOpen,
    isProfileOpen,
    isChatSearchOpen,
    isGroupInfoOpen,
    isAddMemberOpen,
    isCreateGroupOpen,
    replyingTo,
  ]);
}

export default useKeyboardShortcuts;
