import { ModelBrowser } from "@/components/models";
import { getAvailableModels, getModelStats } from "@/lib/ollama/server";
=======
import dynamic from "next/dynamic";
const ModelBrowser = dynamic(() =>
  import("@/components/models").then((m) => m.ModelBrowser),
);
import type { Model } from "@/types";

async function getModels(): Promise<Model[]> {
  try {
    const res = await fetch(
      `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/tags`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}


export default async function Page() {
  const [models, stats] = await Promise.all([getAvailableModels(), getModelStats()]);
  return (
    <div className="p-6">
      <ModelBrowser models={models} stats={stats} />
    </div>
  );
}
