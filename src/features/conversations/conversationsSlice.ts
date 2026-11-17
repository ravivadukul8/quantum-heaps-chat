import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Conversation,
  ConversationFilter,
  Message,
  MessageStatus,
  GroupMember,
  GroupConversation,
} from '../../types';
import { isGroupConversation } from '../../types';
import { mockConversations } from '../../mock/conversations.mock';
import { conversationService } from '../../services/conversationService';
import { storageService } from '../../services/storageService';

export interface ConversationsState {
  entities: Record<string, Conversation>;
  ids: string[];
  activeConversationId: string | null;
  filter: ConversationFilter;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Hydrate from LocalStorage if available, fallback to mockConversations
const savedConversations = storageService.getSavedConversations();
const initialData: Conversation[] = savedConversations ?? mockConversations;

const initialEntities: Record<string, Conversation> = initialData.reduce((acc, conv) => {
  acc[conv.id] = conv;
  return acc;
}, {} as Record<string, Conversation>);

const initialIds: string[] = initialData.map(c => c.id);
const savedActiveId = storageService.getActiveConversationId();
const initialActiveId =
  savedActiveId && initialEntities[savedActiveId] ? savedActiveId : (initialIds[0] ?? null);

const initialState: ConversationsState = {
  entities: initialEntities,
  ids: initialIds,
  activeConversationId: initialActiveId,
  filter: 'all',
  searchQuery: '',
  loading: false,
  error: null,
};

export const fetchConversationsThunk = createAsyncThunk(
  'conversations/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await conversationService.fetchConversations(200);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch conversations');
    }
  }
);

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      storageService.setActiveConversationId(action.payload);

      // Auto-clear unread count when opening a conversation
      if (action.payload && state.entities[action.payload]) {
        state.entities[action.payload]!.unreadCount = 0;
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    setFilter: (state, action: PayloadAction<ConversationFilter>) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const conv = state.entities[action.payload];
      if (conv) {
        conv.unreadCount = 0;
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    updateLastMessage: (
      state,
      action: PayloadAction<Message | { message: Message; currentUserId?: string }>
    ) => {
      const message = 'message' in action.payload ? action.payload.message : action.payload;
      const currentUserId =
        'currentUserId' in action.payload ? action.payload.currentUserId : undefined;
      const { conversationId } = message;
      const conv = state.entities[conversationId];

      if (conv) {
        conv.lastMessage = message;
        conv.updatedAt = message.timestamp;

        // If message is from someone else and this conversation is NOT currently active, increment unread
        const isFromOther = currentUserId
          ? message.senderId !== currentUserId
          : message.senderId !== 'user-1';

        if (isFromOther && state.activeConversationId !== conversationId) {
          conv.unreadCount += 1;
        }

        // Reorder ids: move this conversation to the top
        state.ids = [conversationId, ...state.ids.filter(id => id !== conversationId)];
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    togglePinConversation: (state, action: PayloadAction<string>) => {
      const conv = state.entities[action.payload];
      if (conv) {
        conv.isPinned = !conv.isPinned;
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    toggleMuteConversation: (state, action: PayloadAction<string>) => {
      const conv = state.entities[action.payload];
      if (conv) {
        conv.isMuted = !conv.isMuted;
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    updateConversationLastMessageStatus: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; status: MessageStatus }>
    ) => {
      const conv = state.entities[action.payload.conversationId];
      if (conv && conv.lastMessage && conv.lastMessage.id === action.payload.messageId) {
        conv.lastMessage.status = action.payload.status;
        storageService.saveConversations(Object.values(state.entities));
      }
    },
    setDraft: (state, action: PayloadAction<{ conversationId: string; draft: string }>) => {
      const conv = state.entities[action.payload.conversationId];
      if (conv) {
        conv.draft = action.payload.draft;
      }
    },
    createGroup: (
      state,
      action: PayloadAction<{
        name: string;
        description?: string;
        avatarUrl?: string;
        memberIds: string[];
        creatorId: string;
      }>
    ) => {
      const newGroupId = `group-${Date.now()}`;
      const now = new Date().toISOString();

      const members: GroupMember[] = action.payload.memberIds.map(userId => ({
        userId,
        role: userId === action.payload.creatorId ? 'admin' : 'member',
        joinedAt: now,
      }));

      const newGroup: GroupConversation = {
        id: newGroupId,
        type: 'group',
        name: action.payload.name,
        description: action.payload.description,
        avatarUrl:
          action.payload.avatarUrl ||
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
        members,
        adminIds: [action.payload.creatorId],
        createdBy: action.payload.creatorId,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        isMuted: false,
      };

      state.entities[newGroupId] = newGroup;
      state.ids = [newGroupId, ...state.ids];
      state.activeConversationId = newGroupId;
      storageService.saveConversations(Object.values(state.entities));
      storageService.setActiveConversationId(newGroupId);
    },
    addGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
    ) => {
      const conv = state.entities[action.payload.groupId];
      if (conv && isGroupConversation(conv)) {
        const exists = conv.members.some(m => m.userId === action.payload.member.userId);
        if (!exists) {
          conv.members.push(action.payload.member);
          storageService.saveConversations(Object.values(state.entities));
        }
      }
    },
    removeGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; userId: string }>
    ) => {
      const conv = state.entities[action.payload.groupId];
      if (conv && isGroupConversation(conv)) {
        conv.members = conv.members.filter(m => m.userId !== action.payload.userId);
        conv.adminIds = conv.adminIds.filter(id => id !== action.payload.userId);
        storageService.saveConversations(Object.values(state.entities));
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConversationsThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const newEntities: Record<string, Conversation> = {};
        const newIds: string[] = [];

        action.payload.forEach(conv => {
          newEntities[conv.id] = conv;
          newIds.push(conv.id);
        });

        state.entities = newEntities;
        state.ids = newIds;
        storageService.saveConversations(action.payload);
      })
      .addCase(fetchConversationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch conversations';
      });
  },
});

export const {
  setActiveConversation,
  setFilter,
  setSearchQuery,
  markAsRead,
  updateLastMessage,
  togglePinConversation,
  toggleMuteConversation,
  setDraft,
  createGroup,
  addGroupMember,
  removeGroupMember,
  updateConversationLastMessageStatus,
} = conversationsSlice.actions;

export * from './conversationsSelectors';

export default conversationsSlice.reducer;
