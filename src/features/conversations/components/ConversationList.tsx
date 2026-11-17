import React, { useCallback } from 'react';
import { MessageSquareDashed, CheckCircle, SearchX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setActiveConversation,
  setSearchQuery,
} from '../conversationsSlice';
import {
  selectFilteredConversations,
  selectActiveConversationId,
  selectConversationFilter,
  selectConversationSearchQuery,
} from '../conversationsSelectors';
import {
  selectCurrentUser,
  selectUsersEntities,
} from '../../auth/usersSlice';
import { setMobilePane } from '../../settings/uiSlice';
import { ConversationItem } from './ConversationItem';

export const ConversationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectFilteredConversations);
  const activeId = useAppSelector(selectActiveConversationId);
  const activeFilter = useAppSelector(selectConversationFilter);
  const searchQuery = useAppSelector(selectConversationSearchQuery);
  const currentUser = useAppSelector(selectCurrentUser);
  const usersEntities = useAppSelector(selectUsersEntities);

  const handleSelectConversation = useCallback(
    (id: string) => {
      dispatch(setActiveConversation(id));
      // Transition mobile view from sidebar to active chat pane
      dispatch(setMobilePane('chat'));
    },
    [dispatch]
  );

  if (!currentUser) return null;

  // Empty state rendering
  if (conversations.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
            <SearchX className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            No matches found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            No conversations matching &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => dispatch(setSearchQuery(''))}
            className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (activeFilter === 'unread') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-3 text-teal-600 dark:text-teal-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            All caught up!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You have no unread messages.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
          <MessageSquareDashed className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          No conversations
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Start a new direct chat or create a group channel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100/40 dark:divide-gray-800/30">
      {conversations.map(conv => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeId}
          currentUser={currentUser}
          usersEntities={usersEntities}
          onClick={handleSelectConversation}
        />
      ))}
    </div>
  );
};
