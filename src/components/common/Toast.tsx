import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectToasts, selectToast, dismissToast } from '../../features/settings/uiSlice';
import { Notification } from './Notification';
import { cn } from '../../utils/classNames';

export interface ToastProps {
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);
  const singleToast = useAppSelector(selectToast);

  // Unified list of active notifications
  const activeToasts = toasts.length > 0 ? toasts : singleToast ? [singleToast] : [];

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none max-w-md w-full px-4',
        className
      )}
    >
      {activeToasts.map(toast => (
        <Notification
          key={toast.id}
          notification={toast}
          onDismiss={id => dispatch(dismissToast(id))}
          className="w-full sm:w-auto min-w-[280px]"
        />
      ))}
    </div>
  );
};

export default Toast;
