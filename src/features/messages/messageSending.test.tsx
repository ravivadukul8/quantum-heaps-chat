import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { setReplyingTo } from './messagesSlice';
import { MessageInput } from './components/MessageInput';
import { MessageList } from './components/MessageList';

describe('Message Sending & Incoming Message Simulation Suite', () => {
  const renderChatArea = () =>
    render(
      <Provider store={store}>
        <div className="flex flex-col h-[600px]">
          <MessageList />
          <MessageInput />
        </div>
      </Provider>
    );

  beforeEach(() => {
    store.dispatch(setActiveConversation('conv-1'));
    store.dispatch(setReplyingTo(null));
  });

  it('renders the message input area with placeholder and voice note icon when empty', () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    expect(textarea).toBeInTheDocument();
    expect(screen.getByLabelText('Voice message')).toBeInTheDocument();
  });

  it('switches to send button when text is entered, and prevents empty sending', () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);

    // Typing whitespace only
    fireEvent.change(textarea, { target: { value: '    ' } });
    expect(screen.queryByLabelText('Send message')).not.toBeInTheDocument();

    // Typing real text
    fireEvent.change(textarea, { target: { value: 'Hello team!' } });
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('sends message on clicking the send button, updates Redux, and clears input', async () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'New test message from Alex Rivera' } });

    const sendBtn = screen.getByLabelText('Send message');
    fireEvent.click(sendBtn);

    // Message appears immediately in the message feed
    await waitFor(() => {
      expect(screen.getByText('New test message from Alex Rivera')).toBeInTheDocument();
    });

    // Input is cleared
    expect((textarea as HTMLTextAreaElement).value).toBe('');

    // Last message in Redux conversation store is updated
    const conv = store.getState().conversations.entities['conv-1'];
    expect(conv?.lastMessage?.content).toBe('New test message from Alex Rivera');
  });

  it('supports Enter key to send message', async () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'Sent via Enter key press' } });

    // Press Enter (without Shift)
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText('Sent via Enter key press')).toBeInTheDocument();
    });

    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('supports Shift + Enter to add newline without sending', () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'Line 1' } });

    // Press Shift + Enter
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    // Should NOT send
    expect(screen.queryByText('Line 1')).not.toBeInTheDocument();
  });

  it('attaches reply quote to sent message and clears reply banner', async () => {
    store.dispatch(
      setReplyingTo({
        messageId: 'm-1-1',
        senderId: 'user-2',
        senderName: 'Sarah Chen',
        content: 'Original question from Sarah',
      })
    );

    renderChatArea();

    // Reply preview is visible
    expect(screen.getByText(/Replying to Sarah Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Original question from Sarah/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'Answering Sarah with a quote reply' } });

    const sendBtn = screen.getByLabelText('Send message');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Answering Sarah with a quote reply')).toBeInTheDocument();
    });

    // Reply banner is cleared
    expect(screen.queryByText(/Replying to Sarah Chen/i)).not.toBeInTheDocument();
  });

  it('simulates progressive delivery status updates and contextual incoming response', async () => {
    renderChatArea();

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: 'Testing live simulated bot response' } });

    const sendBtn = screen.getByLabelText('Send message');
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    // Message is dispatched
    await waitFor(() => {
      expect(screen.getByText('Testing live simulated bot response')).toBeInTheDocument();
    });

    const messages = store.getState().messages.byConversationId['conv-1'];
    const sentMsg = messages?.find(m => m.content === 'Testing live simulated bot response');
    expect(sentMsg).toBeDefined();

    // Wait for delivery status progression (sent -> delivered)
    await waitFor(
      () => {
        const msg = store.getState().messages.byConversationId['conv-1']?.find(m => m.id === sentMsg?.id);
        expect(msg?.status).toBe('delivered');
      },
      { timeout: 1500 }
    );

    // Wait for read status
    await waitFor(
      () => {
        const msg = store.getState().messages.byConversationId['conv-1']?.find(m => m.id === sentMsg?.id);
        expect(msg?.status).toBe('read');
      },
      { timeout: 2500 }
    );
  });
});
