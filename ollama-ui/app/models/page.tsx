import dynamic from "next/dynamic";
import { getAvailableModels, getModelStats } from "@/lib/ollama/server";

const ModelManager = dynamic(
  () => import("@/components/models").then((m) => m.ModelManager),
  {
    loading: () =>
      import("@/components/models").then((m) => <m.ModelBrowserSkeleton />),
  },
);


export default async function Page() {
  const [models, stats] = await Promise.all([
    getAvailableModels(),
    getModelStats(),
  ]);
  return <ModelManager models={models} stats={stats} />;
}
