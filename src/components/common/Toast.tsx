import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectToast, hideToast } from '../../features/settings/uiSlice';
import { cn } from '../../utils/classNames';

export interface ToastProps {
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      dispatch(hideToast());
    }, toast.duration ?? 2500);

    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
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
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none text-xs font-medium',
        className
      )}
    >
      {getIcon()}
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => dispatch(hideToast())}
        aria-label="Close notification"
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;
