import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode, MobilePane } from '../../types';
import { storageService } from '../../services/storageService';

export interface UIState {
  theme: ThemeMode;
  mobilePane: MobilePane;
  isSearchInChatOpen: boolean;
  searchInChatQuery: string;
  isKeyboardShortcutsModalOpen: boolean;
  isUserProfileModalOpen: boolean;
  soundEnabled: boolean;
}

// Hydrate initial theme from storage or system preference
const savedTheme = storageService.getTheme();
const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme: ThemeMode = savedTheme ?? (prefersDark ? 'dark' : 'light');

// Apply theme class to document body/root element if DOM is present
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const initialState: UIState = {
  theme: initialTheme,
  mobilePane: 'sidebar',
  isSearchInChatOpen: false,
  searchInChatQuery: '',
  isKeyboardShortcutsModalOpen: false,
  isUserProfileModalOpen: false,
  soundEnabled: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      storageService.setTheme(action.payload);
      if (typeof document !== 'undefined') {
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleTheme: state => {
      const nextTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      storageService.setTheme(nextTheme);
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setMobilePane: (state, action: PayloadAction<MobilePane>) => {
      state.mobilePane = action.payload;
    },
    toggleSearchInChat: (state, action: PayloadAction<boolean | undefined>) => {
      state.isSearchInChatOpen =
        action.payload !== undefined ? action.payload : !state.isSearchInChatOpen;
      if (!state.isSearchInChatOpen) {
        state.searchInChatQuery = '';
      }
    },
    setSearchInChatQuery: (state, action: PayloadAction<string>) => {
      state.searchInChatQuery = action.payload;
    },
    toggleKeyboardShortcutsModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isKeyboardShortcutsModalOpen =
        action.payload !== undefined ? action.payload : !state.isKeyboardShortcutsModalOpen;
    },
    toggleUserProfileModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isUserProfileModalOpen =
        action.payload !== undefined ? action.payload : !state.isUserProfileModalOpen;
    },
    toggleSound: state => {
      state.soundEnabled = !state.soundEnabled;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setMobilePane,
  toggleSearchInChat,
  setSearchInChatQuery,
  toggleKeyboardShortcutsModal,
  toggleUserProfileModal,
  toggleSound,
} = uiSlice.actions;

interface HasUIState {
  ui: UIState;
}

export const selectTheme = (state: HasUIState): ThemeMode => state.ui.theme;
export const selectMobilePane = (state: HasUIState): MobilePane => state.ui.mobilePane;
export const selectIsSearchInChatOpen = (state: HasUIState): boolean => state.ui.isSearchInChatOpen;
export const selectSearchInChatQuery = (state: HasUIState): string => state.ui.searchInChatQuery;
export const selectIsKeyboardShortcutsModalOpen = (state: HasUIState): boolean =>
  state.ui.isKeyboardShortcutsModalOpen;
export const selectIsUserProfileModalOpen = (state: HasUIState): boolean =>
  state.ui.isUserProfileModalOpen;
export const selectSoundEnabled = (state: HasUIState): boolean => state.ui.soundEnabled;

export default uiSlice.reducer;
