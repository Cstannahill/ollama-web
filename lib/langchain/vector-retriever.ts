import type { RetrieverOptions, SearchResult } from "@/types";
import { vectorStore } from "@/lib/vector";
import { conversationEmbedding } from "@/services/conversation-embedding";

export class VectorStoreRetriever {
  constructor(private options?: RetrieverOptions) {}

  async getRelevantDocuments(query: string): Promise<SearchResult[]> {
    try {
      const maxDocs = this.options?.filters?.topK || 5;
      const documentSplit = Math.max(1, Math.floor(maxDocs * 0.7)); // 70% for documents
      const conversationSplit = maxDocs - documentSplit; // 30% for conversation history

      // Search regular documents
      const documentResults = await vectorStore.search(query, {
        ...this.options?.filters,
        topK: documentSplit,
      });

      // Search conversation history
      const conversationHistory =
        await conversationEmbedding.searchConversationHistory(
          query,
          conversationSplit
        );

      // Convert conversation history to SearchResult format
      const conversationResults: SearchResult[] = conversationHistory.map(
        (context) => ({
          id: `${context.conversationId}-${context.timestamp}`,
          text: `Previous conversation about ${context.topic}:\nQ: ${context.userMessage}\nA: ${context.assistantResponse}`,
          metadata: {
            source: "conversation-history",
            conversationId: context.conversationId,
            timestamp: context.timestamp,
            mode: context.mode,
            topic: context.topic,
            title: `Past conversation: ${context.topic}`,
          },
          score: 0.8, // Give conversation history a decent relevance score
        })
      );

      // Combine and sort by relevance
      const allResults = [...documentResults, ...conversationResults];
      allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Return up to the requested number of results
      return allResults.slice(0, maxDocs);
    } catch (error) {
      console.error("VectorStoreRetriever error", error);
      return [];
    }
  }

  /**
   * Get only document results (excluding conversation history)
   */
  async getDocumentResults(query: string): Promise<SearchResult[]> {
    try {
      return await vectorStore.search(query, this.options?.filters);
    } catch (error) {
      console.error("VectorStoreRetriever document search error", error);
      return [];
    }
  }

  /**
   * Get only conversation history results
   */
  async getConversationResults(query: string): Promise<SearchResult[]> {
    try {
      const maxResults = this.options?.filters?.topK || 5;
      const conversationHistory =
        await conversationEmbedding.searchConversationHistory(
          query,
          maxResults
        );

      return conversationHistory.map((context) => ({
        id: `${context.conversationId}-${context.timestamp}`,
        text: `Q: ${context.userMessage}\nA: ${context.assistantResponse}`,
        metadata: {
          source: "conversation-history",
          conversationId: context.conversationId,
          timestamp: context.timestamp,
          mode: context.mode,
          topic: context.topic,
          title: `Past conversation: ${context.topic}`,
        },
        score: 0.8,
      }));
    } catch (error) {
      console.error("VectorStoreRetriever conversation search error", error);
      return [];
    }
  }

  /**
   * Incremental document retrieval - yields results as they're found
   * This provides better perceived performance by showing documents as they're discovered
   */
  async *getRelevantDocumentsIncremental(query: string): AsyncGenerator<{
    type: "documents" | "conversations" | "complete";
    results: SearchResult[];
    progress: number;
    total: number;
  }> {
    try {
      const maxDocs = this.options?.filters?.topK || 5;
      const documentSplit = Math.max(1, Math.floor(maxDocs * 0.7)); // 70% for documents
      const conversationSplit = maxDocs - documentSplit; // 30% for conversation history

      const allResults: SearchResult[] = [];
      let totalProgress = 0;
      const totalSteps = 2; // documents + conversations

      // Step 1: Search regular documents
      yield {
        type: "documents" as const,
        results: [],
        progress: 0,
        total: totalSteps,
      };

      const documentResults = await vectorStore.search(query, {
        ...this.options?.filters,
        topK: documentSplit,
      });

      allResults.push(...documentResults);
      totalProgress++;

      yield {
        type: "documents" as const,
        results: documentResults,
        progress: totalProgress,
        total: totalSteps,
      };

      // Step 2: Search conversation history
      const conversationHistory =
        await conversationEmbedding.searchConversationHistory(
          query,
          conversationSplit
        );

      // Convert conversation history to SearchResult format
      const conversationResults: SearchResult[] = conversationHistory.map(
        (context) => ({
          id: `${context.conversationId}-${context.timestamp}`,
          text: `Previous conversation about ${context.topic}:\nQ: ${context.userMessage}\nA: ${context.assistantResponse}`,
          metadata: {
            source: "conversation-history",
            conversationId: context.conversationId,
            timestamp: context.timestamp,
            mode: context.mode,
            topic: context.topic,
            title: `Past conversation: ${context.topic}`,
          },
          score: 0.8,
        })
      );

      allResults.push(...conversationResults);
      totalProgress++;

      yield {
        type: "conversations" as const,
        results: conversationResults,
        progress: totalProgress,
        total: totalSteps,
      };

      // Final step: Sort and return combined results
      allResults.sort((a, b) => (b.score || 0) - (a.score || 0));
      const finalResults = allResults.slice(0, maxDocs);

      yield {
        type: "complete" as const,
        results: finalResults,
        progress: totalSteps,
        total: totalSteps,
      };
    } catch (error) {
      console.error("VectorStoreRetriever incremental error", error);
      yield {
        type: "complete" as const,
        results: [],
        progress: 0,
        total: 1,
      };
    }
  }
}
