# Ollama Web UI - Advanced Chat Interface

A sophisticated web interface for Ollama with dual-mode chat capabilities, featuring both simple direct chat and advanced agentic RAG (Retrieval-Augmented Generation) conversations.

## 🚀 Key Features

### Dual-Mode Chat System

- **Simple Mode**: Direct, fast conversations with AI models
- **Agentic Mode**: Advanced document-enhanced chat with RAG pipeline
- Seamless mode switching with visual indicators
- Real-time process visualization for complex operations

### Advanced RAG Pipeline

- **Document Embedding**: Vector-based document similarity search
- **Intelligent Retrieval**: Sophisticated document ranking and selection
- **Context Reranking**: AI-powered result refinement
- **Enhanced Prompting**: Context-aware prompt construction
- **Streaming Responses**: Real-time response generation with progress tracking

### Modern UI/UX

- **shadcn/ui Components**: Professional, accessible design system
- **Dark/Light Theme**: Automatic theme switching with user preference
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Progress indicators and status updates
- **Intuitive Settings**: Comprehensive configuration panel

### Technical Excellence

- **TypeScript**: Full type safety and enhanced developer experience
- **Next.js 15**: Latest framework features with Turbopack
- **Zustand**: Efficient state management
- **Performance Optimized**: Lazy loading and conditional rendering

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Ollama installed and running
- (Optional) Vector store for agentic mode

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ollama-web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the interface.

### Configuration

#### Simple Mode

Works immediately with any Ollama model - no additional setup required.

#### Agentic Mode

Requires configuration in the Settings panel:

1. **Vector Store Path**: Location of your document embeddings
2. **Embedding Model**: Model for document similarity (e.g., `nomic-embed-text`)
3. **Reranking Model**: Model for result refinement (e.g., `llama3`)

### Example Agentic Setup

```bash
# Install required Ollama models
ollama pull nomic-embed-text
ollama pull llama3

# Configure in Settings UI
Vector Store Path: /path/to/your/vector/store
Embedding Model: nomic-embed-text
Reranking Model: llama3
```

## 📖 Usage

### Simple Mode

1. Select "Simple" mode from the mode selector
2. Type your message and press Enter
3. Receive direct AI responses

### Agentic Mode

1. Configure vector store and models in Settings
2. Select "Agentic" mode from the mode selector
3. Ask questions that benefit from document context
4. Watch the RAG pipeline process in real-time:
   - Query embedding
   - Document retrieval
   - Result reranking
   - Context summarization
   - Enhanced response generation

### Settings Panel

Access comprehensive settings via the Settings button:

- **Temperature**: Control response creativity (0.0-2.0)
- **Top P**: Nucleus sampling threshold
- **Top K**: Token selection limit
- **Vector Store Configuration**: Agentic mode setup
- **Model Selection**: Embedding and reranking models

## 🏗️ Architecture

### Component Structure

```
components/
├── chat/
│   ├── ChatInterface.tsx          # Main chat interface
│   ├── ModeSelector.tsx          # Simple/Agentic mode toggle
│   ├── AgenticProcessIndicator.tsx # RAG pipeline visualization
│   ├── EnhancedChatSettings.tsx   # Comprehensive settings panel
│   └── ModeInfo.tsx              # Welcome screen with mode info
├── ui/                           # shadcn/ui components
└── ...
```

### State Management

- **Chat Store**: Message history, mode state, process status
- **Settings Store**: Configuration, theme, model selection
- **Persistent Storage**: User preferences and settings

### RAG Pipeline

```
User Query → Embedding → Document Retrieval → Reranking → Context Building → AI Response
```

## 🎨 Design System

Built with shadcn/ui for consistency and accessibility:

- Modern, clean interface
- Accessible components with ARIA labels
- Smooth animations and transitions
- Consistent color scheme and typography
- Mobile-responsive design

## 🔧 Development

### Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm lint         # Lint code
```

### Project Structure

- `app/`: Next.js app router pages
- `components/`: React components
- `lib/`: Utility functions and configurations
- `services/`: API services and integrations
- `stores/`: State management
- `types/`: TypeScript type definitions

## 📚 Documentation

- [Dual-Mode Chat System](./docs/dual-mode-chat-system.md)
- [Demo Script](./docs/demo-script.md)
- [Component Architecture](./docs/README.md)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or use the Vercel dashboard
# Import your repository at vercel.com
```

### Self-hosted

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for the Ollama community**
