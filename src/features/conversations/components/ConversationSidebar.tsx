import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { ConversationSearch } from './ConversationSearch';
import { ConversationFilterTabs } from './ConversationFilterTabs';
import { ConversationList } from './ConversationList';
import { cn } from '../../../utils/classNames';

export interface ConversationSidebarProps {
  className?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ className }) => {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800 transition-colors select-none',
        className
      )}
    >
      {/* 1. Header with Current User & Action Icons */}
      <SidebarHeader />

      {/* 2. Search Input */}
      <ConversationSearch />

      {/* 3. Category Filter Tabs (All, Unread, Groups) */}
      <ConversationFilterTabs />

      {/* 4. Scrollable Conversation Feed */}
      <ConversationList />
    </aside>
  );
};

export default ConversationSidebar;
