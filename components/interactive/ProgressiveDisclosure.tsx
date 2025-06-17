"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AdvancedMarkdown } from "../markdown";

interface ProgressiveDisclosureSection {
  id: string;
  title: string;
  content: string;
  level?: number;
  defaultExpanded?: boolean;
  summary?: string;
  metadata?: {
    readingTime?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    tags?: string[];
  };
}

interface ProgressiveDisclosureProps {
  sections: ProgressiveDisclosureSection[];
  title?: string;
  className?: string;
  allowMultipleOpen?: boolean;
  showProgress?: boolean;
  searchable?: boolean;
}

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={cn(
      "w-5 h-5 transition-transform duration-200",
      isOpen && "rotate-180"
    )}
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

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  sections,
  title,
  className,
  allowMultipleOpen = true,
  showProgress = false,
  searchable = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter((s) => s.defaultExpanded).map((s) => s.id))
  );
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);

      if (!allowMultipleOpen && !newSet.has(sectionId)) {
        // Close all others if multiple open is not allowed
        newSet.clear();
      }

      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }

      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Filter sections based on search term
  const filteredSections = searchTerm
    ? sections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sections;

  const progress = showProgress
    ? Math.round((expandedSections.size / sections.length) * 100)
    : 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}

        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reading Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const level = section.level || 0;

          return (
            <div
              key={section.id}
              className={cn(
                "border rounded-lg bg-card overflow-hidden",
                level > 0 && "ml-4"
              )}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "font-semibold",
                        level === 0 && "text-lg",
                        level === 1 && "text-base",
                        level >= 2 && "text-sm"
                      )}
                    >
                      {section.title}
                    </h3>

                    {/* Metadata badges */}
                    <div className="flex items-center gap-1">
                      {section.metadata?.difficulty && (
                        <span
                          className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            getDifficultyColor(section.metadata.difficulty)
                          )}
                        >
                          {section.metadata.difficulty}
                        </span>
                      )}
                      {section.metadata?.readingTime && (
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                          {section.metadata.readingTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {section.summary && (
                    <p className="text-sm text-muted-foreground">
                      {section.summary}
                    </p>
                  )}

                  {section.metadata?.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {section.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ChevronDownIcon isOpen={isExpanded} />
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t bg-muted/20">
                  <div className="prose prose-sm max-w-none dark:prose-invert pt-4">
                    <AdvancedMarkdown content={section.content} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSections.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No sections found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ProgressiveDisclosure;
