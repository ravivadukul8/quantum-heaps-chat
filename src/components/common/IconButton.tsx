import React from 'react';
import { cn } from '../../utils/classNames';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'ghost' | 'filled' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const sizeClasses = {
  sm: 'p-1.5 rounded-lg text-sm',
  md: 'p-2 rounded-xl text-base',
  lg: 'p-2.5 rounded-xl text-lg',
};

const variantClasses = {
  ghost:
    'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/70',
  filled:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  danger:
    'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
        sizeClasses[size],
        variantClasses[variant],
        active && 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 font-medium',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};
