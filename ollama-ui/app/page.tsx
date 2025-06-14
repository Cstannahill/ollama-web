import { LandingHero } from "@/components/landing";

export default async function Home() {
  return <LandingHero />;
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-24 gap-10">
      <h1 className="text-4xl font-bold">Ollama Web Interface</h1>
      <p className="text-muted-foreground max-w-md">
        Manage local models and chat with them using a sleek interface.
      </p>
      <div className="flex gap-4">
        <Link
          href="/models"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90"
        >
          Browse Models
        </Link>
        <Link
          href="/chat"
          className="border px-6 py-3 rounded-md hover:bg-accent"
        >
          Start Chatting
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/next.svg"
          alt="Decor"
          width={400}
          height={400}
          className="opacity-5 absolute -top-10 -right-10 animate-pulse"
        />
      </div>
    </section>
  );
}
