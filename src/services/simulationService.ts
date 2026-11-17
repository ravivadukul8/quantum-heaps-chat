import type { Message, MessageStatus, User } from '../types';
import { isGroupConversation } from '../types';
import { mockConversations } from '../mock/conversations.mock';
import { mockUsersById } from '../mock/users.mock';
import { messageService } from './messageService';

/**
 * Realistic contextual canned replies for simulator.
 */
const SIMULATED_REPLIES = [
  'Sounds great! I will take a look at the branch shortly.',
  'Thanks for the update! The latest design tokens look super crisp.',
  'Agreed. Let us make sure we test mobile responsiveness thoroughly.',
  'LGTM! Merging into main branch now.',
  'I am reviewing this right now. Looks really solid!',
  'Great catch on that edge case. I appreciate the quick turnaround.',
  'Got it! Will sync up right after the team standup.',
  'Fantastic work! The animations and typing indicators feel super natural.',
  'Nice! Running the Vitest suite on my machine too, 100% green.',
  'Got your message! Let me double check with Marcus and follow up.',
];

export const simulationService = {
  /**
   * Simulates WhatsApp-style progressive status updates:
   * sent -> delivered (after 400ms) -> read (after 1200ms)
   *
   * @param onStatusChange Callback invoked on each status transition
   * @returns Cleanup function to cancel pending timeouts
   */
  simulateMessageStatusTransition(
    onStatusChange: (status: MessageStatus) => void
  ): () => void {
    const deliveredTimer = setTimeout(() => {
      onStatusChange('delivered');
    }, 450);

    const readTimer = setTimeout(() => {
      onStatusChange('read');
    }, 1300);

    return () => {
      clearTimeout(deliveredTimer);
      clearTimeout(readTimer);
    };
  },

  /**
   * Simulates typing activity for a given conversation.
   *
   * @returns Cleanup function
   */
  simulateTyping(
    conversationId: string,
    onTypingChange: (isTyping: boolean, user: User) => void,
    durationMs = 2200
  ): () => void {
    const conv = mockConversations.find(c => c.id === conversationId);
    let respondentId = 'user-2';

    if (conv) {
      if (isGroupConversation(conv)) {
        const otherMembers = conv.members.filter(m => m.userId !== 'user-1');
        const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        respondentId = randomMember ? randomMember.userId : 'user-2';
      } else {
        respondentId = conv.participantIds.find(id => id !== 'user-1') ?? 'user-2';
      }
    }

    const respondent = mockUsersById[respondentId] ?? mockUsersById['user-2']!;

    onTypingChange(true, respondent);

    const timer = setTimeout(() => {
      onTypingChange(false, respondent);
    }, durationMs);

    return () => {
      clearTimeout(timer);
      onTypingChange(false, respondent);
    };
  },

  /**
   * Generates a simulated incoming response message.
   */
  async simulateIncomingMessage(
    conversationId: string,
    customContent?: string,
    senderIdOverride?: string
  ): Promise<Message> {
    const conv = mockConversations.find(c => c.id === conversationId);
    let senderId = senderIdOverride;

    if (!senderId && conv) {
      if (isGroupConversation(conv)) {
        const otherMembers = conv.members.filter(m => m.userId !== 'user-1');
        const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        senderId = randomMember ? randomMember.userId : 'user-2';
      } else {
        senderId = conv.participantIds.find(id => id !== 'user-1') ?? 'user-2';
      }
    }

    const content =
      customContent ??
      SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)]!;

    return messageService.sendMessage(
      {
        conversationId,
        senderId: senderId ?? 'user-2',
        content,
      },
      100
    );
  },

  /**
   * Coordinates the full simulated bot response workflow:
   * 1. Waits 1000ms delay
   * 2. Triggers typing indicator for 2000ms
   * 3. Dispatches realistic incoming message
   *
   * @returns Cleanup function to abort if user switches conversation
   */
  triggerAutoReplyWorkflow(
    conversationId: string,
    onTyping: (isTyping: boolean, user: User) => void,
    onMessageReceived: (message: Message) => void
  ): () => void {
    let cancelTyping: (() => void) | null = null;

    const initialDelayTimer = setTimeout(() => {
      cancelTyping = this.simulateTyping(
        conversationId,
        onTyping,
        2200
      );

      const messageTimer = setTimeout(async () => {
        const incomingMsg = await this.simulateIncomingMessage(conversationId);
        onMessageReceived(incomingMsg);
      }, 2300);

      // Store cleanup for message timer
      cleanups.push(() => clearTimeout(messageTimer));
    }, 1000);

    const cleanups: Array<() => void> = [
      () => clearTimeout(initialDelayTimer),
      () => {
        if (cancelTyping) cancelTyping();
      },
    ];

    return () => {
      cleanups.forEach(fn => fn());
    };
  },
};
