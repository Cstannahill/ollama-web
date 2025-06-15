"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OllamaClient } from "@/lib/ollama/client";
import { OLLAMA_BASE_URL } from "@/lib/config";

// Custom icons
const Settings = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const EnhancedChatSettings = () => {
  const {
    chatSettings,
    updateChatSettings,
    embeddingModel,
    rerankingModel,
    vectorStorePath,
    setEmbeddingModel,
    setRerankingModel,
    setVectorStorePath,
  } = useSettingsStore();
  const { mode, isStreaming } = useChatStore();
  const [open, setOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load available models when component mounts
  useEffect(() => {
    const loadModels = async () => {
      try {
        const client = new OllamaClient({ baseUrl: OLLAMA_BASE_URL });
        const models = await client.listModels();
        setAvailableModels(models.map((m) => m.name));
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };
    loadModels();
  }, []);

  const handleSliderChange = (
    key: keyof typeof chatSettings,
    value: number
  ) => {
    updateChatSettings({ [key]: value });
  };

  const handleModelChange = (model: string) => {
    updateChatSettings({ model });
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isStreaming}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Settings
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Chat Settings
              <Badge variant="outline">{mode} mode</Badge>
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* General Chat Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              General Settings
            </h3>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Model
                <span className="text-xs text-muted-foreground ml-1">
                  (AI model to use for chat)
                </span>
              </label>
              <select
                value={chatSettings.model || "mistral:latest"}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                ) : (
                  <option value="mistral:latest">
                    mistral:latest (loading...)
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Temperature
                  <span className="text-xs text-muted-foreground ml-1">
                    (Creativity vs Focus)
                  </span>
                </label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {chatSettings.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={chatSettings.temperature}
                onChange={(e) =>
                  handleSliderChange("temperature", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Focused (0.0)</span>
                <span>Balanced (1.0)</span>
                <span>Creative (2.0)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Top P
                  <span className="text-xs text-muted-foreground ml-1">
                    (Nucleus sampling)
                  </span>
                </label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {(chatSettings.topP ?? 0.9).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={chatSettings.topP}
                onChange={(e) =>
                  handleSliderChange("topP", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Top K
                  <span className="text-xs text-muted-foreground ml-1">
                    (Token selection limit)
                  </span>
                </label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {chatSettings.topK}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={chatSettings.topK}
                onChange={(e) =>
                  handleSliderChange("topK", parseInt(e.target.value))
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Agentic Mode Settings */}
          {mode === "agentic" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Agentic Mode Settings
                </h3>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Vector Store Path
                    <span className="text-xs text-muted-foreground ml-1">
                      (Knowledge base location)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={vectorStorePath || ""}
                    onChange={(e) => setVectorStorePath(e.target.value)}
                    placeholder="Enter path to your vector store..."
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {!vectorStorePath && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      ⚠️ Vector store path required for document search
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Embedding Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For document similarity)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={embeddingModel || ""}
                    onChange={(e) => setEmbeddingModel(e.target.value)}
                    placeholder="e.g., nomic-embed-text"
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Reranking Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For result refinement)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={rerankingModel || ""}
                    onChange={(e) => setRerankingModel(e.target.value)}
                    placeholder="e.g., llama3"
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
