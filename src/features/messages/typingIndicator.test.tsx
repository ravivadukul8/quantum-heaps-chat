import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '../../components/common/TypingIndicator';
import { formatTypingText } from '../../utils/typingUtils';
import { simulationService } from '../../services/simulationService';
import { store } from '../../store';
import {
  setTypingIndicator,
  clearTypingForConversation,
} from './messagesSlice';

describe('Task 13: Typing Indicators Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    store.dispatch(clearTypingForConversation('conv-1'));
    store.dispatch(clearTypingForConversation('conv-6'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTypingText formatting helper', () => {
    it('returns empty string when no users are typing', () => {
      expect(formatTypingText([])).toBe('');
    });

    it('formats single user typing', () => {
      expect(formatTypingText([{ userId: 'u1', userName: 'Sarah Chen' }])).toBe(
        'Sarah is typing...'
      );
    });

    it('formats two users typing', () => {
      expect(
        formatTypingText([
          { userId: 'u1', userName: 'Sarah Chen' },
          { userId: 'u2', userName: 'Marcus Vance' },
        ])
      ).toBe('Sarah and Marcus are typing...');
    });

    it('formats three users typing', () => {
      expect(
        formatTypingText([
          { userId: 'u1', userName: 'Sarah Chen' },
          { userId: 'u2', userName: 'Marcus Vance' },
          { userId: 'u3', userName: 'Elena Rostova' },
        ])
      ).toBe('Sarah, Marcus, and Elena are typing...');
    });

    it('formats four or more users typing in a group conversation', () => {
      expect(
        formatTypingText([
          { userId: 'u1', userName: 'Sarah Chen' },
          { userId: 'u2', userName: 'Marcus Vance' },
          { userId: 'u3', userName: 'Elena Rostova' },
          { userId: 'u4', userName: 'Devon Miller' },
        ])
      ).toBe('Sarah, Marcus, and 2 others are typing...');
    });
  });

  describe('TypingIndicator component rendering', () => {
    it('renders bubble variant with bouncing dots and accessible status role', () => {
      render(
        <TypingIndicator
          users={[{ userId: 'u1', userName: 'Sarah Chen' }]}
          variant="bubble"
        />
      );

      const statusElem = screen.getByRole('status');
      expect(statusElem).toBeInTheDocument();
      expect(screen.getByText('Sarah is typing...')).toBeInTheDocument();
    });

    it('renders header variant with pulse effect', () => {
      render(
        <TypingIndicator
          users={[
            { userId: 'u1', userName: 'Sarah Chen' },
            { userId: 'u2', userName: 'Elena Rostova' },
          ]}
          variant="header"
        />
      );

      expect(screen.getByText('Sarah and Elena are typing...')).toBeInTheDocument();
    });

    it('returns null when user list is empty', () => {
      const { container } = render(<TypingIndicator users={[]} variant="bubble" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Typing Simulation Engine & Group Typing', () => {
    it('simulates multiple concurrent typing users in a group conversation and cleans up', () => {
      const onTyping = vi.fn();

      // Trigger group typing simulation on #frontend-guild (conv-6)
      const cancelSim = simulationService.simulateGroupTyping('conv-6', onTyping);

      // First member starts typing immediately (0ms)
      vi.advanceTimersByTime(10);
      expect(onTyping).toHaveBeenCalledWith(true, expect.objectContaining({ id: expect.any(String) }));

      // Second member starts typing after staggered delay (300ms)
      vi.advanceTimersByTime(350);
      expect(onTyping).toHaveBeenCalledWith(true, expect.objectContaining({ id: expect.any(String) }));

      // Complete simulation duration
      vi.advanceTimersByTime(3000);
      expect(onTyping).toHaveBeenCalledWith(false, expect.objectContaining({ id: expect.any(String) }));

      // Cleanup function cleanly clears timers
      cancelSim();
    });

    it('prevents redundant Redux typing updates and cleans up timers', () => {
      // Dispatch typing true
      store.dispatch(
        setTypingIndicator({
          conversationId: 'conv-6',
          userId: 'user-2',
          userName: 'Sarah Chen',
          isTyping: true,
        })
      );
      // Dispatch typing true again for same user
      store.dispatch(
        setTypingIndicator({
          conversationId: 'conv-6',
          userId: 'user-2',
          userName: 'Sarah Chen',
          isTyping: true,
        })
      );

      const typingList = store.getState().messages.typingUsers['conv-6']!;
      // Should not duplicate user in typing list
      expect(typingList.filter(u => u.userId === 'user-2').length).toBe(1);

      // Dispatch typing false cleans up
      store.dispatch(
        setTypingIndicator({
          conversationId: 'conv-6',
          userId: 'user-2',
          userName: 'Sarah Chen',
          isTyping: false,
        })
      );
      expect(store.getState().messages.typingUsers['conv-6']!.length).toBe(0);
    });
  });
});
