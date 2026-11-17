import React from 'react';
import { CornerUpLeft, X } from 'lucide-react';
import type { MessageReply } from '../../../types';

export interface ReplyPreviewProps {
  reply: MessageReply | null;
  onCancel: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ reply, onCancel }) => {
  if (!reply) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#182229] border-t border-b border-gray-200/80 dark:border-gray-800/80 text-xs animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-start gap-2.5 min-w-0 pr-3">
        <div className="w-1 self-stretch bg-teal-500 rounded-full shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400">
            <CornerUpLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Replying to {reply.senderName}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {reply.content}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel reply"
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
        title="Cancel reply (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
