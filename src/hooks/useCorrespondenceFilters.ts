"use client";

import { useState, useMemo, useCallback } from "react";
import type { CorrespondenceDocument } from "@/contracts/correspondence";
import type { DocumentDirection, DocumentPriority, DocumentStatus } from "@/contracts/correspondence";

export interface CorrespondenceFilters {
  direction: DocumentDirection | "ALL";
  status: DocumentStatus | "ALL";
  priority: DocumentPriority | "ALL";
  search: string;
}

export type SortField = "referenceNumber" | "title" | "createdAt" | "priority" | "status";
export type SortOrder = "asc" | "desc";

export interface CorrespondenceSort {
  field: SortField;
  order: SortOrder;
}

const PRIORITY_WEIGHT: Record<DocumentPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

export function useCorrespondenceFilters(documents: CorrespondenceDocument[]) {
  const [filters, setFilters] = useState<CorrespondenceFilters>({
    direction: "ALL",
    status: "ALL",
    priority: "ALL",
    search: "",
  });
  const [sort, setSort] = useState<CorrespondenceSort>({ field: "createdAt", order: "desc" });
  const [page, setPage] = useState(1);
  const perPage = 8;

  const updateFilter = useCallback(<K extends keyof CorrespondenceFilters>(key: K, value: CorrespondenceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  const filtered = useMemo(() => {
    let result = [...documents];

    if (filters.direction !== "ALL") {
      result = result.filter((d) => d.direction === filters.direction);
    }
    if (filters.status !== "ALL") {
      result = result.filter((d) => d.status === filters.status);
    }
    if (filters.priority !== "ALL") {
      result = result.filter((d) => d.priority === filters.priority);
    }
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.referenceNumber.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          (d.senderName && d.senderName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sort.field) {
        case "referenceNumber":
          cmp = a.referenceNumber.localeCompare(b.referenceNumber);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
        case "priority":
          cmp = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sort.order === "asc" ? cmp : -cmp;
    });

    return result;
  }, [documents, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * perPage, safePage * perPage),
    [filtered, safePage, perPage]
  );

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages]
  );

  return {
    filters,
    sort,
    page: safePage,
    totalPages,
    perPage,
    totalFiltered: filtered.length,
    paginatedDocuments: paginated,
    updateFilter,
    toggleSort,
    goToPage,
  };
}