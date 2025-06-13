import type {
  Document,
  SearchFilters,
  SearchResult,
  VectorStoreOptions,
} from "@/types";

export class VectorStoreService {
  private initialized = false;

  async initialize(options: VectorStoreOptions): Promise<void> {
    void options;
    this.initialized = true;
  }

  async addConversation(conversationId: string, messages: Document[]): Promise<void> {
    void conversationId;
    void messages;
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    void query;
    void filters;
    return [];
  }
}
