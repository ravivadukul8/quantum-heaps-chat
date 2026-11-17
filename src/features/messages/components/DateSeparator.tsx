import React, { memo } from 'react';
import { cn } from '../../../utils/classNames';

export interface DateSeparatorProps {
  label: string;
  className?: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = memo(({ label, className }) => {
  return (
    <div className={cn('sticky top-2 z-10 flex items-center justify-center my-3 select-none pointer-events-none', className)}>
      <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-[#182229]/95 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200/60 dark:border-gray-800/80 backdrop-blur tracking-wide">
        {label}
      </span>
    </div>
  );
});

DateSeparator.displayName = 'DateSeparator';
