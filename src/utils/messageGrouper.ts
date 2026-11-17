import type { Message } from '../types';
import { formatDateSeparator } from './dateUtils';

export interface MessageDateGroup {
  dateLabel: string;
  dateKey: string;
  messages: Message[];
}

/**
 * Groups an array of messages chronologically by calendar date.
 * Formats date headers into "Today", "Yesterday", or full formatted dates.
 */
export function groupMessagesByDate(messages: Message[]): MessageDateGroup[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  const groupsMap = new Map<string, Message[]>();

  messages.forEach(message => {
    const dateLabel = formatDateSeparator(message.timestamp);
    const existing = groupsMap.get(dateLabel);

    if (existing) {
      existing.push(message);
    } else {
      groupsMap.set(dateLabel, [message]);
    }
  });

  const dateGroups: MessageDateGroup[] = [];

  groupsMap.forEach((groupMessages, dateLabel) => {
    // Determine sort date key from first message in group
    const firstMsgTimestamp = groupMessages[0]?.timestamp ?? '';
    dateGroups.push({
      dateLabel,
      dateKey: firstMsgTimestamp.split('T')[0] || dateLabel,
      messages: groupMessages,
    });
  });

  return dateGroups;
}
