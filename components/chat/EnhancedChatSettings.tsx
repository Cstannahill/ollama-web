"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    agenticConfig,
    setAgenticConfig,
    validateAgenticSetup,
  } = useSettingsStore();
  const { mode, isStreaming } = useChatStore();
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Get validation state
  const validation = validateAgenticSetup();

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
    value: number,
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Agentic Mode Settings
                  </h3>
                  <Badge
                    variant={validation.isValid ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {validation.isValid ? "Complete" : "Incomplete"}
                  </Badge>
                </div>

                {/* Validation Messages */}
                {!validation.isValid && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium mb-1">
                      Missing Configuration:
                    </p>
                    <ul className="text-xs text-destructive/80 space-y-1">
                      {validation.missingFields.map((field) => (
                        <li key={field}>• {field}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-600 font-medium mb-1">
                      Warnings:
                    </p>
                    <ul className="text-xs text-yellow-600/80 space-y-1">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>
                    Vector Store Path
                    <span className="text-xs text-muted-foreground ml-1">
                      (Local directory for your knowledge base)
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={vectorStorePath || ""}
                      onChange={(e) => setVectorStorePath(e.target.value)}
                      placeholder="e.g., C:\\Users\\YourName\\ollama-vectors or ~/Documents/ollama-vectors"
                      className={`flex-1 ${!vectorStorePath ? "border-destructive/50" : ""}`}
                    />
                    <input
                      type="file"
                      /* @ts-ignore - non-standard attribute for directory picking */
                      webkitdirectory=""
                      /* @ts-ignore - non-standard attribute for directory picking */
                      directory=""
                      multiple={false}
                      style={{ display: "none" }}
                      id="directory-picker"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const firstFile = files[0] as File & {
                            webkitRelativePath?: string;
                          };
                          const fullPath = firstFile.webkitRelativePath;
                          if (fullPath) {
                            const pathParts = fullPath.split("/");
                            if (pathParts.length > 1) {
                              const directoryName = pathParts[0];
                              setVectorStorePath(directoryName);
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const dirPicker = (
                          window as unknown as {
                            showDirectoryPicker?: () => Promise<{
                              name: string;
                            }>;
                          }
                        ).showDirectoryPicker;
                        if (dirPicker) {
                          try {
                            const dir = await dirPicker();
                            setVectorStorePath(dir.name);
                          } catch (err) {
                            console.error("Directory selection cancelled", err);
                          }
                        } else {
                          const fileInput = document.getElementById(
                            "directory-picker",
                          ) as HTMLInputElement;
                          fileInput?.click();
                        }
                      }}
                      className="px-3 shrink-0"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H6a2 2 0 00-2 2z"
                        />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Important:</strong> This should be a local directory
                    on your computer where the vector database will be stored.
                    The folder will be created if it doesn&apos;t exist.
                    Examples: &quot;C:\ollama-vectors&quot; or
                    &quot;/home/user/ollama-vectors&quot;
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>
                    Embedding Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For document similarity and vector search)
                    </span>
                  </Label>
                  <Select
                    value={embeddingModel || ""}
                    onValueChange={setEmbeddingModel}
                  >
                    <SelectTrigger
                      className={!embeddingModel ? "border-destructive/50" : ""}
                    >
                      <SelectValue placeholder="Select embedding model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nomic-embed-text">
                        <div className="flex flex-col">
                          <span>nomic-embed-text</span>
                          <span className="text-xs text-muted-foreground">
                            Recommended - General purpose embedding model
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="all-minilm">
                        <div className="flex flex-col">
                          <span>all-minilm</span>
                          <span className="text-xs text-muted-foreground">
                            Lightweight - Fast but less accurate
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sentence-transformers">
                        <div className="flex flex-col">
                          <span>sentence-transformers</span>
                          <span className="text-xs text-muted-foreground">
                            High quality - Best for semantic understanding
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> &quot;nomic-embed-text&quot; is
                    recommended for most use cases. Make sure the model is
                    downloaded in Ollama first.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>
                    Reranking Model
                    <span className="text-xs text-muted-foreground ml-1">
                      (For refining and ranking search results)
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
                      <SelectItem value="none">
                        <div className="flex flex-col">
                          <span>None</span>
                          <span className="text-xs text-muted-foreground">
                            Skip reranking - Faster but less accurate
                          </span>
                        </div>
                      </SelectItem>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          <div className="flex flex-col">
                            <span>{model}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.toLowerCase().includes("llama")
                                ? "🎯 Excellent for reranking"
                                : model.toLowerCase().includes("mistral")
                                  ? "🎯 Good for reranking"
                                  : model.toLowerCase().includes("qwen")
                                    ? "🎯 Good for reranking"
                                    : model.toLowerCase().includes("gemma")
                                      ? "🎯 Good for reranking"
                                      : model.toLowerCase().includes("phi")
                                        ? "🎯 Good for reranking"
                                        : "General chat model"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Use any chat model for reranking.
                    Llama, Mistral, and Qwen models work particularly well.
                  </p>
                </div>

                {/* Advanced Agentic Settings */}
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">
                    Advanced Options
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>
                        Max Retrieval Docs
                        <span className="text-xs text-muted-foreground ml-1">
                          ({agenticConfig.maxRetrievalDocs})
                        </span>
                      </Label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={agenticConfig.maxRetrievalDocs}
                        onChange={(e) =>
                          setAgenticConfig({
                            maxRetrievalDocs: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>
                        Context Summary Length
                        <span className="text-xs text-muted-foreground ml-1">
                          ({agenticConfig.contextSummaryLength})
                        </span>
                      </Label>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="50"
                        value={agenticConfig.contextSummaryLength}
                        onChange={(e) =>
                          setAgenticConfig({
                            contextSummaryLength: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>
                        Query Rewriting
                        <span className="text-xs text-muted-foreground ml-1">
                          (Enhance queries for better results)
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        checked={agenticConfig.enableQueryRewriting}
                        onChange={(e) =>
                          setAgenticConfig({
                            enableQueryRewriting: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>
                        Response Summarization
                        <span className="text-xs text-muted-foreground ml-1">
                          (Summarize long responses)
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        checked={agenticConfig.enableResponseSummarization}
                        onChange={(e) =>
                          setAgenticConfig({
                            enableResponseSummarization: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>
                        Caching
                        <span className="text-xs text-muted-foreground ml-1">
                          (Cache results for performance)
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        checked={agenticConfig.cachingEnabled}
                        onChange={(e) =>
                          setAgenticConfig({ cachingEnabled: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {validation.recommendations.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Recommendations:
                    </p>
                    <ul className="text-xs text-blue-600/80 space-y-1">
                      {validation.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
