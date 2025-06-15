"use client";
import { ReactNode, useState } from "react";

// Custom chevron icons
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
}

export const CollapsibleSection = ({
  title,
  children,
}: CollapsibleSectionProps) => {
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
