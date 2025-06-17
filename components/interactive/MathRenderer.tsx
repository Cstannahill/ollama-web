"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MathRendererProps {
  expression: string;
  inline?: boolean;
  className?: string;
  showSource?: boolean;
  editable?: boolean;
  title?: string;
}

// Fallback math renderer for when KaTeX is not available
const FallbackMathRenderer = ({
  expression,
  inline,
}: {
  expression: string;
  inline?: boolean;
}) => {
  const processedExpression = expression
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")
    .replace(/\\\[/g, "")
    .replace(/\\\]/g, "")
    .replace(/\$/g, "");

  return (
    <span
      className={cn(
        "font-mono bg-muted/50 px-2 py-1 rounded",
        !inline && "block text-center my-2"
      )}
    >
      {processedExpression}
    </span>
  );
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  expression,
  inline = false,
  className,
  showSource = false,
  editable = false,
  title,
}) => {
  const [katex, setKatex] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [showingSource, setShowingSource] = useState(false);

  useEffect(() => {
    // Try to load KaTeX dynamically
    const loadKaTeX = async () => {
      try {
        const katexModule = await import("katex");
        setKatex(katexModule.default);
        setError(null);
      } catch (err) {
        console.warn("KaTeX not available, using fallback renderer");
        setError("KaTeX not available");
      } finally {
        setIsLoading(false);
      }
    };

    loadKaTeX();
  }, []);

  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  const renderMath = () => {
    if (isLoading) {
      return <div className="animate-pulse bg-muted/50 h-8 rounded"></div>;
    }

    if (error || !katex) {
      return (
        <FallbackMathRenderer expression={currentExpression} inline={inline} />
      );
    }

    try {
      const html = katex.renderToString(currentExpression, {
        throwOnError: false,
        displayMode: !inline,
        output: "html",
        trust: false,
      });

      return (
        <span
          className={cn("katex-rendered", !inline && "block text-center my-2")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (renderError) {
      return (
        <span className="text-red-500 font-mono text-sm">
          Math Error:{" "}
          {renderError instanceof Error ? renderError.message : "Unknown error"}
        </span>
      );
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentExpression);
    } catch (err) {
      console.error("Failed to copy expression:", err);
    }
  };

  if (inline) {
    return (
      <span className={cn("inline-block", className)}>{renderMath()}</span>
    );
  }

  return (
    <div className={cn("border rounded-lg bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
          )}
          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
            LaTeX
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showSource && (
            <button
              onClick={() => setShowingSource(!showingSource)}
              className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              {showingSource ? "Hide Source" : "Show Source"}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Math Content */}
      <div className="p-6 bg-white dark:bg-gray-900 text-center">
        {showingSource ? (
          <div className="space-y-4">
            <div className="text-left">
              <div className="text-xs text-muted-foreground mb-2">
                LaTeX Source:
              </div>
              {editable ? (
                <textarea
                  value={currentExpression}
                  onChange={(e) => setCurrentExpression(e.target.value)}
                  className="w-full p-3 border rounded-md bg-background font-mono text-sm resize-none"
                  rows={3}
                />
              ) : (
                <pre className="bg-muted p-3 rounded-md font-mono text-sm text-left overflow-x-auto">
                  {currentExpression}
                </pre>
              )}
            </div>
            <div className="border-t pt-4">
              <div className="text-xs text-muted-foreground mb-2">
                Rendered:
              </div>
              {renderMath()}
            </div>
          </div>
        ) : (
          renderMath()
        )}
      </div>

      {/* Mathematical Context */}
      {!showingSource && (
        <div className="px-4 py-2 bg-muted/30 border-t">
          <div className="text-xs text-muted-foreground">
            Mathematical expression rendered with{" "}
            {error ? "fallback renderer" : "KaTeX"}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathRenderer;
