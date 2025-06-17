import React from "react";
import { AIComponentIntegrationTest } from "@/components/chat/AIComponentIntegrationTest";

export default function AIComponentDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Component Integration Demo
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Experience how AI responses are automatically enhanced with
            interactive components based on content patterns and explicit
            directives.
          </p>
        </div>

        <AIComponentIntegrationTest />
      </div>
    </div>
  );
}
