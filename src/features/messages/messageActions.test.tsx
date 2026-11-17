import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { MessageList } from './components/MessageList';

describe('Message Actions Suite (Edit, Delete, React, Copy)', () => {
  const renderMessageList = () =>
    render(
      <Provider store={store}>
        <MessageList />
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
  });

  it('renders copy action and copies message text to clipboard', async () => {
    renderMessageList();

    const copyButtons = screen.getAllByLabelText(/copy message text/i);
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]!);

    await waitFor(() => {
      expect(screen.getByLabelText(/copied to clipboard/i)).toBeInTheDocument();
    });
  });

  it('allows adding a reaction from the quick emoji picker', async () => {
    renderMessageList();

    const reactionButtons = screen.getAllByLabelText(/add reaction/i);
    expect(reactionButtons.length).toBeGreaterThan(0);

    // Open quick emoji popover
    fireEvent.click(reactionButtons[0]!);

    // Click fire emoji
    const fireEmojiBtn = await screen.findByTitle(/react with 🔥/i);
    fireEvent.click(fireEmojiBtn);

    // Emoji reaction should be rendered on message
    await waitFor(() => {
      expect(screen.getAllByText('🔥').length).toBeGreaterThan(0);
    });
  });

  it('allows author to inline edit their own message', async () => {
    renderMessageList();

    // Edit button exists for user's own messages
    const editButtons = screen.getAllByLabelText(/edit message/i);
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]!);

    // Textarea with original text should appear (first message sent by Alex Rivera)
    const textarea = screen.getByDisplayValue(/Hey Sarah! Yes, I walked through the slices/i);
    expect(textarea).toBeInTheDocument();

    // Change text and save
    fireEvent.change(textarea, {
      target: { value: 'Hey Sarah! Yes, I walked through the slices [UPDATED]' },
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Hey Sarah! Yes, I walked through the slices \[UPDATED\]/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText(/\(edited\)/i).length).toBeGreaterThan(0);
    });
  });

  it('allows author to cancel inline edit without saving', async () => {
    renderMessageList();

    const editButtons = screen.getAllByLabelText(/edit message/i);
    fireEvent.click(editButtons[0]!);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Form disappears and original text is retained
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('allows author to delete their own message with confirmation', async () => {
    renderMessageList();

    const deleteButtons = screen.getAllByLabelText(/delete message/i);
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Trigger delete confirmation prompt
    fireEvent.click(deleteButtons[0]!);
    expect(screen.getByText(/delete this message\?/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/this message was deleted/i)).toBeInTheDocument();
    });
  });
});
