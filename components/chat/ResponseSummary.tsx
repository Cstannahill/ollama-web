import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  TrendingDown,
  Eye,
  EyeOff,
  Sparkles,
  Hash,
} from "lucide-react";
import {
  ResponseSummarizerService,
  ResponseSummary,
  SummaryOptions,
} from "../../services/response-summarizer";

interface ResponseSummaryProps {
  content: string;
  autoSummarize?: boolean;
  summaryOptions?: Partial<SummaryOptions>;
  className?: string;
}

export const ResponseSummaryComponent: React.FC<ResponseSummaryProps> = ({
  content,
  autoSummarize = true,
  summaryOptions = {},
  className = "",
}) => {
  const [summary, setSummary] = useState<ResponseSummary | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFullResponse, setShowFullResponse] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  const shouldShowSummary = ResponseSummarizerService.shouldSummarize(content);

  useEffect(() => {
    if (shouldShowSummary && autoSummarize) {
      generateSummary();
    }
  }, [content, shouldShowSummary, autoSummarize]);

  const generateSummary = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const generatedSummary =
        await ResponseSummarizerService.summarizeResponse(
          content,
          summaryOptions
        );
      setSummary(generatedSummary);

      // Auto-collapse if summary is high confidence and significant compression
      if (
        generatedSummary.confidence > 0.7 &&
        generatedSummary.compressionRatio < 0.4
      ) {
        setIsCollapsed(true);
        setShowFullResponse(false);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleView = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setShowFullResponse(false);
    } else {
      setShowFullResponse(true);
    }
  };

  const formatSummary = (summary: ResponseSummary) => {
    return ResponseSummarizerService.formatSummaryForDisplay(summary);
  };

  if (!shouldShowSummary && !summary) {
    return (
      <div className={className}>
        <div className="prose dark:prose-invert max-w-none">{content}</div>
      </div>
    );
  }

  const displayData = summary ? formatSummary(summary) : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary Header */}
      {(summary || isGenerating) && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {isGenerating ? "Generating summary..." : "AI Summary"}
              </span>
            </div>

            {displayData && (
              <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {displayData.stats}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {displayData.confidence}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {summary && summary.keywords.length > 0 && (
              <button
                onClick={() => setShowKeywords(!showKeywords)}
                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                title="Toggle keywords"
              >
                <Hash className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleView}
              className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
            >
              {showFullResponse ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Show Summary
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Full
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Keywords */}
      <AnimatePresence>
        {showKeywords && summary && summary.keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Key Topics
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {showFullResponse ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="prose dark:prose-invert max-w-none"
            >
              {content}
            </motion.div>
          ) : summary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Summary Text */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {summary.keyPoints.length > 0 ? (
                    <div className="space-y-2">
                      {summary.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {displayData?.displayText}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Original: {summary.originalLength} characters</span>
                  <span>Summary: {summary.summaryLength} characters</span>
                  <span>
                    Compression:{" "}
                    {Math.round((1 - summary.compressionRatio) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Generated {summary.generatedAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Manual Summary Generation */}
      {!summary && !isGenerating && shouldShowSummary && !autoSummarize && (
        <div className="flex justify-center">
          <button
            onClick={generateSummary}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Summary
          </button>
        </div>
      )}
    </div>
  );
};
