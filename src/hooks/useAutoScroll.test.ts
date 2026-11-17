import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoScroll } from './useAutoScroll';

describe('Task 14: Automatic Scrolling & useAutoScroll Hook Suite', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('scrolls to latest message when opening a conversation', () => {
    const scrollMock = vi.fn();
    const mockElem = document.createElement('div');
    mockElem.scrollIntoView = scrollMock;
    const scrollBottomRef = { current: mockElem };

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollBottomRef,
        activeConversationId: 'conv-1',
        messagesCount: 10,
        currentUserId: 'user-1',
      })
    );

    // Initial scroll on conversation load
    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'auto' });
    expect(result.current.isAtBottom).toBe(true);
    expect(result.current.showScrollButton).toBe(false);
  });

  it('smoothly scrolls to bottom when user sends a new message', () => {
    const scrollMock = vi.fn();
    const mockElem = document.createElement('div');
    mockElem.scrollIntoView = scrollMock;
    const scrollBottomRef = { current: mockElem };

    let messagesCount = 10;
    let lastMessageSenderId = 'user-2';

    const { result, rerender } = renderHook(() =>
      useAutoScroll({
        scrollBottomRef,
        activeConversationId: 'conv-1',
        messagesCount,
        lastMessageSenderId,
        currentUserId: 'user-1',
      })
    );

    scrollMock.mockClear();

    // User sends a message (lastMessageSenderId === 'user-1')
    messagesCount = 11;
    lastMessageSenderId = 'user-1';

    rerender();

    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(result.current.unreadBelowCount).toBe(0);
  });

  it('avoids forcing scroll when user is reading older messages and displays scroll button with unread count', () => {
    const scrollMock = vi.fn();
    const mockElem = document.createElement('div');
    mockElem.scrollIntoView = scrollMock;
    const scrollBottomRef = { current: mockElem };

    const mockContainer = document.createElement('div');
    Object.defineProperty(mockContainer, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(mockContainer, 'scrollTop', { value: 200, configurable: true });
    Object.defineProperty(mockContainer, 'clientHeight', { value: 400, configurable: true });
    const containerRef = { current: mockContainer };

    let messagesCount = 10;
    let lastMessageSenderId = 'user-2';

    const { result, rerender } = renderHook(() =>
      useAutoScroll({
        containerRef,
        scrollBottomRef,
        activeConversationId: 'conv-1',
        messagesCount,
        lastMessageSenderId,
        currentUserId: 'user-1',
      })
    );

    // Simulate scroll event moving away from bottom (scrollTop: 200, distanceFromBottom: 400 > 120)
    act(() => {
      mockContainer.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isAtBottom).toBe(false);
    expect(result.current.showScrollButton).toBe(true);

    // Incoming messages arrive from user-2
    scrollMock.mockClear();
    messagesCount = 12;
    lastMessageSenderId = 'user-2';

    rerender();

    // Should NOT force scroll to bottom!
    expect(scrollMock).not.toHaveBeenCalled();
    // Scroll to bottom button and unread count should be active
    expect(result.current.showScrollButton).toBe(true);
    expect(result.current.unreadBelowCount).toBe(2);

    // Clicking scroll to bottom smoothly scrolls down and resets counter
    act(() => {
      result.current.scrollToBottom('smooth');
    });

    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(result.current.showScrollButton).toBe(false);
    expect(result.current.unreadBelowCount).toBe(0);
  });

  it('cleans up scroll event listeners on unmount', () => {
    const mockContainer = document.createElement('div');
    const removeEventListenerSpy = vi.spyOn(mockContainer, 'removeEventListener');
    const containerRef = { current: mockContainer };

    const { unmount } = renderHook(() =>
      useAutoScroll({
        containerRef,
        activeConversationId: 'conv-1',
        messagesCount: 5,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
