# Agentic Flow Enhancement Ideas

This document outlines potential improvements to strengthen the existing agentic workflow and its integration with the chat interface.

## Goals
- Provide a smoother user experience when switching between simple and agentic modes
- Increase resiliency of the agent pipeline against failures
- Offer richer functionality for advanced users
- Expand the pipeline to support new use cases

## Proposed Enhancements

### 1. Unified Pipeline Event Stream
- Formalize a typed event emitter for all pipeline stages.
- Consolidate status, metrics and error messages into a single stream.
- Allows components like `AgenticProcessIndicator` to subscribe once and render more consistent progress updates.

### 2. Graceful Timeout Handling
- Configure per-step timeouts (embedding, retrieval, reranking, generation).
- Abort a step with a clear error message if it exceeds its limit.
- Prevents the chat UI from hanging indefinitely when external services stall.

### 3. Incremental Context Retrieval
- Retrieve context documents in small batches and stream them to the UI.
- Users can see relevant snippets sooner while the remaining search completes in the background.
- Useful for large vector stores or slow disk access.

### 4. Conversation Memory Store
- Persist short conversation summaries in the vector store for long term recall.
- When starting a new thread, the pipeline can retrieve past summaries to maintain context across sessions.

### 5. Custom Tool Plugins
- Expose a lightweight plugin system for adding pipeline tools.
- Tools could perform web lookups, execute code, or query external APIs before generation.
- Users enable or disable plugins in **EnhancedChatSettings**.

### 6. Advanced Metrics Panel
- Expand the `PipelineMetrics` data to include token usage per step and cache hit rates.
- Display these metrics in a collapsible panel for debugging and optimization.

### 7. Conversation-Level System Prompts
- Allow a custom system prompt to be stored with each conversation.
- The agent pipeline uses this prompt when generating responses for that thread.

### 8. Improved Error UI
- Show detailed error summaries with remediation tips inside `AgentError`.
- Offer retry actions when failures are transient (e.g. network issues).

### 9. Offline Cache of Retrieved Docs
- Optionally cache retrieved documents locally so repeated questions load instantly.
- Include cache controls in the settings panel to purge or refresh stored data.

### 10. Flexible Pipeline Composition
- Provide a configuration screen for reordering or disabling individual pipeline steps.
- Developers can experiment with alternate flows without modifying core code.

## Next Steps
1. Prioritize enhancements based on user feedback and performance metrics.
2. Break down each improvement into standalone tasks under `docs/` with design sketches and type updates.
3. Ensure all new types live in `types/langchain` or related folders as defined in `AGENTS.md`.

These ideas aim to evolve the current agentic flow into a more robust and extensible system while keeping the chat experience responsive and user friendly.
