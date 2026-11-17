import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setFilter, setSearchQuery, markAsRead } from './conversationsSlice';
import { ConversationSidebar } from './components/ConversationSidebar';

describe('Conversation Filter Tabs Integration', () => {
  const renderSidebar = () =>
    render(
      <Provider store={store}>
        <ConversationSidebar />
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setFilter('all'));
    store.dispatch(setSearchQuery(''));
  });

  it('renders all three filter tabs (All, Unread, Groups)', () => {
    renderSidebar();

    expect(screen.getByRole('tab', { name: /^All/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Unread/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Groups/i })).toBeInTheDocument();
  });

  it('defaults to the All filter and highlights it as active tab', () => {
    renderSidebar();

    const allTab = screen.getByRole('tab', { name: /^All/i });
    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });

    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveAttribute('aria-selected', 'false');
    expect(store.getState().conversations.filter).toBe('all');
  });

  it('filters to Unread conversations when clicking the Unread tab', () => {
    renderSidebar();

    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
    fireEvent.click(unreadTab);

    expect(store.getState().conversations.filter).toBe('unread');
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');

    // Conversations with unread count in seed:
    // conv-2 (Marcus Vance: 1 unread), conv-6 (#frontend-guild: 2 unread), conv-8 (Random & Coffee: 3 unread)
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
    expect(screen.getByText('Random & Coffee Break')).toBeInTheDocument();

    // Sarah Chen (conv-1) has 0 unread, should not be displayed
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
  });

  it('filters to Group conversations only when clicking the Groups tab', () => {
    renderSidebar();

    const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
    fireEvent.click(groupsTab);

    expect(store.getState().conversations.filter).toBe('groups');
    expect(groupsTab).toHaveAttribute('aria-selected', 'true');

    // All 3 group conversations should be visible
    expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
    expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();
    expect(screen.getByText('Random & Coffee Break')).toBeInTheDocument();

    // Direct conversations should not be present
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
    expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
  });

  it('combines filters and search seamlessly (e.g. searching inside Groups)', async () => {
    renderSidebar();

    // Select Groups tab
    const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
    fireEvent.click(groupsTab);

    // Search for "Coffee"
    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    fireEvent.change(input, { target: { value: 'Coffee' } });

    await waitFor(
      () => {
        expect(screen.getByText('Random & Coffee Break')).toBeInTheDocument();
        expect(screen.queryByText('#frontend-guild')).not.toBeInTheDocument();
        expect(screen.queryByText('Quantum Core Team')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('displays contextual empty state when no unread conversations exist', () => {
    // Mark all unread conversations as read
    store.dispatch(markAsRead('conv-2'));
    store.dispatch(markAsRead('conv-6'));
    store.dispatch(markAsRead('conv-8'));

    renderSidebar();

    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
    fireEvent.click(unreadTab);

    expect(screen.getByText('All caught up!')).toBeInTheDocument();
    expect(screen.getByText('You have no unread conversations.')).toBeInTheDocument();

    // Clicking "Show All Conversations" in empty state switches filter back to all
    const showAllBtn = screen.getByRole('button', { name: /Show All Conversations/i });
    fireEvent.click(showAllBtn);

    expect(store.getState().conversations.filter).toBe('all');
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('displays contextual empty state when search within a filter produces 0 results', async () => {
    renderSidebar();

    const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
    fireEvent.click(groupsTab);

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    fireEvent.change(input, { target: { value: 'NonExistentTerm99' } });

    await waitFor(
      () => {
        expect(screen.getByText('No matches found')).toBeInTheDocument();
        expect(screen.getByText(/No group channels matching "NonExistentTerm99"/i)).toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });
});
