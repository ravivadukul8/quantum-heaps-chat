import React, { useState } from 'react';
import {
  Smile,
  CornerUpLeft,
  Copy,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '../../../utils/classNames';

export interface MessageActionsToolbarProps {
  isMe: boolean;
  isDeleted: boolean;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '🚀'];

export const MessageActionsToolbar: React.FC<MessageActionsToolbarProps> = ({
  isMe,
  isDeleted,
  onReaction,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  className,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isDeleted) return null;

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectEmoji = (emoji: string) => {
    onReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-0.5 p-1 rounded-full bg-white dark:bg-[#202c33] shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all',
        className
      )}
    >
      {/* Quick Emoji Reaction Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          title="Add reaction"
          aria-label="Add reaction"
          className="p-1.5 rounded-full text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {/* Emoji Selection Popover */}
        {showEmojiPicker && (
          <div
            className="absolute bottom-full mb-1 left-0 z-30 flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-[#182229] shadow-xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-100"
            role="menu"
            aria-label="Quick reactions"
          >
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-base hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-transform active:scale-125"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply Action */}
      <button
        type="button"
        onClick={onReply}
        title="Reply"
        aria-label="Reply to message"
        className="p-1.5 rounded-full text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
      >
        <CornerUpLeft className="w-3.5 h-3.5" />
      </button>

      {/* Copy Text Action */}
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy text'}
        aria-label={copied ? 'Copied to clipboard' : 'Copy message text'}
        className="p-1.5 rounded-full text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Edit Action (Author only) */}
      {isMe && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Edit message"
          aria-label="Edit message"
          className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Delete Action (Author only) */}
      {isMe && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Delete message"
          aria-label="Delete message"
          className="p-1.5 rounded-full text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default MessageActionsToolbar;
