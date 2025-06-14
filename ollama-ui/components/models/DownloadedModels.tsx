"use client";
import { useState } from "react";
import { useModelStore } from "@/stores/model-store";
import { ModelCard } from "./ModelCard";
import { Button } from "@/components/ui/button";

export const DownloadedModels = () => {
  const { available, downloaded, deleteModels, usage } = useModelStore();
  const [selected, setSelected] = useState<string[]>([]);
  const models = available.filter((m) => downloaded.includes(m.id));

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <Button onClick={() => { deleteModels(selected); setSelected([]); }}>
          Delete Selected
        </Button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {models.map((m) => (
          <div key={m.id} className="relative">
            <input
              type="checkbox"
              className="absolute top-2 left-2 z-10"
              checked={selected.includes(m.id)}
              onChange={() => toggle(m.id)}
              aria-label="Select model"
            />
            <ModelCard
              model={m}
              onSelect={() => window.location.assign('/chat/new')}
              isDownloaded
            />
            {usage[m.id] && (
              <div className="absolute bottom-2 right-2 text-xs bg-black/50 px-1 rounded">
                {usage[m.id].uses} uses
                {usage[m.id].lastUsed && ` · ${new Date(usage[m.id].lastUsed as string).toLocaleDateString()}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
