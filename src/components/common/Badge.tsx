import React from 'react';
import { cn } from '../../utils/classNames';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'unread' | 'primary' | 'secondary' | 'neutral' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  unread:
    'bg-teal-500 text-white dark:bg-teal-500 dark:text-white font-bold shadow-sm animate-pulse-once',
  primary:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium',
  secondary:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium',
  neutral:
    'bg-gray-200/80 text-gray-600 dark:bg-gray-700/60 dark:text-gray-400 font-medium',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[11px] min-w-[18px] h-[18px]',
  md: 'px-2 py-0.5 text-xs min-w-[20px] h-[20px]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full leading-none text-center select-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};
