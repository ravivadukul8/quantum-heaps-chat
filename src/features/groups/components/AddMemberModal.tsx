import React, { useState, useMemo } from 'react';
import { X, UserPlus, Search, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsAddMemberModalOpen,
  closeAddMemberModal,
} from '../groupsSlice';
import {
  selectActiveConversation,
  addGroupMember,
} from '../../conversations/conversationsSlice';
import { selectAllUsers } from '../../auth/usersSlice';
import { isGroupConversation, type GroupMember } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { cn } from '../../../utils/classNames';

export const AddMemberModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsAddMemberModalOpen);
  const activeConversation = useAppSelector(selectActiveConversation);
  const allUsers = useAppSelector(selectAllUsers);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Resolve target group (either from selectedGroupId or current active conversation)
  const targetGroup = useMemo(() => {
    if (activeConversation && isGroupConversation(activeConversation)) {
      return activeConversation;
    }
    return null;
  }, [activeConversation]);

  // Existing member IDs in target group
  const existingMemberIds = useMemo(() => {
    if (!targetGroup) return new Set<string>();
    return new Set(targetGroup.members.map(m => m.userId));
  }, [targetGroup]);

  // Eligible users who are not yet in the group
  const eligibleUsers = useMemo(() => {
    return allUsers.filter(u => !existingMemberIds.has(u.id));
  }, [allUsers, existingMemberIds]);

  // Filtered by search query
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return eligibleUsers;
    return eligibleUsers.filter(
      u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [eligibleUsers, searchQuery]);

  if (!isOpen || !targetGroup) return null;

  const handleClose = () => {
    dispatch(closeAddMemberModal());
    setSearchQuery('');
    setSelectedUserIds([]);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (selectedUserIds.length === 0) return;

    const now = new Date().toISOString();
    selectedUserIds.forEach(userId => {
      const newMember: GroupMember = {
        userId,
        role: 'member',
        joinedAt: now,
      };
      dispatch(
        addGroupMember({
          groupId: targetGroup.id,
          member: newMember,
        })
      );
    });

    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 id="add-member-title" className="text-base font-bold">
              Add Members to {targetGroup.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close add members modal"
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Search Contacts Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name or email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111b21] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-6">
                {eligibleUsers.length === 0
                  ? 'All available contacts are already members of this group.'
                  : 'No contacts match your search query.'}
              </p>
            ) : (
              filteredUsers.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleSelectUser(user.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors',
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={user.name}
                        src={user.avatarUrl}
                        size="sm"
                        status={user.status}
                        showStatus={true}
                      />
                      <div className="truncate">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0',
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedUserIds.length} contact{selectedUserIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMembers}
                disabled={selectedUserIds.length === 0}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-xs"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
