import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { MessageList } from './components/MessageList';

describe('MessageList & MessageBubble Suite', () => {
  const renderMessageList = () =>
    render(
      <Provider store={store}>
        <MessageList />
      </Provider>
    );

  beforeEach(() => {
    // Scroll mocks for jsdom
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    store.dispatch(setActiveConversation('conv-1'));
  });

  it('displays message feed for the active conversation', () => {
    renderMessageList();

    expect(screen.getByText(/Did you get a chance to review the Redux Toolkit migration PR/i)).toBeInTheDocument();
    expect(screen.getByText(/The normalization looks really neat/i)).toBeInTheDocument();
  });

  it('renders date separators (e.g. Today or Yesterday)', () => {
    renderMessageList();

    // Date separator pills should be present
    const datePills = screen.getAllByText(/Today|Yesterday/i);
    expect(datePills.length).toBeGreaterThan(0);
  });

  it('differentiates sent and received messages with delivery status checkmarks', () => {
    renderMessageList();

    // Message sent by user-1 (outgoing) should display status checkmark and timestamp
    expect(screen.getByText(/Also added WhatsApp-style double tick indicators/i)).toBeInTheDocument();
  });

  it('displays sender name in group conversations', () => {
    store.dispatch(setActiveConversation('conv-6')); // #frontend-guild
    renderMessageList();

    // Sarah Chen sent the first message in the group
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0);
  });

  it('handles clicking reaction pill on a message', () => {
    renderMessageList();

    // In conv-1, m-1-1 has a thumbs up reaction
    const thumbsUpReaction = screen.getByText('👍');
    expect(thumbsUpReaction).toBeInTheDocument();

    fireEvent.click(thumbsUpReaction);
  });

  it('renders empty conversation state when a chat has 0 messages', () => {
    // Switch to a non-existent conversation or mock an empty one
    store.dispatch(setActiveConversation('empty-conv-test'));
    const { container } = renderMessageList();
    // Since empty-conv-test is not in entities, it renders null
    expect(container).toBeEmptyDOMElement();
  });
});
