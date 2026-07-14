"use client";

import {useCallback, useState} from "react";

import {browserApi} from "@/lib/api/browser-client";
import type {ApiFailure, ApiResult} from "@/lib/api/contracts";

type Portal = "central" | "school";
type Method = "POST" | "PATCH" | "PUT" | "DELETE";

export function useApiMutation<T>(portal: Portal, path: string, method: Method) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const mutate = useCallback(
    async (body?: BodyInit | null, headers?: HeadersInit): Promise<ApiResult<T> | null> => {
      if (pending) {
        return null;
      }

      setPending(true);
      setError(null);

      const result = await browserApi<T>(portal, path, {method, body, headers});

      setPending(false);

      if (!result.success) {
        setError(result);
      }

      return result;
    },
    [method, path, pending, portal],
  );

  return {mutate, pending, error};
}
