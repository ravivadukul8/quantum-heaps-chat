import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Message, MessageReply, MessageStatus, MessageReaction } from '../../types';
import { mockMessagesByConversationId } from '../../mock/messages.mock';
import { messageService, type SendMessagePayload } from '../../services/messageService';
import { updateLastMessage } from '../conversations/conversationsSlice';

export interface MessagesState {
  byConversationId: Record<string, Message[]>;
  replyingTo: MessageReply | null;
  editingMessage: Message | null;
  typingUsers: Record<string, { userId: string; userName: string; timestamp: number }[]>;
  loadingConversations: Record<string, boolean>;
  error: string | null;
}

const initialState: MessagesState = {
  byConversationId: { ...mockMessagesByConversationId },
  replyingTo: null,
  editingMessage: null,
  typingUsers: {},
  loadingConversations: {},
  error: null,
};

export const fetchMessagesThunk = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const messages = await messageService.fetchMessagesByConversationId(conversationId, 150);
      return { conversationId, messages };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  }
);

export const sendMessageThunk = createAsyncThunk(
  'messages/sendMessage',
  async (payload: SendMessagePayload, { dispatch, rejectWithValue }) => {
    try {
      const sentMessage = await messageService.sendMessage(payload, 50);
      // Synchronize last message in conversation list
      dispatch(updateLastMessage(sentMessage));
      return sentMessage;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to send message');
    }
  }
);

export const editMessageThunk = createAsyncThunk(
  'messages/editMessage',
  async (
    payload: { conversationId: string; messageId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const edited = await messageService.editMessage(
        payload.conversationId,
        payload.messageId,
        payload.content,
        50
      );
      if (!edited) throw new Error('Message not found');
      return edited;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to edit message');
    }
  }
);

export const deleteMessageThunk = createAsyncThunk(
  'messages/deleteMessage',
  async (payload: { conversationId: string; messageId: string }, { rejectWithValue }) => {
    try {
      const deleted = await messageService.deleteMessage(
        payload.conversationId,
        payload.messageId,
        50
      );
      if (!deleted) throw new Error('Message not found');
      return deleted;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }
);

export const toggleReactionThunk = createAsyncThunk(
  'messages/toggleReaction',
  async (
    payload: { conversationId: string; messageId: string; emoji: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const updated = await messageService.toggleReaction(
        payload.conversationId,
        payload.messageId,
        payload.emoji,
        payload.userId,
        20
      );
      if (!updated) throw new Error('Message not found');
      return updated;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to toggle reaction');
    }
  }
);

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setReplyingTo: (state, action: PayloadAction<MessageReply | null>) => {
      state.replyingTo = action.payload;
    },
    setEditingMessage: (state, action: PayloadAction<Message | null>) => {
      state.editingMessage = action.payload;
    },
    messageReceived: (state, action: PayloadAction<Message>) => {
      const { conversationId } = action.payload;
      if (!state.byConversationId[conversationId]) {
        state.byConversationId[conversationId] = [];
      }
      state.byConversationId[conversationId]!.push(action.payload);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; status: MessageStatus }>
    ) => {
      const { conversationId, messageId, status } = action.payload;
      const thread = state.byConversationId[conversationId];
      if (thread) {
        const msg = thread.find(m => m.id === messageId);
        if (msg) {
          msg.status = status;
        }
      }
    },
    setTypingIndicator: (
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        userName: string;
        isTyping: boolean;
      }>
    ) => {
      const { conversationId, userId, userName, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        const alreadyTyping = state.typingUsers[conversationId]!.some(u => u.userId === userId);
        if (!alreadyTyping) {
          state.typingUsers[conversationId]!.push({
            userId,
            userName,
            timestamp: Date.now(),
          });
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId]!.filter(
          u => u.userId !== userId
        );
      }
    },
    clearTypingForConversation: (state, action: PayloadAction<string>) => {
      state.typingUsers[action.payload] = [];
    },
    // Instant optimistic reaction toggle for ultra-smooth UI feedback
    optimisticToggleReaction: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        emoji: string;
        userId: string;
      }>
    ) => {
      const { conversationId, messageId, emoji, userId } = action.payload;
      const thread = state.byConversationId[conversationId];
      if (!thread) return;

      const msg = thread.find(m => m.id === messageId);
      if (!msg) return;

      const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);
      if (reactionIndex > -1) {
        const r = msg.reactions[reactionIndex]!;
        if (r.userIds.includes(userId)) {
          r.userIds = r.userIds.filter(id => id !== userId);
          r.count = r.userIds.length;
          if (r.count === 0) {
            msg.reactions.splice(reactionIndex, 1);
          }
        } else {
          r.userIds.push(userId);
          r.count = r.userIds.length;
        }
      } else {
        const newReaction: MessageReaction = {
          emoji,
          userIds: [userId],
          count: 1,
        };
        msg.reactions.push(newReaction);
      }
    },
  },
  extraReducers: builder => {
    builder
      // fetchMessagesThunk
      .addCase(fetchMessagesThunk.pending, (state, action) => {
        state.loadingConversations[action.meta.arg] = true;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.loadingConversations[action.payload.conversationId] = false;
        state.byConversationId[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.loadingConversations[action.meta.arg] = false;
        state.error = (action.payload as string) || 'Failed to fetch messages';
      })
      // sendMessageThunk
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        if (!state.byConversationId[conversationId]) {
          state.byConversationId[conversationId] = [];
        }
        state.byConversationId[conversationId]!.push(action.payload);
        state.replyingTo = null; // Clear reply quote banner on send
      })
      // editMessageThunk
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        const { conversationId, id } = action.payload;
        const thread = state.byConversationId[conversationId];
        if (thread) {
          const index = thread.findIndex(m => m.id === id);
          if (index !== -1) {
            thread[index] = action.payload;
          }
        }
        state.editingMessage = null; // Clear edit mode on finish
      })
      // deleteMessageThunk
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { conversationId, id } = action.payload;
        const thread = state.byConversationId[conversationId];
        if (thread) {
          const index = thread.findIndex(m => m.id === id);
          if (index !== -1) {
            thread[index] = action.payload;
          }
        }
      })
      // toggleReactionThunk
      .addCase(toggleReactionThunk.fulfilled, (state, action) => {
        const { conversationId, id } = action.payload;
        const thread = state.byConversationId[conversationId];
        if (thread) {
          const index = thread.findIndex(m => m.id === id);
          if (index !== -1) {
            thread[index] = action.payload;
          }
        }
      });
  },
});

export const {
  setReplyingTo,
  setEditingMessage,
  messageReceived,
  updateMessageStatus,
  setTypingIndicator,
  clearTypingForConversation,
  optimisticToggleReaction,
} = messagesSlice.actions;

export * from './messagesSelectors';

export default messagesSlice.reducer;
