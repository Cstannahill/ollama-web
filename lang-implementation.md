# LangChain Integration Plan

## Current Agentic Flow

The existing agentic mode is described in `docs/agentic-chat/overview.md`:

- _"Enable advanced conversation capabilities with context-aware responses. When activated, the chat retrieves relevant information from the local vector database before sending messages to Ollama."_
- Mode selection is handled in `ChatSettings` and persisted in `useChatStore`.
- When the mode is `agentic`, `vectorStore.search` results are prepended to the conversation prior to calling the Ollama API.
- The architecture is summarized by a sequence where `ChatStore` talks to `VectorStoreService` and then to `OllamaAPI`.

The vector database component outlined in `docs/vector-store/overview.md` notes that it **runs entirely on the user's machine** and is initialized via `useSettingsStore`.

## Limitations

- Retrieval is a single step with no orchestration of further tasks (summarization, tool use, etc.).
- `VectorStoreService` is mostly stubbed out, leaving the agentic flow minimal.
- Adding new behaviors would require custom wiring in `chat-store.ts` and other modules.

## Why LangChain?

LangChain already provides primitives for retrieval‑augmented generation, tool calling, and agent execution. Our flow is linear and does not require a complex state graph, so full LangGraph state machines are unnecessary. A LangChain pipeline will allow us to compose retrieval, prompting and potential tools with minimal boilerplate.

## Proposed Restructure

1. **Wrap Ollama in a LangChain LLM interface.**
   - Implement an `OllamaChat` class that conforms to `BaseChatModel`.
   - Reuse the existing `OllamaClient` connection logic described in `docs/ollama-connection/overview.md`.
2. **Create a Retriever backed by the current vector store.**
   - Use the local `VectorStoreService` to implement LangChain's `VectorStore` interface.
3. **Build a `RunnableSequence` agent.**
   - Steps: retrieve context → format prompt with messages + context → call `OllamaChat`.
   - Additional tools (export, summarization) can be plugged in as LangChain tools in the future.
4. **Update `useChatStore.sendMessage`.**
   - Instead of manually performing search and looping over the Ollama response, invoke the LangChain pipeline which returns a streaming iterator.
5. **Retain user settings.**
   - Keep `chat-settings` and `settings-store` as the source of truth for temperature, model selection and vector database path.

## Benefits

- Clear separation of retrieval and generation logic.
- Easier extension with tools or multi-step chains (e.g., summarizing past conversations).
- Reduced custom code in state stores; LangChain handles orchestration.

### Next Steps

- Prototype the `OllamaChat` wrapper and retriever.
- Replace direct API calls in `chat-store.ts` with the LangChain agent.
- Document the updated architecture in `/docs/agentic-chat/overview.md` once implemented.
