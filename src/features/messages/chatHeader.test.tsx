import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { setTypingIndicator, clearTypingForConversation } from './messagesSlice';
import { ChatHeader } from './components/ChatHeader';

describe('ChatHeader Component Suite', () => {
  const renderHeader = () =>
    render(
      <Provider store={store}>
        <ChatHeader />
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(clearTypingForConversation('conv-1'));
    store.dispatch(clearTypingForConversation('conv-6'));
  });

  it('renders selected contact profile picture, username, and online status for direct chat', () => {
    store.dispatch(setActiveConversation('conv-1')); // Sarah Chen
    renderHeader();

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders group name and member count for group chat', () => {
    store.dispatch(setActiveConversation('conv-6')); // #frontend-guild
    renderHeader();

    expect(screen.getByText('#frontend-guild')).toBeInTheDocument();
    expect(screen.getByText(/5 members/i)).toBeInTheDocument();
  });

  it('displays typing indicator status when participant is actively typing', () => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(
      setTypingIndicator({
        conversationId: 'conv-1',
        userId: 'user-2',
        userName: 'Sarah Chen',
        isTyping: true,
      })
    );

    renderHeader();
    expect(screen.getByText('typing...')).toBeInTheDocument();
  });

  it('displays group member typing indicator with name', () => {
    store.dispatch(setActiveConversation('conv-6'));
    store.dispatch(
      setTypingIndicator({
        conversationId: 'conv-6',
        userId: 'user-2',
        userName: 'Sarah Chen',
        isTyping: true,
      })
    );

    renderHeader();
    expect(screen.getByText('Sarah is typing...')).toBeInTheDocument();
  });

  it('triggers search messages action when search button is clicked', () => {
    renderHeader();
    const searchBtn = screen.getByLabelText(/Search messages in this chat/i);
    fireEvent.click(searchBtn);

    expect(store.getState().ui.isSearchInChatOpen).toBe(true);
  });

  it('triggers group/contact info drawer action when info button is clicked', () => {
    renderHeader();
    const infoBtn = screen.getByLabelText(/Contact info|Group information/i);
    fireEvent.click(infoBtn);

    expect(store.getState().groups.isGroupInfoDrawerOpen).toBe(true);
  });

  it('triggers mobile back navigation when back button is clicked', () => {
    renderHeader();
    const backBtn = screen.getByLabelText(/Back to conversations list/i);
    fireEvent.click(backBtn);

    expect(store.getState().ui.mobilePane).toBe('sidebar');
  });
});
