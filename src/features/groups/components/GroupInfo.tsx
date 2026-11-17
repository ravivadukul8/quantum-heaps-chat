import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Calendar, Search, LogOut, X } from 'lucide-react';
import type { GroupConversation, User } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { GroupMember } from './GroupMember';
import { formatDate } from '../../../utils/dateUtils';
import { cn } from '../../../utils/classNames';

export interface GroupInfoProps {
  group: GroupConversation;
  currentUserId: string;
  usersEntities: Record<string, User>;
  onAddMemberClick?: () => void;
  onRemoveMember?: (userId: string) => void;
  onLeaveGroup?: () => void;
  className?: string;
}

export const GroupInfo: React.FC<GroupInfoProps> = ({
  group,
  currentUserId,
  usersEntities,
  onAddMemberClick,
  onRemoveMember,
  onLeaveGroup,
  className,
}) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isCurrentUserAdmin = group.adminIds.includes(currentUserId);

  // Filter members list based on member search input
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return group.members;

    return group.members.filter(m => {
      const user = usersEntities[m.userId];
      const name = m.userId === currentUserId ? 'You' : user?.name ?? '';
      const email = user?.email ?? '';
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [group.members, memberSearch, usersEntities, currentUserId]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Group Profile Overview */}
      <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/80 dark:bg-[#202c33]/40 border border-gray-100 dark:border-gray-800/80 shadow-xs">
        <Avatar
          name={group.name}
          src={group.avatarUrl}
          size="xl"
        />
        <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          {group.name}
        </h3>
        <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
          Group • {group.members.length} members
        </span>

        {group.description && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed text-center px-2">
            {group.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Created {formatDate(group.createdAt)}</span>
        </div>
      </div>

      {/* 2. Group Members Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Members ({group.members.length})
            </h4>
          </div>

          {onAddMemberClick && (
            <button
              type="button"
              onClick={onAddMemberClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Member Search Filter */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            placeholder="Filter members..."
            aria-label="Filter members"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111b21] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          {memberSearch && (
            <button
              type="button"
              onClick={() => setMemberSearch('')}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Members List */}
        <div
          role="list"
          aria-label="Group members list"
          className="space-y-0.5 divide-y divide-gray-100 dark:divide-gray-800/60 max-h-80 overflow-y-auto pr-0.5"
        >
          {filteredMembers.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
              No members match &ldquo;{memberSearch}&rdquo;
            </div>
          ) : (
            filteredMembers.map(member => {
              const user = usersEntities[member.userId];
              const isMe = member.userId === currentUserId;
              const isAdmin = member.role === 'admin' || group.adminIds.includes(member.userId);
              const canRemove = isCurrentUserAdmin && !isMe;

              return (
                <GroupMember
                  key={member.userId}
                  member={member}
                  user={user}
                  isCurrentUser={isMe}
                  isAdmin={isAdmin}
                  canRemove={canRemove}
                  onRemove={onRemoveMember}
                />
              );
            })
          )}
        </div>
      </div>

      {/* 3. Leave Group / Danger Zone */}
      {onLeaveGroup && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          {!showLeaveConfirm ? (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-rose-200/60 dark:border-rose-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 animate-in zoom-in-95 duration-150">
              <p className="font-bold">Are you sure you want to leave this group?</p>
              <p className="text-[11px] mt-1 text-rose-700 dark:text-rose-300 leading-relaxed">
                You will no longer receive new messages or participate in this group channel.
              </p>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveConfirm(false);
                    onLeaveGroup();
                  }}
                  className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                >
                  Leave Group
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupInfo;
