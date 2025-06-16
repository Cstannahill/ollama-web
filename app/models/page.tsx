import { getAvailableModels, getPulledModels, getModelStats } from "@/lib/ollama/server";
import { ModelManager } from "@/components/models";

export default async function Page() {
  const [availableModels, pulledModels, stats] = await Promise.all([
    getAvailableModels(),
    getPulledModels(), 
    getModelStats(),
  ]);
  return <ModelManager availableModels={availableModels} pulledModels={pulledModels} stats={stats} />;
}
