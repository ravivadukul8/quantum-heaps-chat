import type { Message, MessageReaction, MessageReply } from '../types';
import { mockMessagesByConversationId } from '../mock/messages.mock';

/**
 * In-memory messages map by conversation ID.
 */
let messagesStore: Record<string, Message[]> = JSON.parse(
  JSON.stringify(mockMessagesByConversationId)
);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
  replyTo?: MessageReply;
}

export const messageService = {
  /**
   * Fetches all messages for a specific conversation ID.
   */
  async fetchMessagesByConversationId(
    conversationId: string,
    latencyMs = 200
  ): Promise<Message[]> {
    await delay(latencyMs);
    const messages = messagesStore[conversationId] ?? [];
    return [...messages];
  },

  /**
   * Dispatches a new message into the conversation thread.
   */
  async sendMessage(payload: SendMessagePayload, latencyMs = 100): Promise<Message> {
    await delay(latencyMs);

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.content.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      replyTo: payload.replyTo,
      isEdited: false,
      isDeleted: false,
    };

    if (!messagesStore[payload.conversationId]) {
      messagesStore[payload.conversationId] = [];
    }
    messagesStore[payload.conversationId]!.push(newMessage);

    return { ...newMessage };
  },

  /**
   * Edits the text content of an existing message.
   */
  async editMessage(
    conversationId: string,
    messageId: string,
    newContent: string,
    latencyMs = 100
  ): Promise<Message | null> {
    await delay(latencyMs);
    const messages = messagesStore[conversationId];
    if (!messages) return null;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    const updatedMessage: Message = {
      ...messages[messageIndex]!,
      content: newContent.trim(),
      isEdited: true,
      editedAt: new Date().toISOString(),
    };

    messages[messageIndex] = updatedMessage;
    return { ...updatedMessage };
  },

  /**
   * Soft-deletes a message, retaining message bubble with deleted tombstone.
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
    latencyMs = 100
  ): Promise<Message | null> {
    await delay(latencyMs);
    const messages = messagesStore[conversationId];
    if (!messages) return null;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    const deletedMessage: Message = {
      ...messages[messageIndex]!,
      content: 'This message was deleted',
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };

    messages[messageIndex] = deletedMessage;
    return { ...deletedMessage };
  },

  /**
   * Toggles an emoji reaction from a user on a specific message.
   */
  async toggleReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string,
    latencyMs = 50
  ): Promise<Message | null> {
    await delay(latencyMs);
    const messages = messagesStore[conversationId];
    if (!messages) return null;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    const targetMessage = messages[messageIndex]!;
    const reactions = [...targetMessage.reactions];
    const reactionIndex = reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex > -1) {
      const existingReaction = reactions[reactionIndex]!;
      const hasReacted = existingReaction.userIds.includes(userId);

      if (hasReacted) {
        // Remove user's reaction
        const updatedUserIds = existingReaction.userIds.filter(id => id !== userId);
        if (updatedUserIds.length === 0) {
          reactions.splice(reactionIndex, 1);
        } else {
          reactions[reactionIndex] = {
            ...existingReaction,
            userIds: updatedUserIds,
            count: updatedUserIds.length,
          };
        }
      } else {
        // Add user to existing reaction
        const updatedUserIds = [...existingReaction.userIds, userId];
        reactions[reactionIndex] = {
          ...existingReaction,
          userIds: updatedUserIds,
          count: updatedUserIds.length,
        };
      }
    } else {
      // Add brand new reaction
      const newReaction: MessageReaction = {
        emoji,
        userIds: [userId],
        count: 1,
      };
      reactions.push(newReaction);
    }

    const updatedMessage: Message = {
      ...targetMessage,
      reactions,
    };

    messages[messageIndex] = updatedMessage;
    return { ...updatedMessage };
  },

  /**
   * Searches for messages containing the query string within a conversation.
   */
  async searchMessagesInConversation(
    conversationId: string,
    query: string
  ): Promise<Message[]> {
    const messages = messagesStore[conversationId] ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return messages.filter(
      m => !m.isDeleted && m.content.toLowerCase().includes(normalizedQuery)
    );
  },

  /**
   * Resets messages store to seed state.
   */
  resetStore(): void {
    messagesStore = JSON.parse(JSON.stringify(mockMessagesByConversationId));
  },
};
