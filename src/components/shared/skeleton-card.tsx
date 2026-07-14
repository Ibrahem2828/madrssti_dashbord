import React from "react";

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white p-5 shadow-brand-sm dark:bg-surface-dark ${className}`}
    >
      <div className="mb-4 h-4 w-2/3 rounded bg-surface-muted dark:bg-dark-muted" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`mt-3 h-3 rounded bg-surface-muted dark:bg-dark-muted ${
            i === lines - 1 ? "w-4/5" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex gap-4">
        <div className="h-4 w-1/6 rounded bg-surface-muted dark:bg-dark-muted" />
        <div className="h-4 w-1/6 rounded bg-surface-muted dark:bg-dark-muted" />
        <div className="h-4 w-1/4 rounded bg-surface-muted dark:bg-dark-muted" />
        <div className="h-4 w-1/6 rounded bg-surface-muted dark:bg-dark-muted" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 flex-1 rounded-lg bg-surface-muted dark:bg-dark-muted" />
          <div className="h-10 flex-1 rounded-lg bg-surface-muted dark:bg-dark-muted" />
          <div className="h-10 flex-1 rounded-lg bg-surface-muted dark:bg-dark-muted" />
          <div className="h-10 flex-1 rounded-lg bg-surface-muted dark:bg-dark-muted" />
        </div>
      ))}
    </div>
  );
}