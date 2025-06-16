import { cache } from "react";
import type { Model, ModelStats, OllamaStatus } from "@/types";
import { OLLAMA_BASE_URL } from "@/lib/config";

const BASE_URL = OLLAMA_BASE_URL;

// Get locally pulled/downloaded models
export const getPulledModels = cache(async (): Promise<Model[]> => {
  try {
    const res = await fetch(`${BASE_URL}/api/tags`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawModels = Array.isArray(data) ? data : (data.models ?? []); 
    
    return rawModels.map((model: unknown, index: number): Model => {
      const modelData = model as Record<string, unknown>;
      return {
        id: (modelData.name as string) || `model-${index}`,
        name: (modelData.name as string) || `Unknown Model ${index}`,
        description:
          (modelData.description as string) ||
          (modelData.digest as string) ||
          "No description available",
        size: modelData.size ? formatSize(modelData.size as number) : "Unknown",
        performance: (modelData.performance as string) || "Unknown",
        capabilities: (modelData.capabilities as string[]) || [],
        isDownloaded: true,
      };
    });
  } catch {
    return [];
  }
});

// Get available models from registry (excluding already pulled ones)
export const getAvailableModels = cache(async (): Promise<Model[]> => {
  try {
    // Get pulled models first
    const pulledModels = await getPulledModels();
    const pulledModelNames = new Set(pulledModels.map(m => m.name));
    
    // This would typically fetch from Ollama's registry
    // For now, return a curated list of popular models
    const registryModels: Model[] = [
      {
        id: "llama3.2",
        name: "llama3.2",
        description: "Meta's latest Llama model with improved reasoning",
        size: "2.0 GB",
        performance: "Fast",
        capabilities: ["chat", "code", "reasoning"],
        isDownloaded: false,
      },
      {
        id: "qwen2.5",
        name: "qwen2.5",
        description: "Alibaba's multilingual model",
        size: "4.7 GB", 
        performance: "Medium",
        capabilities: ["chat", "multilingual", "code"],
        isDownloaded: false,
      },
      {
        id: "phi3",
        name: "phi3",
        description: "Microsoft's small language model",
        size: "2.3 GB",
        performance: "Fast",
        capabilities: ["chat", "reasoning"],
        isDownloaded: false,
      },
      {
        id: "codellama",
        name: "codellama",
        description: "Code generation specialist",
        size: "7.0 GB",
        performance: "Medium",
        capabilities: ["code", "completion"],
        isDownloaded: false,
      },
      {
        id: "mistral",
        name: "mistral",
        description: "Fast and efficient general purpose model",
        size: "4.1 GB",
        performance: "Fast",
        capabilities: ["chat", "reasoning"],
        isDownloaded: false,
      },
      {
        id: "gemma2",
        name: "gemma2",
        description: "Google's open model family",
        size: "5.5 GB",
        performance: "Medium",
        capabilities: ["chat", "reasoning"],
        isDownloaded: false,
      },
    ];
    
    // Filter out already pulled models
    return registryModels.filter(model => !pulledModelNames.has(model.name));
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
  const pulledModels = await getPulledModels();
  return {
    total: pulledModels.length,
    downloaded: pulledModels.length,
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
