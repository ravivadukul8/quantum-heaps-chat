import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

describe('Chat Sidebar & Application Integration', () => {
  const renderApp = () =>
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

  it('renders current user profile in the sidebar header', () => {
    renderApp();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
  });

  it('displays conversations in the list with names and unread counts', () => {
    renderApp();
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0);
    expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
    expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();
  });

  it('filters conversation list when typing in search input', async () => {
    renderApp();
    const searchInput = screen.getByPlaceholderText(/Search conversations/i);
    fireEvent.change(searchInput, { target: { value: 'Sarah' } });

    await waitFor(
      () => {
        expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0);
        expect(screen.queryByText('#frontend-guild')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(
      () => {
        expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('filters conversations by Groups tab', () => {
    renderApp();
    const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
    fireEvent.click(groupsTab);

    expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
    expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();

    // Reset to All
    const allTab = screen.getByRole('tab', { name: /^All/i });
    fireEvent.click(allTab);
  });
});
