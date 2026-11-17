import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { MessageStatus as MessageStatusType } from '../../types';
import { formatMessageTime } from '../../utils/dateUtils';
import { cn } from '../../utils/classNames';

export interface MessageStatusProps {
  status: MessageStatusType;
  timestamp?: string;
  showTime?: boolean;
  className?: string;
  iconClassName?: string;
  'aria-label'?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  timestamp,
  showTime = false,
  className,
  iconClassName,
  'aria-label': customAriaLabel,
}) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'sending':
        return {
          label: 'Sending message',
          icon: <Clock className={cn('w-3.5 h-3.5 text-gray-400 dark:text-gray-500 animate-pulse', iconClassName)} />,
        };
      case 'sent':
        return {
          label: 'Sent',
          icon: <Check className={cn('w-3.5 h-3.5 text-gray-400 dark:text-gray-500', iconClassName)} />,
        };
      case 'delivered':
        return {
          label: 'Delivered',
          icon: <CheckCheck className={cn('w-3.5 h-3.5 text-gray-400 dark:text-gray-500', iconClassName)} />,
        };
      case 'read':
        return {
          label: 'Read',
          icon: (
            <CheckCheck
              className={cn(
                'w-3.5 h-3.5 text-[#53bdeb] dark:text-[#53bdeb] font-semibold',
                iconClassName
              )}
            />
          ),
        };
      default:
        return {
          label: '',
          icon: null,
        };
    }
  };

  const { label, icon } = getStatusDetails();
  const ariaLabel = customAriaLabel || label;

  return (
    <span
      className={cn('inline-flex items-center gap-1 select-none', className)}
      title={label}
      aria-label={ariaLabel}
      role="status"
    >
      {showTime && timestamp && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {formatMessageTime(timestamp)}
        </span>
      )}
      {icon}
    </span>
  );
};

export default MessageStatus;
