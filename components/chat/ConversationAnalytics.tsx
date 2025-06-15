"use client";

import { useState, useEffect } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { conversationIndexer } from "@/lib/conversation-indexing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Custom icons
const BarChart = ({ className }: { className?: string }) => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
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
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const MessageCircle = ({ className }: { className?: string }) => (
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
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const Tag = ({ className }: { className?: string }) => (
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
      d="M7 7h.01M7 3h5l5.586 5.586a2 2 0 010 2.828l-5.586 5.586a2 2 0 01-2.828 0L3.586 11.414A2 2 0 013 9.586V4a1 1 0 011-1z"
    />
  </svg>
);

export const ConversationAnalytics = () => {
  const { conversations } = useConversationStore();
  const [stats, setStats] = useState<ReturnType<
    typeof conversationIndexer.getStats
  > | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && conversations.length > 0) {
      // Ensure all conversations are indexed
      conversationIndexer.indexConversations(conversations);
      const currentStats = conversationIndexer.getStats();
      setStats(currentStats);
    }
  }, [isOpen, conversations]);

  if (!stats) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDecimal = (num: number): string => {
    return num.toFixed(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <BarChart className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conversation Analytics</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {stats.totalConversations}
              </div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalMessages)}
              </div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalWords)}
              </div>
              <div className="text-xs text-muted-foreground">Total Words</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {formatDecimal(stats.averageMessagesPerConversation)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Messages</div>
            </div>
          </div>

          {/* Mode Distribution */}
          <div>
            <h3 className="text-sm font-medium mb-3">Chat Mode Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Simple Mode</span>
                <span className="text-sm font-medium">
                  {stats.modeDistribution.simple}
                </span>
              </div>
              <Progress
                value={
                  (stats.modeDistribution.simple / stats.totalConversations) *
                  100
                }
                className="h-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">Agentic Mode</span>
                <span className="text-sm font-medium">
                  {stats.modeDistribution.agentic}
                </span>
              </div>
              <Progress
                value={
                  (stats.modeDistribution.agentic / stats.totalConversations) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>

          {/* Top Keywords */}
          <div>
            <h3 className="text-sm font-medium mb-3">Most Discussed Topics</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topKeywords.slice(0, 12).map((item, index) => (
                <Badge
                  key={item.keyword}
                  variant={index < 3 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {item.keyword} ({item.frequency})
                </Badge>
              ))}
            </div>
          </div>

          {/* Top Tags */}
          {stats.topTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map((item, index) => (
                  <Badge
                    key={item.tag}
                    variant={index < 3 ? "default" : "outline"}
                    className="text-xs"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {item.tag} ({item.frequency})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Activity Insights */}
          <div>
            <h3 className="text-sm font-medium mb-3">Activity Insights</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                Average words per conversation:{" "}
                {formatDecimal(stats.averageWordsPerConversation)}
              </div>
              <div>
                Most productive mode:{" "}
                {stats.modeDistribution.agentic > stats.modeDistribution.simple
                  ? "Agentic"
                  : "Simple"}
              </div>
              {stats.topKeywords.length > 0 && (
                <div>
                  Top discussion topic: &quot;{stats.topKeywords[0].keyword}
                  &quot; ({stats.topKeywords[0].frequency} mentions)
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Refresh stats
                const currentStats = conversationIndexer.getStats();
                setStats(currentStats);
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Export stats as JSON
                const dataStr = JSON.stringify(stats, null, 2);
                const dataBlob = new Blob([dataStr], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `conversation-analytics-${new Date().toISOString().split("T")[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
