import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Calendar,
  Globe,
  BookOpen,
  Newspaper,
  Star,
  Clock,
  User,
} from "lucide-react";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: "web" | "wikipedia" | "news";
  timestamp?: string;
  author?: string;
  rating?: number;
}

interface SearchResultsGridProps {
  results: SearchResult[];
  query: string;
  searchTime?: number;
}

export const SearchResultsGrid = ({
  results,
  query,
  searchTime,
}: SearchResultsGridProps) => {
  const getSourceIcon = (source: SearchResult["source"]) => {
    switch (source) {
      case "web":
        return <Globe className="w-4 h-4" />;
      case "wikipedia":
        return <BookOpen className="w-4 h-4" />;
      case "news":
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const getSourceColors = (source: SearchResult["source"]) => {
    switch (source) {
      case "web":
        return {
          badge:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "wikipedia":
        return {
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
          border: "border-green-200 dark:border-green-800",
        };
      case "news":
        return {
          badge:
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
          border: "border-orange-200 dark:border-orange-800",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Search Results for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
            {searchTime && ` in ${searchTime}ms`}
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => {
          const colors = getSourceColors(result.source);

          return (
            <Card
              key={index}
              className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.border} border-l-4`}
            >
              <CardContent className="p-4">
                {/* Header with source and rating */}
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${colors.badge} flex items-center gap-1`}>
                    {getSourceIcon(result.source)}
                    {result.source}
                  </Badge>

                  {result.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        {result.rating}/5
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-medium text-sm mb-2 line-clamp-2 text-foreground">
                  {result.title}
                </h4>

                {/* Snippet */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                  {result.snippet}
                </p>

                {/* Metadata */}
                <div className="space-y-2">
                  {(result.timestamp || result.author) && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {result.timestamp && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(result.timestamp).toLocaleDateString()}
                        </div>
                      )}
                      {result.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {result.author}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => window.open(result.url, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-foreground">
            Search Summary
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          These results were automatically gathered to provide current
          information about &ldquo;{query}&rdquo;. The assistant will use this
          data to enhance its response with up-to-date facts and perspectives.
        </p>
      </div>
    </div>
  );
};
