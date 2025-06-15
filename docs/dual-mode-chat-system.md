# Dual-Mode Chat System Implementation

## Overview

The ollama-web application now features a sophisticated dual-mode chat system that allows users to switch between two distinct interaction modes:

1. **Simple Mode**: Direct conversation with AI models
2. **Agentic Mode**: AI with advanced document search, retrieval, and reasoning capabilities

## Key Features Implemented

### 1. Mode Selector Component (`ModeSelector.tsx`)

- Modern toggle interface with visual indicators
- Disabled during streaming to prevent mode changes mid-conversation
- Clear visual feedback for active mode
- Hover states and accessibility features

### 2. Enhanced Chat Interface (`ChatInterface.tsx`)

- Updated header with modern layout
- Integrated mode selector and enhanced settings
- Conditional rendering based on current mode
- Process indicator for agentic operations

### 3. Agentic Process Indicator (`AgenticProcessIndicator.tsx`)

- Real-time progress tracking for the RAG pipeline
- Step-by-step process visualization:
  - Embedding query
  - Retrieving documents
  - Reranking results
  - Summarizing context
  - Building prompt
  - Invoking model
  - Completed
- Additional context display (document count, token usage)

### 4. Mode Information Display (`ModeInfo.tsx`)

- Informative welcome screen when no messages are present
- Mode-specific guidance and feature explanations
- Configuration status warnings for agentic mode

### 5. Enhanced Settings Panel (`EnhancedChatSettings.tsx`)

- Full-screen modal settings interface
- Mode-specific configuration options
- Agentic mode settings:
  - Vector store path configuration
  - Embedding model selection
  - Reranking model selection
- General chat settings:
  - Temperature control with visual feedback
  - Top P nucleus sampling
  - Top K token selection
- Real-time value display and intuitive sliders

## Technical Architecture

### Chat Store Integration

The `useChatStore` has been extended to support:

- Mode switching (`mode`, `setMode`)
- Process status tracking (`status`, `isStreaming`)
- Document retrieval results (`docs`)
- Token usage statistics (`tokens`)
- Error handling (`error`, `setError`)

### Agentic Pipeline Integration

The sophisticated RAG system is fully integrated:

- **Embedding Service**: Converts queries to vector representations
- **Vector Store**: Searches knowledge base for relevant documents
- **Reranking Service**: Intelligently ranks results by relevance
- **Context Injection**: Builds enhanced prompts with retrieved context
- **Streaming Response**: Real-time AI response generation

### Settings Store Enhancement

Extended to support agentic mode configuration:

- Vector store path management
- Embedding model configuration
- Reranking model settings
- Chat parameter controls

## User Experience Improvements

### Visual Design

- Modern, cohesive UI using shadcn/ui components
- Proper dark/light mode support
- Smooth transitions and animations
- Clear visual hierarchy

### Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Performance

- Conditional rendering to reduce unnecessary re-renders
- Optimized state management
- Efficient component structure

## Configuration

### Simple Mode

No additional configuration required - works out of the box with any Ollama model.

### Agentic Mode

Requires configuration of:

1. **Vector Store Path**: Location of the knowledge base
2. **Embedding Model**: Model for document similarity (e.g., `nomic-embed-text`)
3. **Reranking Model**: Model for result refinement (e.g., `llama3`)

### Example Configuration

```typescript
// Settings store configuration
{
  vectorStorePath: "/path/to/vector/store",
  embeddingModel: "nomic-embed-text",
  rerankingModel: "llama3",
  chatSettings: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40
  }
}
```

## Process Flow

### Simple Mode Flow

1. User types message
2. Message sent directly to Ollama model
3. Streaming response displayed
4. Conversation continues

### Agentic Mode Flow

1. User types message
2. **Embedding Phase**: Query converted to vector
3. **Retrieval Phase**: Relevant documents found in vector store
4. **Reranking Phase**: Results ranked by relevance
5. **Context Building**: Enhanced prompt created with retrieved context
6. **Generation Phase**: AI model generates response with context
7. **Streaming Response**: Real-time display with process indicators

## Error Handling

### Graceful Degradation

- Vector store initialization errors handled gracefully
- Missing configuration warnings displayed
- Fallback to simple mode if agentic mode fails

### User Feedback

- Clear error messages
- Process status indicators
- Configuration validation warnings

## Future Enhancements

### Planned Features

- Multiple vector store support
- Custom embedding model integration
- Advanced reranking algorithms
- Conversation memory management
- Export capabilities for both modes

### Performance Optimizations

- Lazy loading of agentic components
- Caching of embedding results
- Optimized vector searches
- Background processing improvements

## Testing

### Manual Testing Checklist

- [ ] Mode switching works correctly
- [ ] Simple mode chat functions properly
- [ ] Agentic mode with proper configuration works
- [ ] Settings panel opens and saves correctly
- [ ] Process indicators show during agentic operations
- [ ] Error states display appropriately
- [ ] Dark/light mode toggle works
- [ ] Mobile responsiveness verified

### Integration Testing

- [ ] Chat store state management
- [ ] Settings persistence
- [ ] Vector store integration
- [ ] Ollama API communication
- [ ] Streaming response handling

## Conclusion

The dual-mode chat system successfully integrates the sophisticated agentic RAG pipeline with an intuitive user interface. Users can seamlessly switch between simple direct chat and advanced document-enhanced conversations while maintaining a consistent, modern user experience.

The implementation follows React best practices, provides excellent user feedback, and maintains high performance through efficient state management and conditional rendering.
