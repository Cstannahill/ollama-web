export class BrowserVectorStore {
  private uri: string | null = null;

  async initialize(path: string) {
    this.uri = path.startsWith("indexeddb://") ? path : `indexeddb://${path}`;
  }
}
