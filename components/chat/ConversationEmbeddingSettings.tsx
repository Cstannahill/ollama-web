"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Database,
  BarChart3,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { conversationEmbedding } from "@/services/conversation-embedding";

interface ConversationStats {
  totalExchanges: number;
  agenticExchanges: number;
  simpleExchanges: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
}

export const ConversationEmbeddingSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial settings and stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const conversationStats =
        await conversationEmbedding.getConversationStats();
      setStats(conversationStats);
    } catch (error) {
      console.error("Failed to load conversation stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    conversationEmbedding.setEnabled(enabled);
  };

  const handleFlushPending = async () => {
    setIsLoading(true);
    try {
      await conversationEmbedding.flushPendingEmbeddings();
      await loadStats();
    } catch (error) {
      console.error("Failed to flush pending embeddings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all conversation history? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await conversationEmbedding.clearConversationHistory();
      await loadStats();
    } catch (error) {
      console.error("Failed to clear conversation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Embedding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="conversation-embedding">
                Auto-embed Conversations
              </Label>
              <div className="text-sm text-muted-foreground">
                Automatically add chat exchanges to the vector store for future
                retrieval
              </div>
            </div>
            <Switch
              id="conversation-embedding"
              checked={isEnabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          <Separator />

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              How it Works
            </div>
            <div className="text-blue-700 dark:text-blue-300 space-y-1">
              <div>
                • Each conversation exchange (question + answer) is embedded
                into the vector store
              </div>
              <div>
                • Future agentic chats can retrieve relevant past conversations
                as context
              </div>
              <div>
                • Helps maintain conversational continuity and knowledge
                building
              </div>
              <div>
                • Agentic conversations are prioritized for immediate embedding
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Conversation History Statistics
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={isLoading}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Exchanges</div>
                <div className="font-semibold">{stats.totalExchanges}</div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  Agentic Conversations
                </div>
                <div className="font-semibold">{stats.agenticExchanges}</div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  Simple Conversations
                </div>
                <div className="font-semibold">{stats.simpleExchanges}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Oldest Entry</div>
                <div className="font-semibold text-xs">
                  {formatDate(stats.oldestTimestamp)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading statistics..." : "No statistics available"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Conversation Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleFlushPending}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Pending Embeddings
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Process any conversations that are queued for embedding but
            haven&apos;t been processed yet.
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium mb-2">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Clear all conversation history from the vector store. This will
              remove all embedded conversations but keep uploaded documents.
            </div>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={isLoading}
              size="sm"
            >
              Clear Conversation History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Retrieval Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Retrieval Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-medium text-green-900 dark:text-green-100 mb-1">
                Automatic Retrieval Mix
              </div>
              <div className="text-green-700 dark:text-green-300">
                When retrieving context, the system automatically combines:
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• 70% from uploaded documents</li>
                  <li>• 30% from conversation history</li>
                </ul>
              </div>
            </div>
            <div className="text-muted-foreground">
              This ensures you get both formal documentation and relevant past
              conversations as context for new questions.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
