import type { Message, Document } from "@/types";
import { VectorStoreService } from "@/lib/vector/store";

export interface ConversationContext {
  conversationId: string;
  timestamp: number;
  userMessage: string;
  assistantResponse: string;
  mode: "simple" | "agentic";
  retrievedDocs?: number;
  topic?: string;
}

export class ConversationEmbeddingService {
  private vectorStore: VectorStoreService;
  private isEnabled: boolean = true;
  private batchSize: number = 5; // Process in batches to avoid overwhelming
  private pendingEmbeddings: ConversationContext[] = [];

  constructor() {
    this.vectorStore = new VectorStoreService();
  }

  /**
   * Enable or disable automatic conversation embedding
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Add a conversation exchange to be embedded into the vector store
   */
  async addConversationExchange(
    conversationId: string,
    userMessage: Message,
    assistantMessage: Message,
    mode: "simple" | "agentic",
    retrievedDocs?: number
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Initialize vector store if needed
      await this.vectorStore.initialize();

      const context: ConversationContext = {
        conversationId,
        timestamp: Date.now(),
        userMessage: userMessage.content,
        assistantResponse: assistantMessage.content,
        mode,
        retrievedDocs,
        topic: this.extractTopic(userMessage.content),
      };

      // Add to pending batch
      this.pendingEmbeddings.push(context);

      // Process batch if it's full or process immediately for important conversations
      if (
        this.pendingEmbeddings.length >= this.batchSize ||
        mode === "agentic"
      ) {
        await this.processPendingEmbeddings();
      }
    } catch (error) {
      console.error("Failed to add conversation exchange:", error);
    }
  }

  /**
   * Process all pending conversation embeddings
   */
  async processPendingEmbeddings(): Promise<void> {
    if (this.pendingEmbeddings.length === 0) return;

    try {
      const documents = this.pendingEmbeddings
        .map((context) => this.createDocumentsFromContext(context))
        .flat();

      if (documents.length > 0) {
        await this.vectorStore.addConversation("chat-history", documents);
        console.log(`Embedded ${documents.length} conversation documents`);
      }

      this.pendingEmbeddings = [];
    } catch (error) {
      console.error("Failed to process pending embeddings:", error);
      // Keep the failed embeddings for retry
    }
  }

  /**
   * Force process any remaining pending embeddings (call on app close/navigation)
   */
  async flushPendingEmbeddings(): Promise<void> {
    if (this.pendingEmbeddings.length > 0) {
      await this.processPendingEmbeddings();
    }
  }

  /**
   * Search for relevant past conversations
   */
  async searchConversationHistory(
    query: string,
    maxResults: number = 3
  ): Promise<ConversationContext[]> {
    try {
      await this.vectorStore.initialize();

      const results = await this.vectorStore.search(query, {
        topK: maxResults * 2, // Get more results to filter for conversation history
      });

      // Filter for conversation history documents and reconstruct contexts
      return results
        .filter((result) => result.metadata?.source === "chat-history")
        .slice(0, maxResults)
        .map((result) =>
          result.metadata
            ? this.reconstructContextFromMetadata(result.metadata)
            : null
        )
        .filter(Boolean) as ConversationContext[];
    } catch (error) {
      console.error("Failed to search conversation history:", error);
      return [];
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(): Promise<{
    totalExchanges: number;
    agenticExchanges: number;
    simpleExchanges: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
  }> {
    try {
      await this.vectorStore.initialize();
      const stats = this.vectorStore.getStats();

      // This is a simplified version - in a real implementation,
      // we'd query the metadata to get detailed statistics
      return {
        totalExchanges: Math.floor(stats.totalDocs / 2), // Approximation
        agenticExchanges: 0, // Would need metadata query
        simpleExchanges: 0, // Would need metadata query
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    } catch (error) {
      console.error("Failed to get conversation stats:", error);
      // Return empty stats instead of throwing
      return {
        totalExchanges: 0,
        agenticExchanges: 0,
        simpleExchanges: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    }
  }

  /**
   * Clear all conversation history from vector store
   */
  async clearConversationHistory(): Promise<void> {
    try {
      // This would ideally only clear conversation history documents,
      // but for now we'll provide a warning
      console.warn(
        "clearConversationHistory would clear ALL vector store data"
      );
      // await this.vectorStore.clearAll();
    } catch (error) {
      console.error("Failed to clear conversation history:", error);
    }
  }

  /**
   * Extract topic from user message using simple heuristics
   */
  private extractTopic(message: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = new Set([
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
      "how",
      "what",
      "when",
      "where",
      "why",
      "who",
    ]);

    const meaningfulWords = words
      .filter((word) => word.length > 3 && !stopWords.has(word))
      .slice(0, 3);

    return meaningfulWords.join(" ") || "general";
  }

  /**
   * Create documents from conversation context
   */
  private createDocumentsFromContext(context: ConversationContext): Document[] {
    const baseMetadata = {
      source: "chat-history",
      conversationId: context.conversationId,
      timestamp: context.timestamp,
      mode: context.mode,
      topic: context.topic,
      retrievedDocs: context.retrievedDocs,
    };

    const documents: Document[] = [];

    // Create document for user message
    documents.push({
      id: `${context.conversationId}-user-${context.timestamp}`,
      text: `User Question: ${context.userMessage}`,
      metadata: {
        ...baseMetadata,
        role: "user",
        title: `User question about ${context.topic}`,
      },
    });

    // Create document for assistant response
    documents.push({
      id: `${context.conversationId}-assistant-${context.timestamp}`,
      text: `Assistant Response: ${context.assistantResponse}`,
      metadata: {
        ...baseMetadata,
        role: "assistant",
        title: `Assistant response about ${context.topic}`,
      },
    });

    // Create combined context document for better retrieval
    documents.push({
      id: `${context.conversationId}-exchange-${context.timestamp}`,
      text: `Q: ${context.userMessage}\n\nA: ${context.assistantResponse}`,
      metadata: {
        ...baseMetadata,
        role: "exchange",
        title: `Conversation about ${context.topic}`,
      },
    });

    return documents;
  }

  /**
   * Reconstruct context from document metadata
   */
  private reconstructContextFromMetadata(
    metadata: Record<string, unknown>
  ): ConversationContext | null {
    try {
      // Type-safe metadata extraction
      const conversationId =
        typeof metadata.conversationId === "string"
          ? metadata.conversationId
          : "";
      const timestamp =
        typeof metadata.timestamp === "number"
          ? metadata.timestamp
          : Date.now();
      const userMessage =
        typeof metadata.userMessage === "string" ? metadata.userMessage : "";
      const assistantResponse =
        typeof metadata.assistantResponse === "string"
          ? metadata.assistantResponse
          : "";
      const mode =
        metadata.mode === "simple" || metadata.mode === "agentic"
          ? metadata.mode
          : "simple";
      const retrievedDocs =
        typeof metadata.retrievedDocs === "number"
          ? metadata.retrievedDocs
          : undefined;
      const topic =
        typeof metadata.topic === "string" ? metadata.topic : undefined;

      return {
        conversationId,
        timestamp,
        userMessage,
        assistantResponse,
        mode,
        retrievedDocs,
        topic,
      };
    } catch (error) {
      console.error("Failed to reconstruct context from metadata:", error);
      return null;
    }
  }
}

// Singleton instance for global use
export const conversationEmbedding = new ConversationEmbeddingService();
