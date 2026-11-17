import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Smile, Paperclip, SendHorizontal, Mic } from 'lucide-react';
import { useChat } from '../../../hooks/useChat';
import { ReplyPreview } from './ReplyPreview';
import { cn } from '../../../utils/classNames';

interface MessageFormData {
  message: string;
}

export interface MessageInputProps {
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ className }) => {
  const { replyingTo, handleSendMessage, handleCancelReply } = useChat();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<MessageFormData>({
    defaultValues: {
      message: '',
    },
  });

  const messageText = watch('message');
  const hasText = Boolean(messageText && messageText.trim().length > 0);

  // Auto-resize textarea based on input content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  // Focus textarea when replying to a message
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  const onSubmit = async (data: MessageFormData) => {
    if (!data.message.trim()) return;

    const success = await handleSendMessage(data.message);
    if (success) {
      reset({ message: '' });
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    } else if (e.key === 'Escape' && replyingTo) {
      e.preventDefault();
      handleCancelReply();
    }
  };

  const { ref: formRef, ...restField } = register('message', {
    required: true,
    validate: val => Boolean(val.trim()),
  });

  return (
    <footer
      className={cn(
        'relative flex flex-col bg-white dark:bg-[#202c33] border-t border-gray-200/80 dark:border-gray-800 transition-colors z-20',
        className
      )}
    >
      {/* Quoted Reply Banner */}
      <ReplyPreview reply={replyingTo} onCancel={handleCancelReply} />

      {/* Main Composer Row */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-1.5 md:gap-2 px-3 md:px-4 py-2.5"
      >
        {/* Left Action: Emoji Picker Mock */}
        <button
          type="button"
          aria-label="Insert emoji"
          title="Insert emoji"
          onClick={() => {
            setValue('message', (messageText || '') + ' 😊 ', { shouldValidate: true });
            textareaRef.current?.focus();
          }}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors shrink-0"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Left Action: Attachments */}
        <button
          type="button"
          aria-label="Attach file or photo"
          title="Attach file or media"
          onClick={() => alert('Attachment upload dialog (mock).')}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors shrink-0 hidden sm:inline-flex"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input Textarea Container */}
        <div className="flex-1 min-w-0 bg-gray-100 dark:bg-[#111b21] rounded-2xl border border-transparent focus-within:border-teal-500/50 focus-within:bg-white dark:focus-within:bg-[#111b21] transition-all px-3 py-1.5">
          <textarea
            {...restField}
            ref={e => {
              formRef(e);
              textareaRef.current = e;
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message (Enter to send, Shift+Enter for new line)..."
            aria-label="Message text"
            className="w-full bg-transparent resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none max-h-32 leading-relaxed"
          />
        </div>

        {/* Send / Mic Button */}
        {hasText ? (
          <button
            type="submit"
            aria-label="Send message"
            title="Send message (Enter)"
            className="p-2.5 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-sm transition-all shrink-0 flex items-center justify-center animate-in zoom-in-90 duration-150"
          >
            <SendHorizontal className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Voice message"
            title="Hold to record voice message"
            onClick={() => alert('Hold to record voice message (mock).')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </footer>
  );
};

export default MessageInput;
