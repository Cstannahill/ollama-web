export interface Tool {
  name: string;
  invoke(input: string): Promise<string>;
}
