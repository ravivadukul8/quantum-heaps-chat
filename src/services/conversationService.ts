import type { Conversation, ConversationFilter } from '../types';
import { isGroupConversation } from '../types';
import { mockConversations } from '../mock/conversations.mock';
import { mockUsersById } from '../mock/users.mock';

/**
 * In-memory copy of conversations to support mutations within the session.
 */
let conversationsStore: Conversation[] = JSON.parse(JSON.stringify(mockConversations));

/**
 * Utility helper to simulate network latency.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const conversationService = {
  /**
   * Fetches all conversations with simulated network latency.
   */
  async fetchConversations(latencyMs = 250): Promise<Conversation[]> {
    await delay(latencyMs);
    // Sort conversations: pinned first, then by latest update timestamp descending
    return [...conversationsStore].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  /**
   * Fetches a single conversation by ID.
   */
  async fetchConversationById(id: string, latencyMs = 150): Promise<Conversation | null> {
    await delay(latencyMs);
    const conversation = conversationsStore.find(c => c.id === id);
    return conversation ? { ...conversation } : null;
  },

  /**
   * Searches and filters conversations by query string and filter category.
   */
  async searchConversations(
    query: string,
    filter: ConversationFilter = 'all',
    latencyMs = 100
  ): Promise<Conversation[]> {
    await delay(latencyMs);
    const normalizedQuery = query.trim().toLowerCase();

    return conversationsStore.filter(conv => {
      // 1. Apply category filter
      if (filter === 'unread' && conv.unreadCount === 0) {
        return false;
      }
      if (filter === 'groups' && conv.type !== 'group') {
        return false;
      }

      // 2. Apply search query matching
      if (!normalizedQuery) {
        return true;
      }

      if (isGroupConversation(conv)) {
        const matchesGroupName = conv.name.toLowerCase().includes(normalizedQuery);
        const matchesDescription = conv.description?.toLowerCase().includes(normalizedQuery);
        const matchesLastMessage = conv.lastMessage?.content.toLowerCase().includes(normalizedQuery);
        return Boolean(matchesGroupName || matchesDescription || matchesLastMessage);
      }

      // For direct conversations, search against the other participant's profile
      const otherUserId = conv.participantIds.find(id => id !== 'user-1') ?? conv.participantIds[0];
      const otherUser = otherUserId ? mockUsersById[otherUserId] : undefined;
      const matchesUserName = otherUser?.name.toLowerCase().includes(normalizedQuery);
      const matchesEmail = otherUser?.email.toLowerCase().includes(normalizedQuery);
      const matchesLastMessage = conv.lastMessage?.content.toLowerCase().includes(normalizedQuery);

      return Boolean(matchesUserName || matchesEmail || matchesLastMessage);
    });
  },

  /**
   * Resets unread count for a conversation when viewed.
   */
  async markConversationAsRead(id: string): Promise<Conversation | null> {
    const convIndex = conversationsStore.findIndex(c => c.id === id);
    if (convIndex === -1) return null;

    conversationsStore[convIndex] = {
      ...conversationsStore[convIndex]!,
      unreadCount: 0,
    };
    return { ...conversationsStore[convIndex]! };
  },

  /**
   * Resets in-memory store back to initial mock dataset (useful for test resets).
   */
  resetStore(): void {
    conversationsStore = JSON.parse(JSON.stringify(mockConversations));
  },
};
