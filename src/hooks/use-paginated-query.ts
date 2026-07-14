"use client";

import {useMemo} from "react";

import {useApiQuery} from "@/hooks/use-api-query";

type Portal = "central" | "school";

type PaginatedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function usePaginatedQuery<T>(portal: Portal, path: string, enabled = true) {
  const query = useApiQuery<PaginatedResult<T>>(portal, path, enabled);

  const page = useMemo(() => {
    if (!query.data) {
      return 1;
    }

    return query.data.previous ? 2 : 1;
  }, [query.data]);

  return {
    ...query,
    count: query.data?.count ?? 0,
    results: query.data?.results ?? [],
    next: query.data?.next ?? null,
    previous: query.data?.previous ?? null,
    page,
  };
}
