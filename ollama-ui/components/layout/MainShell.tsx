import React from "react";
import Header from "@/components/Header";

export const MainShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};
import { ReactNode, Suspense } from "react";
import NavigationHeader from "./NavigationHeader";
import HeaderSkeleton from "../HeaderSkeleton";

export default function MainShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <NavigationHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
    </div>
  );
}
