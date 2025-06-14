import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  await params;
  return <ChatInterface />;
}
