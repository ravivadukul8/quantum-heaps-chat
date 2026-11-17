import React from 'react';
import { MessageStatus } from './MessageStatus';
import type { MessageStatus as MessageStatusType } from '../../types';

export interface MessageStatusIconProps {
  status: MessageStatusType;
  className?: string;
  'aria-label'?: string;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  status,
  className,
  'aria-label': ariaLabel,
}) => {
  return <MessageStatus status={status} iconClassName={className} aria-label={ariaLabel} />;
};

export default MessageStatusIcon;
