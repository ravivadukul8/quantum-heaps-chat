import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import {
  setTheme,
  setMobilePane,
  toggleSearchInChat,
  showToast,
  hideToast,
} from '../settings/uiSlice';
import {
  setActiveConversation,
} from '../conversations/conversationsSlice';
import { AppLayout } from '../../components/layout/AppLayout';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConversationSkeleton } from '../../components/common/ConversationSkeleton';
import { MessageSkeleton } from '../../components/common/MessageSkeleton';
import { Notification } from '../../components/common/Notification';
import { Toast } from '../../components/common/Toast';

describe('System Features Suite (Tasks 23 - 28)', () => {
  const renderApp = () =>
    render(
      <Provider store={store}>
        <AppLayout />
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(setMobilePane('sidebar'));
    store.dispatch(toggleSearchInChat(false));
    store.dispatch(hideToast());
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------
   * TASK 23: RESPONSIVE DESIGN
   * ------------------------------------------------------------- */
  describe('Task 23: Responsive Design', () => {
    it('supports mobile pane switching between sidebar and chat view with back button', async () => {
      renderApp();

      // Initially on mobile, sidebar is active
      expect(store.getState().ui.mobilePane).toBe('sidebar');

      // Click on a conversation item in the list
      const convItems = screen.getAllByRole('button', { name: /sarah chen/i });
      fireEvent.click(convItems[0]!);

      // On mobile selection, mobilePane switches to 'chat'
      expect(store.getState().ui.mobilePane).toBe('chat');

      // Back button in ChatHeader returns to 'sidebar'
      const backBtn = screen.getByLabelText(/back to conversations list/i);
      expect(backBtn).toBeInTheDocument();
      fireEvent.click(backBtn);

      expect(store.getState().ui.mobilePane).toBe('sidebar');
    });

    it('applies responsive responsive Tailwind classes to sidebar and chat pane', () => {
      const { container } = renderApp();

      // Sidebar container has responsive widths
      const sidebarContainer = container.querySelector('.md\\:w-80');
      expect(sidebarContainer).toBeInTheDocument();

      // Main chat pane is flexible
      const mainChat = container.querySelector('main');
      expect(mainChat).toBeInTheDocument();
      expect(mainChat?.classList.contains('flex-1')).toBe(true);
    });
  });

  /* -------------------------------------------------------------
   * TASK 24: DARK AND LIGHT THEMES
   * ------------------------------------------------------------- */
  describe('Task 24: Dark and Light Themes', () => {
    it('renders reusable ThemeToggle component and toggles theme in Redux and DOM', () => {
      render(
        <Provider store={store}>
          <ThemeToggle showLabel />
        </Provider>
      );

      // Set to light theme initially
      act(() => {
        store.dispatch(setTheme('light'));
      });

      const toggleBtn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(toggleBtn).toBeInTheDocument();
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Click toggle -> switches to dark
      fireEvent.click(toggleBtn);

      expect(store.getState().ui.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();

      // Click toggle again -> switches back to light
      fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));

      expect(store.getState().ui.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  /* -------------------------------------------------------------
   * TASK 25: MESSAGE SEARCH & MATCH NAVIGATION
   * ------------------------------------------------------------- */
  describe('Task 25: Message Search & Match Navigation', () => {
    it('searches messages, displays match count, and navigates between matches', async () => {
      renderApp();

      // Open in-chat search
      act(() => {
        store.dispatch(toggleSearchInChat(true));
      });

      const searchInput = await screen.findByPlaceholderText(/search in this conversation/i);
      expect(searchInput).toBeInTheDocument();

      // Search for keyword present in multiple messages in conv-1 ('typing')
      fireEvent.change(searchInput, { target: { value: 'typing' } });

      // Match count is displayed
      await waitFor(() => {
        expect(screen.getByText(/\d+ messages? found/i)).toBeInTheDocument();
        expect(screen.getByText(/1 of \d+/i)).toBeInTheDocument();
      });

      // Next match button advances current match index
      const nextMatchBtn = screen.getByLabelText(/next match/i);
      fireEvent.click(nextMatchBtn);

      await waitFor(() => {
        expect(screen.getByText(/2 of \d+/i)).toBeInTheDocument();
      });

      // Previous match button steps back
      const prevMatchBtn = screen.getByLabelText(/previous match/i);
      fireEvent.click(prevMatchBtn);

      await waitFor(() => {
        expect(screen.getByText(/1 of \d+/i)).toBeInTheDocument();
      });

      // Clear search query
      const clearBtn = screen.getByLabelText(/clear search query/i);
      fireEvent.click(clearBtn);

      expect(screen.getByText(/search for words, phrases, or code snippets/i)).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * TASK 26: LOADING, EMPTY, AND ERROR STATES
   * ------------------------------------------------------------- */
  describe('Task 26: Loading, Empty, and Error States', () => {
    it('renders ConversationSkeleton and MessageSkeleton loading components', () => {
      const { rerender } = render(
        <ConversationSkeleton count={3} />
      );

      expect(screen.getByRole('status', { name: /loading conversations/i })).toBeInTheDocument();

      rerender(<MessageSkeleton count={4} />);
      expect(screen.getByRole('status', { name: /loading messages/i })).toBeInTheDocument();
    });

    it('renders reusable EmptyState component with custom icon, title, and action', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No Messages Yet"
          description="Send a message to kick off this conversation."
          actionLabel="Say Hello"
          onAction={onAction}
        />
      );

      expect(screen.getByText('No Messages Yet')).toBeInTheDocument();
      expect(screen.getByText(/send a message to kick off/i)).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /say hello/i });
      fireEvent.click(actionBtn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('renders reusable ErrorState component with message and retry callback', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Failed to fetch conversation"
          message="Simulated network timeout (504)"
          onRetry={onRetry}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch conversation')).toBeInTheDocument();
      expect(screen.getByText(/simulated network timeout/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  /* -------------------------------------------------------------
   * TASK 27: KEYBOARD SHORTCUTS
   * ------------------------------------------------------------- */
  describe('Task 27: Keyboard Shortcuts', () => {
    it('focuses conversation search when pressing Ctrl+K or Cmd+K', () => {
      renderApp();

      const searchInput = screen.getByPlaceholderText(/search conversations, names or messages/i);
      expect(document.activeElement).not.toBe(searchInput);

      // Trigger Ctrl+K
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

      expect(document.activeElement).toBe(searchInput);
    });

    it('opens keyboard shortcuts modal when pressing "?" outside inputs', () => {
      renderApp();

      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();

      // Trigger ?
      fireEvent.keyDown(window, { key: '?' });

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();

      // Press Escape to dismiss
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
    });

    it('does not trigger shortcut when typing inside an input', () => {
      renderApp();

      const searchInput = screen.getByPlaceholderText(/search conversations, names or messages/i);
      searchInput.focus();

      // Type ? inside input
      fireEvent.keyDown(searchInput, { key: '?' });

      // Modal should NOT open
      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * TASK 28: NOTIFICATIONS AND FEEDBACK SYSTEM
   * ------------------------------------------------------------- */
  describe('Task 28: Notifications and Feedback', () => {
    it('renders stacked notifications without overlapping and supports manual dismissal', async () => {
      render(
        <Provider store={store}>
          <Toast />
        </Provider>
      );

      // Dispatch multiple notifications
      act(() => {
        store.dispatch(showToast({ message: 'First notification', type: 'info' }));
        store.dispatch(showToast({ message: 'Second notification', type: 'success' }));
      });

      expect(screen.getByText('First notification')).toBeInTheDocument();
      expect(screen.getByText('Second notification')).toBeInTheDocument();

      // Dismiss first notification
      const dismissButtons = screen.getAllByLabelText(/dismiss notification/i);
      fireEvent.click(dismissButtons[0]!);

      await waitFor(() => {
        expect(screen.queryByText('First notification')).not.toBeInTheDocument();
        expect(screen.getByText('Second notification')).toBeInTheDocument();
      });
    });

    it('renders single Notification component with auto-dismiss timer', async () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();

      render(
        <Notification
          notification={{ id: 'n-1', message: 'Auto dismiss test', duration: 2000, type: 'success' }}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(onDismiss).toHaveBeenCalledWith('n-1');
      vi.useRealTimers();
    });
  });
});
