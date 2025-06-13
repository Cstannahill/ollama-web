"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { CodeBlock as Block } from "@/types";

type CodeBlockProps = Block;

export const CodeBlock = ({ code, language, filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore copy errors
    }
  };

  const lines = code.trimEnd().split("\n");

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden text-sm mb-4">
      {filename && (
        <div className="px-3 py-1 bg-gray-800 text-xs font-mono text-gray-300">
          {filename}
        </div>
      )}
      <pre className="relative p-3 overflow-x-auto">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <code className={`language-${language}`}>{lines.join("\n")}</code>
      </pre>
    </div>
  );
};
