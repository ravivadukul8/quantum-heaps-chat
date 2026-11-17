import React, { memo } from 'react';
import { Pin, VolumeX, Users as UsersIcon } from 'lucide-react';
import type { Conversation, User } from '../../../types';
import { isGroupConversation } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { MessageStatusIcon } from '../../../components/common/MessageStatusIcon';
import { formatConversationTimestamp } from '../../../utils/dateUtils';
import { cn } from '../../../utils/classNames';

export interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUser: User;
  usersEntities: Record<string, User>;
  onClick: (conversationId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, isActive, currentUser, usersEntities, onClick }) => {
    const isGroup = isGroupConversation(conversation);

    // Compute display data for direct vs group
    let title = '';
    let avatarUrl: string | undefined = undefined;
    let partnerStatus: User['status'] | undefined = undefined;
    let memberCount: number | undefined = undefined;

    if (isGroup) {
      title = conversation.name;
      avatarUrl = conversation.avatarUrl;
      memberCount = conversation.members.length;
    } else {
      const otherUserId =
        conversation.participantIds.find(id => id !== currentUser.id) ??
        conversation.participantIds[0];
      const otherUser = otherUserId ? usersEntities[otherUserId] : undefined;

      title = otherUser?.name ?? 'Unknown Contact';
      avatarUrl = otherUser?.avatarUrl;
      partnerStatus = otherUser?.status;
    }

    const lastMsg = conversation.lastMessage;
    const hasDraft = Boolean(conversation.draft?.trim());
    const isLastMsgFromMe = lastMsg?.senderId === currentUser.id;

    // Sender prefix for groups (e.g. "Sarah: ")
    let senderPrefix = '';
    if (isGroup && lastMsg && !isLastMsgFromMe) {
      const sender = usersEntities[lastMsg.senderId];
      if (sender) {
        senderPrefix = `${sender.name.split(' ')[0]}: `;
      }
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick(conversation.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(conversation.id);
          }
        }}
        className={cn(
          'group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition-colors duration-150 border-b border-gray-100/60 dark:border-gray-800/40',
          isActive
            ? 'bg-teal-50/80 dark:bg-[#202c33] text-gray-900 dark:text-gray-100'
            : 'hover:bg-gray-50/90 dark:hover:bg-[#182229] text-gray-700 dark:text-gray-300'
        )}
      >
        {/* Active Left Indicator Bar */}
        {isActive && (
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r" />
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          {isGroup && !avatarUrl ? (
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-inner">
              <UsersIcon className="w-5 h-5" />
            </div>
          ) : (
            <Avatar
              name={title}
              src={avatarUrl}
              size="lg"
              status={partnerStatus}
              showStatus={!isGroup}
            />
          )}
        </div>

        {/* Middle Content: Name & Message Preview */}
        <div className="flex-1 min-w-0">
          {/* Top Line: Title & Timestamp */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2
                className={cn(
                  'text-sm truncate font-medium',
                  conversation.unreadCount > 0
                    ? 'font-bold text-gray-900 dark:text-white'
                    : 'text-gray-800 dark:text-gray-200'
                )}
              >
                {title}
              </h2>

              {isGroup && memberCount && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 shrink-0">
                  ({memberCount})
                </span>
              )}
            </div>

            <span
              className={cn(
                'text-[11px] shrink-0 whitespace-nowrap',
                conversation.unreadCount > 0
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {formatConversationTimestamp(conversation.updatedAt)}
            </span>
          </div>

          {/* Bottom Line: Message Preview & Badges */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 min-w-0 text-gray-500 dark:text-gray-400 truncate">
              {hasDraft ? (
                <span className="truncate">
                  <span className="text-red-500 dark:text-red-400 font-medium">Draft: </span>
                  {conversation.draft}
                </span>
              ) : lastMsg ? (
                <>
                  {isLastMsgFromMe && (
                    <MessageStatusIcon status={lastMsg.status} className="shrink-0 mr-0.5" />
                  )}
                  {senderPrefix && (
                    <span className="text-gray-700 dark:text-gray-300 font-medium shrink-0">
                      {senderPrefix}
                    </span>
                  )}
                  <span
                    className={cn(
                      'truncate',
                      lastMsg.isDeleted && 'italic text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {lastMsg.content}
                  </span>
                </>
              ) : (
                <span className="italic text-gray-400 dark:text-gray-500">No messages yet</span>
              )}
            </div>

            {/* Right Icons: Pinned, Muted, Unread Count */}
            <div className="flex items-center gap-1 shrink-0">
              {conversation.isMuted && (
                <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              )}
              {conversation.isPinned && (
                <Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500 fill-teal-600 dark:fill-teal-500" />
              )}
              {conversation.unreadCount > 0 && (
                <Badge variant="unread" size="sm">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';
