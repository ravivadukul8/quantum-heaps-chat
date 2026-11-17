/**
 * Delivery and read statuses of a message.
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

/**
 * Supported attachment categories.
 */
export type AttachmentType = 'image' | 'file' | 'audio' | 'video';

/**
 * Message attachment entity.
 */
export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number; // File size in bytes
  mimeType: string;
  thumbnailUrl?: string;
}

/**
 * Emoji reaction aggregated on a message.
 */
export interface MessageReaction {
  emoji: string;
  userIds: string[]; // IDs of users who reacted with this emoji
  count: number;
}

/**
 * Quoted reference when a user replies to an existing message.
 */
export interface MessageReply {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentType?: AttachmentType;
}

/**
 * Core Message entity supporting text, attachments, reactions, edits, and replies.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO 8601 string
  status: MessageStatus;
  reactions: MessageReaction[];
  replyTo?: MessageReply;
  attachments?: Attachment[];
  isEdited: boolean;
  editedAt?: string; // ISO 8601 string
  isDeleted: boolean;
  deletedAt?: string; // ISO 8601 string
}

/**
 * Real-time typing indicator event payload.
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: number; // Epoch timestamp for debounce calculation
}
