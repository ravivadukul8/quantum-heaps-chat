import React from 'react';
import { MessageSquareDashed } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center select-none text-gray-500 dark:text-gray-400',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 shadow-inner">
        {icon ?? <MessageSquareDashed className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
