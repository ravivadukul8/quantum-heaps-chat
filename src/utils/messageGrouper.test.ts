import { describe, it, expect } from 'vitest';
import { groupMessagesByDate } from './messageGrouper';
import type { Message } from '../types';

describe('groupMessagesByDate utility', () => {
  it('returns empty array when given no messages', () => {
    expect(groupMessagesByDate([])).toEqual([]);
  });

  it('groups messages with same date under the same date header', () => {
    const mockMsgs: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
        timestamp: '2026-11-17T08:00:00.000Z',
        status: 'read',
        reactions: [],
        isEdited: false,
        isDeleted: false,
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        content: 'Hey there',
        timestamp: '2026-11-17T08:05:00.000Z',
        status: 'read',
        reactions: [],
        isEdited: false,
        isDeleted: false,
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Previous day message',
        timestamp: '2026-11-16T12:00:00.000Z',
        status: 'read',
        reactions: [],
        isEdited: false,
        isDeleted: false,
      },
    ];

    const groups = groupMessagesByDate(mockMsgs);
    expect(groups.length).toBe(2);
    expect(groups[0]?.messages.length).toBe(2);
    expect(groups[1]?.messages.length).toBe(1);
  });
});
