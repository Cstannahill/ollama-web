"use client";
import { ThemeToggle } from "@/components/ui";
import { useSettingsStore } from "@/stores/settings-store";

export default function Page() {
  const {
    setVectorStorePath,
    setEmbeddingModel,
    setRerankingModel,
  } = useSettingsStore();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Vector store path</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          onChange={(e) => setVectorStorePath(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Embedding model</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          onChange={(e) => setEmbeddingModel(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Reranking model</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          onChange={(e) => setRerankingModel(e.target.value)}
        />
      </div>
      <div className="pt-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
