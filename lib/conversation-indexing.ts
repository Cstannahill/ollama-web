import type { Conversation } from "@/stores/conversation-store";
import type { Message } from "@/types";

export interface ConversationIndex {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  mode: "simple" | "agentic";
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  participants: string[];
  hasCodeBlocks: boolean;
  hasImages: boolean;
  hasLinks: boolean;
  wordCount: number;
}

export class ConversationIndexer {
  private index: Map<string, ConversationIndex> = new Map();

  // Extract keywords from text using simple frequency analysis
  private extractKeywords(text: string, maxKeywords: number = 10): string[] {
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
      "is",
      "are",
      "was",
      "were",
      "been",
      "be",
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
      "this",
      "that",
      "these",
      "those",
      "what",
      "when",
      "where",
      "why",
      "how",
      "which",
      "there",
      "here",
      "then",
      "now",
      "so",
      "just",
      "also",
      "very",
      "much",
      "more",
      "like",
      "want",
      "need",
      "know",
      "think",
      "get",
      "go",
      "come",
      "see",
      "make",
      "take",
      "give",
      "use",
      "work",
      "find",
      "help",
      "try",
      "ask",
      "tell",
      "say",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.has(word));

    const wordFreq = new Map<string, number>();
    words.forEach((word) => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // Analyze message content for features
  private analyzeContent(messages: Message[]): {
    hasCodeBlocks: boolean;
    hasImages: boolean;
    hasLinks: boolean;
    wordCount: number;
  } {
    const fullContent = messages.map((m) => m.content).join(" ");

    return {
      hasCodeBlocks: /```|`[^`]+`/.test(fullContent),
      hasImages: /!\[.*?\]\(.*?\)|<img/i.test(fullContent),
      hasLinks: /\[.*?\]\(.*?\)|https?:\/\//.test(fullContent),
      wordCount: fullContent.split(/\s+/).filter((word) => word.length > 0)
        .length,
    };
  }

  // Index a single conversation
  indexConversation(conversation: Conversation): ConversationIndex {
    const fullContent = conversation.messages.map((m) => m.content).join(" ");
    const keywords = this.extractKeywords(fullContent);
    const participants = Array.from(
      new Set(conversation.messages.map((m) => m.role))
    );
    const contentAnalysis = this.analyzeContent(conversation.messages);

    const index: ConversationIndex = {
      id: conversation.id,
      title: conversation.title,
      content: fullContent,
      keywords,
      tags: conversation.tags || [],
      mode: conversation.mode,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      participants,
      ...contentAnalysis,
    };

    this.index.set(conversation.id, index);
    return index;
  }

  // Index multiple conversations
  indexConversations(conversations: Conversation[]): void {
    conversations.forEach((conv) => this.indexConversation(conv));
  }

  // Search conversations with advanced filtering
  search(
    query: string,
    filters?: {
      mode?: "simple" | "agentic";
      tags?: string[];
      hasCodeBlocks?: boolean;
      hasImages?: boolean;
      hasLinks?: boolean;
      minWordCount?: number;
      maxWordCount?: number;
      dateRange?: { start: number; end: number };
    }
  ): ConversationIndex[] {
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
    const results: Array<{ index: ConversationIndex; score: number }> = [];

    for (const [, index] of this.index) {
      // Apply filters first
      if (filters) {
        if (filters.mode && index.mode !== filters.mode) continue;
        if (
          filters.tags &&
          !filters.tags.some((tag) => index.tags.includes(tag))
        )
          continue;
        if (
          filters.hasCodeBlocks !== undefined &&
          index.hasCodeBlocks !== filters.hasCodeBlocks
        )
          continue;
        if (
          filters.hasImages !== undefined &&
          index.hasImages !== filters.hasImages
        )
          continue;
        if (
          filters.hasLinks !== undefined &&
          index.hasLinks !== filters.hasLinks
        )
          continue;
        if (filters.minWordCount && index.wordCount < filters.minWordCount)
          continue;
        if (filters.maxWordCount && index.wordCount > filters.maxWordCount)
          continue;
        if (filters.dateRange) {
          if (
            index.createdAt < filters.dateRange.start ||
            index.createdAt > filters.dateRange.end
          )
            continue;
        }
      }

      // Calculate relevance score
      let score = 0;
      const searchableText =
        `${index.title} ${index.content} ${index.keywords.join(" ")} ${index.tags.join(" ")}`.toLowerCase();

      // Exact phrase matches get highest score
      if (searchableText.includes(query.toLowerCase())) {
        score += 100;
      }

      // Individual term matches
      searchTerms.forEach((term) => {
        if (index.title.toLowerCase().includes(term)) score += 50;
        if (index.keywords.some((keyword) => keyword.includes(term)))
          score += 20;
        if (index.tags.some((tag) => tag.toLowerCase().includes(term)))
          score += 30;
        if (index.content.toLowerCase().includes(term)) score += 10;
      });

      // Boost score for recent conversations
      const daysSinceUpdate =
        (Date.now() - index.updatedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 1) score += 5;
      else if (daysSinceUpdate < 7) score += 3;
      else if (daysSinceUpdate < 30) score += 1;

      if (score > 0) {
        results.push({ index, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map((result) => result.index);
  }

  // Get conversation statistics
  getStats(): {
    totalConversations: number;
    totalMessages: number;
    totalWords: number;
    averageMessagesPerConversation: number;
    averageWordsPerConversation: number;
    modeDistribution: { simple: number; agentic: number };
    topKeywords: Array<{ keyword: string; frequency: number }>;
    topTags: Array<{ tag: string; frequency: number }>;
  } {
    const stats = {
      totalConversations: this.index.size,
      totalMessages: 0,
      totalWords: 0,
      averageMessagesPerConversation: 0,
      averageWordsPerConversation: 0,
      modeDistribution: { simple: 0, agentic: 0 },
      topKeywords: [] as Array<{ keyword: string; frequency: number }>,
      topTags: [] as Array<{ tag: string; frequency: number }>,
    };

    const keywordFreq = new Map<string, number>();
    const tagFreq = new Map<string, number>();

    for (const [, index] of this.index) {
      stats.totalMessages += index.messageCount;
      stats.totalWords += index.wordCount;
      stats.modeDistribution[index.mode]++;

      // Count keywords
      index.keywords.forEach((keyword) => {
        keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
      });

      // Count tags
      index.tags.forEach((tag) => {
        tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
      });
    }

    if (stats.totalConversations > 0) {
      stats.averageMessagesPerConversation =
        stats.totalMessages / stats.totalConversations;
      stats.averageWordsPerConversation =
        stats.totalWords / stats.totalConversations;
    }

    // Get top keywords and tags
    stats.topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, frequency]) => ({ keyword, frequency }));

    stats.topTags = Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, frequency]) => ({ tag, frequency }));

    return stats;
  }

  // Remove conversation from index
  removeConversation(id: string): void {
    this.index.delete(id);
  }

  // Clear all indexed data
  clear(): void {
    this.index.clear();
  }

  // Get all indexed conversations
  getAll(): ConversationIndex[] {
    return Array.from(this.index.values());
  }
}

// Global indexer instance
export const conversationIndexer = new ConversationIndexer();
