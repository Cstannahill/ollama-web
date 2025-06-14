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
    return Array.isArray(data) ? data : data.models ?? [];
  } catch {
    return [];
  }
});

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
    const models = Array.isArray(data) ? data : data.models ?? [];
    return {
      connected: res.ok,
      version,
      latency: Date.now() - start,
      modelCount: models.length,
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
