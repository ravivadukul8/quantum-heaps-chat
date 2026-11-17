import React from 'react';
import {
  ArrowLeft,
  Search,
  Info,
  Phone,
  Video,
  Users as UsersIcon,
  Pin,
  MoreVertical,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectActiveConversation,
  togglePinConversation,
} from '../../conversations/conversationsSlice';
import {
  selectCurrentUser,
  selectUsersEntities,
} from '../../auth/usersSlice';
import {
  selectActiveConversationTypingUsers,
} from '../messagesSelectors';
import {
  setMobilePane,
  toggleSearchInChat,
  selectIsSearchInChatOpen,
} from '../../settings/uiSlice';
import {
  toggleGroupInfoDrawer,
  selectIsGroupInfoDrawerOpen,
} from '../../groups/groupsSlice';
import { isGroupConversation } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { IconButton } from '../../../components/common/IconButton';
import { formatTypingText } from '../../../utils/typingUtils';
import { formatLastSeen } from '../../../utils/dateUtils';
import { cn } from '../../../utils/classNames';

export interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const usersEntities = useAppSelector(selectUsersEntities);
  const typingUsers = useAppSelector(selectActiveConversationTypingUsers);
  const isSearchOpen = useAppSelector(selectIsSearchInChatOpen);
  const isGroupInfoOpen = useAppSelector(selectIsGroupInfoDrawerOpen);

  if (!activeConversation || !currentUser) {
    return null;
  }

  const isGroup = isGroupConversation(activeConversation);

  // 1. Compute Title, Avatar, Status & Subtitle
  let title = '';
  let avatarUrl: string | undefined = undefined;
  let status: 'online' | 'offline' | 'away' | undefined = undefined;
  let statusSubtext = '';

  // Check if anyone else is actively typing in this chat
  const otherTypingUsers = typingUsers.filter(u => u.userId !== currentUser.id);
  const isTyping = otherTypingUsers.length > 0;
  const typingText = formatTypingText(otherTypingUsers);

  if (isGroup) {
    title = activeConversation.name;
    avatarUrl = activeConversation.avatarUrl;

    if (isTyping) {
      statusSubtext = typingText;
    } else {
      // Member names summary (e.g. "5 members: Sarah, Alex, Elena...")
      const memberNames = activeConversation.members
        .map(m => (m.userId === currentUser.id ? 'You' : usersEntities[m.userId]?.name?.split(' ')[0]))
        .filter(Boolean)
        .slice(0, 4)
        .join(', ');

      statusSubtext = `${activeConversation.members.length} members: ${memberNames}${
        activeConversation.members.length > 4 ? '...' : ''
      }`;
    }
  } else {
    // Direct Conversation
    const otherUserId =
      activeConversation.participantIds.find(id => id !== currentUser.id) ??
      activeConversation.participantIds[0];
    const otherUser = otherUserId ? usersEntities[otherUserId] : undefined;

    title = otherUser?.name ?? 'Unknown Contact';
    avatarUrl = otherUser?.avatarUrl;
    status = otherUser?.status;

    if (isTyping) {
      statusSubtext = 'typing...';
    } else if (status === 'online') {
      statusSubtext = 'Online';
    } else if (status === 'away') {
      statusSubtext = 'Away';
    } else {
      statusSubtext = formatLastSeen(otherUser?.lastSeen);
    }
  }

  const handleOpenInfo = () => {
    dispatch(toggleGroupInfoDrawer(true));
  };

  return (
    <header
      className={cn(
        'relative flex items-center justify-between px-3 md:px-4 py-2.5 bg-white dark:bg-[#202c33] border-b border-gray-200/80 dark:border-gray-800 shadow-sm shrink-0 z-20 select-none transition-colors',
        className
      )}
    >
      {/* Left: Mobile Back Button & Profile / Group Information */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile Viewport Back Button */}
        <button
          type="button"
          onClick={() => dispatch(setMobilePane('sidebar'))}
          aria-label="Back to conversations list"
          className="md:hidden p-1.5 -ml-1 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile / Group Header Clickable Action */}
        <button
          type="button"
          onClick={handleOpenInfo}
          className="flex items-center gap-3 min-w-0 text-left p-1 -m-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
          title={isGroup ? 'View group information & members' : 'View contact details'}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            {isGroup && !avatarUrl ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-inner">
                <UsersIcon className="w-5 h-5" />
              </div>
            ) : (
              <Avatar
                name={title}
                src={avatarUrl}
                size="md"
                status={status}
                showStatus={!isGroup}
              />
            )}
          </div>

          {/* Title & Status Subtext */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {title}
              </h1>

              {activeConversation.isPinned && (
                <span title="Pinned conversation" className="inline-flex shrink-0">
                  <Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 fill-teal-600 dark:fill-teal-400" />
                </span>
              )}
            </div>

            <p
              className={cn(
                'text-[11px] md:text-xs truncate transition-colors leading-tight',
                isTyping
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse'
                  : status === 'online'
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : status === 'away'
                  ? 'text-amber-500 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {statusSubtext}
            </p>
          </div>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        {/* Voice Call Mock Action */}
        <IconButton
          icon={<Phone className="w-4 h-4" />}
          label="Voice call"
          className="hidden sm:inline-flex"
          onClick={() => alert(`Starting voice call with ${title}...`)}
        />

        {/* Video Call Mock Action */}
        <IconButton
          icon={<Video className="w-4 h-4" />}
          label="Video call"
          className="hidden sm:inline-flex"
          onClick={() => alert(`Starting video call with ${title}...`)}
        />

        {/* Search In Chat */}
        <IconButton
          icon={<Search className="w-4 h-4" />}
          label="Search messages in this chat"
          active={isSearchOpen}
          onClick={() => dispatch(toggleSearchInChat())}
        />

        {/* Group / Contact Information */}
        <IconButton
          icon={<Info className="w-4 h-4" />}
          label={isGroup ? 'Group information' : 'Contact info'}
          active={isGroupInfoOpen}
          onClick={handleOpenInfo}
        />

        {/* Pin Conversation Quick Toggle */}
        <IconButton
          icon={<Pin className={cn('w-4 h-4', activeConversation.isPinned && 'fill-current text-teal-600')} />}
          label={activeConversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
          active={activeConversation.isPinned}
          onClick={() => dispatch(togglePinConversation(activeConversation.id))}
          className="hidden lg:inline-flex"
        />

        {/* More Options */}
        <IconButton
          icon={<MoreVertical className="w-4 h-4" />}
          label="More options"
          onClick={handleOpenInfo}
        />
      </div>
    </header>
  );
};

export default ChatHeader;
