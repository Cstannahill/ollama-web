import Link from "next/link";
import { getOllamaStatus } from "@/lib/ollama/server";
import { ThemeToggle } from "@/components/ui";

export default async function Header() {
  const status = await getOllamaStatus();
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">
          Ollama Web
        </Link>
        <Link href="/chat" className="hidden sm:block text-sm hover:underline">
          Chat
        </Link>
        <Link href="/models" className="hidden sm:block text-sm hover:underline">
          Models
        </Link>
        <Link href="/settings" className="hidden sm:block text-sm hover:underline">
          Settings
        </Link>
      </nav>
      <div className="flex items-center gap-2 text-sm">
        <span className={status.connected ? "text-green-600" : "text-red-600"}>
          {status.connected ? `Connected (${status.version})` : "Offline"}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
