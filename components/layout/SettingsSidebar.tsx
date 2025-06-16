"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, FolderOpen } from "@/components/ui/icons";
import { useSettingsStore } from "@/stores/settings-store";

const COMMON_MODELS = [
  "llama3.2",
  "llama3.1", 
  "qwen2.5",
  "phi3",
  "mistral",
  "codellama",
  "gemma2"
];

export function SettingsSidebar() {
  const { 
    vectorStorePath, 
    embeddingModel, 
    rerankingModel,
    chatSettings,
    setVectorStorePath,
    setEmbeddingModel,
    setRerankingModel,
    updateChatSettings
  } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleStoragePathSelect = () => {
    // In a real app, this would open a file dialog
    // For now, we'll just show a simple prompt
    const path = prompt("Enter storage path:", vectorStorePath || "");
    if (path) {
      setVectorStorePath(path);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] z-[100]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Default Model */}
          <div className="space-y-2">
            <Label htmlFor="defaultModel">Default Model</Label>
            <Select
              value={chatSettings.model || ""}
              onValueChange={(value: string) => updateChatSettings({ model: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_MODELS.map((modelName) => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <Label>Vector Store Path</Label>
            <div className="flex gap-2">
              <Input
                value={vectorStorePath || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVectorStorePath(e.target.value)}
                placeholder="Enter storage path"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleStoragePathSelect}
                className="px-3"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Location where conversation embeddings are stored
            </p>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <Label htmlFor="embeddingModel">Embedding Model</Label>
            <Select
              value={embeddingModel || ""}
              onValueChange={(value: string) => setEmbeddingModel(value)}
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
            <p className="text-xs text-muted-foreground">
              Model used for generating document embeddings
            </p>
          </div>

          {/* Reranking Model */}
          <div className="space-y-2">
            <Label htmlFor="rerankingModel">Reranking Model</Label>
            <Select
              value={rerankingModel || ""}
              onValueChange={(value: string) => setRerankingModel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reranking model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {COMMON_MODELS.map((modelName) => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Model used for reranking search results
            </p>
          </div>

          {/* Agentic Mode Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Agentic Mode</h3>
            
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={chatSettings.temperature}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChatSettings({ temperature: parseFloat(e.target.value) || 0.7 })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
