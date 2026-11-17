export interface TypingUser {
  userId: string;
  userName: string;
  timestamp?: number;
}

/**
 * Generates natural human-friendly typing text for single and group conversations.
 * Handles 1 user, 2 users, 3 users, and 4+ users.
 */
export function formatTypingText(users: TypingUser[]): string {
  if (!users || users.length === 0) return '';

  const firstNames = users.map(u => u.userName.trim().split(' ')[0] || 'Someone');

  if (firstNames.length === 1) {
    return `${firstNames[0]} is typing...`;
  }
  if (firstNames.length === 2) {
    return `${firstNames[0]} and ${firstNames[1]} are typing...`;
  }
  if (firstNames.length === 3) {
    return `${firstNames[0]}, ${firstNames[1]}, and ${firstNames[2]} are typing...`;
  }

  const remaining = firstNames.length - 2;
  return `${firstNames[0]}, ${firstNames[1]}, and ${remaining} other${remaining > 1 ? 's' : ''} are typing...`;
}
