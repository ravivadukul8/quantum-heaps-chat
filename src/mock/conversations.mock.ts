import type { Conversation, DirectConversation, GroupConversation } from '../types';
import { mockMessagesByConversationId } from './messages.mock';

export const mockConversations: Conversation[] = [
  // 1. Direct: Sarah Chen (conv-1) - Pinned
  {
    id: 'conv-1',
    type: 'direct',
    participantIds: ['user-1', 'user-2'],
    unreadCount: 0,
    lastMessage: mockMessagesByConversationId['conv-1']?.slice(-1)[0],
    isPinned: true,
    isMuted: false,
    updatedAt: '2026-11-17T09:12:00.000Z',
    createdAt: '2024-01-15T08:00:00.000Z',
  } as DirectConversation,

  // 2. Direct: Marcus Vance (conv-2) - 1 Unread
  {
    id: 'conv-2',
    type: 'direct',
    participantIds: ['user-1', 'user-3'],
    unreadCount: 1,
    lastMessage: mockMessagesByConversationId['conv-2']?.slice(-1)[0],
    isPinned: false,
    isMuted: false,
    updatedAt: '2026-11-17T09:40:00.000Z',
    createdAt: '2024-02-10T10:00:00.000Z',
  } as DirectConversation,

  // 3. Direct: Elena Rostova (conv-3)
  {
    id: 'conv-3',
    type: 'direct',
    participantIds: ['user-1', 'user-4'],
    unreadCount: 0,
    lastMessage: mockMessagesByConversationId['conv-3']?.slice(-1)[0],
    isPinned: false,
    isMuted: false,
    updatedAt: '2026-11-17T09:25:00.000Z',
    createdAt: '2024-02-15T11:00:00.000Z',
  } as DirectConversation,

  // 4. Direct: Devon Miller (conv-4)
  {
    id: 'conv-4',
    type: 'direct',
    participantIds: ['user-1', 'user-5'],
    unreadCount: 0,
    lastMessage: mockMessagesByConversationId['conv-4']?.slice(-1)[0],
    isPinned: false,
    isMuted: true,
    updatedAt: '2026-11-17T08:05:00.000Z',
    createdAt: '2024-03-01T09:00:00.000Z',
  } as DirectConversation,

  // 5. Direct: Aisha Patel (conv-5)
  {
    id: 'conv-5',
    type: 'direct',
    participantIds: ['user-1', 'user-6'],
    unreadCount: 0,
    lastMessage: mockMessagesByConversationId['conv-5']?.slice(-1)[0],
    isPinned: false,
    isMuted: false,
    updatedAt: '2026-11-17T09:20:00.000Z',
    createdAt: '2024-03-10T14:00:00.000Z',
  } as DirectConversation,

  // 6. Group: #frontend-guild (conv-6) - Pinned, 2 Unread
  {
    id: 'conv-6',
    type: 'group',
    name: '#frontend-guild',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: 'Frontend Architecture, React patterns, Tailwind systems & UI benchmarks.',
    unreadCount: 2,
    lastMessage: mockMessagesByConversationId['conv-6']?.slice(-1)[0],
    isPinned: true,
    isMuted: false,
    members: [
      { userId: 'user-1', role: 'admin', joinedAt: '2024-01-01T00:00:00.000Z' },
      { userId: 'user-2', role: 'admin', joinedAt: '2024-01-01T00:00:00.000Z' },
      { userId: 'user-4', role: 'member', joinedAt: '2024-02-01T00:00:00.000Z' },
      { userId: 'user-7', role: 'member', joinedAt: '2024-02-15T00:00:00.000Z' },
      { userId: 'user-10', role: 'member', joinedAt: '2024-06-15T00:00:00.000Z' },
    ],
    adminIds: ['user-1', 'user-2'],
    createdBy: 'user-2',
    updatedAt: '2026-11-17T09:30:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
  } as GroupConversation,

  // 7. Group: Quantum Core Team (conv-7)
  {
    id: 'conv-7',
    type: 'group',
    name: 'Quantum Core Team',
    avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    description: 'Core engineering sync, sprint planning, and system architecture reviews.',
    unreadCount: 0,
    lastMessage: mockMessagesByConversationId['conv-7']?.slice(-1)[0],
    isPinned: false,
    isMuted: false,
    members: [
      { userId: 'user-8', role: 'admin', joinedAt: '2023-05-18T00:00:00.000Z' },
      { userId: 'user-1', role: 'member', joinedAt: '2024-01-15T00:00:00.000Z' },
      { userId: 'user-2', role: 'member', joinedAt: '2023-11-10T00:00:00.000Z' },
      { userId: 'user-3', role: 'member', joinedAt: '2023-08-20T00:00:00.000Z' },
      { userId: 'user-5', role: 'member', joinedAt: '2023-09-12T00:00:00.000Z' },
      { userId: 'user-6', role: 'member', joinedAt: '2024-03-05T00:00:00.000Z' },
      { userId: 'user-7', role: 'member', joinedAt: '2023-12-01T00:00:00.000Z' },
    ],
    adminIds: ['user-8'],
    createdBy: 'user-8',
    updatedAt: '2026-11-17T09:20:00.000Z',
    createdAt: '2023-05-18T00:00:00.000Z',
  } as GroupConversation,

  // 8. Group: Random & Coffee Break (conv-8) - 3 Unread
  {
    id: 'conv-8',
    type: 'group',
    name: 'Random & Coffee Break',
    avatarUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=150&auto=format&fit=crop&q=80',
    description: 'Casual watercooler chat, specialty coffee recipes, tech gear & pet photos.',
    unreadCount: 3,
    lastMessage: mockMessagesByConversationId['conv-8']?.slice(-1)[0],
    isPinned: false,
    isMuted: true,
    members: [
      { userId: 'user-1', role: 'member', joinedAt: '2024-01-15T00:00:00.000Z' },
      { userId: 'user-2', role: 'member', joinedAt: '2023-11-10T00:00:00.000Z' },
      { userId: 'user-3', role: 'member', joinedAt: '2023-08-20T00:00:00.000Z' },
      { userId: 'user-4', role: 'member', joinedAt: '2024-02-01T00:00:00.000Z' },
      { userId: 'user-5', role: 'admin', joinedAt: '2023-09-12T00:00:00.000Z' },
      { userId: 'user-6', role: 'member', joinedAt: '2024-03-05T00:00:00.000Z' },
      { userId: 'user-7', role: 'member', joinedAt: '2023-12-01T00:00:00.000Z' },
      { userId: 'user-8', role: 'member', joinedAt: '2023-05-18T00:00:00.000Z' },
      { userId: 'user-9', role: 'member', joinedAt: '2024-01-05T00:00:00.000Z' },
      { userId: 'user-10', role: 'member', joinedAt: '2024-06-15T00:00:00.000Z' },
    ],
    adminIds: ['user-5'],
    createdBy: 'user-5',
    updatedAt: '2026-11-17T09:25:00.000Z',
    createdAt: '2023-09-12T00:00:00.000Z',
  } as GroupConversation,
];
