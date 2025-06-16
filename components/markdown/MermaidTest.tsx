"use client";

import React, { useEffect, useRef, useState } from "react";

export function MermaidTest() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    const testMermaid = async () => {
      try {
        setStatus("importing mermaid");
        const mermaid = await import("mermaid");
        console.log("Mermaid imported:", mermaid);
        
        setStatus("configuring mermaid");
        const mermaidInstance = mermaid.default || mermaid;
        
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose"
        });
        
        setStatus("rendering test diagram");
        const testChart = "graph TD; A-->B; B-->C;";
        const chartId = "test-" + Math.random().toString(36).substr(2, 9);
        
        if (ref.current) {
          const { svg } = await mermaidInstance.render(chartId, testChart);
          ref.current.innerHTML = svg;
          setStatus("success");
        }
      } catch (error) {
        console.error("Mermaid test error:", error);
        setStatus("error: " + (error instanceof Error ? error.message : String(error)));
      }
    };

    testMermaid();
  }, []);

  return (
    <div className="border border-blue-500 p-4 rounded-lg">
      <div className="text-sm mb-2">Mermaid Test Status: {status}</div>
      <div ref={ref} className="bg-slate-800 p-2 rounded" />
    </div>
  );
}
