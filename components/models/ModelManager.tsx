"use client";
import { useState } from "react";
import { ModelBrowser } from "./ModelBrowser";
import { DownloadedModels } from "./DownloadedModels";
import type { Model, ModelStats } from "@/types";

interface Props {
  availableModels: Model[];
  pulledModels: Model[];
  stats: ModelStats;
}

export const ModelManager = ({ availableModels, pulledModels, stats }: Props) => {
  const [tab, setTab] = useState<'browse' | 'downloaded'>('downloaded');
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`${tab === 'downloaded' ? 'font-semibold border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setTab('downloaded')}
        >
          Downloaded ({pulledModels.length})
        </button>
        <button
          className={`${tab === 'browse' ? 'font-semibold border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setTab('browse')}
        >
          Available ({availableModels.length})
        </button>
      </div>
      {tab === 'downloaded' ? (
        <DownloadedModels models={pulledModels} />
      ) : (
        <ModelBrowser models={availableModels} stats={stats} />
      )}
    </div>
  );
};
