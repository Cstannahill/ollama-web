"use client";
import type { ChatMessage as Message } from "@/types";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const bubble = isUser ? "bg-ollama-green text-white" : "bg-white text-black";
  const align = isUser ? "self-end" : "self-start";

  return (
    <div className={cn("prose max-w-sm p-3 rounded-md", bubble, align)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ inline, className, children, ...props }: any) {
            const content = String(children).replace(/\n$/, "");
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-xs text-gray-500"
                  onClick={() => navigator.clipboard.writeText(content)}
                >
                  Copy
                </button>
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
};
