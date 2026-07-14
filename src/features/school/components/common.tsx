"use client";

import type {ReactNode} from "react";

import {
  ActivityFeed,
  ActiveFilterChips,
  BodyCell,
  FilterBar,
  HeaderCell,
  InlineAlert,
  LoadingCard,
  MetadataList,
  MetricCard,
  MobileRecordCard,
  PageHeader,
  PageStack,
  PaginationBar,
  ResponsiveTable,
  SectionHeader,
  SurfaceCard,
  TableContainer,
  TableScroller,
} from "@/components/layout/product-framework";

export {
  ActivityFeed,
  ActiveFilterChips,
  BodyCell,
  FilterBar,
  HeaderCell,
  MetadataList,
  MetricCard,
  MobileRecordCard,
  PageHeader,
  PageStack,
  ResponsiveTable,
  SectionHeader,
  TableContainer,
  TableScroller,
};

export function Card({title, description, actions, children}: {title?: string; description?: string; actions?: ReactNode; children: ReactNode}) {
  return (
    <SurfaceCard title={title} description={description} actions={actions}>
      {children}
    </SurfaceCard>
  );
}

export function DetailItem({label, value}: {label: string; value: ReactNode}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function InlineError({message}: {message: string}) {
  return <InlineAlert tone="danger" title={message} />;
}

export function InlineSuccess({message}: {message: string}) {
  return <InlineAlert tone="success" title={message} />;
}

export function LoadingBlock({label}: {label: string}) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <LoadingCard lines={2} />
    </div>
  );
}

export function Pagination({
  count,
  page,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  count: number;
  page: number;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <PaginationBar
      count={count}
      page={page}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      onPrevious={onPrevious}
      onNext={onNext}
      canPrevious={page > 1}
    />
  );
}

export function readFilters(searchParams: Readonly<{get(name: string): string | null}>, allowed: readonly string[]) {
  const filters: Record<string, string> = {};
  allowed.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
    }
  });
  return filters;
}
