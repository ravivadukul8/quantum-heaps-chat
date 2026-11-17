import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './index';
import {
  setActiveConversation,
  setFilter,
  setSearchQuery,
  togglePinConversation,
} from '../features/conversations/conversationsSlice';
import {
  selectFilteredConversations,
  selectTotalUnreadCount,
  selectActiveConversation,
} from '../features/conversations/conversationsSelectors';
import {
  sendMessageThunk,
  editMessageThunk,
  deleteMessageThunk,
  setTypingIndicator,
  updateMessageStatus,
  optimisticToggleReaction,
} from '../features/messages/messagesSlice';
import {
  selectActiveMessages,
  selectActiveConversationTypingUsers,
} from '../features/messages/messagesSelectors';
import {
  setCurrentUserStatus,
  selectCurrentUser,
  selectAllUsers,
} from '../features/auth/usersSlice';
import {
  toggleGroupInfoDrawer,
  openAddMemberModal,
  closeAddMemberModal,
  selectIsGroupInfoDrawerOpen,
} from '../features/groups/groupsSlice';
import {
  setTheme,
  toggleTheme,
  setMobilePane,
  selectTheme,
  selectMobilePane,
} from '../features/settings/uiSlice';

describe('Redux Toolkit Centralized Store Suite', () => {
  beforeEach(() => {
    // Reset active conversation
    store.dispatch(setActiveConversation('conv-1'));
  });

  describe('usersSlice', () => {
    it('provides default current user and contacts list', () => {
      const state = store.getState();
      const currentUser = selectCurrentUser(state);
      const allUsers = selectAllUsers(state);

      expect(currentUser?.name).toBe('Alex Rivera');
      expect(allUsers.length).toBe(10);
    });

    it('updates user online status', () => {
      store.dispatch(setCurrentUserStatus('away'));
      const state = store.getState();
      const currentUser = selectCurrentUser(state);
      expect(currentUser?.status).toBe('away');
    });
  });

  describe('conversationsSlice & Selectors', () => {
    it('sets active conversation and clears unread count', () => {
      store.dispatch(setActiveConversation('conv-2'));
      const state = store.getState();
      const activeConv = selectActiveConversation(state);

      expect(activeConv?.id).toBe('conv-2');
      expect(activeConv?.unreadCount).toBe(0);
    });

    it('filters conversations by groups and unread', () => {
      store.dispatch(setFilter('groups'));
      let state = store.getState();
      let filtered = selectFilteredConversations(state);
      expect(filtered.every(c => c.type === 'group')).toBe(true);

      store.dispatch(setFilter('all'));
      state = store.getState();
      filtered = selectFilteredConversations(state);
      expect(filtered.length).toBe(8);
    });

    it('filters conversations by search query', () => {
      store.dispatch(setSearchQuery('Sarah'));
      const state = store.getState();
      const filtered = selectFilteredConversations(state);
      expect(filtered.length).toBeGreaterThanOrEqual(1);

      store.dispatch(setSearchQuery(''));
    });

    it('toggles pinned conversation status', () => {
      store.dispatch(togglePinConversation('conv-3'));
      const state = store.getState();
      expect(state.conversations.entities['conv-3']?.isPinned).toBe(true);
    });

    it('calculates total unread count across conversations', () => {
      const state = store.getState();
      const totalUnread = selectTotalUnreadCount(state);
      expect(typeof totalUnread).toBe('number');
    });
  });

  describe('messagesSlice & Selectors', () => {
    it('selects messages for the active conversation', () => {
      store.dispatch(setActiveConversation('conv-1'));
      const state = store.getState();
      const messages = selectActiveMessages(state);
      expect(messages.length).toBeGreaterThanOrEqual(10);
    });

    it('dispatches a new message and updates conversation lastMessage', async () => {
      store.dispatch(setActiveConversation('conv-1'));
      await store.dispatch(
        sendMessageThunk({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'Integration test message dispatch',
        })
      );

      const state = store.getState();
      const messages = selectActiveMessages(state);
      const lastMsg = messages.slice(-1)[0];

      expect(lastMsg?.content).toBe('Integration test message dispatch');
      expect(state.conversations.entities['conv-1']?.lastMessage?.content).toBe(
        'Integration test message dispatch'
      );
    });

    it('updates delivery status of a message', () => {
      store.dispatch(
        updateMessageStatus({
          conversationId: 'conv-1',
          messageId: 'm-1-1',
          status: 'read',
        })
      );

      const state = store.getState();
      const msg = state.messages.byConversationId['conv-1']?.find(m => m.id === 'm-1-1');
      expect(msg?.status).toBe('read');
    });

    it('edits a message content', async () => {
      await store.dispatch(
        editMessageThunk({
          conversationId: 'conv-1',
          messageId: 'm-1-2',
          content: 'Updated content via Redux thunk',
        })
      );

      const state = store.getState();
      const msg = state.messages.byConversationId['conv-1']?.find(m => m.id === 'm-1-2');
      expect(msg?.content).toBe('Updated content via Redux thunk');
      expect(msg?.isEdited).toBe(true);
    });

    it('soft-deletes a message', async () => {
      await store.dispatch(
        deleteMessageThunk({
          conversationId: 'conv-1',
          messageId: 'm-1-3',
        })
      );

      const state = store.getState();
      const msg = state.messages.byConversationId['conv-1']?.find(m => m.id === 'm-1-3');
      expect(msg?.isDeleted).toBe(true);
      expect(msg?.content).toBe('This message was deleted');
    });

    it('optimistically toggles emoji reactions', () => {
      store.dispatch(
        optimisticToggleReaction({
          conversationId: 'conv-1',
          messageId: 'm-1-4',
          emoji: '🎉',
          userId: 'user-1',
        })
      );

      let state = store.getState();
      let msg = state.messages.byConversationId['conv-1']?.find(m => m.id === 'm-1-4');
      let reaction = msg?.reactions.find(r => r.emoji === '🎉');
      expect(reaction?.userIds).toContain('user-1');

      // Toggle off
      store.dispatch(
        optimisticToggleReaction({
          conversationId: 'conv-1',
          messageId: 'm-1-4',
          emoji: '🎉',
          userId: 'user-1',
        })
      );

      state = store.getState();
      msg = state.messages.byConversationId['conv-1']?.find(m => m.id === 'm-1-4');
      reaction = msg?.reactions.find(r => r.emoji === '🎉');
      expect(reaction).toBeUndefined();
    });

    it('manages typing indicators', () => {
      store.dispatch(
        setTypingIndicator({
          conversationId: 'conv-1',
          userId: 'user-2',
          userName: 'Sarah Chen',
          isTyping: true,
        })
      );

      let state = store.getState();
      let typingUsers = selectActiveConversationTypingUsers(state);
      expect(typingUsers.some(u => u.userId === 'user-2')).toBe(true);

      store.dispatch(
        setTypingIndicator({
          conversationId: 'conv-1',
          userId: 'user-2',
          userName: 'Sarah Chen',
          isTyping: false,
        })
      );

      state = store.getState();
      typingUsers = selectActiveConversationTypingUsers(state);
      expect(typingUsers.some(u => u.userId === 'user-2')).toBe(false);
    });
  });

  describe('groupsSlice', () => {
    it('manages group drawers and modals', () => {
      store.dispatch(toggleGroupInfoDrawer(true));
      let state = store.getState();
      expect(selectIsGroupInfoDrawerOpen(state)).toBe(true);

      store.dispatch(openAddMemberModal('conv-6'));
      state = store.getState();
      expect(state.groups.isAddMemberModalOpen).toBe(true);
      expect(state.groups.selectedGroupId).toBe('conv-6');

      store.dispatch(closeAddMemberModal());
      state = store.getState();
      expect(state.groups.isAddMemberModalOpen).toBe(false);
    });
  });

  describe('uiSlice', () => {
    it('manages theme switching', () => {
      store.dispatch(setTheme('dark'));
      let state = store.getState();
      expect(selectTheme(state)).toBe('dark');

      store.dispatch(toggleTheme());
      state = store.getState();
      expect(selectTheme(state)).toBe('light');
    });

    it('manages responsive mobile pane navigation', () => {
      store.dispatch(setMobilePane('chat'));
      const state = store.getState();
      expect(selectMobilePane(state)).toBe('chat');
    });
  });
});
