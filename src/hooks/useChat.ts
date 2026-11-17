import { useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectActiveConversation,
  updateLastMessage,
  updateConversationLastMessageStatus,
} from '../features/conversations/conversationsSlice';
import { selectCurrentUser } from '../features/auth/usersSlice';
import {
  selectReplyingToMessage,
  sendMessageThunk,
  updateMessageStatus,
  setTypingIndicator,
  messageReceived,
  setReplyingTo,
} from '../features/messages/messagesSlice';
import { showToast } from '../features/settings/uiSlice';
import { simulationService } from '../services/simulationService';
import type { Message, MessageReply } from '../types';

export function useChat() {
  const dispatch = useAppDispatch();
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const replyingTo = useAppSelector(selectReplyingToMessage);

  // Stable refs to prevent unnecessary re-creation of callbacks and accidental timer cancellations
  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Active timers cleanup refs
  const cleanupFnsRef = useRef<Array<() => void>>([]);
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    const conv = activeConvRef.current;
    const user = currentUserRef.current;
    if (isTypingRef.current && conv && user) {
      isTypingRef.current = false;
      dispatch(
        setTypingIndicator({
          conversationId: conv.id,
          userId: user.id,
          userName: user.name,
          isTyping: false,
        })
      );
    }
  }, [dispatch]);

  const handleTyping = useCallback(() => {
    const conv = activeConvRef.current;
    const user = currentUserRef.current;
    if (!conv || !user) return;

    // Dispatch typing = true only once at the beginning of a typing burst to prevent redundant updates
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      dispatch(
        setTypingIndicator({
          conversationId: conv.id,
          userId: user.id,
          userName: user.name,
          isTyping: true,
        })
      );
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 1800);
  }, [dispatch, stopTyping]);

  // Clean up timers ONLY on conversation change or unmount
  const activeId = activeConversation?.id;
  useEffect(() => {
    return () => {
      stopTyping();
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, [activeId, stopTyping]);

  const handleSendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      const conv = activeConvRef.current;
      const user = currentUserRef.current;
      if (!content || !conv || !user) {
        return false;
      }

      // Stop typing immediately when sending
      stopTyping();

      const conversationId = conv.id;
      const replyPayload: MessageReply | undefined = replyingTo ? { ...replyingTo } : undefined;

      // 1. Dispatch outgoing message to Redux Toolkit
      const actionResult = await dispatch(
        sendMessageThunk({
          conversationId,
          senderId: user.id,
          content,
          replyTo: replyPayload,
        })
      );

      if (sendMessageThunk.rejected.match(actionResult)) {
        return false;
      }

      const sentMsg = actionResult.payload as Message;

      // Notify message sent
      dispatch(showToast({ message: 'Message sent', type: 'success', duration: 1500 }));

      // 2. Simulate progressive delivery updates (sent -> delivered -> read)
      const cancelStatus = simulationService.simulateMessageStatusTransition(newStatus => {
        dispatch(
          updateMessageStatus({
            conversationId,
            messageId: sentMsg.id,
            status: newStatus,
          })
        );
        dispatch(
          updateConversationLastMessageStatus({
            conversationId,
            messageId: sentMsg.id,
            status: newStatus,
          })
        );
      });
      cleanupFnsRef.current.push(cancelStatus);

      // 3. Trigger contextual simulated bot auto-reply with typing indicator
      const cancelAutoReply = simulationService.triggerAutoReplyWorkflow(
        conversationId,
        (isTyping, respondent) => {
          dispatch(
            setTypingIndicator({
              conversationId,
              userId: respondent.id,
              userName: respondent.name,
              isTyping,
            })
          );
        },
        incomingMessage => {
          // Append received message into message feed
          dispatch(messageReceived(incomingMessage));
          // Update conversation in sidebar (updates last message, timestamp, unread count)
          dispatch(updateLastMessage(incomingMessage));
        }
      );
      cleanupFnsRef.current.push(cancelAutoReply);

      return true;
    },
    [dispatch, replyingTo, stopTyping]
  );

  const handleCancelReply = useCallback(() => {
    dispatch(setReplyingTo(null));
  }, [dispatch]);

  return {
    activeConversation,
    currentUser,
    replyingTo,
    handleSendMessage,
    handleCancelReply,
    handleTyping,
    stopTyping,
  };
}

export default useChat;
