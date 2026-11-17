import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsSearchInChatOpen,
  toggleSearchInChat,
} from '../../settings/uiSlice';
import { selectActiveMessages } from '../messagesSelectors';
import { selectUsersEntities, selectCurrentUser } from '../../auth/usersSlice';
import { Avatar } from '../../../components/common/Avatar';
import { formatMessageTime, formatDate } from '../../../utils/dateUtils';

export const ChatSearchDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsSearchInChatOpen);
  const messages = useAppSelector(selectActiveMessages);
  const usersEntities = useAppSelector(selectUsersEntities);
  const currentUser = useAppSelector(selectCurrentUser);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Matching messages filter (case-insensitive on message.content)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return messages.filter(
      msg => !msg.isDeleted && msg.content.toLowerCase().includes(q)
    );
  }, [messages, query]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(toggleSearchInChat(false));
  };

  const handleScrollToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply temporary highlight flash
      element.classList.add('ring-2', 'ring-teal-500', 'bg-teal-50/20', 'dark:bg-teal-950/30', 'rounded-xl');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-teal-500', 'bg-teal-50/20', 'dark:bg-teal-950/30', 'rounded-xl');
      }, 2000);
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark
          key={index}
          className="bg-amber-200 dark:bg-amber-900/60 text-gray-900 dark:text-amber-100 rounded-xs px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <aside
      aria-label="In-Chat Message Search"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#202c33]/50">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Search Messages</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close message search"
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in this conversation..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#182229] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {query.trim() && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
            {matches.length} message{matches.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500 select-none">
            <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-xs">Search for words, phrases, or code snippets in this chat.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500 select-none">
            <Search className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No matching messages found
            </p>
            <p className="text-[11px] mt-1 max-w-[200px]">
              Try searching with a different keyword or checking for typos.
            </p>
          </div>
        ) : (
          matches.map(msg => {
            const sender = usersEntities[msg.senderId];
            const isMe = msg.senderId === currentUser?.id;
            const senderName = isMe ? 'You' : sender?.name ?? 'Unknown User';

            return (
              <button
                key={msg.id}
                type="button"
                onClick={() => handleScrollToMessage(msg.id)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#182229]/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 hover:border-teal-500/30 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={senderName}
                      src={sender?.avatarUrl}
                      size="xs"
                      showStatus={false}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {senderName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>{formatDate(msg.timestamp)}</span>
                    <span>•</span>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-teal-600 dark:text-teal-400 transition-opacity ml-1" />
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed pl-6">
                  {highlightMatch(msg.content, query)}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ChatSearchDrawer;
