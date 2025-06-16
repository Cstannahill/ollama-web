"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info } from "@/components/ui/icons";
import type { Model } from "@/types/ollama/Model";

interface ModelInfoDialogProps {
  model: Model;
  trigger?: React.ReactNode;
}

export function ModelInfoDialog({ model, trigger }: ModelInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default trigger if none provided
  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
      aria-label={`Model information for ${model.name}`}
    >
      <Info className="h-4 w-4" />
    </Button>
  );

  // Parse model size if available
  const formatSize = (size?: string) => {
    if (!size) return "Unknown";
    return size; // Already formatted as string
  };

  // Parse model family/type from name
  const getModelFamily = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("llama")) return "LLaMA";
    if (lowerName.includes("qwen")) return "Qwen";
    if (lowerName.includes("phi")) return "Phi";
    if (lowerName.includes("mistral")) return "Mistral";
    if (lowerName.includes("codellama")) return "Code Llama";
    if (lowerName.includes("gemma")) return "Gemma";
    if (lowerName.includes("yi")) return "Yi";
    if (lowerName.includes("deepseek")) return "DeepSeek";
    return "Other";
  };

  // Get model capabilities based on name
  const getCapabilities = (name: string) => {
    const capabilities = [];
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("code") || lowerName.includes("coder")) {
      capabilities.push("Code Generation");
    }
    if (lowerName.includes("instruct") || lowerName.includes("chat")) {
      capabilities.push("Instruction Following");
    }
    if (lowerName.includes("vision") || lowerName.includes("visual")) {
      capabilities.push("Vision");
    }
    if (lowerName.includes("math")) {
      capabilities.push("Mathematics");
    }
    
    // Default capabilities for major model families
    if (capabilities.length === 0) {
      capabilities.push("Text Generation", "Conversation");
    }
    
    return capabilities;
  };

  const capabilities = getCapabilities(model.name);
  const modelFamily = getModelFamily(model.name);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{model.name}</span>
            <Badge variant="secondary" className="text-xs">
              {modelFamily}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this language model
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant={model.isDownloaded ? "default" : "outline"}>
                {model.isDownloaded ? "Downloaded" : "Available"}
              </Badge>
            </div>

            {model.size && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Size</span>
                <span className="text-sm">{formatSize(model.size)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Model ID</span>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {model.id}
              </span>
            </div>
          </div>

          <Separator />

          {/* Capabilities */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              {capabilities.map((capability) => (
                <Badge key={capability} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Use Cases */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Use Cases</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {modelFamily === "Code Llama" && (
                <>
                  <li>• Code generation and completion</li>
                  <li>• Code explanation and debugging</li>
                  <li>• Programming assistance</li>
                </>
              )}
              {modelFamily === "LLaMA" && (
                <>
                  <li>• General conversation and Q&A</li>
                  <li>• Text analysis and summarization</li>
                  <li>• Creative writing assistance</li>
                </>
              )}
              {modelFamily === "Qwen" && (
                <>
                  <li>• Multilingual conversations</li>
                  <li>• Complex reasoning tasks</li>
                  <li>• Technical documentation</li>
                </>
              )}
              {!["Code Llama", "LLaMA", "Qwen"].includes(modelFamily) && (
                <>
                  <li>• General purpose conversations</li>
                  <li>• Text processing and analysis</li>
                  <li>• Question answering</li>
                </>
              )}
            </ul>
          </div>

          {/* Performance Info */}
          {model.performance && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Performance</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-mono text-xs">{model.performance}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
