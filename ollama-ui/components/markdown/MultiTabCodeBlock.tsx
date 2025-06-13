"use client";
import React, { useState, useEffect, useRef } from "react";
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
import type { CodeBlock as Block } from "@/types";

interface MultiTabCodeBlockProps {
  blocks: Block[];
}

export const MultiTabCodeBlock = ({ blocks }: MultiTabCodeBlockProps) => {
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const current = blocks[active];
  const tabRefs = useRef<HTMLButtonElement[]>([]);

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
        <div className="flex">
          {blocks.map((b, i) => (
            <button
              key={i}
              ref={(el) => {
                if (el) tabRefs.current[i] = el;
              }}
              onClick={() => setActive(i)}
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
          <Search className="w-4 h-4" />
        </button>
      </div>
      {showSearch && (
        <div className="border-b border-gray-700 bg-gray-800 p-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
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
