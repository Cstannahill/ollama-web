"use client";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";

export const ChatSettings = () => {
  const { chatSettings, updateChatSettings } = useSettingsStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" size="icon" onClick={() => setOpen((o) => !o)}>
        <SettingsIcon className="w-4 h-4" />
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
        </div>
      )}
    </div>
  );
};
