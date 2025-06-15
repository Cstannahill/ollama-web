"use client";
import React, { useState, Children } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFootnotes from "remark-footnotes";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./CodeBlock";
import { MultiTabCodeBlock } from "./MultiTabCodeBlock";
import { parseMultiTabs } from "./parseMultiTabs";
import { Callout, type CalloutType } from "./Callout";
import { CollapsibleSection } from "./CollapsibleSection";
import { SecurityLayer } from "@/lib/securityLayer";
import { exportMarkdown, createShareLink } from "@/lib/exportMarkdown";

// Custom icons to avoid lucide-react issues
const Download = ({ className }: { className?: string }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const Share2 = ({ className }: { className?: string }) => (
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
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

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
  const segments = parseMultiTabs(content);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), "details", "summary"],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rehypePlugins: any[] = [[rehypeSanitize, schema], rehypeKatex];
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
                <Download className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Export as HTML"
                onClick={() => exportMarkdown(content, "html")}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Export as PDF"
                onClick={() => exportMarkdown(content, "pdf")}
                className="p-1 text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" aria-hidden />
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
                alert("Share link copied to clipboard");
              }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      {segments.map((seg, i) => {
        if (seg.type === "tabs") {
          return <MultiTabCodeBlock key={i} markdown={seg.content} />;
        }
        const sanitized = SecurityLayer.sanitize(seg.content);
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm, remarkMath, remarkFootnotes]}
            rehypePlugins={rehypePlugins}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meta = (node as any).data?.meta as string | undefined;
                const filename = meta?.match(/filename=(\S+)/)?.[1];
                const highlightRaw = meta?.match(
                  /\{\s*highlight:\s*\[([^\]]+)\]/
                )?.[1];
                const highlight = highlightRaw
                  ? highlightRaw.split(/\s*,\s*/).flatMap((p) => {
                      if (p.includes("-")) {
                        const [s, e] = p.split("-").map(Number);
                        return Array.from(
                          { length: e - s + 1 },
                          (_, j) => s + j
                        );
                      }
                      return [Number(p)];
                    })
                  : [];
                const code = String(children).replace(/\n$/, "");
                if (inline) {
                  return (
                    <code
                      className="px-1 rounded bg-gray-800/40 text-sm"
                      {...props}
                    >
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
              details({ children }) {
                const arr = Children.toArray(children);
                const summary = arr.find(
                  (c) =>
                    React.isValidElement(c) && (c.type as unknown) === "summary"
                ) as
                  | React.ReactElement<{ children?: React.ReactNode }>
                  | undefined;
                const title = summary ? String(summary.props.children) : "";
                const rest = arr.filter((c) => c !== summary);
                return (
                  <CollapsibleSection title={title}>{rest}</CollapsibleSection>
                );
              },
              blockquote({ children }) {
                const first = React.Children.toArray(children)[0];
                if (
                  typeof first === "string" &&
                  /^(note|warning|tip|error):/i.test(first.trim())
                ) {
                  const type = first.split(":")[0].toLowerCase() as CalloutType;
                  const rest = (first as string).replace(/^[^:]+:\s*/, "");
                  return (
                    <Callout type={type}>
                      {rest}
                      {React.Children.toArray(children).slice(1)}
                    </Callout>
                  );
                }
                return (
                  <blockquote className="border-l-4 pl-4 my-4">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {sanitized}
          </ReactMarkdown>
        );
      })}
      {shareUrl && <p className="mt-2 text-xs break-all">Shared: {shareUrl}</p>}
    </div>
  );
};
