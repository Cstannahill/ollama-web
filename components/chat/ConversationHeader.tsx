"use client";

import { useState } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Custom icons
const Edit = ({ className }: { className?: string }) => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
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
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const Tag = ({ className }: { className?: string }) => (
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
      d="M7 7h.01M7 3h5l5.586 5.586a2 2 0 010 2.828l-5.586 5.586a2 2 0 01-2.828 0L3.586 11.414A2 2 0 013 9.586V4a1 1 0 011-1z"
    />
  </svg>
);

export const ConversationHeader = () => {
  const { getActiveConversation, updateConversation } = useConversationStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tempTag, setTempTag] = useState("");

  const activeConversation = getActiveConversation();

  if (!activeConversation) {
    return null;
  }

  const handleStartEditTitle = () => {
    setTempTitle(activeConversation.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      updateConversation(activeConversation.id, { title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
    setTempTitle("");
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setTempTitle("");
  };

  const handleAddTag = () => {
    if (tempTag.trim()) {
      const currentTags = activeConversation.tags || [];
      const newTags = [...currentTags, tempTag.trim()];
      updateConversation(activeConversation.id, { tags: newTags });
    }
    setIsAddingTag(false);
    setTempTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = activeConversation.tags || [];
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    updateConversation(activeConversation.id, { tags: newTags });
  };

  return (
    <div className="p-4 border-b bg-background">
      {/* Title Section */}
      <div className="flex items-center gap-2 mb-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelEditTitle();
              }}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEditTitle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 group">
            <h1 className="text-lg font-semibold flex-1">
              {activeConversation.title}
            </h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEditTitle}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-muted-foreground" />
        {activeConversation.tags?.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleRemoveTag(tag)}
          >
            {tag}
          </Badge>
        ))}

        {isAddingTag ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempTag}
              onChange={(e) => setTempTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTag();
                if (e.key === "Escape") {
                  setIsAddingTag(false);
                  setTempTag("");
                }
              }}
              placeholder="Add tag..."
              className="w-24 h-6 text-xs"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleAddTag}>
              <Check className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddingTag(true)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            + Add Tag
          </Button>
        )}
      </div>

      {/* Conversation Stats */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span>{activeConversation.messages.length} messages</span>
        <span>Mode: {activeConversation.mode}</span>
        <span>
          {new Date(activeConversation.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
