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
      if (!ref.current) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log("Attempting to render mermaid chart:", chart.substring(0, 50) + "...");
        console.log("Full chart content:", chart);
        console.log("Chart length:", chart.length);
        console.log("Chart type check:", typeof chart);

        // Validate chart content
        if (!chart || typeof chart !== 'string' || chart.trim().length === 0) {
          throw new Error("Invalid chart content: empty or not a string");
        }

        // Clean the chart content (remove any potential extra whitespace/characters)
        const cleanChart = chart.trim();
        
        // For debugging, try a simple diagram first
        const testDiagram = "graph TD; A-->B;";
        console.log("Testing with simple diagram first:", testDiagram);        // Dynamic import to avoid SSR issues
        let mermaid;
        try {
          // Try different import approaches
          const mermaidModule = await import("mermaid");
          mermaid = mermaidModule.default || mermaidModule;
          
          console.log("Mermaid imported successfully");
          console.log("Mermaid object keys:", Object.keys(mermaid));
          console.log("Mermaid version:", mermaid.version || "unknown");
        } catch (importErr) {
          console.error("Failed to import mermaid:", importErr);
          throw importErr;
        }

        // Check if mermaid is already initialized
        if (!mermaid.isInitialized || !mermaid.isInitialized()) {
          console.log("Initializing mermaid...");
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            logLevel: 1 // Set to debug level
          });
        } else {
          console.log("Mermaid already initialized");
        }

        // Clear the container
        if (ref.current) {
          ref.current.innerHTML = "";
        }

        // Generate unique ID for this chart
        const chartId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        console.log("Rendering with ID:", chartId);

        // Check if component is still mounted before rendering
        if (mounted && ref.current) {
          try {
            console.log("About to call mermaid.render with:", { chartId, cleanChart: cleanChart.substring(0, 100) });
            
            // Try rendering with both the clean chart and test diagram
            let svg;
            const diagramToRender = cleanChart.startsWith("graph") ? cleanChart : testDiagram;
            
            console.log("Rendering diagram:", diagramToRender);
            
            if (typeof mermaid.render === 'function') {
              const result = await mermaid.render(chartId, diagramToRender);
              svg = result.svg || result;
            } else if (typeof mermaid.renderAsync === 'function') {
              svg = await mermaid.renderAsync(chartId, diagramToRender);
            } else {
              throw new Error("No suitable render method found on mermaid object");
            }
            
            console.log("Mermaid render successful, SVG length:", svg?.length || 0);
            
            if (mounted && ref.current && svg) {
              ref.current.innerHTML = svg;
            } else {
              throw new Error("No SVG content returned from mermaid.render");
            }
          } catch (renderError) {
            console.error("Mermaid render error:", renderError);
            console.error("Chart that failed to render:", cleanChart);
            console.error("Available mermaid methods:", Object.keys(mermaid));
            if (mounted) {
              setError("Failed to render diagram: " + (renderError instanceof Error ? renderError.message : String(renderError)));
            }
          }
        }
      } catch (importError) {
        console.error("Mermaid import error:", importError);
        if (mounted) {
          setError("Mermaid library not available: " + (importError instanceof Error ? importError.message : String(importError)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderChart, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [chart]);

  if (error) {
    return (
      <div className={`border border-red-500/20 bg-red-500/10 p-4 rounded-lg ${className}`}>
        <div className="text-red-400 text-sm font-medium">Mermaid Diagram Error</div>
        <div className="text-red-300 text-xs mt-1">{error}</div>
        <pre className="text-xs text-slate-400 mt-2 bg-slate-800 p-2 rounded overflow-auto">
          {chart}
        </pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border border-slate-600 bg-slate-800 p-4 rounded-lg ${className}`}>
        <div className="text-slate-400 text-sm">Loading diagram...</div>
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