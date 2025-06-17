import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InsightCard,
  SearchResultsGrid,
  ProcessingMetrics,
  DocumentSources,
  ActionPlan,
} from "./";
import {
  Sparkles,
  Search,
  BarChart3,
  FileText,
  CheckSquare,
} from "lucide-react";

/**
 * Demo component showcasing all presentational components
 * This demonstrates how the components work and can be used for testing
 */
export const PresentationalDemo = () => {
  const [activeDemo, setActiveDemo] = useState("insight");

  // Sample data for each component
  const sampleData = {
    insight: {
      title: "Market Analysis Summary",
      content:
        "Based on the analysis of current market trends, we observe a significant shift towards AI-powered solutions. The data indicates a 40% increase in adoption rates over the past quarter, with particularly strong growth in the enterprise segment. This trend suggests that companies are prioritizing automation and intelligent decision-making tools to maintain competitive advantage.",
      confidence: 87,
      category: "analysis" as const,
      metadata: {
        processingTime: 2340,
        sources: [
          "Market Research Report",
          "Industry Analysis",
          "Quarterly Data",
        ],
        complexity: "high" as const,
      },
    },
    searchResults: [
      {
        title: "Advanced AI Development Trends for 2025",
        url: "https://example.com/ai-trends-2025",
        snippet:
          "Exploring the latest developments in artificial intelligence, including breakthrough models, new applications, and industry predictions for the coming year.",
        source: "web" as const,
        timestamp: "2024-12-01T10:00:00Z",
        rating: 0.92,
      },
      {
        title: "Machine Learning in Production: Best Practices",
        url: "https://example.com/ml-production",
        snippet:
          "A comprehensive guide to deploying machine learning models in production environments, covering scalability, monitoring, and maintenance strategies.",
        source: "web" as const,
        timestamp: "2024-11-28T14:30:00Z",
        rating: 0.88,
      },
      {
        title: "OpenAI's Latest Model Architecture Explained",
        url: "https://example.com/openai-architecture",
        snippet:
          "Deep dive into the technical details of OpenAI's newest language model, including architecture improvements and performance benchmarks.",
        source: "wikipedia" as const,
        timestamp: "2024-11-25T09:15:00Z",
        rating: 0.85,
      },
    ],
    processingMetrics: {
      startTime: Date.now() - 5000,
      queryRewriteTime: 150,
      embeddingTime: 340,
      retrievalTime: 890,
      rerankingTime: 210,
      contextTime: 180,
      responseTime: 2100,
      totalTime: 3870,
      docsRetrieved: 12,
      tokensEstimated: 1847,
      efficiency: 322.5,
      tokensPerSecond: 477.2,
      toolsUsed: 2,
      toolExecutionTime: 1200,
    },
    documentSources: [
      {
        id: "doc-1",
        title: "AI Development Guidelines",
        snippet:
          "This comprehensive guide covers best practices for developing AI applications, including ethical considerations, testing methodologies, and deployment strategies. The document provides detailed examples and case studies...",
        score: 0.94,
        metadata: {
          source: "Internal Documentation",
          timestamp: Date.now() - 86400000,
          tags: ["AI", "Development", "Guidelines", "Best Practices"],
          pageNumber: 1,
          section: "Introduction",
        },
      },
      {
        id: "doc-2",
        title: "Technical Architecture Documentation",
        snippet:
          "Detailed technical specifications for the system architecture, including component relationships, data flow diagrams, and integration patterns. This document serves as the primary reference for system design...",
        score: 0.89,
        metadata: {
          source: "Engineering Wiki",
          timestamp: Date.now() - 172800000,
          tags: ["Architecture", "Technical", "Documentation"],
          pageNumber: 15,
          section: "Architecture",
        },
      },
      {
        id: "doc-3",
        title: "API Reference Manual",
        snippet:
          "Complete API documentation including endpoint definitions, request/response schemas, authentication methods, and usage examples. This reference provides everything needed to integrate with the system...",
        score: 0.82,
        metadata: {
          source: "API Documentation",
          timestamp: Date.now() - 259200000,
          tags: ["API", "Reference", "Integration"],
          pageNumber: 42,
          section: "Reference",
        },
      },
    ],
    actionPlan: [
      {
        id: "step-1",
        title: "Research and Analysis",
        description:
          "Conduct comprehensive market research to identify current trends, competitor analysis, and user needs assessment.",
        priority: "high" as const,
        category: "immediate" as const,
        estimatedTime: "2-3 hours",
        difficulty: "medium" as const,
      },
      {
        id: "step-2",
        title: "Technical Architecture Design",
        description:
          "Design the system architecture, select appropriate technologies, and create detailed technical specifications.",
        priority: "high" as const,
        category: "short-term" as const,
        estimatedTime: "3-4 hours",
        difficulty: "hard" as const,
        prerequisites: ["step-1"],
      },
      {
        id: "step-3",
        title: "Prototype Development",
        description:
          "Build a working prototype to validate core concepts and gather initial feedback from stakeholders.",
        priority: "high" as const,
        category: "short-term" as const,
        estimatedTime: "4-6 hours",
        difficulty: "hard" as const,
        prerequisites: ["step-2"],
      },
      {
        id: "step-4",
        title: "User Testing and Feedback",
        description:
          "Conduct user testing sessions to gather feedback on usability, functionality, and overall user experience.",
        priority: "medium" as const,
        category: "short-term" as const,
        estimatedTime: "1-2 hours",
        difficulty: "easy" as const,
        prerequisites: ["step-3"],
      },
      {
        id: "step-5",
        title: "Final Implementation",
        description:
          "Implement the final version based on feedback, conduct thorough testing, and prepare for deployment.",
        priority: "high" as const,
        category: "long-term" as const,
        estimatedTime: "5-8 hours",
        difficulty: "hard" as const,
        prerequisites: ["step-4"],
      },
    ],
  };

  const componentInfo = {
    insight: {
      icon: Sparkles,
      title: "Insight Card",
      description:
        "Displays AI insights with confidence levels and rich metadata",
    },
    search: {
      icon: Search,
      title: "Search Results Grid",
      description:
        "Beautiful presentation of web search results with relevance scores",
    },
    metrics: {
      icon: BarChart3,
      title: "Processing Metrics",
      description:
        "Real-time visualization of pipeline performance and efficiency",
    },
    documents: {
      icon: FileText,
      title: "Document Sources",
      description:
        "Interactive display of document sources with excerpts and metadata",
    },
    actions: {
      icon: CheckSquare,
      title: "Action Plan",
      description: "Step-by-step action recommendations with progress tracking",
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Presentational Components Demo
            <Badge variant="secondary" className="ml-auto">
              Interactive Preview
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This demo showcases the beautiful presentational components that
            enhance the agentic chat experience. Each component is designed to
            present AI-generated content in an aesthetically pleasing and
            informative way.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
            {Object.entries(componentInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <Button
                  key={key}
                  variant={activeDemo === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveDemo(key)}
                  className="flex flex-col items-center gap-1 h-auto p-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{info.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(
              componentInfo[activeDemo as keyof typeof componentInfo].icon,
              { className: "w-5 h-5" }
            )}
            {componentInfo[activeDemo as keyof typeof componentInfo].title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {
              componentInfo[activeDemo as keyof typeof componentInfo]
                .description
            }
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeDemo === "insight" && (
              <InsightCard {...sampleData.insight} />
            )}{" "}
            {activeDemo === "search" && (
              <SearchResultsGrid
                results={sampleData.searchResults}
                query="AI development trends"
                searchTime={1240}
              />
            )}
            {activeDemo === "metrics" && (
              <ProcessingMetrics
                metrics={sampleData.processingMetrics}
                compact={false}
              />
            )}
            {activeDemo === "documents" && (
              <DocumentSources
                sources={sampleData.documentSources}
                totalRetrieved={sampleData.documentSources.length}
                query="AI development best practices"
                retrievalTime={1850}
              />
            )}
            {activeDemo === "actions" && (
              <ActionPlan
                title="AI Development Implementation Plan"
                objective="Implement a comprehensive AI development strategy with best practices and quality assurance."
                steps={sampleData.actionPlan}
                context="Based on current market analysis and technical requirements"
                confidence={92}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage in Agentic Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <div className="font-medium mb-2">
              Automatic Component Selection
            </div>
            <p className="text-muted-foreground">
              These components are automatically selected and rendered based on:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
              <li>Query content analysis (research, analysis, search terms)</li>
              <li>Available data types (documents, tools, metrics)</li>
              <li>Session context (coding, research, general chat)</li>
              <li>User preferences and configuration</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Smart Context Awareness
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              The system intelligently chooses which components to show based on
              what would be most helpful for each specific response. For
              example, search results appear for queries about current events,
              while action plans appear for how-to questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
