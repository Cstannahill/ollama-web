import type { Message } from "../types";
import { SearchResult } from "../types";
import { VectorStoreRetriever } from "../lib/langchain/vector-retriever";

export interface TurnContext {
  turnIndex: number;
  userMessage: Message;
  assistantMessage?: Message;
  relevantDocs: SearchResult[];
  extractedEntities: string[];
  keyTopics: string[];
  contextWeight: number; // How much this turn should influence current retrieval
}

export interface MultiTurnRetrievalConfig {
  maxTurns: number; // Maximum number of previous turns to consider
  entityExtractionEnabled: boolean;
  topicTrackingEnabled: boolean;
  contextDecayRate: number; // How quickly older turns lose relevance (0-1)
  minContextWeight: number; // Minimum weight for a turn to be included
  entityBoostFactor: number; // How much to boost docs containing same entities
  topicBoostFactor: number; // How much to boost docs on same topics
}

export interface MultiTurnResults {
  currentTurnDocs: SearchResult[];
  historicalDocs: SearchResult[];
  combinedDocs: SearchResult[];
  turnContexts: TurnContext[];
  entityChain: string[];
  topicChain: string[];
  relevanceMetrics: {
    entityOverlap: number;
    topicContinuity: number;
    contextualRelevance: number;
  };
}

export class MultiTurnRetrievalService {
  private static readonly DEFAULT_CONFIG: MultiTurnRetrievalConfig = {
    maxTurns: 5,
    entityExtractionEnabled: true,
    topicTrackingEnabled: true,
    contextDecayRate: 0.8,
    minContextWeight: 0.1,
    entityBoostFactor: 1.3,
    topicBoostFactor: 1.2,
  };

  static async performMultiTurnRetrieval(
    currentQuery: string,
    conversationHistory: Message[],
    retriever: VectorStoreRetriever,
    config: Partial<MultiTurnRetrievalConfig> = {}
  ): Promise<MultiTurnResults> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    try {
      // Build turn contexts from conversation history
      const turnContexts = this.buildTurnContexts(
        conversationHistory,
        finalConfig
      );

      // Get current turn results
      const currentTurnDocs =
        await retriever.getRelevantDocuments(currentQuery);

      // Enhance with multi-turn context
      const historicalDocs = await this.retrieveHistoricalContext(
        currentQuery,
        turnContexts,
        retriever,
        finalConfig
      );

      // Extract entity and topic chains
      const entityChain = this.extractEntityChain(turnContexts);
      const topicChain = this.extractTopicChain(turnContexts);

      // Combine and re-rank results
      const combinedDocs = this.combineAndRerankResults(
        currentTurnDocs,
        historicalDocs,
        entityChain,
        topicChain,
        finalConfig
      );

      // Calculate relevance metrics
      const relevanceMetrics = this.calculateRelevanceMetrics(
        currentQuery,
        turnContexts,
        combinedDocs
      );

      return {
        currentTurnDocs,
        historicalDocs,
        combinedDocs,
        turnContexts,
        entityChain,
        topicChain,
        relevanceMetrics,
      };
    } catch (error) {
      console.error("Multi-turn retrieval error:", error);

      // Fallback to single-turn retrieval
      const fallbackDocs = await retriever.getRelevantDocuments(currentQuery);
      return {
        currentTurnDocs: fallbackDocs,
        historicalDocs: [],
        combinedDocs: fallbackDocs,
        turnContexts: [],
        entityChain: [],
        topicChain: [],
        relevanceMetrics: {
          entityOverlap: 0,
          topicContinuity: 0,
          contextualRelevance: 0,
        },
      };
    }
  }

  private static buildTurnContexts(
    messages: Message[],
    config: MultiTurnRetrievalConfig
  ): TurnContext[] {
    const contexts: TurnContext[] = [];
    const userMessages = messages.filter((msg) => msg.role === "user");
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );

    // Consider only the last N turns
    const recentUserMessages = userMessages.slice(-config.maxTurns);

    recentUserMessages.forEach((userMessage, index) => {
      const turnIndex = userMessages.length - recentUserMessages.length + index;

      // TODO: Implement proper message pairing when timestamp support is added
      // For now, use basic index-based pairing
      const assistantMessage = assistantMessages[index] || null;

      // Calculate context weight based on recency and decay rate
      const turnsFromCurrent = recentUserMessages.length - 1 - index;
      const contextWeight = Math.pow(config.contextDecayRate, turnsFromCurrent);

      if (contextWeight >= config.minContextWeight) {
        const extractedEntities = config.entityExtractionEnabled
          ? this.extractEntities(userMessage.content, assistantMessage?.content)
          : [];

        const keyTopics = config.topicTrackingEnabled
          ? this.extractTopics(userMessage.content, assistantMessage?.content)
          : [];

        contexts.push({
          turnIndex,
          userMessage,
          assistantMessage,
          relevantDocs: [], // Will be populated later
          extractedEntities,
          keyTopics,
          contextWeight,
        });
      }
    });

    return contexts;
  }

  private static async retrieveHistoricalContext(
    currentQuery: string,
    turnContexts: TurnContext[],
    retriever: VectorStoreRetriever,
    config: MultiTurnRetrievalConfig
  ): Promise<SearchResult[]> {
    const historicalDocs: SearchResult[] = [];

    for (const context of turnContexts) {
      // Build enhanced query with historical context
      const enhancedQuery = this.buildContextualQuery(
        currentQuery,
        context,
        config
      );

      // Retrieve documents for this enhanced query
      const turnDocs = await retriever.getRelevantDocuments(enhancedQuery);

      // Weight the results based on turn context weight
      const weightedDocs = turnDocs.map((doc) => ({
        ...doc,
        score: (doc.score || 0) * context.contextWeight,
        metadata: {
          ...doc.metadata,
          multiTurnContext: {
            turnIndex: context.turnIndex,
            contextWeight: context.contextWeight,
            isHistorical: true,
          },
        },
      }));

      context.relevantDocs = weightedDocs;
      historicalDocs.push(...weightedDocs);
    }

    return historicalDocs;
  }

  private static buildContextualQuery(
    currentQuery: string,
    context: TurnContext,
    config: MultiTurnRetrievalConfig
  ): string {
    let enhancedQuery = currentQuery;

    // Add entities with boosting
    if (
      config.entityExtractionEnabled &&
      context.extractedEntities.length > 0
    ) {
      const entityTerms = context.extractedEntities.join(" ");
      enhancedQuery += ` ${entityTerms}`;
    }

    // Add topics with boosting
    if (config.topicTrackingEnabled && context.keyTopics.length > 0) {
      const topicTerms = context.keyTopics.join(" ");
      enhancedQuery += ` ${topicTerms}`;
    }

    // Add previous user message context (abbreviated)
    const contextSnippet = context.userMessage.content.substring(0, 100);
    enhancedQuery += ` ${contextSnippet}`;

    return enhancedQuery.trim();
  }

  private static combineAndRerankResults(
    currentDocs: SearchResult[],
    historicalDocs: SearchResult[],
    entityChain: string[],
    topicChain: string[],
    config: MultiTurnRetrievalConfig
  ): SearchResult[] {
    // Combine all documents
    const allDocs = [...currentDocs, ...historicalDocs];

    // Remove duplicates based on ID or content similarity
    const uniqueDocs = this.deduplicateResults(allDocs);

    // Apply multi-turn scoring boosts
    const rescoredDocs = uniqueDocs.map((doc) => {
      let boost = 1.0;
      const content = doc.text.toLowerCase();

      // Entity overlap boost
      const entityMatches = entityChain.filter((entity) =>
        content.includes(entity.toLowerCase())
      ).length;
      if (entityMatches > 0) {
        boost *= Math.pow(config.entityBoostFactor, entityMatches);
      }

      // Topic continuity boost
      const topicMatches = topicChain.filter((topic) =>
        content.includes(topic.toLowerCase())
      ).length;
      if (topicMatches > 0) {
        boost *= Math.pow(config.topicBoostFactor, topicMatches);
      }

      // Historical relevance boost
      const multiTurnContext = doc.metadata as
        | {
            multiTurnContext?: {
              isHistorical?: boolean;
              contextWeight?: number;
            };
          }
        | undefined;
      const isHistorical = multiTurnContext?.multiTurnContext?.isHistorical;
      if (isHistorical) {
        const contextWeight =
          multiTurnContext?.multiTurnContext?.contextWeight || 1.0;
        boost *= contextWeight;
      }

      return {
        ...doc,
        score: (doc.score || 0) * boost,
        metadata: {
          ...doc.metadata,
          multiTurnScore: {
            originalScore: doc.score || 0,
            boost,
            finalScore: (doc.score || 0) * boost,
            entityMatches,
            topicMatches,
          },
        },
      };
    });

    // Sort by final score and return top results
    return rescoredDocs
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 15); // Return more results for multi-turn context
  }

  private static deduplicateResults(docs: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const doc of docs) {
      // Create a fingerprint based on content similarity
      const fingerprint = this.createContentFingerprint(doc.text);

      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        unique.push(doc);
      }
    }

    return unique;
  }

  private static createContentFingerprint(text: string): string {
    // Simple content fingerprinting - could be enhanced with more sophisticated methods
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (normalized.length < 50) return normalized;

    // Use first and last parts of content as fingerprint
    return (
      normalized.substring(0, 25) +
      "..." +
      normalized.substring(normalized.length - 25)
    );
  }

  private static extractEntities(
    userContent: string,
    assistantContent?: string
  ): string[] {
    const combinedContent = `${userContent} ${assistantContent || ""}`;
    const entities: string[] = [];

    // Simple entity extraction patterns
    const patterns = [
      // Capitalized words (proper nouns)
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
      // Technical terms
      /\b[A-Z]{2,}\b/g,
      // Numbers with units
      /\b\d+(?:\.\d+)?\s*(?:GB|MB|KB|TB|GHz|MHz|°C|°F|%)\b/gi,
      // File extensions
      /\.\w{2,4}\b/g,
      // URLs and domains
      /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w-]+/gi,
    ];

    patterns.forEach((pattern) => {
      const matches = combinedContent.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    // Remove duplicates and filter out common words
    const uniqueEntities = Array.from(new Set(entities))
      .filter((entity) => entity.length > 2)
      .filter((entity) => !this.isCommonWord(entity.toLowerCase()))
      .slice(0, 10); // Limit to most relevant

    return uniqueEntities;
  }

  private static extractTopics(
    userContent: string,
    assistantContent?: string
  ): string[] {
    const combinedContent =
      `${userContent} ${assistantContent || ""}`.toLowerCase();
    const topics: string[] = [];

    // Topic extraction patterns
    const topicPatterns = [
      // Programming languages
      /\b(?:javascript|typescript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin)\b/g,
      // Frameworks and libraries
      /\b(?:react|vue|angular|express|django|flask|spring|laravel|rails)\b/g,
      // Technologies
      /\b(?:docker|kubernetes|aws|azure|gcp|database|api|rest|graphql|sql|nosql)\b/g,
      // Concepts
      /\b(?:algorithm|optimization|performance|security|authentication|authorization)\b/g,
      // General topics
      /\b(?:machine learning|artificial intelligence|data science|web development|mobile|frontend|backend)\b/g,
    ];

    topicPatterns.forEach((pattern) => {
      const matches = combinedContent.match(pattern);
      if (matches) {
        topics.push(...matches);
      }
    });

    // Extract noun phrases as potential topics
    const nounPhrases = combinedContent.match(
      /\b(?:how to|what is|how does|why does|when to)\s+[\w\s]{3,20}\b/g
    );
    if (nounPhrases) {
      topics.push(
        ...nounPhrases.map((phrase) =>
          phrase.replace(/^(?:how to|what is|how does|why does|when to)\s+/, "")
        )
      );
    }

    return Array.from(new Set(topics)).slice(0, 8);
  }

  private static isCommonWord(word: string): boolean {
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "this",
      "that",
      "these",
      "those",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "can",
      "may",
      "might",
      "must",
      "shall",
      "will",
      "would",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
    ]);

    return commonWords.has(word);
  }

  private static extractEntityChain(turnContexts: TurnContext[]): string[] {
    const entityCounts = new Map<string, number>();

    turnContexts.forEach((context) => {
      context.extractedEntities.forEach((entity) => {
        const normalized = entity.toLowerCase();
        entityCounts.set(
          normalized,
          (entityCounts.get(normalized) || 0) + context.contextWeight
        );
      });
    });

    return Array.from(entityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([entity]) => entity);
  }

  private static extractTopicChain(turnContexts: TurnContext[]): string[] {
    const topicCounts = new Map<string, number>();

    turnContexts.forEach((context) => {
      context.keyTopics.forEach((topic) => {
        const normalized = topic.toLowerCase();
        topicCounts.set(
          normalized,
          (topicCounts.get(normalized) || 0) + context.contextWeight
        );
      });
    });

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic]) => topic);
  }

  private static calculateRelevanceMetrics(
    currentQuery: string,
    turnContexts: TurnContext[],
    combinedDocs: SearchResult[]
  ): {
    entityOverlap: number;
    topicContinuity: number;
    contextualRelevance: number;
  } {
    if (turnContexts.length === 0) {
      return { entityOverlap: 0, topicContinuity: 0, contextualRelevance: 0 };
    }

    // Calculate entity overlap across turns
    const allEntities = turnContexts.flatMap((ctx) => ctx.extractedEntities);
    const uniqueEntities = new Set(allEntities);
    const entityOverlap =
      allEntities.length > 0
        ? (allEntities.length - uniqueEntities.size) / allEntities.length
        : 0;

    // Calculate topic continuity
    const allTopics = turnContexts.flatMap((ctx) => ctx.keyTopics);
    const uniqueTopics = new Set(allTopics);
    const topicContinuity =
      allTopics.length > 0
        ? (allTopics.length - uniqueTopics.size) / allTopics.length
        : 0;

    // Calculate contextual relevance based on multi-turn scores
    const multiTurnDocs = combinedDocs.filter(
      (doc) => doc.metadata?.multiTurnScore
    );
    const avgBoost =
      multiTurnDocs.length > 0
        ? multiTurnDocs.reduce((sum, doc) => {
            const multiTurnScore = doc.metadata as
              | { multiTurnScore?: { boost?: number } }
              | undefined;
            return sum + (multiTurnScore?.multiTurnScore?.boost || 1);
          }, 0) / multiTurnDocs.length
        : 1;
    const contextualRelevance = Math.min((avgBoost - 1) * 2, 1); // Normalize to 0-1

    return {
      entityOverlap: Math.round(entityOverlap * 100) / 100,
      topicContinuity: Math.round(topicContinuity * 100) / 100,
      contextualRelevance: Math.round(contextualRelevance * 100) / 100,
    };
  }

  static formatMultiTurnSummary(results: MultiTurnResults): string {
    const { turnContexts, entityChain, topicChain, relevanceMetrics } = results;

    let summary = `Multi-turn context analysis:\n`;
    summary += `• Analyzed ${turnContexts.length} previous turns\n`;

    if (entityChain.length > 0) {
      summary += `• Key entities: ${entityChain.slice(0, 5).join(", ")}\n`;
    }

    if (topicChain.length > 0) {
      summary += `• Main topics: ${topicChain.slice(0, 3).join(", ")}\n`;
    }

    summary += `• Entity continuity: ${(relevanceMetrics.entityOverlap * 100).toFixed(0)}%\n`;
    summary += `• Topic continuity: ${(relevanceMetrics.topicContinuity * 100).toFixed(0)}%\n`;
    summary += `• Contextual relevance: ${(relevanceMetrics.contextualRelevance * 100).toFixed(0)}%`;

    return summary;
  }
}
