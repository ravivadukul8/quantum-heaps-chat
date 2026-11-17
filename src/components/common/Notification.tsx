import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import type { ToastNotification } from '../../features/settings/uiSlice';
import { cn } from '../../utils/classNames';

export interface NotificationProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onDismiss,
  className,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, notification.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-teal-500 shrink-0" />;
      case 'success':
      default:
        return <Check className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl shadow-xl border bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 select-none text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-150',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {getIcon()}
        <span className="truncate">{notification.message}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors ml-1 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Notification;
