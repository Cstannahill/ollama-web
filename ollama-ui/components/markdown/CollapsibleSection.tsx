"use client";
import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
}

export const CollapsibleSection = ({ title, children }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-700 rounded mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 text-left"
      >
        {open ? (
          <ChevronDown className="w-4 h-4" aria-hidden />
        ) : (
          <ChevronRight className="w-4 h-4" aria-hidden />
        )}
        <span className="font-medium">{title}</span>
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
};
