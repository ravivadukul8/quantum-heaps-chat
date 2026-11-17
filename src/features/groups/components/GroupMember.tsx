import React from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import type { GroupMember as GroupMemberType, User } from '../../../types';
import { Avatar } from '../../../components/common/Avatar';
import { cn } from '../../../utils/classNames';

export interface GroupMemberProps {
  member: GroupMemberType;
  user?: User;
  isCurrentUser: boolean;
  isAdmin: boolean;
  canRemove: boolean;
  onRemove?: (userId: string) => void;
  className?: string;
}

export const GroupMember: React.FC<GroupMemberProps> = ({
  member,
  user,
  isCurrentUser,
  isAdmin,
  canRemove,
  onRemove,
  className,
}) => {
  const displayName = isCurrentUser
    ? `${user?.name || 'You'} (You)`
    : user?.name || 'Unknown User';

  const userStatus = user?.status ?? 'offline';
  const subtitle = user?.customBio || user?.email || (userStatus === 'online' ? 'Online' : 'Offline');

  return (
    <div
      role="listitem"
      className={cn(
        'flex items-center justify-between py-2.5 px-2 hover:bg-gray-50/80 dark:hover:bg-[#202c33]/50 rounded-xl transition-colors group select-none',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          name={user?.name || 'User'}
          src={user?.avatarUrl}
          size="sm"
          status={userStatus}
          showStatus={true}
        />
        <div className="min-w-0 truncate">
          <div className="text-xs font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
            <span className="truncate">{displayName}</span>
            {isAdmin && (
              <span
                title="Group Administrator"
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 shrink-0"
              >
                <ShieldCheck className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {subtitle}
          </div>
        </div>
      </div>

      {/* Remove Button for eligible members */}
      {canRemove && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(member.userId)}
          title={`Remove ${user?.name || 'member'} from group`}
          aria-label={`Remove ${user?.name || 'member'}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0 ml-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default GroupMember;
