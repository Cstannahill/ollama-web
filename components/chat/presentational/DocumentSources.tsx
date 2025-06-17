import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";

interface DocumentSource {
  id: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: {
    source?: string;
    timestamp?: number;
    url?: string;
    tags?: string[];
    pageNumber?: number;
    section?: string;
  };
}

interface DocumentSourcesProps {
  sources: DocumentSource[];
  totalRetrieved: number;
  query: string;
  retrievalTime?: number;
}

export const DocumentSources = ({
  sources,
  totalRetrieved,
  query,
  retrievalTime,
}: DocumentSourcesProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const displaySources = expanded ? sources : sources.slice(0, 3);
  const averageScore =
    sources.reduce((acc, source) => acc + source.score, 0) / sources.length;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "High Relevance";
    if (score >= 0.6) return "Medium Relevance";
    return "Low Relevance";
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
            Document Sources
            <Badge variant="secondary">
              {sources.length} of {totalRetrieved} shown
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {retrievalTime && (
              <>
                <BarChart3 className="w-4 h-4" />
                Retrieved in {retrievalTime}ms
              </>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-emerald-600">
              {(averageScore * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg. Relevance</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-teal-600">
              {sources.length}
            </div>
            <div className="text-xs text-muted-foreground">Sources Found</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-cyan-600">
              {sources.filter((s) => s.score >= 0.8).length}
            </div>
            <div className="text-xs text-muted-foreground">High Quality</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Query Context */}
        <div className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-lg border border-white/20">
          <div className="text-xs text-muted-foreground mb-1">
            Query Context
          </div>
          <p className="text-sm text-foreground font-medium">
            &ldquo;{query}&rdquo;
          </p>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          {displaySources.map((source) => (
            <div
              key={source.id}
              className={`p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedSource === source.id
                  ? "ring-2 ring-emerald-500 ring-opacity-50"
                  : ""
              }`}
              onClick={() =>
                setSelectedSource(
                  selectedSource === source.id ? null : source.id
                )
              }
            >
              {/* Source Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                    {source.title}
                  </h4>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getScoreColor(source.score)}`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {getScoreLabel(source.score)}
                    </Badge>

                    {source.metadata?.source && (
                      <Badge variant="secondary" className="text-xs">
                        {source.metadata.source}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Score Progress */}
                <div className="ml-4 text-right min-w-[60px]">
                  <div className="text-sm font-medium text-foreground">
                    {(source.score * 100).toFixed(0)}%
                  </div>
                  <Progress
                    value={source.score * 100}
                    className="w-16 h-1.5 mt-1"
                  />
                </div>
              </div>

              {/* Source Snippet */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                {source.snippet}
              </p>

              {/* Metadata (shown when expanded) */}
              {selectedSource === source.id && source.metadata && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {source.metadata.timestamp && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(
                          source.metadata.timestamp
                        ).toLocaleDateString()}
                      </div>
                    )}

                    {source.metadata.pageNumber && (
                      <div className="text-muted-foreground">
                        Page {source.metadata.pageNumber}
                      </div>
                    )}

                    {source.metadata.section && (
                      <div className="text-muted-foreground col-span-2">
                        Section: {source.metadata.section}
                      </div>
                    )}
                  </div>

                  {source.metadata.tags && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {source.metadata.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {source.metadata.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(source.metadata!.url, "_blank");
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Original Source
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        {sources.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show {sources.length - 3} More Sources
              </>
            )}
          </Button>
        )}

        {/* Footer Summary */}
        <div className="mt-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-lg border border-white/20">
          <p className="text-xs text-muted-foreground">
            These documents were automatically selected based on relevance to
            your query. Higher-scored sources contributed more significantly to
            the assistant&apos;s response.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
