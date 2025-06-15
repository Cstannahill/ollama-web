"use client";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";

// Custom Settings icon
const Settings = ({ className }: { className?: string }) => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const ChatSettings = () => {
  const { chatSettings, updateChatSettings } = useSettingsStore();
  const { mode, setMode } = useChatStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat settings"
      >
        <Settings className="w-4 h-4" aria-hidden />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 p-4 border rounded bg-background shadow-lg z-[60]">
          <label className="text-sm font-medium flex justify-between mb-2">
            Temperature
            <span>{chatSettings.temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={chatSettings.temperature}
            onChange={(e) =>
              updateChatSettings({ temperature: parseFloat(e.target.value) })
            }
            className="w-full"
          />
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "simple" | "agentic")}
              className="border p-1 rounded w-full"
            >
              <option value="simple">simple</option>
              <option value="agentic">agentic</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              System Prompt
            </label>
            <textarea
              value={chatSettings.systemPrompt}
              onChange={(e) =>
                updateChatSettings({ systemPrompt: e.target.value })
              }
              className="border p-1 rounded w-full text-sm"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};
