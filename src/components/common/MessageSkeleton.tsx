import React from 'react';
import { cn } from '../../utils/classNames';

export interface MessageSkeletonProps {
  count?: number;
  className?: string;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  count = 6,
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading messages"
      className={cn('flex flex-col space-y-4 p-4 select-none animate-pulse', className)}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isMe = index % 2 === 1;
        return (
          <div
            key={index}
            className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'flex flex-col space-y-2 p-3.5 rounded-2xl max-w-[70%]',
                isMe
                  ? 'bg-teal-100/60 dark:bg-[#005c4b]/50 rounded-tr-xs'
                  : 'bg-gray-100 dark:bg-[#202c33] rounded-tl-xs'
              )}
            >
              <div
                className={cn(
                  'h-3 bg-gray-300 dark:bg-gray-700 rounded',
                  index % 3 === 0 ? 'w-48' : index % 3 === 1 ? 'w-64' : 'w-36'
                )}
              />
              <div
                className={cn(
                  'h-3 bg-gray-300 dark:bg-gray-700 rounded',
                  index % 3 === 0 ? 'w-32' : 'w-24'
                )}
              />
              <div className="flex justify-end pt-1">
                <div className="h-2 w-8 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        );
      })}
      <span className="sr-only">Loading message thread...</span>
    </div>
  );
};

export default MessageSkeleton;
