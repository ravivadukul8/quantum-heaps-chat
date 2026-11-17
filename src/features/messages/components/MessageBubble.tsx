import React, { memo } from 'react';
import { Ban, CornerUpLeft } from 'lucide-react';
import type { Message, User } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { MessageStatusIcon } from '../../../components/common/MessageStatusIcon';
import { formatMessageTime } from '../../../utils/dateUtils';
import { cn } from '../../../utils/classNames';

export interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isGroup: boolean;
  sender?: User;
  showSenderHeader?: boolean;
  currentUserId: string;
  onReply?: (message: Message) => void;
  onReactionClick?: (messageId: string, emoji: string) => void;
}

// Consistent sender colors in group conversations
const SENDER_COLORS = [
  'text-emerald-600 dark:text-emerald-400',
  'text-sky-600 dark:text-sky-400',
  'text-violet-600 dark:text-violet-400',
  'text-amber-600 dark:text-amber-400',
  'text-rose-600 dark:text-rose-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-pink-600 dark:text-pink-400',
  'text-teal-600 dark:text-teal-400',
];

function getSenderColor(name = ''): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SENDER_COLORS.length;
  return SENDER_COLORS[index] ?? 'text-teal-600';
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({
    message,
    isMe,
    isGroup,
    sender,
    showSenderHeader = true,
    currentUserId,
    onReply,
    onReactionClick,
  }) => {
    const senderName = sender?.name ?? 'Unknown User';
    const senderColorClass = getSenderColor(senderName);

    return (
      <div
        className={cn(
          'group relative flex w-full my-1 transition-all',
          isMe ? 'justify-end' : 'justify-start'
        )}
      >
        {/* Incoming Group Avatar (optional avatar for received messages in group) */}
        {!isMe && isGroup && (
          <div className="w-8 shrink-0 mr-2 flex flex-col justify-end self-end">
            {showSenderHeader ? (
              <Avatar
                name={senderName}
                src={sender?.avatarUrl}
                size="sm"
                status={sender?.status}
                showStatus={false}
              />
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        {/* Message Container */}
        <div
          className={cn(
            'relative flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%] rounded-2xl shadow-sm text-sm transition-all',
            isMe
              ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-xs border border-[#c3edbc]/60 dark:border-[#02735e]/40'
              : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-tl-xs border border-gray-200/60 dark:border-gray-800/60'
          )}
        >
          {/* Sender Header for Group Chats */}
          {!isMe && isGroup && showSenderHeader && (
            <div className="px-3.5 pt-2 pb-0.5">
              <span className={cn('text-xs font-bold select-none cursor-pointer hover:underline', senderColorClass)}>
                {senderName}
              </span>
            </div>
          )}

          {/* Quoted Reply Reference Banner */}
          {message.replyTo && (
            <div className="mx-2.5 mt-2 mb-1 p-2 rounded-xl bg-black/5 dark:bg-black/20 border-l-4 border-teal-500 text-xs">
              <div className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                <CornerUpLeft className="w-3 h-3" />
                <span>{message.replyTo.senderName}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 truncate mt-0.5">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Main Content Area */}
          <div className="px-3.5 pt-1.5 pb-2">
            {message.isDeleted ? (
              <div className="flex items-center gap-1.5 italic text-gray-500 dark:text-gray-400 select-none py-0.5">
                <Ban className="w-4 h-4 text-gray-400 shrink-0" />
                <span>This message was deleted</span>
              </div>
            ) : (
              <div className="break-words whitespace-pre-wrap leading-relaxed select-text">
                {message.content}
              </div>
            )}

            {/* Timestamp & Delivery Indicators */}
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] select-none text-gray-500 dark:text-gray-400">
              {message.isEdited && !message.isDeleted && (
                <span className="italic mr-0.5">(edited)</span>
              )}
              <span>{formatMessageTime(message.timestamp)}</span>
              {isMe && !message.isDeleted && (
                <MessageStatusIcon status={message.status} className="shrink-0 ml-0.5" />
              )}
            </div>
          </div>

          {/* Reaction Pills Bar (if reactions present) */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 px-3 pb-2 -mt-0.5">
              {message.reactions.map(reaction => {
                const hasReacted = reaction.userIds.includes(currentUserId);
                return (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() => onReactionClick?.(message.id, reaction.emoji)}
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-transform active:scale-90 select-none border',
                      hasReacted
                        ? 'bg-teal-100 dark:bg-teal-950/60 border-teal-500/50 text-teal-800 dark:text-teal-300 font-medium'
                        : 'bg-white/80 dark:bg-[#182229]/80 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                    )}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-[10px] font-semibold">{reaction.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Reply Button on Hover */}
          {!message.isDeleted && onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              title="Reply to message"
              className={cn(
                'absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white dark:bg-[#202c33] shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400',
                isMe ? '-left-8' : '-right-8'
              )}
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';
