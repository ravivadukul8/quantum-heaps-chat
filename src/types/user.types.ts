/**
 * Status of a user in the chat system.
 */
export type UserStatus = 'online' | 'offline' | 'away';

/**
 * User entity representation.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: UserStatus;
  customBio?: string;
  lastSeen?: string; // ISO 8601 timestamp string
  createdAt: string;
}
