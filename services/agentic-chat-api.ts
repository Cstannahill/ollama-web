import { createAgentPipeline } from './agent-pipeline';
import type { Message, ChatSettings } from '@/types';

// This function is called by the API handler
export async function runAgenticChat(body: any) {
  // Expecting { messages: Message[], settings: ChatSettings }
  const { messages, settings } = body;
  if (!Array.isArray(messages)) {
    throw new Error('Missing or invalid messages');
  }
  const pipeline = createAgentPipeline(settings || {});
  // Collect all outputs from the async generator
  const outputs = [];
  for await (const output of pipeline.run(messages)) {
    outputs.push(output);
  }
  return { outputs };
}
