import { createSelector } from '@reduxjs/toolkit';
import type { Message, MessageReply } from '../../types';
import type { MessagesState } from './messagesSlice';
import type { ConversationsState } from '../conversations/conversationsSlice';

interface HasMessagesAndChatState {
  messages: MessagesState;
  conversations: ConversationsState;
}

const EMPTY_MESSAGES: Message[] = [];
const EMPTY_TYPING_USERS: { userId: string; userName: string; timestamp: number }[] = [];

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
    if (!activeId) return EMPTY_MESSAGES;
    return messagesDict[activeId] ?? EMPTY_MESSAGES;
  }
);

export const selectActiveConversationTypingUsers = createSelector(
  [selectTypingMap, (state: HasMessagesAndChatState) => state.conversations.activeConversationId],
  (typingMap, activeId): { userId: string; userName: string; timestamp: number }[] => {
    if (!activeId) return EMPTY_TYPING_USERS;
    return typingMap[activeId] ?? EMPTY_TYPING_USERS;
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

export const selectMessagesError = (state: HasMessagesAndChatState): string | null =>
  state.messages.error;

export const selectMessagesByConversationId =
  (conversationId: string) =>
    (state: HasMessagesAndChatState): Message[] =>
state.messages.byConversationId[conversationId] ?? EMPTY_MESSAGES;
