"use client";
import React, { useState } from "react";
import { ThemeToggle } from "@/components/ui";
import { useSettingsStore } from "@/stores/settings-store";
import { DocumentIngestion } from "@/components/chat/DocumentIngestion";
import { ConversationEmbeddingSettings } from "@/components/chat/ConversationEmbeddingSettings";
import { ToolSettings } from "@/components/chat/ToolSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Database,
  Save,
  MessageSquare,
  Zap,
  Palette,
} from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("general");
  const {
    agenticConfig,
    setVectorStorePath,
    setEmbeddingModel,
    setRerankingModel,
    validateAgenticSetup,
  } = useSettingsStore();

  const [tempConfig, setTempConfig] = useState(agenticConfig);
  const [isSaving, setIsSaving] = useState(false);

  const validation = validateAgenticSetup();

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      setVectorStorePath(tempConfig.vectorStorePath);
      setEmbeddingModel(tempConfig.embeddingModel);
      setRerankingModel(tempConfig.rerankingModel);
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <ThemeToggle />
      </div>{" "}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {" "}
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="presentation" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            UI
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="conversations"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Conversations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agentic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!validation.isValid && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Configuration Incomplete
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Missing: {validation.missingFields.join(", ")}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vector-path">Vector Store Path</Label>
                <Input
                  id="vector-path"
                  type="text"
                  value={tempConfig.vectorStorePath || ""}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      vectorStorePath: e.target.value,
                    })
                  }
                  placeholder="e.g., S:/Knowledge"
                />
                <div className="text-sm text-muted-foreground">
                  Path where document embeddings will be stored (used as
                  reference in browser)
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedding-model">Embedding Model</Label>
                <Input
                  id="embedding-model"
                  type="text"
                  value={tempConfig.embeddingModel || ""}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      embeddingModel: e.target.value,
                    })
                  }
                  placeholder="e.g., nomic-embed-text"
                />
                <div className="text-sm text-muted-foreground">
                  Model used to generate document embeddings
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reranking-model">Reranking Model</Label>
                <Input
                  id="reranking-model"
                  type="text"
                  value={tempConfig.rerankingModel || ""}
                  onChange={(e) =>
                    setTempConfig({
                      ...tempConfig,
                      rerankingModel: e.target.value,
                    })
                  }
                  placeholder="e.g., llama3.2:3b"
                />
                <div className="text-sm text-muted-foreground">
                  Model used to rerank retrieved documents
                </div>
              </div>

              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>{" "}
        </TabsContent>{" "}
        <TabsContent value="tools" className="space-y-6">
          <ToolSettings />
        </TabsContent>
        <TabsContent value="presentation" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Presentation & UI Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Configure how AI responses and data are presented in the chat
                  interface. These settings control the visual appearance and
                  information density of presentational components like
                  insights, search results, and metrics.
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    🎨 Enhanced UI Components Available
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      • <strong>Insight Cards</strong> - Beautiful AI analysis
                      presentation
                    </li>
                    <li>
                      • <strong>Search Results Grid</strong> - Web search
                      results with rich metadata
                    </li>
                    <li>
                      • <strong>Processing Metrics</strong> - Real-time
                      performance visualization
                    </li>
                    <li>
                      • <strong>Document Sources</strong> - Interactive document
                      references
                    </li>
                    <li>
                      • <strong>Action Plans</strong> - Step-by-step
                      recommendations
                    </li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
                  <div className="font-medium mb-1">
                    Dynamic Component Selection
                  </div>
                  <div className="text-muted-foreground">
                    Components are automatically chosen based on query context,
                    session type, and available data. The system intelligently
                    decides which presentational components will be most helpful
                    for each response.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="space-y-6">
          <DocumentIngestion />
        </TabsContent>
        <TabsContent value="conversations" className="space-y-6">
          <ConversationEmbeddingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
