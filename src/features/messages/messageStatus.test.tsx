import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageStatus } from '../../components/common/MessageStatus';
import { store } from '../../store';
import { updateMessageStatus, messageReceived } from './messagesSlice';
import type { Message } from '../../types';

describe('Task 12: Message Status Indicators Suite', () => {
  it('renders single check for sent messages', () => {
    const { container } = render(<MessageStatus status="sent" />);
    const statusElem = screen.getByRole('status');
    expect(statusElem).toHaveAttribute('aria-label', 'Sent');
    // Lucide check icon
    expect(container.querySelector('.lucide-check')).toBeInTheDocument();
    expect(container.querySelector('.lucide-check-check')).not.toBeInTheDocument();
  });

  it('renders double checks for delivered messages', () => {
    const { container } = render(<MessageStatus status="delivered" />);
    const statusElem = screen.getByRole('status');
    expect(statusElem).toHaveAttribute('aria-label', 'Delivered');
    expect(container.querySelector('.lucide-check-check')).toBeInTheDocument();
  });

  it('renders distinct colored double checks for read messages', () => {
    const { container } = render(<MessageStatus status="read" />);
    const statusElem = screen.getByRole('status');
    expect(statusElem).toHaveAttribute('aria-label', 'Read');
    const icon = container.querySelector('.lucide-check-check');
    expect(icon).toBeInTheDocument();
    expect(icon?.classList.contains('text-[#53bdeb]')).toBe(true);
  });

  it('renders clock indicator for sending status', () => {
    const { container } = render(<MessageStatus status="sending" />);
    const statusElem = screen.getByRole('status');
    expect(statusElem).toHaveAttribute('aria-label', 'Sending message');
    expect(container.querySelector('.lucide-clock')).toBeInTheDocument();
  });

  it('updates message status in Redux without duplicating messages', () => {
    const testMessage: Message = {
      id: 'test-status-msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'Testing delivery status idempotency',
      timestamp: new Date().toISOString(),
      status: 'sending',
      reactions: [],
      isEdited: false,
      isDeleted: false,
    };

    // 1. Add message
    store.dispatch(messageReceived(testMessage));
    const initialThread = store.getState().messages.byConversationId['conv-1']!;
    const initialMatches = initialThread.filter(m => m.id === testMessage.id);
    expect(initialMatches.length).toBe(1);
    expect(initialMatches[0]?.status).toBe('sending');

    // 2. Transition to sent
    store.dispatch(
      updateMessageStatus({
        conversationId: 'conv-1',
        messageId: testMessage.id,
        status: 'sent',
      })
    );
    let currentThread = store.getState().messages.byConversationId['conv-1']!;
    let currentMatches = currentThread.filter(m => m.id === testMessage.id);
    expect(currentMatches.length).toBe(1);
    expect(currentMatches[0]?.status).toBe('sent');

    // 3. Transition to delivered
    store.dispatch(
      updateMessageStatus({
        conversationId: 'conv-1',
        messageId: testMessage.id,
        status: 'delivered',
      })
    );
    currentThread = store.getState().messages.byConversationId['conv-1']!;
    currentMatches = currentThread.filter(m => m.id === testMessage.id);
    expect(currentMatches.length).toBe(1);
    expect(currentMatches[0]?.status).toBe('delivered');

    // 4. Transition to read
    store.dispatch(
      updateMessageStatus({
        conversationId: 'conv-1',
        messageId: testMessage.id,
        status: 'read',
      })
    );
    currentThread = store.getState().messages.byConversationId['conv-1']!;
    currentMatches = currentThread.filter(m => m.id === testMessage.id);
    expect(currentMatches.length).toBe(1);
    expect(currentMatches[0]?.status).toBe('read');
  });
});
