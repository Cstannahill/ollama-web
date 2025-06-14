import { ModelBrowser } from "@/components/models";
import { getAvailableModels, getModelStats } from "@/lib/ollama/server";

export default async function Page() {
  const [models, stats] = await Promise.all([getAvailableModels(), getModelStats()]);
  return (
    <div className="p-6">
      <ModelBrowser models={models} stats={stats} />
    </div>
  );
}
