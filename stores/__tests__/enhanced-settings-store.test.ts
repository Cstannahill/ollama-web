import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSettingsStore } from '@/stores/settings-store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('Enhanced Settings Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store state
    useSettingsStore.getState().resetToDefaults();
  });

  it('should have proper default agentic configuration', () => {
    const state = useSettingsStore.getState();
    
    expect(state.agenticConfig).toBeDefined();
    expect(state.agenticConfig.embeddingModel).toBe('nomic-embed-text');
    expect(state.agenticConfig.rerankingModel).toBe('llama3.2');
    expect(state.agenticConfig.maxRetrievalDocs).toBe(5);
    expect(state.agenticConfig.enableQueryRewriting).toBe(true);
    expect(state.agenticConfig.enableResponseSummarization).toBe(true);
    expect(state.agenticConfig.cachingEnabled).toBe(true);
  });

  it('should validate agentic setup correctly', () => {
    const state = useSettingsStore.getState();
    const validation = state.validateAgenticSetup();
    
    // Should be invalid without vector store path
    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('Vector Store Path');
    expect(validation.recommendations.length).toBeGreaterThan(0);
  });

  it('should update agentic configuration', () => {
    const { setAgenticConfig, agenticConfig } = useSettingsStore.getState();
    
    setAgenticConfig({
      vectorStorePath: '/test/path',
      maxRetrievalDocs: 10,
      cachingEnabled: false
    });
    
    const newState = useSettingsStore.getState();
    expect(newState.agenticConfig.vectorStorePath).toBe('/test/path');
    expect(newState.agenticConfig.maxRetrievalDocs).toBe(10);
    expect(newState.agenticConfig.cachingEnabled).toBe(false);
    
    // Other settings should remain unchanged
    expect(newState.agenticConfig.embeddingModel).toBe('nomic-embed-text');
  });

  it('should sync vector store path with top-level setting', () => {
    const { setVectorStorePath } = useSettingsStore.getState();
    
    setVectorStorePath('/sync/test/path');
    
    const state = useSettingsStore.getState();
    expect(state.vectorStorePath).toBe('/sync/test/path');
    expect(state.agenticConfig.vectorStorePath).toBe('/sync/test/path');
  });

  it('should validate complete setup', () => {
    const { setAgenticConfig } = useSettingsStore.getState();
    
    setAgenticConfig({
      vectorStorePath: '/complete/path',
      embeddingModel: 'nomic-embed-text',
      rerankingModel: 'llama3.2'
    });
    
    const validation = useSettingsStore.getState().validateAgenticSetup();
    expect(validation.isValid).toBe(true);
    expect(validation.missingFields).toHaveLength(0);
  });

  it('should provide warnings for suboptimal settings', () => {
    const { updateChatSettings, setAgenticConfig } = useSettingsStore.getState();
    
    // Set high doc retrieval and low token limit
    setAgenticConfig({ 
      vectorStorePath: '/test',
      maxRetrievalDocs: 15 
    });
    updateChatSettings({ maxTokens: 100 });
    
    const validation = useSettingsStore.getState().validateAgenticSetup();
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.some(w => w.includes('High document retrieval'))).toBe(true);
    expect(validation.warnings.some(w => w.includes('Low token limit'))).toBe(true);
  });
});
