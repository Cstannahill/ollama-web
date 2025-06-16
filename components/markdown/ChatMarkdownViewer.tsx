"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { EnhancedTabCodeBlock } from "./EnhancedTabCodeBlock";
import { CodeBlock } from "./CodeBlock";
import { MermaidComponent } from "./MermaidComponent";

interface ChatMarkdownViewerProps {
  content: string;
  className?: string;
}

export function ChatMarkdownViewer({
  content,
  className = "",
}: ChatMarkdownViewerProps) {
  // Configure plugins with proper async handling
  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath], []);

  const rehypePlugins = useMemo(() => {
    const schema: any = {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), "details", "summary"],
    };

    // Remove mermaid plugin to fix runSync async error
    // We'll handle mermaid diagrams with custom component instead
    const plugins: any[] = [[rehypeSanitize, schema], rehypeKatex];

    return plugins;
  }, []);

  // Parse content to detect special sections (configuration blocks, etc.)
  const parseSpecialSections = (markdown: string) => {
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

    const lines = markdown.split("\n");
    let currentSection: any = null;
    let inCodeBlock = false;
    let currentCode = "";
    let currentLang = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section headers
      if (line.match(/^#{1,3}\s+/)) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Check if this looks like a configuration section
        const title = line.replace(/^#+\s*/, "");
        const isConfigSection =
          title.toLowerCase().includes("config") ||
          title.toLowerCase().includes("environment") ||
          title.toLowerCase().includes("setup");

        currentSection = {
          type: isConfigSection ? "config" : "regular",
          title,
          content: line + "\n",
          tabs: isConfigSection ? [] : undefined,
        };
        continue;
      }

      if (currentSection) {
        currentSection.content += line + "\n";

        // Handle code blocks for config sections
        if (currentSection.type === "config") {
          if (line.startsWith("```")) {
            if (!inCodeBlock) {
              inCodeBlock = true;
              currentLang = line.replace("```", "") || "text";
              currentCode = "";
            } else {
              inCodeBlock = false;
              if (currentCode.trim()) {
                let label = currentLang.toUpperCase();
                if (currentLang === "javascript" || currentLang === "js")
                  label = "JavaScript";
                if (currentLang === "typescript" || currentLang === "ts")
                  label = "TypeScript";
                if (currentLang === "bash" || currentLang === "sh")
                  label = "BASH";

                currentSection.tabs.push({
                  id: `${currentSection.title}-${currentLang}`,
                  label,
                  language: currentLang,
                  code: currentCode.trim(),
                });
              }
            }
          } else if (inCodeBlock) {
            currentCode += (currentCode ? "\n" : "") + line;
          }
        }
      }
    }

    // Don't forget the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If no special sections detected, treat as regular markdown
    if (sections.length === 0) {
      sections.push({
        type: "regular",
        content: markdown,
      });
    }

    return sections;
  };

  const sections = parseSpecialSections(content);

  return (
    <div className={`space-y-4 ${className}`}>
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
              className="my-4"
            />
          );
        } else {
          return (
            <div key={index} className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={{
                  // Enhanced code block rendering
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({ inline, className, children, ...props }: any) {
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
                      <code
                        className={`${className} bg-slate-800 px-1 py-0.5 rounded text-sm`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },

                  // Enhanced heading rendering for chat
                  h1({ children }) {
                    return (
                      <h1 className="text-xl font-bold text-emerald-400 mb-3">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-lg font-semibold text-blue-400 mb-2 mt-4">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-base font-medium text-purple-400 mb-2 mt-3">
                        {children}
                      </h3>
                    );
                  },

                  // Enhanced blockquote for chat
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-blue-500 pl-3 italic text-slate-300 bg-slate-800/50 p-3 rounded-r-lg my-2">
                        {children}
                      </blockquote>
                    );
                  },

                  // Enhanced table for chat
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-slate-700 rounded-lg overflow-hidden text-sm">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="bg-slate-800 border border-slate-700 px-3 py-2 text-left font-semibold text-xs">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-slate-700 px-3 py-2 text-xs">
                        {children}
                      </td>
                    );
                  },

                  // Enhanced lists
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside space-y-1 my-2">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside space-y-1 my-2">
                        {children}
                      </ol>
                    );
                  },

                  // Enhanced paragraphs
                  p({ children }) {
                    return <p className="mb-2 leading-relaxed">{children}</p>;
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
  );
}
