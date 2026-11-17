import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectMobilePane } from '../../features/settings/uiSlice';
import { selectActiveConversation } from '../../features/conversations/conversationsSelectors';
import { ConversationSidebar } from '../../features/conversations/components/ConversationSidebar';
import { ChatHeader } from '../../features/messages/components/ChatHeader';
import { CreateGroupModal } from '../../features/groups/components/CreateGroupModal';
import { UserProfileModal } from '../../features/auth/components/UserProfileModal';
import { MessageSquare, Shield, Sparkles } from 'lucide-react';
import { cn } from '../../utils/classNames';

export const AppLayout: React.FC = () => {
  const mobilePane = useAppSelector(selectMobilePane);
  const activeConversation = useAppSelector(selectActiveConversation);

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
              {/* Specialized Chat Header */}
              <ChatHeader />

              {/* Chat Body Workspace Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/60 dark:bg-[#0b141a] overflow-y-auto">
                <div className="max-w-md p-8 rounded-3xl bg-white/80 dark:bg-[#111b21]/90 backdrop-blur border border-gray-100 dark:border-gray-800/80 shadow-xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Chat Window Ready
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    Chat window header is active with real-time profile picture, online/offline status, member counts, message search, and group information actions.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Next: Message Feed, Reactions, Replies & Input Bar</span>
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
