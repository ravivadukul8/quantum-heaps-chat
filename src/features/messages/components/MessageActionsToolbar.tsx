import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  CornerUpLeft,
  Copy,
  Check,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { showToast } from '../../settings/uiSlice';
import { EmojiPicker } from './EmojiPicker';
import { cn } from '../../../utils/classNames';

export interface MessageActionsToolbarProps {
  isMe: boolean;
  isDeleted: boolean;
  content: string;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '🚀'];

export const MessageActionsToolbar: React.FC<MessageActionsToolbarProps> = ({
  isMe,
  isDeleted,
  content,
  onReaction,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  className,
}) => {
  const dispatch = useAppDispatch();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Clean up copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // Dismiss open emoji menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowQuickMenu(false);
        setShowFullPicker(false);
      }
    };

    if (showQuickMenu || showFullPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickMenu, showFullPicker]);

  if (isDeleted) return null;

  const handleCopy = async () => {
    try {
      if (onCopy) {
        onCopy();
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for environments where Clipboard API is restricted
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = content;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }

      setCopied(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
      dispatch(showToast({ message: 'Message copied to clipboard', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to copy message to clipboard', type: 'error' }));
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    onReaction(emoji);
    setShowQuickMenu(false);
    setShowFullPicker(false);
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'relative inline-flex items-center gap-0.5 p-1 rounded-full bg-white dark:bg-[#202c33] shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all',
        className
      )}
    >
      {/* Quick Emoji Reaction Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowQuickMenu(prev => !prev);
            setShowFullPicker(false);
          }}
          title="Add reaction"
          aria-label="Add reaction"
          className="p-1.5 rounded-full text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {/* Quick Reactions Bar Popover */}
        {showQuickMenu && !showFullPicker && (
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
            <button
              type="button"
              onClick={() => setShowFullPicker(true)}
              title="More emojis"
              aria-label="More emojis"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Expanded Full Accessible Emoji Picker */}
        {showFullPicker && (
          <div className="absolute bottom-full mb-1 left-0 z-40 animate-in zoom-in-95 duration-100">
            <EmojiPicker
              onSelectEmoji={handleSelectEmoji}
              onClose={() => setShowFullPicker(false)}
            />
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
