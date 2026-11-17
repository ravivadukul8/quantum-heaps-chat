import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  Calendar,
  LogOut,
  Search,
  Trash2,
  Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsGroupInfoDrawerOpen,
  toggleGroupInfoDrawer,
  openAddMemberModal,
} from '../groupsSlice';
import {
  selectActiveConversation,
  removeGroupMember,
  setActiveConversation,
} from '../../conversations/conversationsSlice';
import {
  selectCurrentUser,
  selectUsersEntities,
} from '../../auth/usersSlice';
import { isGroupConversation } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { formatDate } from '../../../utils/dateUtils';

export const GroupInfoDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsGroupInfoDrawerOpen);
  const activeConversation = useAppSelector(selectActiveConversation);
  const currentUser = useAppSelector(selectCurrentUser);
  const usersEntities = useAppSelector(selectUsersEntities);

  const [memberSearch, setMemberSearch] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!isOpen || !activeConversation || !isGroupConversation(activeConversation) || !currentUser) {
    return null;
  }

  const isCurrentUserAdmin = activeConversation.adminIds.includes(currentUser.id);

  const handleClose = () => {
    dispatch(toggleGroupInfoDrawer(false));
    setShowLeaveConfirm(false);
  };

  const handleRemoveMember = (userId: string) => {
    dispatch(
      removeGroupMember({
        groupId: activeConversation.id,
        userId,
      })
    );
  };

  const handleLeaveGroup = () => {
    dispatch(
      removeGroupMember({
        groupId: activeConversation.id,
        userId: currentUser.id,
      })
    );
    dispatch(setActiveConversation(null));
    handleClose();
  };

  const filteredMembers = activeConversation.members.filter(m => {
    const user = usersEntities[m.userId];
    const name = m.userId === currentUser.id ? 'You' : user?.name ?? '';
    const email = user?.email ?? '';
    const q = memberSearch.toLowerCase().trim();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <aside
      aria-label="Group Information"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#202c33]/50">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Group Details</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close group details"
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Group Profile Overview */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/80 dark:bg-[#202c33]/40 border border-gray-100 dark:border-gray-800/80">
          <Avatar
            name={activeConversation.name}
            src={activeConversation.avatarUrl}
            size="xl"
          />
          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
            {activeConversation.name}
          </h3>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">
            Group • {activeConversation.members.length} members
          </span>

          {activeConversation.description && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed text-center px-2">
              {activeConversation.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formatDate(activeConversation.createdAt)}</span>
          </div>
        </div>

        {/* Member Management Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Members ({activeConversation.members.length})
              </h4>
            </div>

            <button
              type="button"
              onClick={() => dispatch(openAddMemberModal(activeConversation.id))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {/* Member Search */}
          {activeConversation.members.length > 4 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Filter members..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111b21] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Member Cards */}
          <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/60">
            {filteredMembers.map(member => {
              const user = usersEntities[member.userId];
              const isMe = member.userId === currentUser.id;
              const isAdmin = member.role === 'admin' || activeConversation.adminIds.includes(member.userId);
              const displayName = isMe ? `${user?.name || 'You'} (You)` : user?.name || 'Unknown User';

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-2 px-1 hover:bg-gray-50/60 dark:hover:bg-[#202c33]/40 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={user?.name || 'User'}
                      src={user?.avatarUrl}
                      size="sm"
                      status={user?.status}
                      showStatus={true}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{displayName}</span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {user?.customBio || user?.email}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button (For admins removing other members) */}
                  {isCurrentUserAdmin && !isMe && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      title={`Remove ${user?.name || 'member'} from group`}
                      aria-label={`Remove ${user?.name || 'member'}`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Exit / Danger Zone */}
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
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
              <p className="font-semibold">Are you sure you want to leave this group?</p>
              <p className="text-[11px] mt-1 text-rose-700 dark:text-rose-300">
                You will no longer receive new messages from this channel.
              </p>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  Leave Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default GroupInfoDrawer;
