import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectConversationFilter,
  setFilter,
} from '../conversationsSlice';
import {
  selectAllConversations,
  selectTotalUnreadCount,
} from '../conversationsSelectors';
import type { ConversationFilter } from '../../../types';
import { cn } from '../../../utils/classNames';

export const ConversationFilterTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(selectConversationFilter);
  const totalUnread = useAppSelector(selectTotalUnreadCount);
  const conversations = useAppSelector(selectAllConversations);

  const groupCount = conversations.filter(c => c.type === 'group').length;

  const tabs: { id: ConversationFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: totalUnread },
    { id: 'groups', label: 'Groups', count: groupCount },
  ];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => dispatch(setFilter(tab.id))}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 select-none whitespace-nowrap',
              isActive
                ? 'bg-teal-600 text-white dark:bg-teal-600 dark:text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 dark:bg-[#202c33] dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
