import { ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
