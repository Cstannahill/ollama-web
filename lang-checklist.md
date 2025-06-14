# LangChain Integration Checklist

Use this checklist to track progress while implementing the LangChain pipeline described in `lang-implementation.md`.

- [x] Install `langchain` dependency within `ollama-ui`.
- [x] Create `types/langchain` with:
  - `AgentPipeline.ts`
  - `RetrieverOptions.ts`
  - `PromptOptions.ts`
  - `Tool.ts`
  - `index.ts` barrel file
- [x] Re-export new types from `types/index.ts`.
- [x] Implement `OllamaChat` wrapper in `src/lib/langchain/ollama-chat.ts`.
- [x] Implement `VectorStoreRetriever` in `src/lib/langchain/vector-retriever.ts`.
- [x] Implement `PromptBuilder` in `src/lib/langchain/prompt-builder.ts`.
- [x] Create `AgentPipeline` service in `src/services/agent-pipeline.ts` exposing `.use()` for additional steps.
- [x] Ensure agentic pipeline flow includes at least, but not limited to: Embedding, Reranking, RAG, Custom instructions, and all other features expected from a high quality agentic AI pipeline.
- [x] Refactor `useChatStore` to create and run the pipeline instead of calling `OllamaClient` directly.
- [x] Add unit tests for wrappers and the pipeline.
- [x] Create `docs/langchain/overview.md` and update existing diagrams to include the new pipeline.
- [x] Run `pnpm test` and `pnpm build` to verify before opening a PR.

## Progress Notes
- Implemented embedder, reranker, and RAG assembler modules.
- Refactored useChatStore to run createAgentPipeline.
- Added progress notifier feature with status updates in UI.
- Added error handling for retriever and chat invocation.
- Build and tests succeed.

Latest: Added abortable pipeline with stop control and spinner feedback. Added
RagAssembler error handling and pipeline guard. All tests pass and build
verified.
Added context summarizer step with error handling and prompt build guard. Implemented character count in chat input and colored status messages for clearer feedback. Build verified.
Added response logger step with local history, retrieval retry and empty-query safeguard. Introduced progress bar and error toast UI components. Build and tests pass.
