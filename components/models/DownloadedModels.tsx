"use client";
import { useState } from "react";
import { ModelCard } from "./ModelCard";
import { Button } from "@/components/ui/button";
import type { Model } from "@/types";

interface Props {
  models: Model[];
}

export const DownloadedModels = ({ models }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No models downloaded yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Browse available models to download and use them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <Button variant="destructive" onClick={() => setSelected([])}>
          Delete Selected ({selected.length})
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
          </div>
        ))}
      </div>
    </div>
  );
};
