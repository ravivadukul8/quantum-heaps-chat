import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';

export interface UseAutoScrollOptions {
  /** Optional custom container ref (otherwise internal ref is created) */
  containerRef?: RefObject<HTMLDivElement | null>;
  /** Optional custom bottom anchor ref */
  scrollBottomRef?: RefObject<HTMLDivElement | null>;
  /** Distance from bottom in px to consider user as "at bottom" (default 120) */
  bottomThreshold?: number;
  /** Active conversation ID to trigger auto-scroll on conversation change */
  activeConversationId?: string | null;
  /** Current count of messages in active thread */
  messagesCount: number;
  /** ID of the sender of the latest message */
  lastMessageSenderId?: string;
  /** ID of current user (to distinguish self-sent vs incoming messages) */
  currentUserId?: string;
}

export interface UseAutoScrollReturn {
  containerRef: RefObject<HTMLDivElement>;
  scrollBottomRef: RefObject<HTMLDivElement>;
  isAtBottom: boolean;
  showScrollButton: boolean;
  unreadBelowCount: number;
  scrollToBottom: (behavior?: 'auto' | 'smooth') => void;
}

export function useAutoScroll({
  containerRef: externalContainerRef,
  scrollBottomRef: externalScrollBottomRef,
  bottomThreshold = 120,
  activeConversationId,
  messagesCount,
  lastMessageSenderId,
  currentUserId,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = (externalContainerRef || internalContainerRef) as RefObject<HTMLDivElement>;

  const internalScrollBottomRef = useRef<HTMLDivElement | null>(null);
  const scrollBottomRef = (externalScrollBottomRef || internalScrollBottomRef) as RefObject<HTMLDivElement>;

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);

  const isAtBottomRef = useRef(true);
  isAtBottomRef.current = isAtBottom;

  const prevMessagesCountRef = useRef(messagesCount);
  const isInitialMountRef = useRef(true);
  const prevConversationIdRef = useRef<string | null | undefined>(undefined);

  // Perform scroll to bottom
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView?.({ behavior });
    } else if (containerRef.current) {
      containerRef.current.scrollTo?.({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
    setIsAtBottom(true);
    isAtBottomRef.current = true;
    setShowScrollButton(false);
    setUnreadBelowCount(0);
  }, [scrollBottomRef, containerRef]);

  // 1. Scroll listener to observe user reading position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      const atBottom = distanceFromBottom <= bottomThreshold;

      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      if (atBottom) {
        setShowScrollButton(false);
        setUnreadBelowCount(0);
      } else {
        setShowScrollButton(true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, bottomThreshold]);

  // 2. On conversation switch or initial mount: immediately scroll to latest message
  useEffect(() => {
    if (isInitialMountRef.current || activeConversationId !== prevConversationIdRef.current) {
      isInitialMountRef.current = false;
      prevConversationIdRef.current = activeConversationId;
      prevMessagesCountRef.current = messagesCount;
      setUnreadBelowCount(0);
      setShowScrollButton(false);
      setIsAtBottom(true);
      isAtBottomRef.current = true;
      // Immediate scroll on thread load
      scrollToBottom('auto');
    }
  }, [activeConversationId, messagesCount, scrollToBottom]);

  // 3. On new messages: conditionally auto-scroll or increment unread below
  useEffect(() => {
    const prevCount = prevMessagesCountRef.current;
    prevMessagesCountRef.current = messagesCount;

    // Check if new message was appended
    if (messagesCount > prevCount) {
      const isSentByMe = Boolean(
        currentUserId && lastMessageSenderId && currentUserId === lastMessageSenderId
      );

      // If user sent the message OR was already at the bottom, auto-scroll down smoothly
      if (isSentByMe || isAtBottomRef.current) {
        scrollToBottom('smooth');
      } else {
        // User is reading older messages: avoid forcing scroll, show scroll-to-bottom badge
        setUnreadBelowCount(prev => prev + (messagesCount - prevCount));
        setShowScrollButton(true);
      }
    }
  }, [messagesCount, lastMessageSenderId, currentUserId, scrollToBottom]);

  return {
    containerRef,
    scrollBottomRef,
    isAtBottom,
    showScrollButton,
    unreadBelowCount,
    scrollToBottom,
  };
}

export default useAutoScroll;
