import dynamic from "next/dynamic";
import { getAvailableModels, getModelStats } from "@/lib/ollama/server";

const ModelBrowser = dynamic(() =>
  import("@/components/models").then((m) => m.ModelBrowser),
);


export default async function Page() {
  const [models, stats] = await Promise.all([getAvailableModels(), getModelStats()]);
  return (
    <div className="p-6">
      <ModelBrowser models={models} stats={stats} />
    </div>
  );
}
