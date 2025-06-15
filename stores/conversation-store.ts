import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/types";
import { conversationIndexer } from "@/lib/conversation-indexing";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: "simple" | "agentic";
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  pinned?: boolean;
}

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  searchQuery: string;

  // Actions
  createConversation: (mode: "simple" | "agentic") => string;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessageToConversation: (conversationId: string, message: Message) => void;
  duplicateConversation: (id: string) => string;
  togglePin: (id: string) => void;
  setSearchQuery: (query: string) => void;

  // Getters
  getActiveConversation: () => Conversation | null;
  getFilteredConversations: () => Conversation[];
  generateTitle: (messages: Message[]) => string;
  initializeIndex: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      searchQuery: "",

      createConversation: (mode) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        const conversation: Conversation = {
          id,
          title: "New Chat",
          messages: [],
          mode,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));

        // Index the new conversation
        conversationIndexer.indexConversation(conversation);

        return id;
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: Date.now() }
              : conv
          ),
        }));

        // Re-index the updated conversation
        const updatedConv = get().conversations.find((conv) => conv.id === id);
        if (updatedConv) {
          conversationIndexer.indexConversation(updatedConv);
        }
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        }));

        // Remove from index
        conversationIndexer.removeConversation(id);
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessageToConversation: (conversationId, message) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedMessages = [...conv.messages, message];
              return {
                ...conv,
                messages: updatedMessages,
                title:
                  conv.messages.length === 0
                    ? get().generateTitle(updatedMessages)
                    : conv.title,
                updatedAt: Date.now(),
              };
            }
            return conv;
          });

          return { conversations };
        });

        // Re-index the updated conversation
        const updatedConv = get().conversations.find(
          (conv) => conv.id === conversationId
        );
        if (updatedConv) {
          conversationIndexer.indexConversation(updatedConv);
        }
      },

      duplicateConversation: (id) => {
        const original = get().conversations.find((conv) => conv.id === id);
        if (!original) return "";

        const newId = crypto.randomUUID();
        const duplicated: Conversation = {
          ...original,
          id: newId,
          title: `${original.title} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          conversations: [duplicated, ...state.conversations],
          activeConversationId: newId,
        }));

        return newId;
      },

      togglePin: (id) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
          ),
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return (
          conversations.find((conv) => conv.id === activeConversationId) || null
        );
      },

      getFilteredConversations: () => {
        const { conversations, searchQuery } = get();
        if (!searchQuery.trim()) {
          return conversations.sort((a, b) => {
            // Pinned conversations first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then by updated time
            return b.updatedAt - a.updatedAt;
          });
        }

        const query = searchQuery.toLowerCase();
        return conversations
          .filter((conv) => {
            return (
              conv.title.toLowerCase().includes(query) ||
              conv.messages.some((msg) =>
                msg.content.toLowerCase().includes(query)
              ) ||
              conv.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
          })
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      generateTitle: (messages) => {
        const firstUserMessage = messages.find((msg) => msg.role === "user");
        if (firstUserMessage) {
          const content = firstUserMessage.content.trim();
          if (content.length > 50) {
            return content.substring(0, 47) + "...";
          }
          return content;
        }
        return "New Chat";
      },

      initializeIndex: () => {
        const { conversations } = get();
        conversationIndexer.clear();
        conversationIndexer.indexConversations(conversations);
      },
    }),
    {
      name: "conversation-store",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeIndex();
        }
      },
    }
  )
);
