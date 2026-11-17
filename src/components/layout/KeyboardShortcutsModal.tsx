import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectIsKeyboardShortcutsModalOpen,
  toggleKeyboardShortcutsModal,
} from '../../features/settings/uiSlice';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation & Search',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Focus conversation search' },
      { keys: ['/'], description: 'Search messages in current chat' },
      { keys: ['Esc'], description: 'Close active modal, drawer, or cancel editing' },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { keys: ['Enter'], description: 'Send message' },
      { keys: ['Shift', 'Enter'], description: 'Add new line without sending' },
      { keys: ['Esc'], description: 'Cancel reply preview or message edit' },
    ],
  },
  {
    title: 'General',
    items: [
      { keys: ['?'], description: 'Open keyboard shortcuts cheat-sheet' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsKeyboardShortcutsModalOpen);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(toggleKeyboardShortcutsModal(false));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden text-gray-900 dark:text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 id="shortcuts-modal-title" className="text-base font-bold">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close keyboard shortcuts"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Categories Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_CATEGORIES.map(category => (
            <div key={category.title} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.items.map(item => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#182229]/60 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map(k => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-2xs min-w-[24px] text-center"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#182229]/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Command className="w-3.5 h-3.5" />
            <span>Power user tip: Press Esc anytime to close drawers</span>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
