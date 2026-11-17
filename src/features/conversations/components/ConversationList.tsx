import React, { useCallback } from 'react';
import { MessageSquareDashed, CheckCircle, SearchX, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setActiveConversation,
  setSearchQuery,
  setFilter,
  fetchConversationsThunk,
} from '../conversationsSlice';
import {
  selectFilteredConversations,
  selectActiveConversationId,
  selectConversationFilter,
  selectConversationSearchQuery,
  selectConversationsLoading,
  selectConversationsError,
} from '../conversationsSelectors';
import {
  selectCurrentUser,
  selectUsersEntities,
} from '../../auth/usersSlice';
import { openCreateGroupModal } from '../../groups/groupsSlice';
import { setMobilePane } from '../../settings/uiSlice';
import { ConversationItem } from './ConversationItem';
import { ConversationSkeleton } from '../../../components/common/ConversationSkeleton';
import { ErrorState } from '../../../components/common/ErrorState';

export const ConversationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectFilteredConversations);
  const activeId = useAppSelector(selectActiveConversationId);
  const activeFilter = useAppSelector(selectConversationFilter);
  const searchQuery = useAppSelector(selectConversationSearchQuery);
  const isLoading = useAppSelector(selectConversationsLoading);
  const error = useAppSelector(selectConversationsError);
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

  // 1. Loading state with animated skeletons
  if (isLoading) {
    return <ConversationSkeleton count={6} className="p-1" />;
  }

  // 2. Error state with retry action
  if (error) {
    return (
      <ErrorState
        title="Could not load conversations"
        message={error}
        onRetry={() => dispatch(fetchConversationsThunk())}
      />
    );
  }

  // 3. Contextual empty state rendering
  if (conversations.length === 0) {
    // 3a. Search Query with no matches
    if (searchQuery) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
            <SearchX className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            No matches found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
            {activeFilter === 'unread'
              ? `No unread conversations matching "${searchQuery}"`
              : activeFilter === 'groups'
              ? `No group channels matching "${searchQuery}"`
              : `No conversations matching "${searchQuery}"`}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => dispatch(setSearchQuery(''))}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Clear Search
            </button>
            {activeFilter !== 'all' && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <button
                  type="button"
                  onClick={() => dispatch(setFilter('all'))}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Search in All
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    // 3b. Unread filter active but all messages are read
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
            You have no unread conversations.
          </p>
          <button
            type="button"
            onClick={() => dispatch(setFilter('all'))}
            className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Show All Conversations
          </button>
        </div>
      );
    }

    // 3c. Groups filter active but no groups exist
    if (activeFilter === 'groups') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-3 text-teal-600 dark:text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            No group channels
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You are not a member of any group channels yet.
          </p>
          <button
            type="button"
            onClick={() => dispatch(openCreateGroupModal())}
            className="mt-3 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            Create Group
          </button>
        </div>
      );
    }

    // 3d. Default empty state
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
    <div
      id="conversation-feed"
      role="tabpanel"
      aria-label="Conversation list"
      className="flex-1 overflow-y-auto divide-y divide-gray-100/40 dark:divide-gray-800/30"
    >
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

export default ConversationList;
