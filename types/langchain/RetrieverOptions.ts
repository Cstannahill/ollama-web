import type { SearchFilters } from "../";

export interface RetrieverOptions {
  filters?: SearchFilters;
  topK?: number;
}
