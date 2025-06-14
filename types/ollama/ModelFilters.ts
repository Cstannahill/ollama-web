export interface ModelFilters {
  query?: string;
  categories?: string[];
  /**
   * Size range in megabytes.
   * [min, max]
   */
  sizeRange?: [number, number];
  sort?: "popular" | "recent" | "size" | "performance";
}
