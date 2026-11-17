import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Users, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsCreateGroupModalOpen,
  closeCreateGroupModal,
} from '../groupsSlice';
import { createGroup } from '../../conversations/conversationsSlice';
import {
  selectAllUsers,
  selectCurrentUser,
} from '../../auth/usersSlice';
import { Avatar } from '../../../components/common/Avatar';
import { cn } from '../../../utils/classNames';

interface CreateGroupFormValues {
  name: string;
  description: string;
}

export const CreateGroupModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsCreateGroupModalOpen);
  const currentUser = useAppSelector(selectCurrentUser);
  const allUsers = useAppSelector(selectAllUsers);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  if (!isOpen || !currentUser) return null;

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const onSubmit = (data: CreateGroupFormValues) => {
    const memberIds = Array.from(new Set([currentUser.id, ...selectedUserIds]));

    dispatch(
      createGroup({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        memberIds,
        creatorId: currentUser.id,
      })
    );

    dispatch(closeCreateGroupModal());
    reset();
    setSelectedUserIds([]);
  };

  const handleClose = () => {
    dispatch(closeCreateGroupModal());
    reset();
    setSelectedUserIds([]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden text-gray-900 dark:text-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">New Group Channel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Collaborate with multiple team members
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label htmlFor="group-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Group Name *
            </label>
            <input
              id="group-name"
              type="text"
              {...register('name', { required: 'Group name is required' })}
              placeholder="e.g. #mobile-launch-team"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#111b21] rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Group Description */}
          <div>
            <label htmlFor="group-description" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <input
              id="group-description"
              type="text"
              {...register('description')}
              placeholder="What is this channel about?"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#111b21] rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Add Members Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Add Members
              </span>
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                {selectedUserIds.length} selected
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-[#111b21]/50 p-1">
              {otherUsers.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserSelection(user.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={user.name}
                        src={user.avatarUrl}
                        size="sm"
                        status={user.status}
                        showStatus
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {user.customBio || user.email}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ml-2',
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
