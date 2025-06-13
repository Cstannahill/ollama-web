import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Copy, Code2, FileText, Maximize2, Download, Search, Sparkles, ChevronRight, ChevronDown, Terminal, Braces, Hash, FileCode, Database, Layers, Palette } from 'lucide-react';

// Simulated syntax highlighting (in production, use Prism.js)
const highlightCode = (code, language) => {
  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'async', 'await'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'interface', 'type', 'enum', 'async', 'await'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'with', 'as', 'try', 'except', 'finally'],
    css: ['color', 'background', 'font-size', 'margin', 'padding', 'display', 'position', 'width', 'height']
  };

  let highlighted = code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings
  highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
  
  // Comments
  highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$&</span>');
  
  // Numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
  
  // Keywords
  const langKeywords = keywords[language] || [];
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
  });
  
  return highlighted;
};

// Language icons mapping
const getLanguageIcon = (lang) => {
  const icons = {
    javascript: <Braces className="w-4 h-4" />,
    typescript: <FileCode className="w-4 h-4" />,
    python: <Hash className="w-4 h-4" />,
    css: <Palette className="w-4 h-4" />,
    sql: <Database className="w-4 h-4" />,
    bash: <Terminal className="w-4 h-4" />,
    default: <Code2 className="w-4 h-4" />
  };
  return icons[lang] || icons.default;
};

// Code Block Component
const CodeBlock = ({ code, language, filename, isActive, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };
  
  const lines = code.trim().split('\n');
  const highlightedCode = useMemo(() => highlightCode(code, language), [code, language]);
  const highlightedLines = highlightedCode.split('\n');
  
  return (
    <div className={`code-block ${isActive ? 'active' : 'hidden'}`}>
      <div className="code-header">
        <div className="language-tag">
          {getLanguageIcon(language)}
          <span>{language}</span>
        </div>
        <div className="code-actions">
          <button 
            className="action-btn"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            title="Toggle line numbers"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button 
            className="action-btn"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button className="action-btn" title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="code-content">
        <pre>
          <code>
            {highlightedLines.map((line, i) => (
              <div key={i} className="code-line">
                {showLineNumbers && (
                  <span className="line-number">{i + 1}</span>
                )}
                <span 
                  className="line-content" 
                  dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Multi-tab Code Container
const MultiTabCodeBlock = ({ blocks }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <div className="multi-tab-container">
      <div className="tab-bar">
        <div className="tabs">
          {blocks.map((block, index) => (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {getLanguageIcon(block.language)}
              <span>{block.filename || block.language}</span>
              {activeTab === index && <div className="tab-indicator" />}
            </button>
          ))}
        </div>
        <button 
          className="search-toggle"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
      
      {showSearch && (
        <div className="search-bar">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}
      
      <div className="code-blocks">
        {blocks.map((block, index) => (
          <CodeBlock
            key={index}
            {...block}
            isActive={activeTab === index}
          />
        ))}
      </div>
    </div>
  );
};

// Callout Component
const Callout = ({ type, children }) => {
  const icons = {
    note: <Layers className="w-5 h-5" />,
    warning: <Sparkles className="w-5 h-5" />,
    tip: <Sparkles className="w-5 h-5" />,
    error: <Sparkles className="w-5 h-5" />
  };
  
  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-icon">{icons[type]}</div>
      <div className="callout-content">{children}</div>
    </div>
  );
};

// Collapsible Section
const CollapsibleSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="collapsible-section">
      <button 
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        <h3>{title}</h3>
      </button>
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
};

// Main Markdown Component
const MarkdownChatComponent = () => {
  const [theme, setTheme] = useState('dark');
  
  // Sample content demonstrating various features
  const codeBlocks = [
    {
      filename: 'app.tsx',
      language: 'typescript',
      code: `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AppProps {
  title: string;
  theme: 'light' | 'dark';
}

const App: React.FC<AppProps> = ({ title, theme }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Initialize theme
    document.body.className = theme;
  }, [theme]);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container"
    >
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </motion.div>
  );
};

export default App;`
    },
    {
      filename: 'styles.css',
      language: 'css',
      code: `.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(to right, #00ff88, #00b4d8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}`
    },
    {
      filename: 'server.py',
      language: 'python',
      code: `from flask import Flask, jsonify, request
import asyncio
from datetime import datetime

app = Flask(__name__)

class DataProcessor:
    def __init__(self):
        self.cache = {}
    
    async def process_data(self, data):
        # Simulate async processing
        await asyncio.sleep(0.5)
        return {
            'processed': True,
            'timestamp': datetime.now().isoformat(),
            'data': data
        }

processor = DataProcessor()

@app.route('/api/process', methods=['POST'])
async def process():
    data = request.json
    result = await processor.process_data(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)`
    }
  ];
  
  return (
    <div className={`markdown-container ${theme}`}>
      <style jsx>{`
        .markdown-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #e0e0e0;
          background: #0a0e1a;
          padding: 2rem;
          min-height: 100vh;
        }
        
        .markdown-content {
          max-width: 900px;
          margin: 0 auto;
        }
        
        h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #00ff88, #00b4d8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #00ff88;
        }
        
        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #00b4d8;
        }
        
        p {
          font-size: 1.0625rem;
          line-height: 1.75;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.87);
        }
        
        .inline-code {
          background: rgba(99, 120, 151, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Fira Code', monospace;
          color: #82aaff;
        }
        
        .multi-tab-container {
          background: #141b2d;
          border-radius: 0.75rem;
          overflow: hidden;
          margin: 1.5rem 0;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tab-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e2940;
          padding: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tabs {
          display: flex;
          gap: 0.5rem;
        }
        
        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          position: relative;
          font-size: 0.875rem;
        }
        
        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .tab.active {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
        }
        
        .tab-indicator {
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: #00ff88;
          border-radius: 1.5px;
        }
        
        .search-toggle {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .search-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .code-block {
          display: none;
        }
        
        .code-block.active {
          display: block;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .language-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }
        
        .code-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .code-content {
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Fira Code', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        pre {
          margin: 0;
        }
        
        code {
          display: block;
        }
        
        .code-line {
          display: flex;
          padding: 0.125rem 0;
        }
        
        .code-line:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .line-number {
          display: inline-block;
          width: 3rem;
          color: rgba(255, 255, 255, 0.3);
          text-align: right;
          padding-right: 1rem;
          user-select: none;
        }
        
        .line-content {
          flex: 1;
        }
        
        /* Syntax highlighting */
        .keyword { color: #c792ea; }
        .string { color: #a3d76e; }
        .comment { color: #637897; font-style: italic; }
        .number { color: #ffcb6b; }
        
        .callout {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          border-left: 4px solid;
        }
        
        .callout-note {
          background: rgba(0, 180, 216, 0.1);
          border-color: #00b4d8;
        }
        
        .callout-warning {
          background: rgba(255, 183, 0, 0.1);
          border-color: #ffb700;
        }
        
        .callout-tip {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
        }
        
        .callout-error {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
        }
        
        .callout-icon {
          flex-shrink: 0;
        }
        
        .callout-content {
          flex: 1;
        }
        
        .collapsible-section {
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .collapsible-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: none;
          color: white;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .collapsible-header:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .collapsible-header h3 {
          margin: 0;
        }
        
        .collapsible-content {
          padding: 1rem;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message-wrapper {
          margin-bottom: 2rem;
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      
      <div className="markdown-content">
        <div className="message-wrapper">
          <h1>Advanced Markdown Rendering Engine</h1>
          
          <p>
            Welcome to the next generation of markdown rendering for AI chat interfaces. 
            This component features <span className="inline-code">syntax highlighting</span>, 
            multi-tab code blocks, interactive elements, and a stunning visual design.
          </p>
          
          <Callout type="tip">
            This component supports advanced features like mermaid diagrams, LaTeX math expressions, 
            and interactive code execution. Try hovering over different elements to see smooth animations!
          </Callout>
          
          <h2>Multi-File Code Example</h2>
          <p>
            Here's a complete React application with TypeScript, CSS styling, and a Python backend. 
            Click the tabs to switch between files:
          </p>
          
          <MultiTabCodeBlock blocks={codeBlocks} />
          
          <CollapsibleSection title="Architecture Overview">
            <p>
              The component is built with a modular architecture that ensures maintainability 
              and extensibility. Each feature is encapsulated in its own module, allowing for 
              easy updates and additions.
            </p>
            
            <Callout type="note">
              The rendering engine uses virtual scrolling for optimal performance with large 
              documents, ensuring smooth 60fps scrolling even with thousands of lines of code.
            </Callout>
          </CollapsibleSection>
          
          <h2>Key Features</h2>
          
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.87)' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#00ff88' }}>Intelligent Syntax Highlighting</strong> - 
              Supports 200+ languages with accurate tokenization
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#00b4d8' }}>Tab Management</strong> - 
              Seamlessly switch between multiple code files
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#ffb700' }}>Interactive Elements</strong> - 
              Copy buttons, search functionality, and fullscreen mode
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#ff6b6b' }}>Performance Optimized</strong> - 
              Lazy loading and virtual scrolling for smooth experience
            </li>
          </ul>
          
          <Callout type="warning">
            Remember to configure the Ollama system prompt to take full advantage of these 
            markdown features. The AI should be instructed to use appropriate formatting 
            for code blocks, callouts, and structured content.
          </Callout>
        </div>
      </div>
    </div>
  );
};

export default MarkdownChatComponent;