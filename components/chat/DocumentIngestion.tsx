"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, Trash2, Database, RefreshCw } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { VectorStoreService } from "@/lib/vector/store";
import type { Document } from "@/types";

interface DocumentStats {
  totalDocs: number;
  dbSize: number;
  lastModified: number | null;
  storagePath?: string;
}

export const DocumentIngestion: React.FC = () => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { agenticConfig } = useSettingsStore();

  // Create vector store instance as a ref to avoid recreation
  const vectorStoreRef = React.useRef<VectorStoreService | null>(null);

  const getVectorStore = () => {
    if (!vectorStoreRef.current) {
      vectorStoreRef.current = new VectorStoreService();
    }
    return vectorStoreRef.current;
  };

  const loadStats = React.useCallback(async () => {
    try {
      const vectorStore = getVectorStore();
      const memoryStats = vectorStore.getStats();
      const storageStats = await vectorStore.getStorageStats();

      setStats({
        totalDocs: memoryStats.totalDocs,
        dbSize: storageStats?.dbSize || 0,
        lastModified: storageStats?.lastModified || null,
        storagePath: memoryStats.storagePath,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Initialize vector store and load stats
  React.useEffect(() => {
    const initAndLoadStats = async () => {
      try {
        const vectorStore = getVectorStore();
        await vectorStore.initialize();
        await loadStats();
      } catch (err) {
        setError(
          `Failed to initialize vector store: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    };
    initAndLoadStats();
  }, [loadStats]);

  const addTextDocument = async () => {
    if (!text.trim()) {
      setError("Please enter some text to add");
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      const document: Document = {
        id: `doc-${Date.now()}`,
        text: text.trim(),
        metadata: {
          title: title.trim() || "Untitled Document",
          source: "manual",
          timestamp: new Date().toISOString(),
        },
      };

      setProgress(50);
      const vectorStore = getVectorStore();
      await vectorStore.addConversation("manual-docs", [document]);

      setProgress(100);
      setText("");
      setTitle("");
      await loadStats();
    } catch (err) {
      setError(
        `Failed to add document: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const documents: Document[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / totalFiles) * 80); // Reserve 20% for final processing

        const text = await file.text();
        const document: Document = {
          id: `file-${Date.now()}-${i}`,
          text: text.trim(),
          metadata: {
            title: file.name,
            source: "file",
            fileType: file.type || "text/plain",
            fileSize: file.size,
            timestamp: new Date().toISOString(),
          },
        };
        documents.push(document);
      }

      setProgress(90);
      const vectorStore = getVectorStore();
      await vectorStore.addConversation("uploaded-files", documents);

      setProgress(100);
      await loadStats();
    } catch (err) {
      setError(
        `Failed to upload files: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearAllDocuments = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all documents? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const vectorStore = getVectorStore();
      await vectorStore.clearAll();
      await loadStats();
    } catch (err) {
      setError(
        `Failed to clear documents: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Storage Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Vector Store Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={isProcessing}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Documents</div>
              <div className="font-semibold">{stats?.totalDocs || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Storage Size</div>
              <div className="font-semibold">
                {formatFileSize(stats?.dbSize || 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Modified</div>
              <div className="font-semibold">
                {stats?.lastModified ? formatDate(stats.lastModified) : "Never"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Storage Path</div>
              <div className="font-semibold text-xs">
                {agenticConfig.vectorStorePath || "Not configured"}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Browser Storage Note
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              In web browsers, documents are stored in IndexedDB for
              persistence. The configured path ({agenticConfig.vectorStorePath})
              is used as a reference but actual storage is managed by the
              browser.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Text Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Text Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title..."
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="text">Document Text</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your document text here..."
              rows={8}
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={addTextDocument}
            disabled={isProcessing || !text.trim()}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Add Document"}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Text Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".txt,.md,.json,.csv,.log"
              onChange={handleFileUpload}
              disabled={isProcessing}
              ref={fileInputRef}
            />
            <div className="text-sm text-muted-foreground mt-1">
              Supported formats: .txt, .md, .json, .csv, .log
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {progress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear All Documents */}
      {stats && stats.totalDocs > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={clearAllDocuments}
              disabled={isProcessing}
              className="w-full"
            >
              Clear All Documents
            </Button>
            <div className="text-sm text-muted-foreground mt-2">
              This will permanently delete all {stats.totalDocs} documents from
              the vector store.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
