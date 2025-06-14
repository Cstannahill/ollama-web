"use client";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";

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
        <SettingsIcon className="w-4 h-4" aria-hidden />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 p-4 border rounded bg-background shadow">
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
