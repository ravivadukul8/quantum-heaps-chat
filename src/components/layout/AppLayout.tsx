import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectMobilePane,
  setMobilePane,
} from '../../features/settings/uiSlice';
import {
  selectActiveConversation,
} from '../../features/conversations/conversationsSelectors';
import {
  selectUsersEntities,
  selectCurrentUser,
} from '../../features/auth/usersSlice';
import { isGroupConversation } from '../../types';
import { ConversationSidebar } from '../../features/conversations/components/ConversationSidebar';
import { CreateGroupModal } from '../../features/groups/components/CreateGroupModal';
import { UserProfileModal } from '../../features/auth/components/UserProfileModal';
import { Avatar } from '../common/Avatar';
import { ArrowLeft, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { cn } from '../../utils/classNames';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const mobilePane = useAppSelector(selectMobilePane);
  const activeConversation = useAppSelector(selectActiveConversation);
  const usersEntities = useAppSelector(selectUsersEntities);
  const currentUser = useAppSelector(selectCurrentUser);

  // Compute active conversation details
  let activeTitle = 'Select a conversation';
  let activeAvatar: string | undefined = undefined;
  let activeStatus: 'online' | 'offline' | 'away' | undefined = undefined;
  let activeSubtext = 'Quantum Heaps Chat';

  if (activeConversation && currentUser) {
    if (isGroupConversation(activeConversation)) {
      activeTitle = activeConversation.name;
      activeAvatar = activeConversation.avatarUrl;
      activeSubtext = `${activeConversation.members.length} members • ${activeConversation.description || 'Group Channel'}`;
    } else {
      const otherUserId =
        activeConversation.participantIds.find(id => id !== currentUser.id) ??
        activeConversation.participantIds[0];
      const otherUser = otherUserId ? usersEntities[otherUserId] : undefined;

      if (otherUser) {
        activeTitle = otherUser.name;
        activeAvatar = otherUser.avatarUrl;
        activeStatus = otherUser.status;
        activeSubtext =
          otherUser.status === 'online'
            ? 'Online'
            : otherUser.lastSeen
            ? `Last seen recently`
            : otherUser.status;
      }
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-[#0c1317] antialiased">
      {/* Outer Shell Container (WhatsApp/Slack Desktop Centered Frame or Fullscreen) */}
      <div className="flex h-full w-full max-w-[1720px] mx-auto bg-white dark:bg-[#111b21] shadow-2xl overflow-hidden">
        {/* Left Pane: Conversation Sidebar */}
        <div
          className={cn(
            'h-full w-full md:w-80 lg:w-[410px] shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col',
            mobilePane === 'sidebar' ? 'flex' : 'hidden md:flex'
          )}
        >
          <ConversationSidebar className="h-full w-full" />
        </div>

        {/* Right Pane: Active Chat Area (Preview placeholder / Message Feed) */}
        <main
          className={cn(
            'h-full flex-1 flex flex-col bg-[#efeae2]/40 dark:bg-[#0b141a] relative overflow-hidden',
            mobilePane === 'chat' ? 'flex' : 'hidden md:flex'
          )}
        >
          {activeConversation ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <header className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#202c33] border-b border-gray-200/80 dark:border-gray-800 shadow-sm shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(setMobilePane('sidebar'))}
                    className="md:hidden p-1.5 -ml-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition-colors"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Avatar
                    name={activeTitle}
                    src={activeAvatar}
                    size="md"
                    status={activeStatus}
                    showStatus={Boolean(activeStatus)}
                  />

                  <div className="truncate">
                    <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {activeTitle}
                    </h1>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {activeSubtext}
                    </p>
                  </div>
                </div>
              </header>

              {/* Chat Body Workspace Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/60 dark:bg-[#0b141a] overflow-y-auto">
                <div className="max-w-md p-8 rounded-3xl bg-white/80 dark:bg-[#111b21]/90 backdrop-blur border border-gray-100 dark:border-gray-800/80 shadow-xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                    {activeTitle}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    Sidebar integration complete! The sidebar displays current user profile, online/offline status, unread counters, last message previews, search, and category filter pills.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Next: Full Message Feed, Bubble Actions & Input Bar</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Quantum Heaps Chat <Sparkles className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                Select a conversation from the sidebar to start messaging with real-time simulated typing and delivery indicators.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateGroupModal />
      <UserProfileModal />
    </div>
  );
};
