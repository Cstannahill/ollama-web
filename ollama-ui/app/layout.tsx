import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui";
import { MainShell } from "@/components/layout";
import { ServiceWorkerProvider } from "@/components/performance";

export const metadata: Metadata = {
  title: "Ollama Web",
  description: "Manage local models and chat",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <MainShell>{children}</MainShell>
          <ServiceWorkerProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
