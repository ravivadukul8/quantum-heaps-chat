import type { Message } from './message.types';

/**
 * Types of conversation supported in the application.
 */
export type ConversationType = 'direct' | 'group';

/**
 * Filter tabs available on the conversation list sidebar.
 */
export type ConversationFilter = 'all' | 'unread' | 'groups';

/**
 * Role of a member inside a group conversation.
 */
export type GroupRole = 'admin' | 'member';

/**
 * Member record within a group conversation.
 */
export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string; // ISO 8601 string
}

/**
 * Base conversation attributes shared between direct and group chats.
 */
export interface BaseConversation {
  id: string;
  type: ConversationType;
  unreadCount: number;
  lastMessage?: Message;
  updatedAt: string; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  isPinned?: boolean;
  isMuted?: boolean;
  draft?: string;
}

/**
 * Individual direct 1-on-1 conversation.
 */
export interface DirectConversation extends BaseConversation {
  type: 'direct';
  participantIds: [string, string]; // Exactly two users
}

/**
 * Multi-user group conversation with metadata and membership controls.
 */
export interface GroupConversation extends BaseConversation {
  type: 'group';
  name: string;
  avatarUrl?: string;
  description?: string;
  members: GroupMember[];
  adminIds: string[];
  createdBy: string;
}

/**
 * Discriminated union of all conversation types.
 */
export type Conversation = DirectConversation | GroupConversation;

/**
 * Type guard to check if a conversation is a GroupConversation.
 */
export function isGroupConversation(conversation: Conversation): conversation is GroupConversation {
  return conversation.type === 'group';
}

/**
 * Type guard to check if a conversation is a DirectConversation.
 */
export function isDirectConversation(conversation: Conversation): conversation is DirectConversation {
  return conversation.type === 'direct';
}
