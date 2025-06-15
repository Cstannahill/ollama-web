"use client";
import { useState } from "react";
import { ModelBrowser } from "./ModelBrowser";
import { DownloadedModels } from "./DownloadedModels";
import type { Model, ModelStats } from "@/types";

interface Props {
  models: Model[];
  stats: ModelStats;
}

export const ModelManager = ({ models, stats }: Props) => {
  const [tab, setTab] = useState<'browse' | 'downloaded'>('browse');
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`${tab === 'browse' ? 'font-semibold border-b-2' : 'text-muted-foreground'}`}
          onClick={() => setTab('browse')}
        >
          Browse Models
        </button>
        <button
          className={`${tab === 'downloaded' ? 'font-semibold border-b-2' : 'text-muted-foreground'}`}
          onClick={() => setTab('downloaded')}
        >
          Downloaded Models
        </button>
      </div>
      {tab === 'browse' ? (
        <ModelBrowser models={models} stats={stats} />
      ) : (
        <DownloadedModels />
      )}
    </div>
  );
};
