import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../../utils/classNames';

export interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

const EMOJI_LIBRARY = [
  { emoji: '👍', name: 'thumbs up thumbsup like' },
  { emoji: '❤️', name: 'heart love red' },
  { emoji: '😂', name: 'joy laugh tears haha' },
  { emoji: '😮', name: 'wow surprised shocked' },
  { emoji: '😢', name: 'sad cry crying' },
  { emoji: '🎉', name: 'tada celebration party congrats' },
  { emoji: '🔥', name: 'fire hot lit awesome' },
  { emoji: '🚀', name: 'rocket launch fast spaceship' },
  { emoji: '👏', name: 'applause clap cheering' },
  { emoji: '🙏', name: 'pray please thanks grateful' },
  { emoji: '💯', name: '100 perfect score complete' },
  { emoji: '✨', name: 'sparkles stars magic clean' },
  { emoji: '💡', name: 'lightbulb idea smart brain' },
  { emoji: '✅', name: 'check green done approved' },
  { emoji: '👀', name: 'eyes looking watching observe' },
  { emoji: '💪', name: 'muscle strong flex power' },
  { emoji: '🎯', name: 'target bullseye goal accurate' },
  { emoji: '⚡', name: 'lightning bolt fast electric' },
  { emoji: '🥳', name: 'party face celebrate happy' },
  { emoji: '🤝', name: 'handshake deal agree partner' },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  onClose,
  className,
}) => {
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const filteredEmojis = EMOJI_LIBRARY.filter(item =>
    search ? item.name.includes(search.toLowerCase().trim()) : true
  );

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Choose emoji reaction"
      className={cn(
        'w-64 p-2 rounded-2xl bg-white dark:bg-[#182229] shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-150 z-30 select-none text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {/* Search Header */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emojis..."
          aria-label="Search emojis"
          className="w-full pl-8 pr-6 py-1 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111b21] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear emoji search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-1 max-h-44 overflow-y-auto p-1">
        {filteredEmojis.map(item => (
          <button
            key={item.emoji}
            type="button"
            onClick={() => {
              onSelectEmoji(item.emoji);
              onClose?.();
            }}
            title={item.name.split(' ')[0]}
            aria-label={`React with ${item.emoji}`}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-transform active:scale-125 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
