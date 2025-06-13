import { ModelCard } from "@/components/models/ModelCard";
import type { Model } from "@/types";

async function getModels(): Promise<Model[]> {
  try {
    const res = await fetch(`${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/tags`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
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
