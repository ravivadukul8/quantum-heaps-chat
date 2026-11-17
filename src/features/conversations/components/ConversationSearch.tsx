import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectConversationSearchQuery,
  setSearchQuery,
} from '../conversationsSlice';

export const ConversationSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectConversationSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    dispatch(setSearchQuery(''));
    inputRef.current?.focus();
  };

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => dispatch(setSearchQuery(e.target.value))}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-14 py-2 text-xs bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border border-transparent focus:border-teal-500/50 focus:bg-white dark:focus:bg-[#111b21] focus:outline-none transition-all duration-150"
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="absolute right-3 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-200/60 dark:bg-gray-800 rounded border border-gray-300/40 dark:border-gray-700 select-none">
            Ctrl+K
          </span>
        )}
      </div>
    </div>
  );
};
