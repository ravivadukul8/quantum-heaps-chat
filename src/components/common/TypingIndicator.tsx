import React from 'react';
import { formatTypingText, type TypingUser } from '../../utils/typingUtils';
import { cn } from '../../utils/classNames';

export type { TypingUser };

export interface TypingIndicatorProps {
  users: TypingUser[];
  variant?: 'bubble' | 'header' | 'inline';
  className?: string;
  showDots?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users,
  variant = 'bubble',
  className,
  showDots = true,
}) => {
  if (!users || users.length === 0) return null;

  const typingText = formatTypingText(users);

  // Variant 1: Header (rendered inside ChatHeader as status subtext)
  if (variant === 'header') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium animate-pulse',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <span>{typingText}</span>
      </span>
    );
  }

  // Variant 2: Inline / Subtle
  if (variant === 'inline') {
    return (
      <span
        className={cn('inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400', className)}
        role="status"
        aria-live="polite"
      >
        {showDots && (
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </span>
        )}
        <span className="text-[11px] font-medium">{typingText}</span>
      </span>
    );
  }

  // Variant 3: Bubble (rendered at bottom of MessageList feed)
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 my-1 text-xs text-teal-600 dark:text-teal-400 select-none animate-in fade-in duration-200',
        className
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800/60 shadow-xs">
        {showDots && (
          <div className="flex items-center gap-1 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}
        <span className="ml-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
          {typingText}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
