import React from 'react';
import { Search, X } from 'lucide-react';
import { useConversationSearch } from '../../../hooks/useConversationSearch';

export const ConversationSearch: React.FC = () => {
  const { inputValue, setInputValue, handleClear, inputRef, totalMatches, hasActiveQuery } =
    useConversationSearch(250);

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Search conversations, names or messages..."
          aria-label="Search conversations"
          className="w-full pl-9 pr-14 py-2 text-xs bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border border-transparent focus:border-teal-500/50 focus:bg-white dark:focus:bg-[#111b21] focus:outline-none transition-all duration-150"
        />

        {hasActiveQuery ? (
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold select-none">
              {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
            </span>
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear conversation search"
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Clear search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <kbd
            title="Press Ctrl+K or / to search"
            className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-200/60 dark:bg-gray-800 rounded border border-gray-300/40 dark:border-gray-700 select-none cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            onClick={() => inputRef.current?.focus()}
          >
            Ctrl+K
          </kbd>
        )}
      </div>
    </div>
  );
};
