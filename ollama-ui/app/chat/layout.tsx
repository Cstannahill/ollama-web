import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>;
}
