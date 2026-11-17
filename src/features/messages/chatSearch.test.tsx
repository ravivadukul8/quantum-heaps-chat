import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import {
  toggleSearchInChat,
  toggleKeyboardShortcutsModal,
} from '../settings/uiSlice';
import { ChatSearchDrawer } from './components/ChatSearchDrawer';
import { KeyboardShortcutsModal } from '../../components/layout/KeyboardShortcutsModal';

describe('Chat Search Drawer & Keyboard Shortcuts Modal Suite', () => {
  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(toggleSearchInChat(false));
    store.dispatch(toggleKeyboardShortcutsModal(false));
  });

  describe('ChatSearchDrawer', () => {
    const renderDrawer = () =>
      render(
        <Provider store={store}>
          <ChatSearchDrawer />
        </Provider>
      );

    it('renders empty search state when query is blank', () => {
      store.dispatch(toggleSearchInChat(true));
      renderDrawer();

      expect(screen.getByText('Search Messages')).toBeInTheDocument();
      expect(
        screen.getByText(/search for words, phrases, or code snippets in this chat/i)
      ).toBeInTheDocument();
    });

    it('filters messages by case-insensitive query and displays matching snippets', () => {
      store.dispatch(toggleSearchInChat(true));
      renderDrawer();

      const searchInput = screen.getByPlaceholderText(/search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'redux' } });

      expect(screen.getByText(/message.*found/i)).toBeInTheDocument();
      expect(screen.getByText(/migration PR for the chat store/i)).toBeInTheDocument();
    });

    it('displays empty state when no messages match the search query', () => {
      store.dispatch(toggleSearchInChat(true));
      renderDrawer();

      const searchInput = screen.getByPlaceholderText(/search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistentkeyword12345' } });

      expect(screen.getByText(/no matching messages found/i)).toBeInTheDocument();
    });

    it('clears query when clicking the clear icon button', () => {
      store.dispatch(toggleSearchInChat(true));
      renderDrawer();

      const searchInput = screen.getByPlaceholderText(/search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'redux' } });

      const clearBtn = screen.getByLabelText(/clear search query/i);
      fireEvent.click(clearBtn);

      expect(searchInput).toHaveValue('');
    });

    it('scrolls to matching message when a result is clicked', () => {
      store.dispatch(toggleSearchInChat(true));
      renderDrawer();

      // Mock DOM element for message anchor
      const mockScrollIntoView = vi.fn();
      const mockElem = document.createElement('div');
      mockElem.id = 'msg-m-1-1';
      mockElem.scrollIntoView = mockScrollIntoView;
      document.body.appendChild(mockElem);

      const searchInput = screen.getByPlaceholderText(/search in this conversation/i);
      fireEvent.change(searchInput, { target: { value: 'redux' } });

      const resultItem = screen.getByText(/migration PR for the chat store/i);
      fireEvent.click(resultItem);

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });

      document.body.removeChild(mockElem);
    });
  });

  describe('KeyboardShortcutsModal', () => {
    const renderModal = () =>
      render(
        <Provider store={store}>
          <KeyboardShortcutsModal />
        </Provider>
      );

    it('renders shortcuts list when opened', () => {
      store.dispatch(toggleKeyboardShortcutsModal(true));
      renderModal();

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText(/focus conversation search/i)).toBeInTheDocument();
      expect(screen.getByText(/search messages in current chat/i)).toBeInTheDocument();
      expect(screen.getByText(/add new line without sending/i)).toBeInTheDocument();
    });

    it('closes modal when clicking close or Done button', async () => {
      store.dispatch(toggleKeyboardShortcutsModal(true));
      renderModal();

      const doneBtn = screen.getByRole('button', { name: /done/i });
      fireEvent.click(doneBtn);

      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
      });
    });
  });
});
