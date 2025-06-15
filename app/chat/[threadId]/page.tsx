import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ChatInterface threadId={threadId} />;
}
