import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { setReplyingTo } from './messagesSlice';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ChatSearchDrawer } from './components/ChatSearchDrawer';
import { Toast } from '../../components/common/Toast';
import { toggleSearchInChat } from '../settings/uiSlice';

describe('Message Interaction Suite (Tasks 15 - 19: Edit, Delete, Reply, Copy, Reactions)', () => {
  const renderChatHarness = () =>
    render(
      <Provider store={store}>
        <div className="flex flex-col h-[700px] relative">
          <MessageList />
          <MessageInput />
          <ChatSearchDrawer />
          <Toast />
        </div>
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(setReplyingTo(null));
    store.dispatch(toggleSearchInChat(false));
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------
   * TASK 15: EDIT MESSAGES
   * ------------------------------------------------------------- */
  describe('Task 15: Edit Messages', () => {
    it('shows Edit button only for the author\'s own messages', () => {
      renderChatHarness();

      const editButtons = screen.getAllByLabelText(/edit message/i);
      expect(editButtons.length).toBeGreaterThan(0);

      // Verify that messages sent by other participants (Sarah Chen, user-2) do NOT have an edit button
      const sarahMsgElem = screen
        .getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
        .closest('.group');
      expect(sarahMsgElem).not.toBeNull();
      expect(sarahMsgElem?.querySelector('button[aria-label="Edit message"]')).toBeNull();
    });

    it('allows author to inline edit message with validation, Enter to save, and (edited) label', async () => {
      renderChatHarness();

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      // Inline textarea should be present
      const textarea = screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();

      // Empty validation: clearing text disables the Save button
      fireEvent.change(textarea, { target: { value: '   ' } });
      const saveBtn = screen.getByRole('button', { name: /save/i });
      expect(saveBtn).toBeDisabled();

      // Enter valid updated content
      const updatedText = 'Verified architectural diagrams updated with Redux Toolkit';
      fireEvent.change(textarea, { target: { value: updatedText } });
      expect(saveBtn).not.toBeDisabled();

      // Save via Enter key
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(screen.getByText(updatedText)).toBeInTheDocument();
        expect(screen.getAllByText(/\(edited\)/i).length).toBeGreaterThan(0);
      });
    });

    it('allows author to cancel inline edit via Escape key or Cancel button', async () => {
      renderChatHarness();

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      const textarea = screen.getByRole('textbox', { name: '' });
      expect(textarea).toBeInTheDocument();

      // Press Escape to cancel
      fireEvent.keyDown(textarea, { key: 'Escape' });

      // Form should dismiss without saving
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * TASK 16: DELETE MESSAGES
   * ------------------------------------------------------------- */
  describe('Task 16: Delete Messages', () => {
    it('shows Delete button only on author\'s messages and prompts with ConfirmDialog', async () => {
      renderChatHarness();

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      expect(deleteButtons.length).toBeGreaterThan(0);

      // Verify that messages sent by other participants do not expose a delete button
      const sarahMsgElem = screen
        .getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
        .closest('.group');
      expect(sarahMsgElem?.querySelector('button[aria-label="Delete message"]')).toBeNull();

      // Click delete trigger on author's message
      fireEvent.click(deleteButtons[0]!);

      // Accessible ConfirmDialog modal should appear
      const dialogTitle = await screen.findByRole('heading', { name: /delete message\?/i });
      expect(dialogTitle).toBeInTheDocument();
      expect(screen.getByText(/removed for everyone in this chat/i)).toBeInTheDocument();

      // Cancel button closes dialog without deleting
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /delete message\?/i })).not.toBeInTheDocument();
      });
    });

    it('soft-deletes message on confirmation and displays placeholder', async () => {
      renderChatHarness();

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      fireEvent.click(deleteButtons[0]!);

      // Confirm deletion in dialog
      const confirmBtn = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getAllByText(/this message was deleted/i).length).toBeGreaterThan(0);
      });
    });

    it('removes soft-deleted messages from in-chat search results', async () => {
      renderChatHarness();

      // Open in-chat search
      await act(async () => {
        store.dispatch(toggleSearchInChat(true));
      });

      const searchInput = await screen.findByPlaceholderText(/search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'accidentally drafted' } });

      // In conv-1, message m-1-8 had 'accidentally drafted' and was soft deleted, so it must NOT appear
      await waitFor(() => {
        expect(screen.getByText(/no matching messages found/i)).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
   * TASK 17: REPLY TO SPECIFIC MESSAGES
   * ------------------------------------------------------------- */
  describe('Task 17: Reply to Specific Messages', () => {
    it('allows replying to sent and received messages, showing ReplyPreview banner', async () => {
      renderChatHarness();

      const replyButtons = screen.getAllByLabelText(/reply to message/i);
      expect(replyButtons.length).toBeGreaterThan(0);

      // Click reply on first message
      fireEvent.click(replyButtons[0]!);

      // ReplyPreview banner should be rendered
      await waitFor(() => {
        expect(screen.getByText(/replying to/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cancel reply/i)).toBeInTheDocument();
      });

      // Cancelling reply dismisses preview
      fireEvent.click(screen.getByLabelText(/cancel reply/i));

      await waitFor(() => {
        expect(screen.queryByText(/replying to/i)).not.toBeInTheDocument();
      });
    });

    it('sends a reply with quoted message attached to sent message', async () => {
      renderChatHarness();

      // 1. Trigger reply
      const replyButtons = screen.getAllByLabelText(/reply to message/i);
      fireEvent.click(replyButtons[0]!);

      expect(screen.getByText(/replying to/i)).toBeInTheDocument();

      // 2. Type reply text into composer
      const composer = screen.getByPlaceholderText(/type a message/i);
      fireEvent.change(composer, { target: { value: 'This is my custom test reply message!' } });

      // 3. Send message
      const sendBtn = screen.getByLabelText(/send message/i);
      fireEvent.click(sendBtn);

      // 4. Sent reply should contain quoted preview and new text
      await waitFor(() => {
        expect(screen.getByText('This is my custom test reply message!')).toBeInTheDocument();
      });

      // Verify quoted reply block is inside the newly sent message bubble
      const sentBubble = screen.getByText('This is my custom test reply message!').closest('.group');
      expect(sentBubble?.querySelector('[role="button"][title*="Jump to"]')).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * TASK 18: COPY MESSAGE CONTENT
   * ------------------------------------------------------------- */
  describe('Task 18: Copy Message Content', () => {
    it('copies message content to clipboard and displays success toast', async () => {
      renderChatHarness();

      const copyButtons = screen.getAllByLabelText(/copy message text/i);
      expect(copyButtons.length).toBeGreaterThan(0);

      fireEvent.click(copyButtons[0]!);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();

      // Toast notification should appear
      await waitFor(() => {
        expect(screen.getByText(/message copied to clipboard/i)).toBeInTheDocument();
      });
    });

    it('handles clipboard failure gracefully and shows error toast', async () => {
      renderChatHarness();

      // Make writeText reject
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Permission denied'));

      const copyButtons = screen.getAllByLabelText(/copy message text/i);
      fireEvent.click(copyButtons[0]!);

      await waitFor(() => {
        expect(screen.getByText(/failed to copy message to clipboard/i)).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
   * TASK 19: EMOJI REACTIONS
   * ------------------------------------------------------------- */
  describe('Task 19: Emoji Reactions', () => {
    it('allows toggling reactions from quick reaction menu', async () => {
      renderChatHarness();

      const reactionTriggers = screen.getAllByLabelText(/add reaction/i);
      // Select reaction button on a message
      fireEvent.click(reactionTriggers[0]!);

      // Click celebration emoji 🎉 (not initially present on this message)
      const tadaBtn = await screen.findByTitle(/react with 🎉/i);
      fireEvent.click(tadaBtn);

      // Reaction pill should be visible with count
      await waitFor(() => {
        const reactionPill = screen.getByLabelText(/1 reacted with 🎉 \(you reacted\)/i);
        expect(reactionPill).toBeInTheDocument();
        expect(reactionPill).toHaveAttribute('aria-pressed', 'true');
      });

      // Clicking the reaction pill toggles it off
      const pill = screen.getByLabelText(/1 reacted with 🎉 \(you reacted\)/i);
      fireEvent.click(pill);

      await waitFor(() => {
        expect(screen.queryByLabelText(/reacted with 🎉/i)).not.toBeInTheDocument();
      });
    });

    it('supports selecting emojis from accessible full EmojiPicker dialog', async () => {
      renderChatHarness();

      const reactionTriggers = screen.getAllByLabelText(/add reaction/i);
      fireEvent.click(reactionTriggers[0]!);

      // Click the "+" button to open the full picker
      const moreBtn = await screen.findByLabelText(/more emojis/i);
      fireEvent.click(moreBtn);

      // Search for 💯 (100) using keyword 'score'
      const searchInput = await screen.findByLabelText(/search emojis/i);
      fireEvent.change(searchInput, { target: { value: 'score' } });

      const hundredBtn = await screen.findByLabelText(/react with 💯/i);
      fireEvent.click(hundredBtn);

      // Reaction should be added
      await waitFor(() => {
        expect(screen.getByLabelText(/1 reacted with 💯/i)).toBeInTheDocument();
      });
    });
  });
});
