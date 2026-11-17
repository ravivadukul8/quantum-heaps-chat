import React, { useState } from 'react';
import type { UserStatus } from '../../types';
import { cn } from '../../utils/classNames';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatus;
  className?: string;
  showStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 ring-1',
  sm: 'w-2.5 h-2.5 ring-1.5',
  md: 'w-3 h-3 ring-2',
  lg: 'w-3.5 h-3.5 ring-2',
  xl: 'w-4 h-4 ring-2',
};

const statusColorClasses: Record<UserStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400 dark:bg-gray-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
  showStatus = Boolean(status),
}) => {
  const [hasError, setHasError] = useState(false);

  // Generate 1-2 letter initials
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={cn('relative inline-flex shrink-0 select-none items-center justify-center', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full font-semibold shadow-inner transition-transform',
          'bg-gradient-to-tr from-teal-600 to-emerald-400 text-white dark:from-teal-700 dark:to-teal-500',
          sizeClasses[size]
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>

      {showStatus && status && (
        <span
          title={`Status: ${status}`}
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white dark:ring-[#111b21] transition-colors',
            statusSizeClasses[size],
            statusColorClasses[status]
          )}
        />
      )}
    </div>
  );
};
