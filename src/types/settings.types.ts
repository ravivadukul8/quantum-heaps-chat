/**
 * Visual theme mode.
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Mobile navigation pane state.
 */
export type MobilePane = 'sidebar' | 'chat' | 'info';

/**
 * User application preferences.
 */
export interface AppSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  enterToSend: boolean;
  compactView: boolean;
}
