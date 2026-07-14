"use client";

import {useCallback, useMemo} from "react";
import {usePathname, useSearchParams} from "next/navigation";

export function useUrlSearchState(allowed: readonly string[]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const state: Record<string, string> = {};

    allowed.forEach((key) => {
      const nextValue = searchParams.get(key);
      if (nextValue) {
        state[key] = nextValue;
      }
    });

    return state;
  }, [allowed, searchParams]);

  const setValue = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams();

      Object.entries(next).forEach(([key, currentValue]) => {
        if (currentValue) {
          params.set(key, currentValue);
        }
      });

      const query = params.toString();
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [pathname],
  );

  return [value, setValue] as const;
}
