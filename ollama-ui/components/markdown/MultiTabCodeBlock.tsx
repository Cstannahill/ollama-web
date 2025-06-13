"use client";
import { useState, useEffect, useRef } from "react";
import { CodeBlock } from "./CodeBlock";
import type { CodeBlock as Block } from "@/types";

interface MultiTabCodeBlockProps {
  blocks: Block[];
}

export const MultiTabCodeBlock = ({ blocks }: MultiTabCodeBlockProps) => {
  const [active, setActive] = useState(0);
  const current = blocks[active];
  const tabRefs = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActive((a) => (a + 1) % blocks.length);
      } else if (e.key === "ArrowLeft") {
        setActive((a) => (a - 1 + blocks.length) % blocks.length);
      } else if (e.key === "/") {
        const el = document.getElementById("code-search");
        el?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks.length]);

  return (
    <div className="border border-gray-700 rounded-md mb-4">
      <div className="flex border-b border-gray-700 bg-gray-800 text-sm">
        {blocks.map((b, i) => (
          <button
            key={i}
            ref={(el) => {
              if (el) tabRefs.current[i] = el;
            }}
            onClick={() => setActive(i)}
            aria-selected={active === i}
            className={`px-3 py-2 font-mono focus:outline-none ${active === i ? "bg-gray-900 text-white" : "text-gray-400"}`}
          >
            {b.filename || b.language}
          </button>
        ))}
      </div>
      <CodeBlock {...current} />
    </div>
  );
};
