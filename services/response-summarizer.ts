import type { Message } from "../types";

export interface SummaryOptions {
  maxLength: number;
  bulletPoints: boolean;
  includeKeywords: boolean;
  summaryStyle: "concise" | "detailed" | "bullet-points";
}

export interface ResponseSummary {
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  summary: string;
  keyPoints: string[];
  keywords: string[];
  confidence: number;
  generatedAt: Date;
}

export class ResponseSummarizerService {
  private static readonly DEFAULT_OPTIONS: SummaryOptions = {
    maxLength: 200,
    bulletPoints: true,
    includeKeywords: true,
    summaryStyle: "bullet-points",
  };

  private static readonly LONG_RESPONSE_THRESHOLD = 1000; // Characters
  private static readonly SUMMARY_TRIGGERS = {
    length: 1000, // Auto-summarize responses over 1000 characters
    sentences: 10, // Auto-summarize responses over 10 sentences
    paragraphs: 4, // Auto-summarize responses over 4 paragraphs
  };

  static shouldSummarize(content: string): boolean {
    const length = content.length;
    const sentences = this.countSentences(content);
    const paragraphs = this.countParagraphs(content);

    return (
      length > this.SUMMARY_TRIGGERS.length ||
      sentences > this.SUMMARY_TRIGGERS.sentences ||
      paragraphs > this.SUMMARY_TRIGGERS.paragraphs
    );
  }

  static async summarizeResponse(
    content: string,
    options: Partial<SummaryOptions> = {}
  ): Promise<ResponseSummary> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    const originalLength = content.length;

    try {
      // Extract key information
      const sentences = this.extractSentences(content);
      const paragraphs = this.extractParagraphs(content);
      const keywords = this.extractKeywords(content);

      // Generate summary based on style
      let summary: string;
      let keyPoints: string[] = [];

      switch (opts.summaryStyle) {
        case "bullet-points":
          keyPoints = this.generateBulletPoints(sentences, paragraphs);
          summary = keyPoints.map((point) => `• ${point}`).join("\n");
          break;
        case "concise":
          summary = this.generateConciseSummary(sentences, opts.maxLength);
          keyPoints = this.extractMainPoints(sentences);
          break;
        case "detailed":
          summary = this.generateDetailedSummary(paragraphs, opts.maxLength);
          keyPoints = this.extractMainPoints(sentences);
          break;
        default:
          summary = this.generateConciseSummary(sentences, opts.maxLength);
          keyPoints = this.extractMainPoints(sentences);
      }

      const summaryLength = summary.length;
      const compressionRatio =
        originalLength > 0 ? summaryLength / originalLength : 0;
      const confidence = this.calculateConfidence(content, summary, keyPoints);

      return {
        originalLength,
        summaryLength,
        compressionRatio,
        summary,
        keyPoints,
        keywords: opts.includeKeywords ? keywords : [],
        confidence,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error generating summary:", error);

      // Fallback: simple truncation with ellipsis
      const fallbackSummary =
        content.length > opts.maxLength
          ? content.substring(0, opts.maxLength) + "..."
          : content;

      return {
        originalLength,
        summaryLength: fallbackSummary.length,
        compressionRatio: fallbackSummary.length / originalLength,
        summary: fallbackSummary,
        keyPoints: [],
        keywords: [],
        confidence: 0.3, // Low confidence for fallback
        generatedAt: new Date(),
      };
    }
  }

  static async summarizeConversation(
    messages: Message[]
  ): Promise<ResponseSummary> {
    const conversationText = messages
      .filter((msg) => msg.role !== "system")
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    return this.summarizeResponse(conversationText, {
      maxLength: 500,
      summaryStyle: "detailed",
      bulletPoints: true,
      includeKeywords: true,
    });
  }

  private static countSentences(text: string): number {
    return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  }

  private static countParagraphs(text: string): number {
    return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  }

  private static extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10) // Filter out very short fragments
      .slice(0, 20); // Limit for processing
  }

  private static extractParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20) // Filter out very short paragraphs
      .slice(0, 10); // Limit for processing
  }

  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.isStopWord(word));

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach((word) => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Return top keywords
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static generateBulletPoints(
    sentences: string[],
    paragraphs: string[]
  ): string[] {
    const points: string[] = [];

    // If we have clear paragraphs, use them as the basis
    if (paragraphs.length > 1) {
      paragraphs.slice(0, 5).forEach((paragraph) => {
        const firstSentence = paragraph.split(/[.!?]/)[0]?.trim();
        if (firstSentence && firstSentence.length > 10) {
          points.push(this.cleanPoint(firstSentence));
        }
      });
    } else {
      // Use key sentences
      const keyIndices = this.selectKeySentences(sentences, 5);
      keyIndices.forEach((index) => {
        if (sentences[index]) {
          points.push(this.cleanPoint(sentences[index]));
        }
      });
    }

    return points.filter((point) => point.length > 0);
  }

  private static generateConciseSummary(
    sentences: string[],
    maxLength: number
  ): string {
    const keyIndices = this.selectKeySentences(sentences, 3);
    const keySentences = keyIndices.map((i) => sentences[i]).filter(Boolean);

    let summary = keySentences.join(". ");

    // Truncate if necessary
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + "...";
    }

    return summary;
  }

  private static generateDetailedSummary(
    paragraphs: string[],
    maxLength: number
  ): string {
    // Take first sentence from each paragraph
    const summaryParts = paragraphs
      .slice(0, 4)
      .map((paragraph) => {
        const firstSentence = paragraph.split(/[.!?]/)[0]?.trim();
        return firstSentence || "";
      })
      .filter((part) => part.length > 10);

    let summary = summaryParts.join(". ");

    // Truncate if necessary
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + "...";
    }

    return summary;
  }

  private static extractMainPoints(sentences: string[]): string[] {
    // Select sentences that likely contain main points
    return sentences
      .filter((sentence) => {
        // Look for sentences with certain patterns that indicate importance
        const lowerSentence = sentence.toLowerCase();
        return (
          lowerSentence.includes("important") ||
          lowerSentence.includes("key") ||
          lowerSentence.includes("main") ||
          lowerSentence.includes("conclusion") ||
          lowerSentence.includes("summary") ||
          lowerSentence.startsWith("first") ||
          lowerSentence.startsWith("second") ||
          lowerSentence.startsWith("finally") ||
          sentence.length > 50 // Longer sentences often contain more information
        );
      })
      .slice(0, 5)
      .map((sentence) => this.cleanPoint(sentence));
  }

  private static selectKeySentences(
    sentences: string[],
    count: number
  ): number[] {
    if (sentences.length <= count) {
      return sentences.map((_, index) => index);
    }

    // Score sentences based on various factors
    const scores = sentences.map((sentence, index) => {
      let score = 0;

      // Position scoring (first and last sentences often important)
      if (index === 0) score += 0.3;
      if (index === sentences.length - 1) score += 0.2;

      // Length scoring (moderate length sentences often most informative)
      const length = sentence.length;
      if (length > 50 && length < 150) score += 0.2;

      // Content scoring
      const lowerSentence = sentence.toLowerCase();
      if (lowerSentence.includes("important") || lowerSentence.includes("key"))
        score += 0.3;
      if (
        lowerSentence.includes("because") ||
        lowerSentence.includes("therefore")
      )
        score += 0.2;
      if (lowerSentence.includes("however") || lowerSentence.includes("but"))
        score += 0.15;

      return { index, score };
    });

    // Return indices of top-scored sentences
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((item) => item.index)
      .sort((a, b) => a - b); // Maintain original order
  }

  private static calculateConfidence(
    original: string,
    summary: string,
    keyPoints: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Factor in compression ratio
    const compressionRatio = summary.length / original.length;
    if (compressionRatio > 0.1 && compressionRatio < 0.4) {
      confidence += 0.2; // Good compression ratio
    }

    // Factor in key points extraction
    if (keyPoints.length > 0) {
      confidence += Math.min(keyPoints.length * 0.05, 0.2);
    }

    // Factor in summary quality indicators
    if (summary.includes(".") && !summary.endsWith("...")) {
      confidence += 0.1; // Complete sentences
    }

    return Math.min(confidence, 1.0);
  }

  private static cleanPoint(point: string): string {
    return point
      .replace(/^\s*[-•*]\s*/, "") // Remove bullet points
      .replace(
        /^(First|Second|Third|Finally|In conclusion|Additionally),?\s*/i,
        ""
      ) // Remove sequence words
      .trim();
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
      "is",
      "was",
      "are",
      "been",
      "being",
      "has",
      "had",
      "having",
      "does",
      "did",
      "doing",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "shall",
      "can",
      "cannot",
    ]);

    return stopWords.has(word);
  }

  static formatSummaryForDisplay(summary: ResponseSummary): {
    displayText: string;
    stats: string;
    confidence: string;
  } {
    const compressionPercent = Math.round((1 - summary.compressionRatio) * 100);
    const confidencePercent = Math.round(summary.confidence * 100);

    return {
      displayText: summary.summary,
      stats: `${summary.originalLength} → ${summary.summaryLength} chars (${compressionPercent}% shorter)`,
      confidence: `${confidencePercent}% confidence`,
    };
  }
}
