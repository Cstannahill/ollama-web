import { cache } from "react";
import type { Model, ModelStats, OllamaStatus } from "@/types";
import { OLLAMA_BASE_URL } from "@/lib/config";

const BASE_URL = OLLAMA_BASE_URL;

export const getAvailableModels = cache(async (): Promise<Model[]> => {
  try {
    const res = await fetch(`${BASE_URL}/api/tags`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawModels = Array.isArray(data) ? data : (data.models ?? []); // Map Ollama API response to our Model interface
    return rawModels.map((model: unknown, index: number): Model => {
      const modelData = model as Record<string, unknown>;
      return {
        id: (modelData.name as string) || `model-${index}`, // Use name as id, fallback to index
        name: (modelData.name as string) || `Unknown Model ${index}`,
        description:
          (modelData.description as string) ||
          (modelData.digest as string) ||
          "No description available",
        size: modelData.size ? formatSize(modelData.size as number) : "Unknown",
        performance: (modelData.performance as string) || "Unknown",
        capabilities: (modelData.capabilities as string[]) || [],
      };
    });
  } catch {
    return [];
  }
});

// Helper function to format size from bytes to human readable
function formatSize(bytes: number | string): string {
  if (typeof bytes === "string") return bytes;
  if (typeof bytes !== "number" || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const getModelStats = cache(async (): Promise<ModelStats> => {
  const models = await getAvailableModels();
  return {
    total: models.length,
    downloaded: 0,
    lastUpdated: new Date().toISOString(),
  };
});

export const getOllamaStatus = cache(async (): Promise<OllamaStatus> => {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/tags`, {
      next: { revalidate: 60 },
    });
    const version = res.headers.get("x-ollama-version") || "";
    const data = res.ok ? await res.json() : { models: [] };
    const rawModels = Array.isArray(data) ? data : (data.models ?? []);
    return {
      connected: res.ok,
      version,
      latency: Date.now() - start,
      modelCount: rawModels.length,
      lastChecked: new Date(),
    };
  } catch {
    return {
      connected: false,
      version: "",
      latency: Date.now() - start,
      modelCount: 0,
      lastChecked: new Date(),
    };
  }
});
