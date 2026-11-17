import React from 'react';
import { CornerUpLeft } from 'lucide-react';
import type { MessageReply as MessageReplyType } from '../../../types';
import { cn } from '../../../utils/classNames';

export interface MessageReplyProps {
  reply: MessageReplyType;
  onQuoteClick?: (messageId: string) => void;
  className?: string;
}

export const MessageReply: React.FC<MessageReplyProps> = ({
  reply,
  onQuoteClick,
  className,
}) => {
  const handleClick = () => {
    if (onQuoteClick && reply.messageId) {
      onQuoteClick(reply.messageId);
    } else if (reply.messageId) {
      const elem = document.getElementById(`msg-${reply.messageId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elem.classList.add('ring-2', 'ring-teal-500', 'bg-teal-50/30', 'dark:bg-teal-950/40', 'rounded-xl');
        setTimeout(() => {
          elem.classList.remove('ring-2', 'ring-teal-500', 'bg-teal-50/30', 'dark:bg-teal-950/40', 'rounded-xl');
        }, 1800);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title={`Jump to ${reply.senderName}'s message`}
      className={cn(
        'mx-2.5 mt-2 mb-1 p-2 rounded-xl bg-black/5 dark:bg-black/25 border-l-4 border-teal-500 text-xs cursor-pointer hover:bg-black/10 dark:hover:bg-black/40 transition-colors select-none text-left',
        className
      )}
    >
      <div className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
        <CornerUpLeft className="w-3 h-3 shrink-0" />
        <span className="truncate">{reply.senderName}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 truncate mt-0.5 leading-relaxed">
        {reply.content}
      </p>
    </div>
  );
};

export default MessageReply;
