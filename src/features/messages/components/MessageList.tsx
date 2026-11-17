import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Lock, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectActiveMessages,
  selectActiveConversationTypingUsers,
} from '../messagesSelectors';
import {
  setReplyingTo,
  optimisticToggleReaction,
  toggleReactionThunk,
  editMessageThunk,
  deleteMessageThunk,
} from '../messagesSlice';
import { selectActiveConversation } from '../../conversations/conversationsSelectors';
import { selectCurrentUser, selectUsersEntities } from '../../auth/usersSlice';
import { isGroupConversation, type Message } from '../../../types';
import { groupMessagesByDate } from '../../../utils/messageGrouper';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { Avatar } from '../../../components/common/Avatar';
import { cn } from '../../../utils/classNames';

export interface MessageListProps {
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectActiveMessages);
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const usersEntities = useAppSelector(selectUsersEntities);
  const typingUsers = useAppSelector(selectActiveConversationTypingUsers);

  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Group messages chronologically by date
  const dateGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Auto-scroll to bottom on new messages or conversation switch
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    scrollBottomRef.current?.scrollIntoView?.({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeConversation?.id, scrollToBottom]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, scrollToBottom]);

  const activeConvId = activeConversation?.id;

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!activeConvId) return;
      dispatch(
        editMessageThunk({
          conversationId: activeConvId,
          messageId,
          content: newContent,
        })
      );
    },
    [dispatch, activeConvId]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!activeConvId) return;
      dispatch(
        deleteMessageThunk({
          conversationId: activeConvId,
          messageId,
        })
      );
    },
    [dispatch, activeConvId]
  );

  if (!activeConversation || !currentUser) {
    return null;
  }

  const isGroup = isGroupConversation(activeConversation);

  // Handle Reply trigger
  const handleReply = (message: Message) => {
    const sender = usersEntities[message.senderId];
    dispatch(
      setReplyingTo({
        messageId: message.id,
        senderId: message.senderId,
        senderName: message.senderId === currentUser.id ? 'You' : sender?.name ?? 'Unknown',
        content: message.content,
      })
    );
  };

  // Handle Reaction Click
  const handleReactionClick = (messageId: string, emoji: string) => {
    // 1. Instant optimistic update
    dispatch(
      optimisticToggleReaction({
        conversationId: activeConversation.id,
        messageId,
        emoji,
        userId: currentUser.id,
      })
    );
    // 2. Background service sync
    dispatch(
      toggleReactionThunk({
        conversationId: activeConversation.id,
        messageId,
        emoji,
        userId: currentUser.id,
      })
    );
  };

  // Empty conversation thread state
  if (messages.length === 0) {
    let emptyTitle = '';
    let emptyAvatar: string | undefined = undefined;
    let emptyBio = '';

    if (isGroup) {
      emptyTitle = activeConversation.name;
      emptyAvatar = activeConversation.avatarUrl;
      emptyBio = activeConversation.description || 'Welcome to the group channel!';
    } else {
      const otherUserId =
        activeConversation.participantIds.find(id => id !== currentUser.id) ??
        activeConversation.participantIds[0];
      const otherUser = otherUserId ? usersEntities[otherUserId] : undefined;
      emptyTitle = otherUser?.name ?? 'Unknown Contact';
      emptyAvatar = otherUser?.avatarUrl;
      emptyBio = otherUser?.customBio || otherUser?.email || '';
    }

    return (
      <div className={cn('flex-1 flex flex-col items-center justify-center p-6 text-center select-none', className)}>
        <div className="max-w-sm flex flex-col items-center p-6 rounded-3xl bg-white/70 dark:bg-[#182229]/80 backdrop-blur border border-gray-100 dark:border-gray-800 shadow-md">
          <Avatar name={emptyTitle} src={emptyAvatar} size="xl" />
          <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            {emptyTitle} <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
            {emptyBio}
          </p>

          <div className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[11px] text-teal-700 dark:text-teal-300 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Messages in this chat are end-to-end encrypted</span>
          </div>

          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Say hello to start the conversation!</span>
          </p>
        </div>
      </div>
    );
  }

  // Active Typing indicator in feed
  const otherTypingUsers = typingUsers.filter(u => u.userId !== currentUser.id);

  return (
    <div
      ref={listContainerRef}
      role="log"
      aria-live="polite"
      aria-label="Message feed"
      className={cn(
        'flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2 select-text scroll-smooth',
        className
      )}
    >
      {/* End-to-end encryption privacy notice banner */}
      <div className="flex justify-center mb-4 select-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 shadow-xs">
          <Lock className="w-3 h-3 shrink-0" />
          <span>Messages are protected with end-to-end simulated encryption.</span>
        </div>
      </div>

      {/* Date Groups */}
      {dateGroups.map(group => (
        <div key={group.dateKey} className="space-y-1">
          {/* Centered Date Separator ("Today", "Yesterday", or formatted date) */}
          <DateSeparator label={group.dateLabel} />

          {/* Group Messages */}
          {group.messages.map((message, index) => {
            const isMe = message.senderId === currentUser.id;
            const sender = usersEntities[message.senderId];
            const prevMsg = group.messages[index - 1];
            // Only show sender header on first consecutive message from same sender
            const showSenderHeader = !prevMsg || prevMsg.senderId !== message.senderId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isMe={isMe}
                isGroup={isGroup}
                sender={sender}
                showSenderHeader={showSenderHeader}
                currentUserId={currentUser.id}
                onReply={handleReply}
                onReactionClick={handleReactionClick}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            );
          })}
        </div>
      ))}

      {/* Floating Typing Indicator bubble in feed if active */}
      {otherTypingUsers.length > 0 && (
        <div className="flex items-center gap-2 mt-2 ml-1 text-xs text-teal-600 dark:text-teal-400 select-none animate-in fade-in duration-200">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
            <span className="ml-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {otherTypingUsers.map(u => u.userName.split(' ')[0]).join(', ')} is typing...
            </span>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={scrollBottomRef} />
    </div>
  );
};

export default MessageList;
