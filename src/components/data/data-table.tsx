"use client";

import type {ReactNode} from "react";

import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export type PaginatedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Column<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
};

export function DataTableLoading() {
  const t = useTranslations("tables");
  return <div role="status" className="rounded-lg border p-6">{t("loading")}</div>;
}

export function DataTableError({message}: {message: string}) {
  return <div role="alert" className="rounded-lg border p-6 text-danger">{message}</div>;
}

export function DataTableEmpty() {
  const t = useTranslations("tables");
  return <div className="rounded-lg border p-6 text-muted-foreground">{t("empty")}</div>;
}

export function DataTableHeader({children}: {children: ReactNode}) {
  return <div className="flex flex-wrap items-center justify-between gap-3">{children}</div>;
}

export function DataTableToolbar({children, className}: {children: ReactNode; className?: string}) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

export function DataTablePagination({
  count,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: {
  count: number;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
      <span>{count}</span>
      <div className="flex gap-2">
        <Button type="button" className="bg-secondary text-secondary-foreground" onClick={onPrevious} disabled={previousDisabled}>
          {t("previous")}
        </Button>
        <Button type="button" className="bg-secondary text-secondary-foreground" onClick={onNext} disabled={nextDisabled}>
          {t("next")}
        </Button>
      </div>
    </div>
  );
}

export function DataTableMobileCards<T extends {id: string}>({
  data,
  render,
}: {
  data: readonly T[];
  render: (item: T) => ReactNode;
}) {
  return <div className="grid gap-3 md:hidden">{data.map((item) => <div key={item.id}>{render(item)}</div>)}</div>;
}

export function ColumnVisibilityMenu({children}: {children?: ReactNode}) {
  return <div className="rounded-md border bg-card p-2 text-sm">{children}</div>;
}

export function RowActionsMenu({children}: {children?: ReactNode}) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function DataTable<T extends {id: string}>({
  data,
  columns,
  loading,
  error,
}: {
  data: PaginatedResult<T> | null;
  columns: readonly Column<T>[];
  loading: boolean;
  error?: string;
}) {
  const t = useTranslations("tables");

  if (loading) {
    return <DataTableLoading />;
  }

  if (error) {
    return <DataTableError message={error} />;
  }

  if (!data || data.results.length === 0) {
    return <DataTableEmpty />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-start">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column.key} className="px-4 py-3 text-start text-sm">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.results.map((row) => (
            <tr key={row.id} className="border-t">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-4 py-3 text-sm text-muted-foreground">{t("total", {count: data.count})}</p>
    </div>
  );
}
