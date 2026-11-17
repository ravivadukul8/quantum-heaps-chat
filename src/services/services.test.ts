import { describe, it, expect, beforeEach, vi } from 'vitest';
import { conversationService } from './conversationService';
import { messageService } from './messageService';
import { simulationService } from './simulationService';

describe('Frontend Services Suite', () => {
  beforeEach(() => {
    conversationService.resetStore();
    messageService.resetStore();
    vi.useRealTimers();
  });

  describe('conversationService', () => {
    it('fetches all 8 mock conversations with pinned chats first', async () => {
      const conversations = await conversationService.fetchConversations(0);
      expect(conversations).toHaveLength(8);
      // Pinned conversations should lead
      expect(conversations[0]?.isPinned).toBe(true);
      expect(conversations[1]?.isPinned).toBe(true);
    });

    it('filters conversations by groups', async () => {
      const groups = await conversationService.searchConversations('', 'groups', 0);
      expect(groups).toHaveLength(3);
      groups.forEach(group => {
        expect(group.type).toBe('group');
      });
    });

    it('filters conversations by unread count', async () => {
      const unread = await conversationService.searchConversations('', 'unread', 0);
      expect(unread.length).toBeGreaterThanOrEqual(1);
      unread.forEach(conv => {
        expect(conv.unreadCount).toBeGreaterThan(0);
      });
    });

    it('searches conversations by name query', async () => {
      const results = await conversationService.searchConversations('Sarah', 'all', 0);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('marks conversation as read', async () => {
      const updated = await conversationService.markConversationAsRead('conv-2');
      expect(updated?.unreadCount).toBe(0);
    });
  });

  describe('messageService', () => {
    it('fetches at least 10 messages for conversation conv-1', async () => {
      const messages = await messageService.fetchMessagesByConversationId('conv-1', 0);
      expect(messages.length).toBeGreaterThanOrEqual(10);
    });

    it('sends a new message successfully', async () => {
      const newMsg = await messageService.sendMessage(
        {
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'Testing new message dispatch',
        },
        0
      );

      expect(newMsg.id).toBeDefined();
      expect(newMsg.content).toBe('Testing new message dispatch');
      expect(newMsg.status).toBe('sent');
      expect(newMsg.isEdited).toBe(false);

      const allMessages = await messageService.fetchMessagesByConversationId('conv-1', 0);
      expect(allMessages.slice(-1)[0]?.id).toBe(newMsg.id);
    });

    it('edits an existing message', async () => {
      const edited = await messageService.editMessage('conv-1', 'm-1-1', 'Updated PR content', 0);
      expect(edited?.content).toBe('Updated PR content');
      expect(edited?.isEdited).toBe(true);
      expect(edited?.editedAt).toBeDefined();
    });

    it('soft-deletes a message', async () => {
      const deleted = await messageService.deleteMessage('conv-1', 'm-1-1', 0);
      expect(deleted?.isDeleted).toBe(true);
      expect(deleted?.content).toBe('This message was deleted');
      expect(deleted?.deletedAt).toBeDefined();
    });

    it('toggles user emoji reactions correctly', async () => {
      // Add reaction
      const reacted = await messageService.toggleReaction('conv-1', 'm-1-2', '🚀', 'user-1', 0);
      const reaction = reacted?.reactions.find(r => r.emoji === '🚀');
      expect(reaction?.userIds).toContain('user-1');
      expect(reaction?.count).toBe(1);

      // Toggle off reaction
      const unreacted = await messageService.toggleReaction('conv-1', 'm-1-2', '🚀', 'user-1', 0);
      const removed = unreacted?.reactions.find(r => r.emoji === '🚀');
      expect(removed).toBeUndefined();
    });
  });

  describe('simulationService', () => {
    it('simulates progressive message delivery states (sent -> delivered -> read)', () => {
      vi.useFakeTimers();
      const statusUpdates: string[] = [];

      simulationService.simulateMessageStatusTransition(status => {
        statusUpdates.push(status);
      });

      expect(statusUpdates).toHaveLength(0);

      vi.advanceTimersByTime(500);
      expect(statusUpdates).toEqual(['delivered']);

      vi.advanceTimersByTime(900);
      expect(statusUpdates).toEqual(['delivered', 'read']);
    });
  });
});
