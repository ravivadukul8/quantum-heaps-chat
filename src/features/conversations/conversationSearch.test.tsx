import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setSearchQuery, setFilter } from './conversationsSlice';
import { ConversationSidebar } from './components/ConversationSidebar';

describe('Conversation Search Integration', () => {
  const renderSidebar = () =>
    render(
      <Provider store={store}>
        <ConversationSidebar />
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setSearchQuery(''));
    store.dispatch(setFilter('all'));
  });

  it('renders search input with placeholder and keyboard shortcut', () => {
    renderSidebar();
    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('searches conversations by username (case-insensitive)', async () => {
    renderSidebar();

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    // Lowercase "sarah" matches "Sarah Chen"
    fireEvent.change(input, { target: { value: 'sarah' } });

    await waitFor(
      () => {
        expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0);
        expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
        expect(screen.queryByText('#frontend-guild')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('searches conversations by group name', async () => {
    renderSidebar();

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    fireEvent.change(input, { target: { value: 'GUILD' } }); // Uppercase

    await waitFor(
      () => {
        expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
        expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('searches conversations by last message content', async () => {
    renderSidebar();

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    // conv-8 last message contains "Ethiopian coffee"
    fireEvent.change(input, { target: { value: 'Ethiopian' } });

    await waitFor(
      () => {
        expect(screen.getByText('Random & Coffee Break')).toBeInTheDocument();
        expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('displays empty state with clear button when no conversations match', async () => {
    renderSidebar();

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    fireEvent.change(input, { target: { value: 'unmatchedxyz123' } });

    await waitFor(
      () => {
        expect(screen.getByText('No matches found')).toBeInTheDocument();
        expect(screen.getByText(/unmatchedxyz123/i)).toBeInTheDocument();
      },
      { timeout: 1500 }
    );

    // Click "Clear Search" in the empty state
    const clearBtn = screen.getByRole('button', { name: /Clear Search/i });
    fireEvent.click(clearBtn);

    await waitFor(
      () => {
        expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
        expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0);
      },
      { timeout: 1500 }
    );
  });

  it('clears search using input clear X button', async () => {
    renderSidebar();

    const input = screen.getByPlaceholderText(/Search conversations, names or messages/i);
    fireEvent.change(input, { target: { value: 'sarah' } });

    await waitFor(
      () => {
        expect(screen.getByLabelText(/Clear conversation search/i)).toBeInTheDocument();
      },
      { timeout: 1500 }
    );

    const clearButton = screen.getByLabelText(/Clear conversation search/i);
    fireEvent.click(clearButton);

    await waitFor(
      () => {
        expect((input as HTMLInputElement).value).toBe('');
        expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });
});
