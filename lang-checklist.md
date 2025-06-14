# LangChain Integration Checklist

Use this checklist to track progress while implementing the LangChain pipeline described in `lang-implementation.md`.

- [x] Install `langchain` dependency within `ollama-ui`.
- [ ] Create `types/langchain` with:
  - `AgentPipeline.ts`
  - `RetrieverOptions.ts`
  - `PromptOptions.ts`
  - `Tool.ts`
  - `index.ts` barrel file
- [ ] Re-export new types from `types/index.ts`.
- [ ] Implement `OllamaChat` wrapper in `src/lib/langchain/ollama-chat.ts`.
- [ ] Implement `VectorStoreRetriever` in `src/lib/langchain/vector-retriever.ts`.
- [ ] Implement `PromptBuilder` in `src/lib/langchain/prompt-builder.ts`.
- [ ] Create `AgentPipeline` service in `src/services/agent-pipeline.ts` exposing `.use()` for additional steps.
- [ ] Refactor `useChatStore` to create and run the pipeline instead of calling `OllamaClient` directly.
- [ ] Add unit tests for wrappers and the pipeline.
- [ ] Create `docs/langchain/overview.md` and update existing diagrams to include the new pipeline.
- [ ] Run `pnpm test` and `pnpm build` to verify before opening a PR.
