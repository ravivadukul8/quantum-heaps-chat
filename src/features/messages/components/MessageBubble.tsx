import React, { memo, useState, useRef, useEffect } from 'react';
import { Ban, CornerUpLeft } from 'lucide-react';
import type { Message, User } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { MessageStatusIcon } from '../../../components/common/MessageStatusIcon';
import { formatMessageTime } from '../../../utils/dateUtils';
import { MessageActionsToolbar } from './MessageActionsToolbar';
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
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
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
    onEditMessage,
    onDeleteMessage,
  }) => {
    const senderName = sender?.name ?? 'Unknown User';
    const senderColorClass = getSenderColor(senderName);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus and select text when entering edit mode
    useEffect(() => {
      if (isEditing) {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }
    }, [isEditing]);

    const handleStartEdit = () => {
      setEditContent(message.content);
      setIsEditing(true);
      setShowDeleteConfirm(false);
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditContent(message.content);
    };

    const handleSaveEdit = () => {
      const trimmed = editContent.trim();
      if (!trimmed) return;
      if (trimmed !== message.content && onEditMessage) {
        onEditMessage(message.id, trimmed);
      }
      setIsEditing(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    };

    const handleCopy = () => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message.content);
      }
    };

    const handleConfirmDelete = () => {
      onDeleteMessage?.(message.id);
      setShowDeleteConfirm(false);
    };

    return (
      <div
        id={`msg-${message.id}`}
        className={cn(
          'group relative flex w-full my-1 transition-all',
          isMe ? 'justify-end' : 'justify-start'
        )}
      >
        {/* Incoming Group Avatar (avatar for received messages in group) */}
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
            ) : isEditing ? (
              /* Inline Editing Form */
              <div className="py-1 min-w-[220px] sm:min-w-[280px]">
                <textarea
                  ref={editInputRef}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={2}
                  className="w-full p-2 text-sm rounded-lg border border-teal-500 bg-white dark:bg-[#111b21] text-gray-900 dark:text-gray-100 focus:outline-none resize-none shadow-xs"
                />
                <div className="flex items-center justify-between mt-1.5 select-none">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    Esc to cancel • Enter to save
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                      className="px-2 py-0.5 rounded text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Message Text */
              <div className="break-words whitespace-pre-wrap leading-relaxed select-text">
                {message.content}
              </div>
            )}

            {/* Inline Delete Confirmation Banner */}
            {showDeleteConfirm && (
              <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs">
                <p className="text-rose-800 dark:text-rose-200 font-medium">
                  Delete this message?
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-0.5 rounded text-[11px] text-gray-600 dark:text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
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
          {message.reactions && message.reactions.length > 0 && !message.isDeleted && (
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

          {/* Floating Actions Toolbar on Hover */}
          {!message.isDeleted && !isEditing && (
            <div
              className={cn(
                'absolute -top-3.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20',
                isMe ? 'right-2' : 'left-2'
              )}
            >
              <MessageActionsToolbar
                isMe={isMe}
                isDeleted={message.isDeleted}
                onReaction={emoji => onReactionClick?.(message.id, emoji)}
                onReply={() => onReply?.(message)}
                onCopy={handleCopy}
                onEdit={isMe ? handleStartEdit : undefined}
                onDelete={isMe ? () => setShowDeleteConfirm(true) : undefined}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
