import { createSelector } from '@reduxjs/toolkit';
import type { Message, MessageReply } from '../../types';
import type { MessagesState } from './messagesSlice';
import type { ConversationsState } from '../conversations/conversationsSlice';

interface HasMessagesAndChatState {
  messages: MessagesState;
  conversations: ConversationsState;
}

export const selectMessagesState = (state: HasMessagesAndChatState) => state.messages;

export const selectMessagesDict = (state: HasMessagesAndChatState) =>
  state.messages.byConversationId;

export const selectReplyingToMessage = (state: HasMessagesAndChatState): MessageReply | null =>
  state.messages.replyingTo;

export const selectEditingMessage = (state: HasMessagesAndChatState): Message | null =>
  state.messages.editingMessage;

export const selectTypingMap = (state: HasMessagesAndChatState) => state.messages.typingUsers;

export const selectMessagesLoadingMap = (state: HasMessagesAndChatState) =>
  state.messages.loadingConversations;

export const selectActiveMessages = createSelector(
  [selectMessagesDict, (state: HasMessagesAndChatState) => state.conversations.activeConversationId],
  (messagesDict, activeId): Message[] => {
    if (!activeId) return [];
    return messagesDict[activeId] ?? [];
  }
);

export const selectActiveConversationTypingUsers = createSelector(
  [selectTypingMap, (state: HasMessagesAndChatState) => state.conversations.activeConversationId],
  (typingMap, activeId): { userId: string; userName: string; timestamp: number }[] => {
    if (!activeId) return [];
    return typingMap[activeId] ?? [];
  }
);

export const selectIsActiveConversationLoading = createSelector(
  [
    selectMessagesLoadingMap,
    (state: HasMessagesAndChatState) => state.conversations.activeConversationId,
  ],
  (loadingMap, activeId): boolean => {
    if (!activeId) return false;
    return Boolean(loadingMap[activeId]);
  }
);

export const selectMessagesByConversationId =
  (conversationId: string) =>
    (state: HasMessagesAndChatState): Message[] =>
      state.messages.byConversationId[conversationId] ?? [];
