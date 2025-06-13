"use client";
import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import type { CodeBlock as Block } from "@/types";

interface MultiTabCodeBlockProps {
  blocks: Block[];
}

export const MultiTabCodeBlock = ({ blocks }: MultiTabCodeBlockProps) => {
  const [active, setActive] = useState(0);
  const current = blocks[active];

  return (
    <div className="border border-gray-700 rounded-md mb-4">
      <div className="flex border-b border-gray-700 bg-gray-800 text-sm">
        {blocks.map((b, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-2 font-mono ${active === i ? "bg-gray-900 text-white" : "text-gray-400"}`}
          >
            {b.filename || b.language}
          </button>
        ))}
      </div>
      <CodeBlock {...current} />
    </div>
  );
};
