import { NextRequest } from 'next/server';
import { handleAgenticChat } from '@/lib/ollama/agenticHandler';

// POST /api/ollama/chat
export async function POST(req: NextRequest) {
  // Forward the request to the agentic chat handler in lib
  return handleAgenticChat(req);
}
