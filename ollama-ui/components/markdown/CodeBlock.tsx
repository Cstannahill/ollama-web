"use client";
import { useState, useEffect, useId } from "react";
import { Copy, Check, Download, Maximize2, X, Hash, Search } from "lucide-react";
import { createPortal } from "react-dom";
import type { CodeBlock as Block, ExportFormat } from "@/types";

interface CodeBlockProps extends Block {
  search?: string;
  onSearchChange?: (value: string) => void;
}

export const CodeBlock = ({ code, language, filename, search: externalSearch = "", onSearchChange }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [search, setSearch] = useState(externalSearch);
  const [filtered, setFiltered] = useState<string[]>([]);
  const id = useId();

  useEffect(() => {
    setSearch(externalSearch);
  }, [externalSearch]);

  useEffect(() => {
    const lines = code.trimEnd().split("\n");
    if (!search) {
      setFiltered(lines);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      lines.map((l) =>
        l.toLowerCase().includes(q)
          ? l.replace(new RegExp(q, "gi"), (m) => `<mark>${m}</mark>`) 
          : l
      )
    );
  }, [search, code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore copy errors
    }
  };

  const handleDownload = (format: ExportFormat) => {
    let data = code;
    let mime = "text/plain";
    if (format === "html") {
      data = `<pre>${code}</pre>`;
      mime = "text/html";
    }
    if (format === "pdf") {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre>${code}</pre>`);
        win.print();
        win.close();
      }
      return;
    }
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = filtered;

  const body = (
    <div className="bg-gray-900 rounded-md overflow-hidden text-sm mb-4">
      {filename && (
        <div className="px-3 py-1 bg-gray-800 text-xs font-mono text-gray-300">
          {filename}
        </div>
      )}
      <div className="flex justify-between items-center px-3 pt-2">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Toggle line numbers"
            onClick={() => setShowNumbers((n) => !n)}
            className="text-gray-400 hover:text-white"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Search code"
            onClick={() => {
              const el = document.getElementById(`code-search-${id}`);
              el?.focus();
            }}
            className="text-gray-400 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Copy code"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label="Download as markdown"
            onClick={() => handleDownload("markdown")}
            className="text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={() => setFullscreen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-3 pb-2">
        <input
          id={`code-search-${id}`}
          aria-label="Search in code"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          className="mb-2 w-full rounded bg-gray-800 px-2 py-1 text-xs outline-none"
          placeholder="Search..."
        />
        <pre className="relative overflow-x-auto">
          <code className={`language-${language} block`}> 
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {showNumbers && (
                  <span className="select-none text-gray-500 mr-3">{i + 1}</span>
                )}
                <span dangerouslySetInnerHTML={{ __html: line }} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );

  if (!fullscreen) return body;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative max-h-full overflow-auto w-full max-w-4xl">
        <button
          type="button"
          aria-label="Close fullscreen"
          onClick={() => setFullscreen(false)}
          className="absolute top-2 right-2 text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {body}
      </div>
    </div>,
    document.body
  );
};
