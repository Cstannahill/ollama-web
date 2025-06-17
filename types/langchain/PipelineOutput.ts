// Enhanced data types for presentational components aligned with existing component interfaces

export interface InsightData {
  title: string;
  content: string;
  confidence?: number;
  category?: "analysis" | "recommendation" | "insight" | "warning";
  metadata?: {
    processingTime?: number;
    sources?: string[];
    complexity?: "low" | "medium" | "high";
  };
}

// Align with existing SearchResultsGrid component
export interface SearchResultData {
  title: string;
  url: string;
  snippet: string;
  source: "web" | "wikipedia" | "news";
  timestamp?: string;
  author?: string;
  rating?: number;
}

// Align with existing ActionPlan component
export interface ActionStepData {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "immediate" | "short-term" | "long-term";
  estimatedTime?: string;
  difficulty?: "easy" | "medium" | "hard";
  prerequisites?: string[];
}

// Align with existing DocumentSources component
export interface DocumentSourceData {
  id: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: {
    source?: string;
    timestamp?: number;
    url?: string;
    tags?: string[];
    pageNumber?: number;
    section?: string;
  };
}

// Align with existing ProcessingMetrics component
export interface ProcessingMetricsData {
  startTime: number;
  queryRewriteTime?: number;
  embeddingTime?: number;
  retrievalTime?: number;
  rerankingTime?: number;
  contextTime?: number;
  responseTime?: number;
  totalTime?: number;
  docsRetrieved: number;
  tokensEstimated: number;
  efficiency?: number;
  tokensPerSecond?: number;
  toolsUsed?: number;
  toolExecutionTime?: number;
  // Multi-turn specific metrics
  multiTurnMetrics?: {
    turnsAnalyzed: number;
    entitiesTracked: number;
    topicsTracked: number;
    entityOverlap: number;
    topicContinuity: number;
    contextualRelevance: number;
    historicalDocsRetrieved: number;
    currentDocsRetrieved: number;
  };
}

export interface PresentationConfig {
  prefer?: "compact" | "detailed" | "visual";
  theme?: "default" | "minimal" | "rich";
  showMetrics?: boolean;
  showSources?: boolean;
  animationLevel?: "none" | "subtle" | "full";
}

export interface ContextData {
  query: string;
  previousOutputs: PipelineOutput[];
  userPreferences?: PresentationConfig;
  sessionContext?: "research" | "coding" | "general" | "analysis";
}

export type PipelineOutput =
  | { type: "status"; message: string }
  | { type: "thinking"; message: string }
  | { type: "tokens"; count: number }
  | { type: "docs"; docs: import("../vector").SearchResult[] }
  | { type: "chat"; chunk: import("../ollama").ChatResponse }
  | { type: "summary"; message: string }
  | { type: "tool"; name: string; output: string }
  | { type: "metrics"; data: ProcessingMetricsData }
  | { type: "error"; message: string }
  // Enhanced presentational outputs
  | { type: "insight"; data: InsightData; presentation?: PresentationConfig }
  | {
      type: "search-results";
      data: { results: SearchResultData[]; query: string; searchTime?: number };
      presentation?: PresentationConfig;
    }
  | {
      type: "action-plan";
      data: {
        title: string;
        objective: string;
        steps: ActionStepData[];
        context?: string;
        confidence?: number;
      };
      presentation?: PresentationConfig;
    }
  | {
      type: "document-sources";
      data: {
        sources: DocumentSourceData[];
        totalRetrieved: number;
        query: string;
        retrievalTime?: number;
      };
      presentation?: PresentationConfig;
    }
  | {
      type: "processing-metrics";
      data: ProcessingMetricsData;
      presentation?: PresentationConfig;
    }
  | {
      type: "multi-turn-summary";
      summary: string;
      metrics: {
        entityOverlap: number;
        topicContinuity: number;
        contextualRelevance: number;
      };
    };
