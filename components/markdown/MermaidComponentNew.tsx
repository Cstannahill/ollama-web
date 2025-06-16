"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidComponentProps {
  chart: string;
  className?: string;
}

export function MermaidComponent({ chart, className = "" }: MermaidComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const renderChart = async () => {
      if (!ref.current || !chart) return;

      try {
        setIsLoading(true);
        setError(null);

        // Clean and validate chart content
        const cleanChart = chart.trim();
        if (!cleanChart) {
          throw new Error("Empty chart content");
        }

        console.log("🔄 Rendering mermaid chart:", cleanChart.substring(0, 50) + "...");

        // Import mermaid dynamically
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        console.log("✅ Mermaid imported successfully");

        // Initialize with minimal config
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose"
        });

        // Clear container
        if (ref.current) {
          ref.current.innerHTML = "";
        }

        // Generate unique ID
        const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log("🎨 Rendering with ID:", chartId);

        // Render the chart
        if (mounted && ref.current) {
          const { svg } = await mermaid.render(chartId, cleanChart);
          
          if (mounted && ref.current && svg) {
            ref.current.innerHTML = svg;
            console.log("✅ Mermaid chart rendered successfully");
          }
        }
      } catch (renderError) {
        console.error("❌ Mermaid render error:", renderError);
        if (mounted) {
          const errorMessage = renderError instanceof Error ? renderError.message : String(renderError);
          setError(`Failed to render diagram: ${errorMessage}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(renderChart, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [chart]);

  if (error) {
    return (
      <div className={`border border-red-500/20 bg-red-500/10 p-4 rounded-lg ${className}`}>
        <div className="text-red-400 text-sm font-medium">❌ Mermaid Diagram Error</div>
        <div className="text-red-300 text-xs mt-1">{error}</div>
        <details className="mt-2">
          <summary className="text-xs text-slate-400 cursor-pointer">Show chart source</summary>
          <pre className="text-xs text-slate-400 mt-1 bg-slate-800 p-2 rounded overflow-auto">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border border-slate-600 bg-slate-800 p-4 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <div className="text-slate-400 text-sm">Loading diagram...</div>
        </div>
        <div className="animate-pulse bg-slate-700 h-32 rounded mt-2"></div>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className={`mermaid-container border border-slate-600 bg-slate-800 p-4 rounded-lg overflow-auto ${className}`}
    />
  );
}
