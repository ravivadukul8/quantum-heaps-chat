import React, { useState, useRef, useEffect } from 'react';
import { Users, MoreVertical, Circle, Check, Keyboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCurrentUser,
  setCurrentUserStatus,
} from '../../auth/usersSlice';
import {
  toggleUserProfileModal,
  toggleKeyboardShortcutsModal,
} from '../../settings/uiSlice';
import { openCreateGroupModal } from '../../groups/groupsSlice';
import { Avatar } from '../../../components/common/Avatar';
import { IconButton } from '../../../components/common/IconButton';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import type { UserStatus } from '../../../types';
import { cn } from '../../../utils/classNames';

export const SidebarHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    if (isStatusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusMenuOpen]);

  const handleStatusChange = (status: UserStatus) => {
    dispatch(setCurrentUserStatus(status));
    setIsStatusMenuOpen(false);
  };

  if (!currentUser) return null;

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800/80 transition-colors">
      {/* Current User Info */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsStatusMenuOpen(prev => !prev)}
          aria-haspopup="menu"
          aria-expanded={isStatusMenuOpen}
          className="flex items-center gap-3 p-1 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left group"
          title="Change your online status"
        >
          <Avatar
            name={currentUser.name}
            src={currentUser.avatarUrl}
            size="md"
            status={currentUser.status}
            showStatus
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {currentUser.name}
            </span>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
              <span
                className={cn('w-1.5 h-1.5 rounded-full inline-block', {
                  'bg-emerald-500': currentUser.status === 'online',
                  'bg-amber-500': currentUser.status === 'away',
                  'bg-gray-400': currentUser.status === 'offline',
                })}
              />
              {currentUser.status}
            </span>
          </div>
        </button>

        {/* Status Dropdown Popover */}
        {isStatusMenuOpen && (
          <div
            role="menu"
            aria-label="Set online status"
            className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/60 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1.5 font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              Set Online Status
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleStatusChange('online')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                <span>Online</span>
              </div>
              {currentUser.status === 'online' && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleStatusChange('away')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Circle className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>Away</span>
              </div>
              {currentUser.status === 'away' && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleStatusChange('offline')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Circle className="w-2.5 h-2.5 fill-gray-400 text-gray-400" />
                <span>Offline / Invisible</span>
              </div>
              {currentUser.status === 'offline' && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
            </button>
          </div>
        )}
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={<Users className="w-4 h-4" />}
          label="Create New Group Channel"
          onClick={() => dispatch(openCreateGroupModal())}
        />
        <ThemeToggle />
        <IconButton
          icon={<Keyboard className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
          label="Keyboard Shortcuts (?)"
          onClick={() => dispatch(toggleKeyboardShortcutsModal(true))}
        />
        <IconButton
          icon={<MoreVertical className="w-4 h-4" />}
          label="Profile & Preferences"
          onClick={() => dispatch(toggleUserProfileModal(true))}
        />
      </div>
    </header>
  );
};
