"use client";

import React, { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { Copy } from "@/components/ui/icons";

interface EnhancedTabCodeBlockProps {
  title?: string;
  tabs: Array<{
    id: string;
    label: string;
    language: string;
    code: string;
  }>;
  className?: string;
}

export function EnhancedTabCodeBlock({ 
  title, 
  tabs, 
  className = "" 
}: EnhancedTabCodeBlockProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg overflow-hidden ${className}`}>
      {/* Section Title */}
      {title && (
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">{title}</h3>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700 bg-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${ 
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="relative">
        <div className="p-4">
          <CodeBlock
            code={activeTabData.code}
            language={activeTabData.language}
            filename=""
          />
        </div>
      </div>
    </div>
  );
}
