import type { Conversation, ThemeMode } from '../types';

const STORAGE_KEYS = {
  THEME: 'qh_chat_theme',
  CONVERSATIONS: 'qh_chat_conversations',
  ACTIVE_CONVERSATION_ID: 'qh_chat_active_conv',
} as const;

export const storageService = {
  getTheme(): ThemeMode | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return null;
    } catch {
      return null;
    }
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  },

  getSavedConversations(): Conversation[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch {
      // Ignore storage errors
    }
  },

  getActiveConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
    } catch {
      return null;
    }
  },

  setActiveConversationId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
      }
    } catch {
      // Ignore storage errors
    }
  },
};
