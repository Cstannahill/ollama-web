import { OllamaClient } from "@/lib/ollama/client";
import { ModelCard } from "@/components/models/ModelCard";
import type { Model } from "@/types";

async function getModels(): Promise<Model[]> {
  const client = new OllamaClient({ baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434" });
  return client.listModels();
}

export default async function Page() {
  const models = await getModels();
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {models.map((m) => (
        <ModelCard key={m.id} model={m} onSelect={() => {}} />
      ))}
    </div>
  );
}
