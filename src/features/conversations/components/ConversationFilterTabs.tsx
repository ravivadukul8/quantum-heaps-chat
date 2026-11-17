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

export interface FilterTabOption {
  id: ConversationFilter;
  label: string;
  count?: number;
  badgeVariant?: 'unread' | 'neutral' | 'primary';
}

export const ConversationFilterTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(selectConversationFilter);
  const totalUnread = useAppSelector(selectTotalUnreadCount);
  const conversations = useAppSelector(selectAllConversations);

  const groupCount = conversations.filter(c => c.type === 'group').length;
  const unreadConversationsCount = conversations.filter(c => c.unreadCount > 0).length;

  const tabs: FilterTabOption[] = [
    {
      id: 'all',
      label: 'All',
      count: conversations.length,
    },
    {
      id: 'unread',
      label: 'Unread',
      // Display unread conversations count or total unread messages if any
      count: unreadConversationsCount > 0 ? totalUnread : undefined,
      badgeVariant: 'unread',
    },
    {
      id: 'groups',
      label: 'Groups',
      count: groupCount,
      badgeVariant: 'neutral',
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Conversation filters"
      className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto no-scrollbar"
    >
      {tabs.map(tab => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls="conversation-feed"
            type="button"
            onClick={() => dispatch(setFilter(tab.id))}
            className={cn(
              'group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50',
              isActive
                ? 'bg-teal-600 text-white dark:bg-teal-600 dark:text-white shadow-sm font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 dark:bg-[#202c33] dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <span>{tab.label}</span>

            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight transition-colors',
                  isActive
                    ? 'bg-white/25 text-white'
                    : tab.badgeVariant === 'unread'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                    : 'bg-gray-200/80 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
