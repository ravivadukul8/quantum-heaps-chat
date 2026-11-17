import React from 'react';
import { useForm } from 'react-hook-form';
import { X, UserCircle2, Mail, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCurrentUser,
  updateCurrentUserProfile,
  setCurrentUserStatus,
} from '../usersSlice';
import {
  selectIsUserProfileModalOpen,
  toggleUserProfileModal,
} from '../../settings/uiSlice';
import { Avatar } from '../../../components/common/Avatar';
import type { UserStatus } from '../../../types';
import { cn } from '../../../utils/classNames';

interface ProfileFormValues {
  name: string;
  customBio: string;
}

export const UserProfileModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsUserProfileModalOpen);
  const currentUser = useAppSelector(selectCurrentUser);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProfileFormValues>({
    values: {
      name: currentUser?.name ?? '',
      customBio: currentUser?.customBio ?? '',
    },
  });

  if (!isOpen || !currentUser) return null;

  const handleClose = () => {
    dispatch(toggleUserProfileModal(false));
  };

  const onSubmit = (data: ProfileFormValues) => {
    dispatch(
      updateCurrentUserProfile({
        name: data.name.trim(),
        customBio: data.customBio.trim(),
      })
    );
    handleClose();
  };

  const handleStatusSelect = (status: UserStatus) => {
    dispatch(setCurrentUserStatus(status));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold">Profile & Preferences</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details & Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Avatar & Status Section */}
          <div className="flex flex-col items-center text-center">
            <Avatar
              name={currentUser.name}
              src={currentUser.avatarUrl}
              size="xl"
              status={currentUser.status}
              showStatus
            />
            <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-gray-100">
              {currentUser.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {currentUser.email}
            </p>

            {/* Status Pills */}
            <div className="flex items-center gap-2 mt-3 p-1 rounded-xl bg-gray-100 dark:bg-[#111b21] border border-gray-200/50 dark:border-gray-800">
              {(['online', 'away', 'offline'] as UserStatus[]).map(status => {
                const isActive = currentUser.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusSelect(status)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all select-none',
                      isActive
                        ? 'bg-white dark:bg-[#202c33] shadow-sm text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit Display Name */}
          <div>
            <label htmlFor="display-name" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              {...register('name', { required: true })}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#111b21] rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Edit Bio */}
          <div>
            <label htmlFor="user-bio" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Custom Status & Bio
            </label>
            <textarea
              id="user-bio"
              rows={2}
              {...register('customBio')}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#111b21] rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          {/* Account Metadata Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Senior Frontend Engineer (Quantum Core)</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!isDirty}
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
