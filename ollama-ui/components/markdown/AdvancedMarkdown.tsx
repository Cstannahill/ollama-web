"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFootnotes from "remark-footnotes";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { SecurityLayer } from "@/lib/securityLayer";
import { exportMarkdown, createShareLink } from "@/lib/exportMarkdown";
import { Download, Share2 } from "lucide-react";

interface AdvancedMarkdownProps {
  content: string;
  showExport?: boolean;
  showShare?: boolean;
}

export const AdvancedMarkdown = ({
  content,
  showExport = false,
  showShare = false,
}: AdvancedMarkdownProps) => {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const sanitized = SecurityLayer.sanitize(content);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rehypePlugins: any[] = [rehypeSanitize, rehypeKatex];
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const mermaid = require("rehype-mermaid").default;
    rehypePlugins.push(mermaid);
  }
  return (
    <div className="prose prose-invert max-w-none relative">
      {(showExport || showShare) && (
        <div className="absolute right-0 top-0 flex gap-2">
          {showExport && (
            <>
              <button
                type="button"
                aria-label="Export as Markdown"
                onClick={() => exportMarkdown(content, "markdown")}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Export as HTML"
                onClick={() => exportMarkdown(content, "html")}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Export as PDF"
                onClick={() => exportMarkdown(content, "pdf")}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          {showShare && (
            <button
              type="button"
              aria-label="Share"
              onClick={async () => {
                const url = await createShareLink(content);
                setShareUrl(url);
                await navigator.clipboard.writeText(url);
                // eslint-disable-next-line no-alert
                alert("Share link copied to clipboard");
              }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkFootnotes]}
        rehypePlugins={rehypePlugins}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const meta = (node as any).data?.meta as string | undefined;
          const filename = meta?.match(/filename=(\S+)/)?.[1];
          const highlightRaw = meta?.match(/\{\s*highlight:\s*\[([^\]]+)\]/)?.[1];
          const highlight = highlightRaw
            ? highlightRaw.split(/\s*,\s*/).flatMap((p) => {
                if (p.includes("-")) {
                  const [s, e] = p.split("-").map(Number);
                  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
                }
                return [Number(p)];
              })
            : [];
          const code = String(children).replace(/\n$/, "");
          if (inline) {
            return (
              <code className="px-1 rounded bg-gray-800/40 text-sm" {...props}>
                {children}
              </code>
            );
          }
          return (
            <CodeBlock
              code={code}
              language={match?.[1] || ""}
              filename={filename}
              highlight={highlight}
            />
          );
        },
        blockquote({ children }) {
          const first = React.Children.toArray(children)[0];
          if (
            typeof first === "string" &&
            /^(note|warning|tip|error):/i.test(first.trim())
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const type = first.split(":")[0].toLowerCase() as any;
            const rest = (first as string).replace(/^[^:]+:\s*/, "");
            return (
              <Callout type={type}>
                {rest}
                {React.Children.toArray(children).slice(1)}
              </Callout>
            );
          }
          return <blockquote className="border-l-4 pl-4 my-4">{children}</blockquote>;
        },
      }}
      >
        {sanitized}
      </ReactMarkdown>
      {shareUrl && (
        <p className="mt-2 text-xs break-all">Shared: {shareUrl}</p>
      )}
    </div>
  );
};
