import React from 'react';
import type { MessageReaction } from '../../../types';
import { cn } from '../../../utils/classNames';

export interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onReactionClick: (emoji: string) => void;
  className?: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUserId,
  onReactionClick,
  className,
}) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Message reactions"
      className={cn('flex flex-wrap items-center gap-1 px-3 pb-2 -mt-0.5', className)}
    >
      {reactions.map(reaction => {
        const hasReacted = reaction.userIds.includes(currentUserId);
        const titleText = hasReacted
          ? `You and ${reaction.count - 1} other${reaction.count - 1 === 1 ? '' : 's'} reacted with ${reaction.emoji}`
          : `${reaction.count} person${reaction.count === 1 ? '' : 's'} reacted with ${reaction.emoji}`;

        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onReactionClick(reaction.emoji)}
            title={titleText}
            aria-label={`${reaction.count} reacted with ${reaction.emoji}${hasReacted ? ' (you reacted)' : ''}`}
            aria-pressed={hasReacted}
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
  );
};

export default MessageReactions;
