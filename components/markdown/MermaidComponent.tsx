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

        // Validate chart content
        const cleanChart = chart.trim();
        if (!cleanChart) {
          throw new Error("Empty chart content");
        }

        // Import mermaid dynamically
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default || mermaidModule;

        // Initialize with minimal config
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
          });
        } catch {
          // Mermaid might already be initialized
          console.log("Mermaid initialization skipped (already initialized)");
        }

        // Generate unique ID for this chart
        const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render the chart
        const { svg } = await mermaid.render(chartId, cleanChart);
        
        if (mounted && ref.current && svg) {
          ref.current.innerHTML = svg;
        }
      } catch (renderError) {
        console.error("Mermaid rendering error:", renderError);
        if (mounted) {
          setError(renderError instanceof Error ? renderError.message : String(renderError));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
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
