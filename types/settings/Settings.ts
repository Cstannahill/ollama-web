import type { ChatSettings } from "./ChatSettings";

export interface Settings {
  theme: "light" | "dark" | "system";
  vectorStorePath: string | null;
  embeddingModel: string | null;
  rerankingModel: string | null;
  chatSettings: ChatSettings;
}
