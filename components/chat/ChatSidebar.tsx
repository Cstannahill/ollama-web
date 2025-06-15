"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useConversationStore,
  type Conversation,
} from "@/stores/conversation-store";
import { useChatStore } from "@/stores/chat-store";
import { ConversationSearch } from "./ConversationSearch";
import { ConversationAnalytics } from "./ConversationAnalytics";
import { ConversationExport } from "./ConversationExport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Custom icons
const Plus = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const Pin = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const Brain = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const MoreVertical = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const Trash = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const Copy = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
}

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onTogglePin,
}: ConversationItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleSelect = () => {
    onSelect();
    router.push(`/chat/${conversation.id}`);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
        isActive && "bg-muted"
      )}
      onClick={handleSelect}
    >
      <div className="flex-shrink-0">
        {conversation.mode === "agentic" ? (
          <Brain className="w-4 h-4 text-primary" />
        ) : (
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium truncate">{conversation.title}</h3>
          {conversation.pinned && (
            <Pin className="w-3 h-3 text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(conversation.updatedAt)}
          </span>
          <Badge
            variant={conversation.mode === "agentic" ? "default" : "secondary"}
            className="text-xs"
          >
            {conversation.mode}
          </Badge>
        </div>
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-10 w-48 bg-background border rounded-md shadow-lg py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                  setShowMenu(false);
                }}
              >
                <Pin className="w-4 h-4" />
                {conversation.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                  setShowMenu(false);
                }}
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatSidebar = () => {
  const router = useRouter();
  const {
    conversations,
    activeConversationId,
    searchQuery,
    createConversation,
    deleteConversation,
    setActiveConversation,
    duplicateConversation,
    togglePin,
    getFilteredConversations,
  } = useConversationStore();

  const { mode } = useChatStore();
  const filteredConversations = getFilteredConversations();

  const handleNewChat = () => {
    const newId = createConversation(mode);
    setActiveConversation(newId);
    router.push(`/chat/${newId}`);
  };

  return (
    <div className="w-80 h-full bg-background border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Enhanced Search */}
        <ConversationSearch />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium mb-2">No conversations</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery
                ? "No conversations match your search."
                : "Start a new conversation to get started."}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewChat} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onSelect={() => setActiveConversation(conversation.id)}
                onDelete={() => deleteConversation(conversation.id)}
                onDuplicate={() => {
                  const newId = duplicateConversation(conversation.id);
                  router.push(`/chat/${newId}`);
                }}
                onTogglePin={() => togglePin(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t space-y-2">
        <ConversationAnalytics />
        <ConversationExport />
        <div className="text-xs text-muted-foreground text-center">
          {conversations.length} conversation
          {conversations.length !== 1 ? "s" : ""}
          {searchQuery && ` • ${filteredConversations.length} shown`}
        </div>
      </div>
    </div>
  );
};
