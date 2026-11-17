import React from 'react';
import { cn } from '../../utils/classNames';

export interface ConversationSkeletonProps {
  count?: number;
  className?: string;
}

export const ConversationSkeleton: React.FC<ConversationSkeletonProps> = ({
  count = 5,
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading conversations"
      className={cn('divide-y divide-gray-100/60 dark:divide-gray-800/40 select-none animate-pulse', className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3.5 py-3">
          {/* Avatar Skeleton */}
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />

          {/* Lines Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-2.5 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-2.5 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading conversations...</span>
    </div>
  );
};

export default ConversationSkeleton;
