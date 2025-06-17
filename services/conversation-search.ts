import { Conversation } from "../stores/conversation-store";
import type { Message } from "../types";

export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageIndex: number;
  message: Message;
  relevanceScore: number;
  highlightedContent: string;
  contextBefore?: string;
  contextAfter?: string;
}

export interface SearchOptions {
  query: string;
  matchType: "fuzzy" | "exact" | "regex";
  includeSystemMessages: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  conversationIds?: string[];
  maxResults?: number;
}

export class ConversationSearchService {
  private static readonly CONTEXT_LENGTH = 100; // Characters of context to include

  static searchConversations(
    conversations: Conversation[],
    options: SearchOptions
  ): SearchResult[] {
    const {
      query,
      matchType = "fuzzy",
      includeSystemMessages = false,
      dateRange,
      conversationIds,
      maxResults = 50,
    } = options;

    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchRegex = this.buildSearchRegex(query, matchType);

    // Filter conversations by ID if specified
    const targetConversations = conversationIds
      ? conversations.filter((conv) => conversationIds.includes(conv.id))
      : conversations;

    for (const conversation of targetConversations) {
      // Skip conversations outside date range
      if (
        dateRange &&
        !this.isInDateRange(new Date(conversation.createdAt), dateRange)
      ) {
        continue;
      }

      // Search through messages
      for (
        let messageIndex = 0;
        messageIndex < conversation.messages.length;
        messageIndex++
      ) {
        const message = conversation.messages[messageIndex];

        // Skip system messages if not included
        if (!includeSystemMessages && message.role === "system") {
          continue;
        }

        // Skip messages outside date range
        // TODO: Add timestamp support to Message type if needed
        // if (dateRange && !this.isInDateRange(message.timestamp, dateRange)) {
        //   continue;
        // }

        // Search in message content
        const matches = this.findMatches(
          message.content,
          searchRegex,
          matchType
        );
        if (matches.length > 0) {
          const relevanceScore = this.calculateRelevanceScore(
            message.content,
            query,
            matches,
            matchType
          );

          const highlightedContent = this.highlightMatches(
            message.content,
            matches
          );

          const context = this.getMessageContext(
            conversation.messages,
            messageIndex
          );

          results.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            messageIndex,
            message,
            relevanceScore,
            highlightedContent,
            contextBefore: context.before,
            contextAfter: context.after,
          });
        }

        // Also search in conversation title
        const titleMatches = this.findMatches(
          conversation.title,
          searchRegex,
          matchType
        );
        if (titleMatches.length > 0 && messageIndex === 0) {
          // Only add title match for the first message to avoid duplicates
          const relevanceScore =
            this.calculateRelevanceScore(
              conversation.title,
              query,
              titleMatches,
              matchType
            ) + 0.5; // Boost title matches

          results.push({
            conversationId: conversation.id,
            conversationTitle: this.highlightMatches(
              conversation.title,
              titleMatches
            ),
            messageIndex: 0,
            message: conversation.messages[0],
            relevanceScore,
            highlightedContent:
              message.content.substring(0, 200) +
              (message.content.length > 200 ? "..." : ""),
            contextBefore: "Title match",
            contextAfter: undefined,
          });
        }
      }
    }

    // Sort by relevance score (descending) and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  static searchByDateRange(
    conversations: Conversation[],
    dateRange: { start?: Date; end?: Date }
  ): Conversation[] {
    return conversations.filter((conv) =>
      this.isInDateRange(new Date(conv.createdAt), dateRange)
    );
  }

  static searchByTags(
    conversations: Conversation[],
    tags: string[]
  ): Conversation[] {
    if (tags.length === 0) return conversations;

    return conversations.filter((conv) => {
      // Assuming conversations might have tags in the future
      // For now, search in title and messages for tag-like patterns
      const content =
        conv.title + " " + conv.messages.map((m) => m.content).join(" ");
      return tags.some(
        (tag) =>
          content.toLowerCase().includes(tag.toLowerCase()) ||
          content.includes(`#${tag}`) ||
          content.includes(`@${tag}`)
      );
    });
  }

  static getSearchSuggestions(
    conversations: Conversation[],
    partialQuery: string
  ): string[] {
    if (partialQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = partialQuery.toLowerCase();

    // Extract common words and phrases from conversations
    const wordFrequency = new Map<string, number>();

    conversations.forEach((conv) => {
      const allText =
        conv.title + " " + conv.messages.map((m) => m.content).join(" ");
      const words = allText
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2);

      words.forEach((word) => {
        if (word.startsWith(lowerQuery)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });

    // Get top suggestions by frequency
    Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word]) => suggestions.add(word));

    return Array.from(suggestions);
  }

  private static buildSearchRegex(
    query: string,
    matchType: SearchOptions["matchType"]
  ): RegExp {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    switch (matchType) {
      case "exact":
        return new RegExp(`\\b${escapedQuery}\\b`, "gi");
      case "regex":
        try {
          return new RegExp(query, "gi");
        } catch {
          return new RegExp(escapedQuery, "gi");
        }
      case "fuzzy":
      default:
        return new RegExp(escapedQuery, "gi");
    }
  }

  private static findMatches(
    text: string,
    regex: RegExp,
    matchType: SearchOptions["matchType"]
  ): RegExpMatchArray[] {
    const matches: RegExpMatchArray[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match);
      if (regex.global === false) break;
    }

    return matches;
  }

  private static calculateRelevanceScore(
    text: string,
    query: string,
    matches: RegExpMatchArray[],
    matchType: SearchOptions["matchType"]
  ): number {
    let score = 0;
    const textLength = text.length;
    const queryLength = query.length;

    // Base score from number of matches
    score += matches.length * 0.1;

    // Boost for exact matches
    if (matchType === "exact") {
      score += 0.3;
    }

    // Boost for early occurrences
    matches.forEach((match) => {
      const position = match.index || 0;
      const positionScore = 1 - position / textLength;
      score += positionScore * 0.2;
    });

    // Boost for query length relative to text length
    const lengthRatio = queryLength / textLength;
    score += Math.min(lengthRatio * 0.5, 0.3);

    // Boost for complete word matches
    const wordBoundaryRegex = new RegExp(
      `\\b${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    if (wordBoundaryRegex.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  private static highlightMatches(
    text: string,
    matches: RegExpMatchArray[]
  ): string {
    if (matches.length === 0) return text;

    // Sort matches by position to process them in order
    const sortedMatches = matches.sort(
      (a, b) => (a.index || 0) - (b.index || 0)
    );

    let highlighted = text;
    let offset = 0;

    sortedMatches.forEach((match) => {
      if (match.index !== undefined) {
        const start = match.index + offset;
        const end = start + match[0].length;
        const before = highlighted.substring(0, start);
        const matchText = highlighted.substring(start, end);
        const after = highlighted.substring(end);

        highlighted =
          before +
          `<mark class="bg-yellow-200 dark:bg-yellow-800">${matchText}</mark>` +
          after;
        offset += '<mark class="bg-yellow-200 dark:bg-yellow-800"></mark>'
          .length;
      }
    });

    return highlighted;
  }

  private static getMessageContext(
    messages: Message[],
    messageIndex: number
  ): { before?: string; after?: string } {
    const context: { before?: string; after?: string } = {};

    // Get previous message for context
    if (messageIndex > 0) {
      const prevMessage = messages[messageIndex - 1];
      const prevContent = prevMessage.content;
      if (prevContent.length > this.CONTEXT_LENGTH) {
        context.before = "..." + prevContent.slice(-this.CONTEXT_LENGTH);
      } else {
        context.before = prevContent;
      }
    }

    // Get next message for context
    if (messageIndex < messages.length - 1) {
      const nextMessage = messages[messageIndex + 1];
      const nextContent = nextMessage.content;
      if (nextContent.length > this.CONTEXT_LENGTH) {
        context.after = nextContent.slice(0, this.CONTEXT_LENGTH) + "...";
      } else {
        context.after = nextContent;
      }
    }

    return context;
  }

  private static isInDateRange(
    date: Date,
    dateRange: { start?: Date; end?: Date }
  ): boolean {
    const checkDate = new Date(date);

    if (dateRange.start && checkDate < dateRange.start) {
      return false;
    }

    if (dateRange.end && checkDate > dateRange.end) {
      return false;
    }

    return true;
  }

  static exportSearchResults(results: SearchResult[]): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalResults: results.length,
      results: results.map((result) => ({
        conversationTitle: result.conversationTitle,
        messageRole: result.message.role,
        messageContent: result.message.content,
        messageTimestamp: new Date().toISOString(), // TODO: Use actual message timestamp when available
        relevanceScore: result.relevanceScore,
        context: {
          before: result.contextBefore,
          after: result.contextAfter,
        },
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  static getSearchStats(conversations: Conversation[]): {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    dateRange: { earliest?: Date; latest?: Date };
    topWords: Array<{ word: string; frequency: number }>;
  } {
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce(
      (sum, conv) => sum + conv.messages.length,
      0
    );
    const avgMessagesPerConversation = totalMessages / totalConversations || 0;

    // Find date range
    let earliest: Date | undefined;
    let latest: Date | undefined;

    conversations.forEach((conv) => {
      const convDate = new Date(conv.createdAt);
      if (!earliest || convDate < earliest) earliest = convDate;
      if (!latest || convDate > latest) latest = convDate;

      // TODO: Add timestamp support to Message type when needed
      // For now, use conversation dates as approximation
      // conv.messages.forEach((msg) => {
      //   const msgDate = new Date(msg.timestamp);
      //   if (!earliest || msgDate < earliest) earliest = msgDate;
      //   if (!latest || msgDate > latest) latest = msgDate;
      // });
    });

    // Calculate word frequencies
    const wordFrequency = new Map<string, number>();
    conversations.forEach((conv) => {
      const allText =
        conv.title + " " + conv.messages.map((m) => m.content).join(" ");
      const words = allText
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !this.isStopWord(word));

      words.forEach((word) => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      });
    });

    const topWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, frequency]) => ({ word, frequency }));

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation:
        Math.round(avgMessagesPerConversation * 10) / 10,
      dateRange: { earliest, latest },
      topWords,
    };
  }

  private static isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
      "when",
      "make",
      "can",
      "like",
      "time",
      "no",
      "just",
      "him",
      "know",
      "take",
      "people",
      "into",
      "year",
      "your",
      "good",
      "some",
      "could",
      "them",
      "see",
      "other",
      "than",
      "then",
      "now",
      "look",
      "only",
      "come",
      "its",
      "over",
      "think",
      "also",
      "back",
      "after",
      "use",
      "two",
      "how",
      "our",
      "work",
      "first",
      "well",
      "way",
      "even",
      "new",
      "want",
      "because",
      "any",
      "these",
      "give",
      "day",
      "most",
      "us",
    ]);

    return stopWords.has(word);
  }
}
