"use client";

import {useCallback, useEffect, useRef, useState} from "react";

import {browserApi} from "@/lib/api/browser-client";
import type {ApiFailure} from "@/lib/api/contracts";

type Portal = "central" | "school";

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiFailure | null;
};

export function useApiQuery<T>(portal: Portal, path: string, enabled = true) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });
  const sequence = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    const current = ++sequence.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((previous) => ({...previous, loading: true, error: null}));

    const result = await browserApi<T>(portal, path, {signal: controller.signal});

    if (controller.signal.aborted || current !== sequence.current) {
      return;
    }

    if (result.success) {
      setState({data: result.data, loading: false, error: null});
      return;
    }

    setState({data: null, loading: false, error: result});
  }, [path, portal]);

  useEffect(() => {
    if (enabled) {
      void refetch();
    }

    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, refetch]);

  return {...state, refetch};
}
