"use client";

import {useEffect} from "react";

export function useUnsavedChangesGuard(enabled: boolean, message: string) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled, message]);

  return {
    confirmDiscardChanges() {
      if (!enabled) {
        return true;
      }

      return window.confirm(message);
    },
  };
}
