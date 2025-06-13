"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { SecurityLayer } from "@/lib/securityLayer";

interface AdvancedMarkdownProps {
  content: string;
}

export const AdvancedMarkdown = ({ content }: AdvancedMarkdownProps) => {
  const sanitized = SecurityLayer.sanitize(content);
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeSanitize, rehypeKatex]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const meta = (node as any).data?.meta as string | undefined;
          const filename = meta?.match(/filename=(\S+)/)?.[1];
          const code = String(children).replace(/\n$/, "");
          if (inline) {
            return (
              <code className="px-1 rounded bg-gray-800/40 text-sm" {...props}>
                {children}
              </code>
            );
          }
          return (
            <CodeBlock code={code} language={match?.[1] || ""} filename={filename} />
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
    </div>
  );
};
