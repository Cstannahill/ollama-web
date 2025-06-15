"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";

// Custom icons to avoid lucide-react issues
const Search = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Braces = ({ className }: { className?: string }) => (
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
      d="M7 8a4 4 0 01-4 4 4 4 0 014 4v1c0 .55.45 1 1 1h1m8-10a4 4 0 004 4 4 4 0 00-4 4v1c0 .55-.45 1-1 1h-1"
    />
  </svg>
);

const FileCode = ({ className }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const Hash = ({ className }: { className?: string }) => (
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
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);

const Database = ({ className }: { className?: string }) => (
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
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
);

const Terminal = ({ className }: { className?: string }) => (
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
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const Palette = ({ className }: { className?: string }) => (
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
      d="M7.021 9.863C7.021 6.618 9.639 4 12.884 4c3.245 0 5.863 2.618 5.863 5.863 0 3.245-2.618 5.863-5.863 5.863a5.863 5.863 0 01-5.863-5.863z"
    />
  </svg>
);

const getLanguageIcon = (lang: string) => {
  const icons: Record<string, React.ReactElement> = {
    javascript: <Braces className="w-3 h-3" />,
    typescript: <FileCode className="w-3 h-3" />,
    python: <Hash className="w-3 h-3" />,
    css: <Palette className="w-3 h-3" />,
    sql: <Database className="w-3 h-3" />,
    bash: <Terminal className="w-3 h-3" />,
  };
  return icons[lang] || <FileCode className="w-3 h-3" />;
};
import { CodeBlock } from "./CodeBlock";
import { parseCodeBlocks } from "./parseCodeBlocks";
import type { CodeBlock as Block } from "@/types";

interface MultiTabCodeBlockProps {
  markdown: string;
}

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
};

export const MultiTabCodeBlock = ({ markdown }: MultiTabCodeBlockProps) => {
  const blocks = useMemo<Block[]>(() => parseCodeBlocks(markdown), [markdown]);
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const current = blocks[active];
  const tabRefs = useRef<HTMLButtonElement[]>([]);
  const storageKey = useMemo(
    () => `mtcb-${hashString(blocks.map((b) => b.filename || "").join("|"))}`,
    [blocks]
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const idx = parseInt(stored, 10);
      if (!isNaN(idx) && idx < blocks.length) {
        setActive(idx);
      }
    }
  }, [storageKey, blocks.length]);

  useEffect(() => {
    localStorage.setItem(storageKey, active.toString());
  }, [active, storageKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActive((a) => (a + 1) % blocks.length);
      } else if (e.key === "ArrowLeft") {
        setActive((a) => (a - 1 + blocks.length) % blocks.length);
      } else if (e.key === "/") {
        const el = document.getElementById(`code-search-${active}`);
        el?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks.length, active]);

  return (
    <div className="border border-gray-700 rounded-md mb-4">
      <div className="flex justify-between border-b border-gray-700 bg-gray-800 text-sm">
        <div className="flex" role="tablist">
          {blocks.map((b, i) => (
            <button
              key={i}
              ref={(el) => {
                if (el) tabRefs.current[i] = el;
              }}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={active === i}
              className={`px-3 py-2 font-mono flex items-center gap-1 focus:outline-none ${active === i ? "bg-gray-900 text-white" : "text-gray-400"}`}
            >
              {getLanguageIcon(b.language)}
              {b.filename || b.language}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowSearch((s) => !s)}
          aria-label="Toggle search"
          className="p-2 text-gray-400 hover:text-white"
        >
          <Search className="w-4 h-4" aria-hidden />
        </button>
      </div>
      {showSearch && (
        <div className="border-b border-gray-700 bg-gray-800 p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" aria-hidden />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      )}
      <CodeBlock {...current} search={search} onSearchChange={setSearch} />
    </div>
  );
};
