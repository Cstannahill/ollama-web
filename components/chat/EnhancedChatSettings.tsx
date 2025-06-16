"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isStreaming}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chat Settings
            <Badge variant="outline">{mode} mode</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Chat Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              General Settings
            </h3>

            {/* Model Selection */}
            <div className="space-y-3">
              <Label>
                Model
                <span className="text-xs text-muted-foreground ml-1">
                  (AI model to use for chat)
                </span>
              </Label>
              <Select
                value={chatSettings.model || ""}
                onValueChange={handleModelChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading models...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>
                  Temperature
                  <span className="text-xs text-muted-foreground ml-1">
                    (Response creativity)
                  </span>
                </Label>
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
            </div>

            {/* Top P */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>
                  Top P
                  <span className="text-xs text-muted-foreground ml-1">
                    (Response diversity)
                  </span>
                </Label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {(chatSettings.topP ?? 0.9).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={chatSettings.topP ?? 0.9}
                onChange={(e) =>
                  handleSliderChange("topP", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>
                  Top K
                  <span className="text-xs text-muted-foreground ml-1">
                    (Token selection limit)
                  </span>
                </Label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {chatSettings.topK ?? 40}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={chatSettings.topK ?? 40}
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
                  <Label>
                    Vector Store Path
                    <span className="text-xs text-muted-foreground ml-1">
                      (Knowledge base location)
                    </span>
                  </Label>
                  <Input
                    value={vectorStorePath || ""}
                    onChange={(e) => setVectorStorePath(e.target.value)}
                    placeholder="S:\\Knowledge"
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    Embedding Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For document similarity)
                    </span>
                  </Label>
                  <Select
                    value={embeddingModel || ""}
                    onValueChange={setEmbeddingModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select embedding model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nomic-embed-text">nomic-embed-text</SelectItem>
                      <SelectItem value="all-minilm">all-minilm</SelectItem>
                      <SelectItem value="sentence-transformers">sentence-transformers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>
                    Reranking Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For result refinement)
                    </span>
                  </Label>
                  <Select
                    value={rerankingModel || ""}
                    onValueChange={setRerankingModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reranking model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
