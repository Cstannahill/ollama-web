"use client";

import { useState } from "react";
import {
  useConversationStore,
  type Conversation,
} from "@/stores/conversation-store";
import type { Message } from "@/types";
import { conversationIndexer } from "@/lib/conversation-indexing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom icons
const Download = ({ className }: { className?: string }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

type ExportFormat = "markdown" | "json" | "txt" | "csv";
type ExportScope = "all" | "active" | "filtered";

export const ConversationExport = () => {
  const { conversations, getActiveConversation, getFilteredConversations } =
    useConversationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [scope, setScope] = useState<ExportScope>("all");
  const [includeTags, setIncludeTags] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeStats, setIncludeStats] = useState(false);
  const [filename, setFilename] = useState("");

  const formatConversationToMarkdown = (conv: Conversation): string => {
    let content = `# ${conv.title}\n\n`;

    if (includeMetadata) {
      content += `**Mode:** ${conv.mode}\n`;
      content += `**Created:** ${new Date(conv.createdAt).toLocaleString()}\n`;
      content += `**Updated:** ${new Date(conv.updatedAt).toLocaleString()}\n`;
      content += `**Messages:** ${conv.messages.length}\n`;

      if (conv.tags && conv.tags.length > 0 && includeTags) {
        content += `**Tags:** ${conv.tags.join(", ")}\n`;
      }

      content += "\n---\n\n";
    }

    conv.messages.forEach((message: Message, index: number) => {
      const role = message.role === "user" ? "👤 You" : "🤖 Assistant";
      content += `## ${role}\n\n`;
      content += `${message.content}\n\n`;

      if (index < conv.messages.length - 1) {
        content += "---\n\n";
      }
    });

    return content;
  };

  const formatConversationToText = (conv: Conversation): string => {
    let content = `${conv.title}\n${"=".repeat(conv.title.length)}\n\n`;

    if (includeMetadata) {
      content += `Mode: ${conv.mode}\n`;
      content += `Created: ${new Date(conv.createdAt).toLocaleString()}\n`;
      content += `Updated: ${new Date(conv.updatedAt).toLocaleString()}\n`;
      content += `Messages: ${conv.messages.length}\n`;

      if (conv.tags && conv.tags.length > 0 && includeTags) {
        content += `Tags: ${conv.tags.join(", ")}\n`;
      }

      content += "\n";
    }

    conv.messages.forEach((message: Message) => {
      const role = message.role === "user" ? "You" : "Assistant";
      content += `[${role}]\n`;
      content += `${message.content}\n\n`;
    });

    return content;
  };

  const formatConversationToCSV = (conversations: Conversation[]): string => {
    const headers = [
      "Conversation ID",
      "Title",
      "Mode",
      "Created",
      "Updated",
      "Message Count",
      "Tags",
      "Message Role",
      "Message Content",
      "Message Index",
    ];

    let csv = headers.join(",") + "\n";

    conversations.forEach((conv) => {
      const baseLine = [
        `"${conv.id}"`,
        `"${conv.title.replace(/"/g, '""')}"`,
        `"${conv.mode}"`,
        `"${new Date(conv.createdAt).toISOString()}"`,
        `"${new Date(conv.updatedAt).toISOString()}"`,
        conv.messages.length,
        `"${(conv.tags || []).join("; ")}"`,
      ];

      if (conv.messages.length === 0) {
        csv += baseLine.join(",") + ',"","",0\n';
      } else {
        conv.messages.forEach((message: Message, index: number) => {
          const line = [
            ...baseLine,
            `"${message.role}"`,
            `"${message.content.replace(/"/g, '""')}"`,
            index,
          ];
          csv += line.join(",") + "\n";
        });
      }
    });

    return csv;
  };

  const getConversationsToExport = () => {
    switch (scope) {
      case "active":
        const active = getActiveConversation();
        return active ? [active] : [];
      case "filtered":
        return getFilteredConversations();
      default:
        return conversations;
    }
  };

  const generateFilename = (): string => {
    if (filename.trim()) return filename;

    const date = new Date().toISOString().split("T")[0];
    const scopeText = scope === "all" ? "all" : scope;
    return `conversations-${scopeText}-${date}`;
  };

  const handleExport = () => {
    const conversationsToExport = getConversationsToExport();
    if (conversationsToExport.length === 0) {
      alert("No conversations to export");
      return;
    }

    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    switch (format) {
      case "markdown":
        content = conversationsToExport
          .map(formatConversationToMarkdown)
          .join("\n\n" + "=".repeat(50) + "\n\n");
        mimeType = "text/markdown";
        extension = "md";
        break;
      case "json":
        const exportData = {
          exported_at: new Date().toISOString(),
          format: "ollama-web-conversations",
          version: "1.0",
          conversations: conversationsToExport,
          ...(includeStats && {
            stats: conversationIndexer.getStats(),
          }),
        };
        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        extension = "json";
        break;
      case "txt":
        content = conversationsToExport
          .map(formatConversationToText)
          .join("\n" + "=".repeat(50) + "\n\n");
        break;
      case "csv":
        content = formatConversationToCSV(conversationsToExport);
        mimeType = "text/csv";
        extension = "csv";
        break;
    }

    // Add summary header for multi-conversation exports
    if (
      conversationsToExport.length > 1 &&
      format !== "csv" &&
      format !== "json"
    ) {
      const summary =
        `# Conversation Export Summary\n\n` +
        `**Export Date:** ${new Date().toLocaleString()}\n` +
        `**Format:** ${format.toUpperCase()}\n` +
        `**Scope:** ${scope}\n` +
        `**Conversations:** ${conversationsToExport.length}\n` +
        `**Total Messages:** ${conversationsToExport.reduce((sum, conv) => sum + conv.messages.length, 0)}\n\n` +
        "---\n\n";
      content = summary + content;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generateFilename()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Conversations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: string) =>
                setFormat(value as ExportFormat)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">Markdown (.md)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON (.json)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt">Plain Text (.txt)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (.csv)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Scope Selection */}
          <div>
            <Label className="text-sm font-medium">Export Scope</Label>
            <Select
              value={scope}
              onValueChange={(value: string) => setScope(value as ExportScope)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Conversations ({conversations.length})
                </SelectItem>
                <SelectItem value="active">Active Conversation Only</SelectItem>
                <SelectItem value="filtered">
                  Filtered Results ({getFilteredConversations().length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Include Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked: boolean) =>
                    setIncludeMetadata(checked === true)
                  }
                />
                <Label htmlFor="metadata" className="text-sm">
                  Metadata (dates, mode, message count)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tags"
                  checked={includeTags}
                  onCheckedChange={(checked: boolean) =>
                    setIncludeTags(checked === true)
                  }
                />
                <Label htmlFor="tags" className="text-sm">
                  Tags
                </Label>
              </div>
              {format === "json" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stats"
                    checked={includeStats}
                    onCheckedChange={(checked: boolean) =>
                      setIncludeStats(checked === true)
                    }
                  />
                  <Label htmlFor="stats" className="text-sm">
                    Analytics & Statistics
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Custom Filename */}
          <div>
            <Label htmlFor="filename" className="text-sm font-medium">
              Filename (optional)
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={generateFilename()}
            />
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Export {getConversationsToExport().length} Conversation
            {getConversationsToExport().length !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
