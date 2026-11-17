import { useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectActiveConversation,
  updateLastMessage,
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
import { simulationService } from '../services/simulationService';
import type { Message, MessageReply } from '../types';

export function useChat() {
  const dispatch = useAppDispatch();
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const replyingTo = useAppSelector(selectReplyingToMessage);

  // Active timers cleanup refs
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  // Clean up all pending simulation timers on unmount or conversation change
  useEffect(() => {
    return () => {
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, [activeConversation?.id]);

  const handleSendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || !activeConversation || !currentUser) {
        return false;
      }

      const conversationId = activeConversation.id;
      const replyPayload: MessageReply | undefined = replyingTo ? { ...replyingTo } : undefined;

      // 1. Dispatch outgoing message to Redux Toolkit
      const actionResult = await dispatch(
        sendMessageThunk({
          conversationId,
          senderId: currentUser.id,
          content,
          replyTo: replyPayload,
        })
      );

      if (sendMessageThunk.rejected.match(actionResult)) {
        return false;
      }

      const sentMsg = actionResult.payload as Message;

      // 2. Simulate progressive delivery updates (sent -> delivered -> read)
      const cancelStatus = simulationService.simulateMessageStatusTransition(newStatus => {
        dispatch(
          updateMessageStatus({
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
    [activeConversation, currentUser, replyingTo, dispatch]
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
  };
}
