import type {HTMLAttributes, ReactNode, TableHTMLAttributes} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";

export function PageStack({children, className}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-6", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <div className="flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SurfaceCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-sm sm:p-6", className)}>
      {title || description || actions ? (
        <div className="mb-4">
          <SectionHeader title={title ?? ""} description={description} actions={actions} />
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricGrid({children}: {children: ReactNode}) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

/** A consistent, permission-safe container for contextual navigation and create actions. */
export function QuickActionGrid({children}: {children: ReactNode}) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/**
 * The interactive control is supplied by the caller so locale-aware links and
 * permission-aware buttons keep their native semantics.
 */
export function QuickActionCard({children, className}: {children: ReactNode; className?: string}) {
  return <div className={cn("rounded-xl border bg-background p-1 transition-colors hover:border-primary/30 hover:bg-muted/45", className)}>{children}</div>;
}

export function MetricCard({
  label,
  value,
  meta,
  badge,
}: {
  label: string;
  value: string | number;
  meta?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold">{value}</p>
          {meta ? <p className="mt-2 text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        {badge}
      </div>
    </div>
  );
}

export function InlineAlert({
  tone = "neutral",
  title,
  description,
  action,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  const classes: Record<NonNullable<typeof tone>, string> = {
    neutral: "border-border bg-muted/40 text-foreground",
    success: "border-success/20 bg-success/10 text-success",
    warning: "border-warning/20 bg-warning/10 text-warning",
    danger: "border-danger/20 bg-danger/10 text-danger",
  };

  return (
    <div className={cn("rounded-xl border p-4", classes[tone])} role={tone === "danger" ? "alert" : "status"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          {description ? <p className="text-sm opacity-90">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

export function FilterBar({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function ActiveFilterChips({
  items,
  clearLabel,
  onClear,
  onClearAll,
  clearAllLabel,
}: {
  items: ReadonlyArray<{key: string; label: string; value: string}>;
  clearLabel: string;
  clearAllLabel?: string;
  onClear: (key: string) => void;
  onClearAll?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Badge key={item.key} variant="neutral" className="gap-2 pe-1">
          <span className="truncate">{item.label}: {item.value}</span>
          <Button type="button" variant="ghost" size="sm" className="min-h-0 px-1 py-0 text-xs" onClick={() => onClear(item.key)}>
            {clearLabel}
          </Button>
        </Badge>
      ))}
      {onClearAll && clearAllLabel ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
          {clearAllLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function TableContainer({children, className}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>{children}</div>;
}

export function TableScroller({children}: {children: ReactNode}) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function ResponsiveTable({children, className}: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full text-start text-sm", className)}>{children}</table>;
}

export function HeaderCell({children, sortable = false, sortDirection = "none"}: {children: ReactNode; sortable?: boolean; sortDirection?: "ascending" | "descending" | "none"}) {
  return (
    <th
      scope="col"
      aria-sort={sortable ? sortDirection : undefined}
      className="whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </th>
  );
}

export function BodyCell({children, className}: {children: ReactNode; className?: string}) {
  return <td className={cn("px-4 py-3 align-top text-sm", className)}>{children}</td>;
}

export function PaginationBar({
  count,
  page,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  canPrevious = true,
  canNext = true,
}: {
  count: number;
  page: number;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{count}</span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{page}</Badge>
        <Button type="button" variant="secondary" onClick={onPrevious} disabled={!canPrevious}>
          {previousLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onNext} disabled={!canNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/** Keeps a long-form's primary action reachable on a phone without obscuring content. */
export function StickyPageActions({children, className}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MobileRecordCard({title, subtitle, children, actions}: {title: string; subtitle?: string; children?: ReactNode; actions?: ReactNode}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children ? <div className="mt-3 space-y-2 text-sm">{children}</div> : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetadataList({items}: {items: ReadonlyArray<{label: string; value: ReactNode}>}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border bg-background p-3">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ActivityFeed({items}: {items: ReadonlyArray<{id: string; title: string; description?: string; meta?: string}>}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">{item.title}</p>
            {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
            {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingCard({lines = 3}: {lines?: number}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="space-y-3">
        {Array.from({length: lines}).map((_, index) => (
          <Skeleton key={index} className={index === 0 ? "h-5 w-40" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}

/** Shared route-level placeholder that mirrors the dashboard information hierarchy. */
export function DashboardRouteLoading() {
  return (
    <PageStack aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <MetricGrid>
        {Array.from({length: 4}).map((_, index) => <LoadingCard key={index} lines={2} />)}
      </MetricGrid>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <LoadingCard lines={5} />
        <LoadingCard lines={4} />
      </div>
    </PageStack>
  );
}
