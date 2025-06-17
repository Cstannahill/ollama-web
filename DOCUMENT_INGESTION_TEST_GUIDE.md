# Document Ingestion Testing Guide

## Quick Test Instructions

### 1. **Start the Application**

```bash
cd "s:\Code\ollama-web"
npm run dev
```

### 2. **Navigate to Settings**

- Open http://localhost:3000/settings
- Click on the "Documents" tab

### 3. **Test Manual Document Entry**

**Add a Test Document:**

1. In the "Add Text Document" section:
   - Title: `Test Knowledge Base Entry`
   - Text:
   ```
   This is a test document for the vector store system.
   It contains information about how to configure and use the agentic features.
   The system supports embedding generation, document retrieval, and context building.
   ```
2. Click "Add Document"
3. Watch the progress bar and verify success

### 4. **Test File Upload**

**Create Test Files:**

Create `test-doc-1.txt`:

```
Ollama Web Application
======================

This application provides a web interface for interacting with Ollama models.
It includes both simple chat and advanced agentic capabilities.

Key Features:
- Simple chat mode for direct model interaction
- Agentic mode with document retrieval and context enhancement
- Vector store for knowledge base management
- Performance monitoring and metrics
```

Create `test-doc-2.md`:

```
# Configuration Guide

## Vector Store Setup

The vector store system allows you to upload documents that can be retrieved
during agentic conversations. Documents are embedded using the configured
embedding model and stored persistently.

## Supported File Types

- .txt - Plain text files
- .md - Markdown documents
- .json - JSON data files
- .csv - Comma-separated values
- .log - Log files
```

**Upload Files:**

1. Click "Choose Files" in the "Upload Text Files" section
2. Select both test files
3. Watch progress bar and verify success

### 5. **Verify Storage**

**Check Vector Store Status:**

- Look at the "Vector Store Status" panel
- Verify document count shows 3 (1 manual + 2 uploaded)
- Check that storage size is greater than 0
- Note the storage path reference

**Check Browser Storage:**

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Expand IndexedDB
4. Look for database starting with `ollama-web-vector-store-`
5. Verify data is actually stored

### 6. **Test Agentic Chat**

**Enable Agentic Mode:**

1. Go to `/chat/new`
2. Click the settings gear ⚙️
3. Toggle "Enable Agentic Mode" to ON
4. Verify settings show proper configuration

**Test Knowledge Retrieval:**
Ask questions that should retrieve your test documents:

- "What are the key features of this application?"
- "How do I configure the vector store?"
- "What file types are supported?"

**Expected Behavior:**

- Should switch to agentic mode automatically
- Show "Agent thinking..." indicator
- Display retrieved documents in the response
- Provide answers based on your uploaded content

### 7. **Test Default Storage**

**Reset and Verify Defaults:**

1. Go to Settings → General
2. Clear the Vector Store Path field
3. Refresh the page
4. Check that path auto-populates with "ollama-web-documents"
5. Try adding another document
6. Verify it still persists correctly

## Expected Results

✅ **Documents persist across browser sessions**
✅ **Real-time storage statistics update**
✅ **Agentic chat retrieves uploaded documents**
✅ **Default storage path auto-configured**
✅ **File uploads work for multiple formats**
✅ **Clear functionality removes all documents**

## Troubleshooting

**If documents aren't being retrieved in chat:**

1. Check that agentic mode is enabled
2. Verify embedding model is set (default: nomic-embed-text)
3. Ensure you have documents in the vector store
4. Try asking questions directly related to your document content

**If upload fails:**

1. Check file formats are supported (.txt, .md, .json, .csv, .log)
2. Verify files aren't too large
3. Check browser console for error messages

**If storage isn't persisting:**

1. Check that browser allows IndexedDB
2. Verify you're not in private/incognito mode
3. Check browser storage quotas

## Success Criteria

The vector store persistence implementation is working correctly if:

1. ✅ Documents can be added manually and via file upload
2. ✅ Storage statistics show real document counts and sizes
3. ✅ Documents persist after browser restart
4. ✅ Agentic chat can retrieve and use uploaded documents
5. ✅ Default storage path is automatically configured
6. ✅ All UI components function without errors

This resolves the original issue where no files were being created in the configured directory by implementing proper browser-compatible persistence with IndexedDB while maintaining the user's configured path as a logical reference.
