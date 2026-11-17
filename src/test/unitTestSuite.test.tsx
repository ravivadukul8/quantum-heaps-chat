import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createTestStore, renderWithProviders } from './testUtils';
import { AppLayout } from '../components/layout/AppLayout';
import { ConversationSidebar } from '../features/conversations/components/ConversationSidebar';
import { MessageList } from '../features/messages/components/MessageList';
import { MessageInput } from '../features/messages/components/MessageInput';
import { ChatHeader } from '../features/messages/components/ChatHeader';
import { ChatSearchDrawer } from '../features/messages/components/ChatSearchDrawer';
import { GroupInfoDrawer } from '../features/groups/components/GroupInfoDrawer';
import { AddMemberModal } from '../features/groups/components/AddMemberModal';
import { Toast } from '../components/common/Toast';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  setActiveConversation,
} from '../features/conversations/conversationsSlice';
import {
  setReplyingTo,
} from '../features/messages/messagesSlice';
import {
  toggleSearchInChat,
  setMobilePane,
} from '../features/settings/uiSlice';
import { toggleGroupInfoDrawer } from '../features/groups/groupsSlice';

describe('Task 36: Master Unit Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  /* =========================================================================
   * 1. Conversation sidebar rendering
   * ========================================================================= */
  describe('1. Conversation sidebar rendering', () => {
    it('renders sidebar header with current user profile, avatar, and online status', () => {
      renderWithProviders(<ConversationSidebar />);

      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByAltText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getAllByTitle(/Status: online/i).length).toBeGreaterThan(0);
    });

    it('renders conversation search bar with shortcut hint', () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations, names or messages/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('id', 'conversation-search-input');
      expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
    });

    it('renders All, Unread, and Groups category tabs with unread badges', () => {
      renderWithProviders(<ConversationSidebar />);

      const allTab = screen.getByRole('tab', { name: /^All/i });
      const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
      const groupsTab = screen.getByRole('tab', { name: /^Groups/i });

      expect(allTab).toBeInTheDocument();
      expect(unreadTab).toBeInTheDocument();
      expect(groupsTab).toBeInTheDocument();
    });

    it('renders conversation items with names, last messages, timestamps, and badges', () => {
      renderWithProviders(<ConversationSidebar />);

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();

      // Check group member count indicators: #frontend-guild has 5 members
      expect(screen.getByText('(5)')).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 2. Conversation search
   * ========================================================================= */
  describe('2. Conversation search', () => {
    it('searches conversations by direct contact username (case-insensitive)', async () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'sarah' } });

      await waitFor(
        () => {
          expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
          expect(screen.queryByText('#frontend-guild')).not.toBeInTheDocument();
          expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('searches conversations by group channel name', async () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'guild' } });

      await waitFor(
        () => {
          expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
          expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('searches conversations by last message snippet content', async () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'Ping me anytime' } });

      await waitFor(
        () => {
          expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
          expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('displays empty state when query matches no conversations', async () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentChatQueryXYZ' } });

      await waitFor(
        () => {
          expect(screen.getByText(/No matches found/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Clear Search/i })).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('clears search query and restores complete conversation list when clear button is clicked', async () => {
      renderWithProviders(<ConversationSidebar />);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'Marcus' } });

      await waitFor(() => {
        expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
        expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
      });

      const clearBtn = screen.getByLabelText(/Clear conversation search/i);
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
        expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
        expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 3. All, Unread, and Groups filters
   * ========================================================================= */
  describe('3. All, Unread, and Groups filters', () => {
    it('renders All filter by default with aria-selected="true"', () => {
      const { store } = renderWithProviders(<ConversationSidebar />);

      const allTab = screen.getByRole('tab', { name: /^All/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
      expect(store.getState().conversations.filter).toBe('all');
    });

    it('filters to unread conversations when clicking the Unread tab', () => {
      const { store } = renderWithProviders(<ConversationSidebar />);

      const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
      fireEvent.click(unreadTab);

      expect(store.getState().conversations.filter).toBe('unread');
      expect(unreadTab).toHaveAttribute('aria-selected', 'true');

      // Marcus Vance, #frontend-guild, and Random & Coffee have unread counts
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      // Sarah Chen has unreadCount = 0 so should not appear
      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
    });

    it('filters to group conversations when clicking the Groups tab', () => {
      const { store } = renderWithProviders(<ConversationSidebar />);

      const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
      fireEvent.click(groupsTab);

      expect(store.getState().conversations.filter).toBe('groups');
      expect(groupsTab).toHaveAttribute('aria-selected', 'true');

      // Groups must be present
      expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();
      expect(screen.getByText('Random & Coffee Break')).toBeInTheDocument();

      // Direct chats must not be present
      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
      expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
    });

    it('seamlessly combines category filter and search query', async () => {
      renderWithProviders(<ConversationSidebar />);

      // Switch to Groups
      const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
      fireEvent.click(groupsTab);

      // Search for "Core" inside Groups
      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'Core' } });

      await waitFor(() => {
        expect(screen.getByText('Quantum Core Team')).toBeInTheDocument();
        expect(screen.queryByText('#frontend-guild')).not.toBeInTheDocument();
        expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
      });
    });

    it('shows contextual empty state when search within a filter yields no results', async () => {
      renderWithProviders(<ConversationSidebar />);

      const groupsTab = screen.getByRole('tab', { name: /^Groups/i });
      fireEvent.click(groupsTab);

      const searchInput = screen.getByPlaceholderText(/Search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentGroup' } });

      await waitFor(() => {
        expect(screen.getByText(/No matches found/i)).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 4. Selecting a conversation
   * ========================================================================= */
  describe('4. Selecting a conversation', () => {
    it('selects a conversation when clicked and updates activeConversation state in Redux', () => {
      const { store } = renderWithProviders(<AppLayout />);

      const marcusItem = screen.getByText('Marcus Vance').closest('[role="button"]');
      expect(marcusItem).not.toBeNull();
      fireEvent.click(marcusItem!);

      expect(store.getState().conversations.activeConversationId).toBe('conv-2');
    });

    it('applies active highlighted styling to the selected conversation item', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-2'));

      renderWithProviders(<ConversationSidebar />, { store });

      const marcusItem = screen.getByText('Marcus Vance').closest('[role="button"]');
      expect(marcusItem).toHaveClass('bg-teal-50/80', 'dark:bg-[#202c33]');
    });

    it('updates chat header details to match the selected conversation', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-2'));

      renderWithProviders(
        <div>
          <ChatHeader />
        </div>,
        { store }
      );

      // Marcus Vance in header
      expect(screen.getByRole('heading', { name: 'Marcus Vance' })).toBeInTheDocument();
      expect(screen.getByAltText('Marcus Vance')).toBeInTheDocument();
    });

    it('switches mobile pane to "chat" on mobile view when a conversation is selected', () => {
      const store = createTestStore();
      store.dispatch(setMobilePane('sidebar'));

      renderWithProviders(<ConversationSidebar />, { store });

      const sarahItem = screen.getByText('Sarah Chen').closest('[role="button"]');
      fireEvent.click(sarahItem!);

      expect(store.getState().ui.mobilePane).toBe('chat');
    });
  });

  /* =========================================================================
   * 5. Message list rendering
   * ========================================================================= */
  describe('5. Message list rendering', () => {
    it('renders messages for the selected conversation', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      expect(
        screen.getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Hey Sarah! Yes, I walked through the slices earlier this morning/i)
      ).toBeInTheDocument();
    });

    it('visually differentiates between sent and received messages', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      // Sent by Alex (user-1)
      const sentMsg = screen
        .getByText(/Hey Sarah! Yes, I walked through the slices earlier this morning/i)
        .closest('.group');
      expect(sentMsg).toHaveClass('justify-end');

      // Received from Sarah (user-2)
      const receivedMsg = screen
        .getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
        .closest('.group');
      expect(receivedMsg).toHaveClass('justify-start');
    });

    it('renders group sender names with colored tags on received group messages', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6')); // #frontend-guild

      renderWithProviders(<MessageList />, { store });

      // Elena Rostova is sender of first message in conv-6
      expect(screen.getAllByText('Elena Rostova').length).toBeGreaterThan(0);
    });

    it('displays formatted message timestamps and date separators', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      // Should display date separator such as Yesterday or formatted date
      const dateSeparators = screen.getAllByText(/Today|Yesterday|\w+ \d+, \d{4}/i);
      expect(dateSeparators.length).toBeGreaterThan(0);
    });

    it('displays empty state when conversation has no messages', () => {
      const store = createTestStore({
        conversations: {
          ...createTestStore().getState().conversations,
          activeConversationId: 'empty-conv',
          entities: {
            'empty-conv': {
              id: 'empty-conv',
              type: 'direct',
              participantIds: ['user-1', 'user-2'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              unreadCount: 0,
            },
          },
          ids: ['empty-conv'],
        },
        messages: {
          ...createTestStore().getState().messages,
          byConversationId: {
            'empty-conv': [],
          },
        },
      });

      renderWithProviders(<MessageList />, { store });

      expect(screen.getByText(/Say hello to start the conversation!/i)).toBeInTheDocument();
      expect(screen.getByText(/Messages in this chat are end-to-end encrypted/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 6. Sending a message
   * ========================================================================= */
  describe('6. Sending a message', () => {
    it('updates composer textarea as user types', () => {
      renderWithProviders(<MessageInput />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Testing message input' } });

      expect(textarea.value).toBe('Testing message input');
    });

    it('sends message and clears composer input upon clicking Send button', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: 'Hello world from test suite!' } });

      const sendBtn = screen.getByRole('button', { name: /Send message/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('Hello world from test suite!')).toBeInTheDocument();
        expect((textarea as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('sends message when pressing Enter without Shift', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: 'Enter key test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(screen.getByText('Enter key test message')).toBeInTheDocument();
        expect((textarea as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('inserts newline and does not send when pressing Shift + Enter', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: 'Multiline\nline 2' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      // Message should NOT be added
      expect(screen.queryByText('Multiline\nline 2')).not.toBeInTheDocument();
    });

    it('prevents sending empty or whitespace-only messages', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageInput />
        </div>,
        { store }
      );

      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: '   ' } });

      // When text is purely whitespace, the mic button is displayed instead of send button
      expect(screen.queryByRole('button', { name: /Send message/i })).toBeNull();
      expect(screen.getByRole('button', { name: /Voice message/i })).toBeInTheDocument();
    });

    it('updates sidebar conversation last message preview upon sending', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <ConversationSidebar />
          <MessageInput />
        </div>,
        { store }
      );

      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: 'New last message preview' } });
      fireEvent.click(screen.getByRole('button', { name: /Send message/i }));

      await waitFor(() => {
        const previews = screen.getAllByText('New last message preview');
        expect(previews.length).toBeGreaterThan(0);
      });
    });
  });

  /* =========================================================================
   * 7. Editing a message
   * ========================================================================= */
  describe('7. Editing a message', () => {
    it('shows Edit button only for messages sent by the current user', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      expect(editButtons.length).toBeGreaterThan(0);

      // Verify that Sarah Chen's received message does not have an edit button
      const sarahMsg = screen
        .getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
        .closest('.group');
      expect(sarahMsg?.querySelector('button[aria-label="Edit message"]')).toBeNull();
    });

    it('opens inline edit textarea initialized with message content when Edit is clicked', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      const inlineTextarea = screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement;
      expect(inlineTextarea).toBeInTheDocument();
      expect(inlineTextarea.value).toContain('Hey Sarah!');
    });

    it('validates that edited message cannot be saved if empty', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      const inlineTextarea = screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement;
      fireEvent.change(inlineTextarea, { target: { value: '   ' } });

      const saveBtn = screen.getByRole('button', { name: /^save$/i });
      expect(saveBtn).toBeDisabled();
    });

    it('saves updated message and displays (edited) label upon clicking Save', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      const inlineTextarea = screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement;
      fireEvent.change(inlineTextarea, { target: { value: 'Hey Sarah! This message was edited successfully.' } });

      const saveBtn = screen.getByRole('button', { name: /^save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('Hey Sarah! This message was edited successfully.')).toBeInTheDocument();
        expect(screen.getAllByText('(edited)').length).toBeGreaterThan(0);
      });
    });

    it('cancels edit without changing content when Cancel is clicked', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      fireEvent.click(editButtons[0]!);

      const inlineTextarea = screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement;
      fireEvent.change(inlineTextarea, { target: { value: 'Should be discarded' } });

      const cancelBtn = screen.getByRole('button', { name: /^cancel$/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByText('Should be discarded')).toBeNull();
      expect(screen.getByText(/Hey Sarah! Yes, I walked through the slices earlier this morning/i)).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 8. Deleting a message
   * ========================================================================= */
  describe('8. Deleting a message', () => {
    it('shows Delete button only on author sent messages', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      expect(deleteButtons.length).toBeGreaterThan(0);

      const sarahMsg = screen
        .getByText(/Morning Alex! Did you get a chance to review the Redux Toolkit migration PR/i)
        .closest('.group');
      expect(sarahMsg?.querySelector('button[aria-label="Delete message"]')).toBeNull();
    });

    it('opens confirmation dialog when Delete button is clicked and cancels safely', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      fireEvent.click(deleteButtons[0]!);

      expect(screen.getByText('Delete message?')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /^cancel$/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByText('Delete message?')).not.toBeInTheDocument();
    });

    it('soft-deletes message when confirmed and displays deleted placeholder', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      fireEvent.click(deleteButtons[0]!);

      const confirmBtn = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText('This message was deleted')).toBeInTheDocument();
      });
    });

    it('excludes deleted messages from message search results', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <ChatSearchDrawer />
        </div>,
        { store }
      );

      // Delete the first authored message (m-1-2)
      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      fireEvent.click(deleteButtons[0]!);
      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

      // Open ChatSearchDrawer and search for deleted text
      act(() => {
        store.dispatch(toggleSearchInChat(true));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search in this conversation/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'walked through the slices' } });

      await waitFor(() => {
        expect(screen.getByText(/No matching messages found/i)).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 9. Replying to a message
   * ========================================================================= */
  describe('9. Replying to a message', () => {
    it('opens ReplyPreview banner above input when clicking Reply on a message', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      const replyButtons = screen.getAllByLabelText(/reply to message/i);
      fireEvent.click(replyButtons[0]!);

      expect(screen.getByText(/Replying to Sarah Chen/i)).toBeInTheDocument();
      expect(store.getState().messages.replyingTo).not.toBeNull();
    });

    it('cancels reply when clicking cancel button on ReplyPreview banner', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      const replyButtons = screen.getAllByLabelText(/reply to message/i);
      fireEvent.click(replyButtons[0]!);

      const cancelReplyBtn = screen.getByLabelText(/cancel reply/i);
      fireEvent.click(cancelReplyBtn);

      expect(screen.queryByText(/Replying to Sarah Chen/i)).toBeNull();
      expect(store.getState().messages.replyingTo).toBeNull();
    });

    it('attaches replyTo reference and renders quoted preview when sending reply', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <MessageInput />
        </div>,
        { store }
      );

      // Click reply on first message
      const replyButtons = screen.getAllByLabelText(/reply to message/i);
      fireEvent.click(replyButtons[0]!);

      // Type reply content
      const textarea = screen.getByPlaceholderText(/Type a message/i);
      fireEvent.change(textarea, { target: { value: 'This is my quoted response to your question.' } });

      const sendBtn = screen.getByRole('button', { name: /Send message/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('This is my quoted response to your question.')).toBeInTheDocument();
        // Quoted message sender name inside reply bubble
        expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(1);
      });
    });
  });

  /* =========================================================================
   * 10. Copying a message
   * ========================================================================= */
  describe('10. Copying a message', () => {
    it('copies message text to clipboard when clicking Copy button and shows toast', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(
        <div>
          <MessageList />
          <Toast />
        </div>,
        { store }
      );

      const copyButtons = screen.getAllByLabelText(/copy message text/i);
      fireEvent.click(copyButtons[0]!);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(screen.getByText('Message copied to clipboard')).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 11. Emoji reactions
   * ========================================================================= */
  describe('11. Emoji reactions', () => {
    it('adds emoji reaction to a message when selecting from quick reactions and toggles it', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const reactionTriggers = screen.getAllByLabelText(/add reaction/i);
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

    it('allows multiple different emoji reactions on the same message', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const reactionTriggers = screen.getAllByLabelText(/add reaction/i);
      fireEvent.click(reactionTriggers[0]!);

      const fireBtn = await screen.findByTitle(/react with 🔥/i);
      fireEvent.click(fireBtn);

      await waitFor(() => {
        expect(screen.getAllByLabelText(/1 reacted with 🔥/i).length).toBeGreaterThan(0);
      });
    });

    it('supports searching emojis in the full emoji picker', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-1'));

      renderWithProviders(<MessageList />, { store });

      const reactionTriggers = screen.getAllByLabelText(/add reaction/i);
      fireEvent.click(reactionTriggers[0]!);

      const moreBtn = await screen.findByLabelText(/more emojis/i);
      fireEvent.click(moreBtn);

      const searchInput = await screen.findByLabelText(/search emojis/i);
      fireEvent.change(searchInput, { target: { value: 'score' } });

      const hundredBtn = await screen.findByLabelText(/react with 💯/i);
      expect(hundredBtn).toBeInTheDocument();
    });
  });

  /* =========================================================================
   * 12. Group member management
   * ========================================================================= */
  describe('12. Group member management', () => {
    it('opens GroupInfoDrawer displaying group details, member count, and member list', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6')); // #frontend-guild
      store.dispatch(toggleGroupInfoDrawer(true));

      renderWithProviders(<GroupInfoDrawer />, { store });

      expect(screen.getByText('Group Details')).toBeInTheDocument();
      expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
      expect(screen.getByText(/Frontend Architecture, React patterns, Tailwind systems/i)).toBeInTheDocument();
      expect(screen.getByText(/Members \(5\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Elena Rostova/i)).toBeInTheDocument();
    });

    it('displays admin badges and online/offline status for group members', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6'));
      store.dispatch(toggleGroupInfoDrawer(true));

      renderWithProviders(<GroupInfoDrawer />, { store });

      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });

    it('allows admin to open AddMemberModal and view eligible non-member contacts', () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6'));
      store.dispatch(toggleGroupInfoDrawer(true));

      renderWithProviders(
        <div>
          <GroupInfoDrawer />
          <AddMemberModal />
        </div>,
        { store }
      );

      const addMemberBtn = screen.getByRole('button', { name: /Add Member/i });
      fireEvent.click(addMemberBtn);

      expect(screen.getByRole('dialog', { name: /Add Members to #frontend-guild/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search contacts by name or email/i)).toBeInTheDocument();
    });

    it('supports selecting multiple users and adding them to the group', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6'));
      store.dispatch(toggleGroupInfoDrawer(true));

      renderWithProviders(
        <div>
          <GroupInfoDrawer />
          <AddMemberModal />
          <Toast />
        </div>,
        { store }
      );

      // Open Add Member Modal
      fireEvent.click(screen.getByRole('button', { name: /Add Member/i }));

      // Select eligible non-member Maya Lin
      const mayaOption = screen.getByRole('option', { name: /Maya Lin/i });
      fireEvent.click(mayaOption);

      const addBtn = screen.getByRole('button', { name: /Add Selected/i });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText(/Added 1 new member to #frontend-guild/i)).toBeInTheDocument();
        expect(screen.getByText(/Members \(6\)/i)).toBeInTheDocument();
      });
    });

    it('allows admin to remove a member with confirmation dialog', async () => {
      const store = createTestStore();
      store.dispatch(setActiveConversation('conv-6'));
      store.dispatch(toggleGroupInfoDrawer(true));

      renderWithProviders(
        <div>
          <GroupInfoDrawer />
          <Toast />
        </div>,
        { store }
      );

      // Remove Elena Rostova
      const removeBtn = screen.getByLabelText(/Remove Elena Rostova/i);
      fireEvent.click(removeBtn);

      expect(screen.getByText('Remove Elena Rostova?')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /^remove$/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/Removed Elena Rostova from #frontend-guild/i)).toBeInTheDocument();
        expect(screen.getByText(/Members \(4\)/i)).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 13. Theme switching
   * ========================================================================= */
  describe('13. Theme switching', () => {
    it('toggles theme between light and dark in Redux store', () => {
      const store = createTestStore();
      renderWithProviders(<ThemeToggle />, { store });

      const toggleBtn = screen.getByRole('button', { name: /Switch to dark theme/i });
      fireEvent.click(toggleBtn);

      expect(store.getState().ui.theme).toBe('dark');

      fireEvent.click(screen.getByRole('button', { name: /Switch to light theme/i }));
      expect(store.getState().ui.theme).toBe('light');
    });

    it('updates document.documentElement classList with "dark"', () => {
      const store = createTestStore();
      renderWithProviders(<ThemeToggle />, { store });

      const toggleBtn = screen.getByRole('button', { name: /Switch to dark theme/i });
      fireEvent.click(toggleBtn);

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireEvent.click(screen.getByRole('button', { name: /Switch to light theme/i }));
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persists theme preference to localStorage', () => {
      const store = createTestStore();
      renderWithProviders(<ThemeToggle />, { store });

      const toggleBtn = screen.getByRole('button', { name: /Switch to dark theme/i });
      fireEvent.click(toggleBtn);

      expect(localStorage.getItem('qh_chat_theme')).toBe('dark');
    });
  });

  /* =========================================================================
   * 14. Keyboard shortcuts
   * ========================================================================= */
  describe('14. Keyboard shortcuts', () => {
    it('focuses conversation search input when pressing Ctrl+K', () => {
      renderWithProviders(<AppLayout />);

      const searchInput = screen.getByPlaceholderText(/Search conversations, names or messages/i);
      expect(document.activeElement).not.toBe(searchInput);

      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(document.activeElement).toBe(searchInput);
    });

    it('opens message search drawer when pressing "/" while outside inputs', () => {
      const { store } = renderWithProviders(<AppLayout />);

      expect(store.getState().ui.isSearchInChatOpen).toBe(false);

      fireEvent.keyDown(window, { key: '/' });
      expect(store.getState().ui.isSearchInChatOpen).toBe(true);
      expect(screen.getByPlaceholderText(/Search in this conversation/i)).toBeInTheDocument();
    });

    it('opens keyboard shortcuts modal when pressing "?"', () => {
      const { store } = renderWithProviders(<AppLayout />);

      expect(store.getState().ui.isKeyboardShortcutsModalOpen).toBe(false);

      fireEvent.keyDown(window, { key: '?' });
      expect(store.getState().ui.isKeyboardShortcutsModalOpen).toBe(true);
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });

    it('closes active modals/drawers when pressing Escape', () => {
      const store = createTestStore();
      store.dispatch(toggleSearchInChat(true));

      renderWithProviders(<AppLayout />, { store });

      expect(store.getState().ui.isSearchInChatOpen).toBe(true);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(store.getState().ui.isSearchInChatOpen).toBe(false);
    });

    it('cancels active reply when pressing Escape if no modal is open', () => {
      const store = createTestStore();
      store.dispatch(
        setReplyingTo({
          messageId: 'm-1-1',
          senderId: 'user-2',
          senderName: 'Sarah Chen',
          content: 'Quoted test',
        })
      );

      renderWithProviders(<AppLayout />, { store });

      expect(store.getState().messages.replyingTo).not.toBeNull();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(store.getState().messages.replyingTo).toBeNull();
    });
  });
});
