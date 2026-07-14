"use client";

import React from "react";
import type { CorrespondenceFilters, SortField } from "@/hooks/useCorrespondenceFilters";
import type { DocumentDirection, DocumentPriority, DocumentStatus } from "@/contracts/correspondence";

interface CorrespondenceToolbarProps {
  filters: CorrespondenceFilters;
  totalFiltered: number;
  totalDocuments: number;
  sortField: SortField;
  sortOrder: "asc" | "desc";
  onFilterChange: <K extends keyof CorrespondenceFilters>(key: K, value: CorrespondenceFilters[K]) => void;
  onSortToggle: (field: SortField) => void;
  onOpenNewDocument: () => void;
}

const directionFilters: { value: DocumentDirection | "ALL"; label: string }[] = [
  { value: "ALL", label: "الكل" },
  { value: "INCOMING", label: "وارد" },
  { value: "OUTGOING", label: "صادر" },
  { value: "INTERNAL", label: "داخلي" },
];

const statusFilters: { value: DocumentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "جميع الحالات" },
  { value: "DRAFT", label: "مسودة" },
  { value: "PENDING_REVIEW", label: "قيد المراجعة" },
  { value: "APPROVED", label: "معتمد" },
  { value: "ARCHIVED", label: "مؤرشف" },
];

const priorityFilters: { value: DocumentPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "جميع الأولويات" },
  { value: "URGENT", label: "عاجل" },
  { value: "HIGH", label: "مرتفع" },
  { value: "NORMAL", label: "عادي" },
  { value: "LOW", label: "منخفض" },
];

export function CorrespondenceToolbar({
  filters,
  totalFiltered,
  totalDocuments,
  sortField,
  sortOrder,
  onFilterChange,
  onSortToggle,
  onOpenNewDocument,
}: CorrespondenceToolbarProps) {
  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {directionFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange("direction", f.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                filters.direction === f.value
                  ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                  : "border-surface-border text-text-muted hover:border-brand-navy/30 hover:text-text-primary dark:hover:border-brand-gold/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenNewDocument}
          className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-navy-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          مراسلة جديدة
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <svg className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              placeholder="بحث في المراسلات..."
              className="w-48 rounded-lg border border-surface-border bg-surface-muted py-1.5 pr-8 pl-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30 dark:bg-dark-muted"
            />
          </div>

          <select
            value={filters.priority}
            onChange={(e) => onFilterChange("priority", e.target.value as DocumentPriority | "ALL")}
            className="rounded-lg border border-surface-border bg-surface-muted px-2.5 py-1.5 text-xs text-text-primary focus:border-brand-gold focus:outline-none dark:bg-dark-muted"
          >
            {priorityFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value as DocumentStatus | "ALL")}
            className="rounded-lg border border-surface-border bg-surface-muted px-2.5 py-1.5 text-xs text-text-primary focus:border-brand-gold focus:outline-none dark:bg-dark-muted"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-text-muted">
          عرض <span className="font-medium text-text-primary">{totalFiltered}</span> من <span className="font-medium text-text-primary">{totalDocuments}</span> مراسلة
        </p>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-text-muted">
        <span>ترتيب حسب:</span>
        {(["createdAt", "priority", "referenceNumber"] as SortField[]).map((field) => (
          <button
            key={field}
            onClick={() => onSortToggle(field)}
            className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 transition-colors ${
              sortField === field ? "bg-brand-gold/10 text-brand-gold font-medium" : "hover:bg-surface-muted dark:hover:bg-dark-muted"
            }`}
          >
            <span>{field === "createdAt" ? "التاريخ" : field === "priority" ? "الأولوية" : "المرجع"}</span>
            {sortField === field && (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sortOrder === "asc" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}