"use client";

import {useCallback, useState} from "react";

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      if (pending) {
        return null;
      }

      setPending(true);
      setError(null);

      try {
        const nextResult = await action(...args);
        setResult(nextResult);
        return nextResult;
      } catch (nextError) {
        setError(nextError);
        return null;
      } finally {
        setPending(false);
      }
    },
    [action, pending],
  );

  return {run, pending, error, result};
}
