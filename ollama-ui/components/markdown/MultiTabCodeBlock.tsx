"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Braces, FileCode, Hash, Database, Terminal, Palette } from "lucide-react";

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
