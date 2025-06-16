"use client";

import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { EnhancedTabCodeBlock } from "./EnhancedTabCodeBlock";
import { CodeBlock } from "./CodeBlock";
import { MermaidComponent } from "./MermaidComponentNew";
import {
  Search,
  FileText,
  Download,
  Share2,
  Maximize2,
  Minimize2,
} from "@/components/ui/icons";

interface FullMarkdownViewerProps {
  content: string;
  title?: string;
  showSearch?: boolean;
  showExport?: boolean;
  showShare?: boolean;
  className?: string;
}

export function FullMarkdownViewer({
  content,
  title = "Documentation",
  showSearch = true,
  showExport = true,
  showShare = true,
  className = "",
}: FullMarkdownViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  // Configure plugins with proper async handling
  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath], []);

  const rehypePlugins = useMemo(() => {
    const schema: unknown = {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), "details", "summary"],
    };

    // Remove mermaid plugin to fix runSync async error
    // We'll handle mermaid diagrams with custom component instead
    const plugins: any[] = [[rehypeSanitize, schema], rehypeKatex];

    return plugins;
  }, []);

  // Handle copy functionality
  const handleCopy = async (text: string, id: string = "main") => {
    await navigator.clipboard.writeText(text);
    setCopyStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Handle export
  const handleExport = async (format: "md" | "html" | "pdf") => {
    const filename = `${title.toLowerCase().replace(/\s+/g, "-")}.${format}`;

    if (format === "md") {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "html") {
      // Export as HTML with embedded styles
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin-left: 0; color: #64748b; }
  </style>
</head>
<body>
  <div id="content">${content}</div>
</body>
</html>`;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Filter content based on search
  const filteredContent = useMemo(() => {
    if (!searchTerm.trim()) return content;

    const lines = content.split("\n");

    // Include some context around matches
    const result: string[] = [];
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Add context before and after
        const contextBefore = lines.slice(Math.max(0, index - 2), index);
        const contextAfter = lines.slice(
          index + 1,
          Math.min(lines.length, index + 3),
        );

        result.push(...contextBefore, line, ...contextAfter);
      }
    });

    return [...new Set(result)].join("\n");
  }, [content, searchTerm]);

  // Parse content to detect special sections (configuration blocks, etc.)
  const parseSpecialSections = (markdown: string) => {
    // Check if the content has configuration sections that would benefit from tabbed rendering
    const hasConfigBlocks =
      markdown.includes("## Basic Configuration") &&
      markdown.includes("```javascript") &&
      markdown.includes("```typescript");

    if (!hasConfigBlocks) {
      // Just render as one section for simpler content
      return [
        {
          type: "regular" as const,
          content: markdown,
          title: title,
        },
      ];
    }

    // For config-heavy content, split into meaningful sections
    const sections: Array<{
      type: "config" | "regular";
      content: string;
      title?: string;
      tabs?: Array<{
        id: string;
        label: string;
        language: string;
        code: string;
      }>;
    }> = [];

    // Split by main headings but keep content together
    const parts = markdown.split(/(?=^## )/m);

    parts.forEach((part, index) => {
      if (!part.trim()) return;

      const firstLine = part.split("\n")[0];
      const title = firstLine.replace(/^#+\s*/, "");
      const isConfigSection =
        title.toLowerCase().includes("config") &&
        part.includes("```javascript") &&
        part.includes("```typescript");

      if (isConfigSection) {
        // Extract JavaScript and TypeScript code blocks
        const jsMatch = part.match(/```javascript\n([\s\S]*?)\n```/);
        const tsMatch = part.match(/```typescript\n([\s\S]*?)\n```/);

        if (jsMatch && tsMatch) {
          sections.push({
            type: "config",
            title,
            content: part,
            tabs: [
              {
                id: `${title}-js`,
                label: "JavaScript",
                language: "javascript",
                code: jsMatch[1].trim(),
              },
              {
                id: `${title}-ts`,
                label: "TypeScript",
                language: "typescript",
                code: tsMatch[1].trim(),
              },
            ],
          });
          return;
        }
      }

      // Regular section
      sections.push({
        type: "regular",
        content: part,
        title: title || `Section ${index + 1}`,
      });
    });

    return sections.length > 0
      ? sections
      : [
          {
            type: "regular" as const,
            content: markdown,
            title: title,
          },
        ];
  };

  const sections = parseSpecialSections(filteredContent);

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-[200] bg-slate-900" : ""} ${className}`}
    >
      <div
        className={`bg-slate-800 border-b border-slate-700 ${isFullscreen ? "p-4" : "px-4 py-3"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {showExport && (
                <>
                  <button
                    onClick={() => handleExport("md")}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    title="Export as Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExport("html")}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    title="Export as HTML"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

              {showShare && (
                <button
                  onClick={() => handleCopy(content, "share")}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copyStates.share ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search results indicator */}
        {searchTerm && (
          <div className="text-sm text-slate-400">
            {filteredContent.split("\n").length} lines match &quot;{searchTerm}
            &quot;
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`${isFullscreen ? "flex-1 overflow-auto p-6" : "p-6"} space-y-6`}
      >
        {sections.map((section, index) => {
          if (
            section.type === "config" &&
            section.tabs &&
            section.tabs.length > 0
          ) {
            return (
              <EnhancedTabCodeBlock
                key={index}
                title={section.title}
                tabs={section.tabs}
              />
            );
          } else {
            return (
              <div key={index} className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                  components={{
                    // Enhanced code block rendering
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({
                      node: _node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const code = String(children).replace(/\n$/, "");

                      if (!inline && language) {
                        // Handle mermaid diagrams
                        if (language === "mermaid") {
                          return (
                            <MermaidComponent chart={code} className="my-4" />
                          );
                        }

                        return (
                          <CodeBlock
                            code={code}
                            language={language}
                            filename=""
                          />
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },

                    // Enhanced heading rendering
                    h1({ children }) {
                      return (
                        <h1 className="text-3xl font-bold text-emerald-400 mb-4">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-2xl font-semibold text-blue-400 mb-3 mt-8">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-xl font-medium text-purple-400 mb-2 mt-6">
                          {children}
                        </h3>
                      );
                    },

                    // Enhanced blockquote
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-300 bg-slate-800 p-4 rounded-r-lg">
                          {children}
                        </blockquote>
                      );
                    },

                    // Enhanced table
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-slate-700 rounded-lg overflow-hidden">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="bg-slate-800 border border-slate-700 px-4 py-2 text-left font-semibold">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-slate-700 px-4 py-2">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
