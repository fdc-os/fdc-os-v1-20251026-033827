import { create } from 'zustand';
import { ChatMessage } from '@shared/types';
import { api } from './api-client';
interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  toggleChat: () => void;
  fetchMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<ChatMessage | null>;
}
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  loading: false,
  error: null,
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      const messages = await api<ChatMessage[]>('/api/chat/messages');
      set({ messages, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ loading: false, error: errorMessage });
    }
  },
  sendMessage: async (text: string) => {
    try {
      const newMessage = await api<ChatMessage>('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
      return newMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: errorMessage });
      return null;
    }
  },
}));