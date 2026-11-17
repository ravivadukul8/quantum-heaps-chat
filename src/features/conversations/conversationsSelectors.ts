import { createSelector } from '@reduxjs/toolkit';
import type { Conversation, ConversationFilter } from '../../types';
import { isGroupConversation } from '../../types';
import type { ConversationsState } from './conversationsSlice';
import type { UsersState } from '../auth/usersSlice';

interface HasChatState {
  conversations: ConversationsState;
  users: UsersState;
}

export const selectConversationsState = (state: HasChatState) => state.conversations;

export const selectConversationsEntities = (state: HasChatState) => state.conversations.entities;

export const selectConversationsIds = (state: HasChatState) => state.conversations.ids;

export const selectActiveConversationId = (state: HasChatState) =>
  state.conversations.activeConversationId;

export const selectConversationFilter = (state: HasChatState): ConversationFilter =>
  state.conversations.filter;

export const selectConversationSearchQuery = (state: HasChatState): string =>
  state.conversations.searchQuery;

export const selectConversationsLoading = (state: HasChatState): boolean =>
  state.conversations.loading;

export const selectConversationsError = (state: HasChatState): string | null =>
  state.conversations.error;

/**
 * Returns all conversations sorted: pinned chats first, then newest updatedAt.
 */
export const selectAllConversations = createSelector(
  [selectConversationsEntities, selectConversationsIds],
  (entities, ids): Conversation[] => {
    return ids
      .map(id => entities[id])
      .filter((c): c is Conversation => Boolean(c))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }
);

/**
 * Returns the currently active Conversation object.
 */
export const selectActiveConversation = createSelector(
  [selectConversationsEntities, selectActiveConversationId],
  (entities, activeId): Conversation | null => {
    if (!activeId) return null;
    return entities[activeId] ?? null;
  }
);

/**
 * Returns filtered conversations matching the current filter tab and case-insensitive search query.
 * Matches:
 * - Direct conversations: by partner's username or last message content
 * - Group conversations: by group name or last message content
 */
export const selectFilteredConversations = createSelector(
  [
    selectAllConversations,
    selectConversationFilter,
    selectConversationSearchQuery,
    (state: HasChatState) => state.users.entities,
    (state: HasChatState) => state.users.currentUserId,
  ],
  (conversations, filter, searchQuery, usersEntities, currentUserId): Conversation[] => {
    const query = searchQuery.trim().toLowerCase();

    return conversations.filter(conv => {
      // 1. Tab category filter
      if (filter === 'unread' && conv.unreadCount === 0) {
        return false;
      }
      if (filter === 'groups' && conv.type !== 'group') {
        return false;
      }

      // 2. Search query matching
      if (!query) {
        return true;
      }

      const matchesLastMsg = conv.lastMessage?.content.toLowerCase().includes(query);

      if (isGroupConversation(conv)) {
        const matchesGroupName = conv.name.toLowerCase().includes(query);
        const matchesDesc = conv.description?.toLowerCase().includes(query);
        return Boolean(matchesGroupName || matchesDesc || matchesLastMsg);
      }

      // Direct chat: search by username or last message
      const otherUserId = conv.participantIds.find(id => id !== currentUserId) ?? conv.participantIds[0];
      const otherUser = otherUserId ? usersEntities[otherUserId] : undefined;
      const matchesUserName = otherUser?.name.toLowerCase().includes(query);

      return Boolean(matchesUserName || matchesLastMsg);
    });
  }
);

/**
 * Computes total unread count across all conversations for badges.
 */
export const selectTotalUnreadCount = createSelector(
  [selectAllConversations],
  (conversations): number => {
    return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }
);

/**
 * Factory selector for single conversation.
 */
export const selectConversationById =
  (conversationId: string) =>
  (state: HasChatState): Conversation | undefined =>
    state.conversations.entities[conversationId];
