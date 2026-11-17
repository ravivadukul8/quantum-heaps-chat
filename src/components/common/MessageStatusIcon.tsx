import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { MessageStatus } from '../../types';
import { cn } from '../../utils/classNames';

export interface MessageStatusIconProps {
  status: MessageStatus;
  className?: string;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({ status, className }) => {
  switch (status) {
    case 'sending':
      return <Clock className={cn('w-3.5 h-3.5 text-gray-400 animate-spin', className)} />;
    case 'sent':
      return <Check className={cn('w-3.5 h-3.5 text-gray-400 dark:text-gray-500', className)} />;
    case 'delivered':
      return <CheckCheck className={cn('w-3.5 h-3.5 text-gray-400 dark:text-gray-500', className)} />;
    case 'read':
      return (
        <CheckCheck
          className={cn('w-3.5 h-3.5 text-sky-500 dark:text-sky-400 font-semibold', className)}
        />
      );
    default:
      return null;
  }
};
