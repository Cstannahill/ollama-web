import { NextRequest, NextResponse } from "next/server";
import { runAgenticChat } from "@/services/agentic-chat-api";

// This handler will be called by the API route
export async function handleAgenticChat(req: NextRequest) {
  try {
    const body = await req.json();
    // You can add authentication, logging, etc. here
    const result = await runAgenticChat(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
