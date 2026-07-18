"use client";

import {useId, type ReactNode} from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
  side?: "start" | "end";
};

/** Lightweight accessible tooltip for icon-only controls without another dependency. */
export function Tooltip({content, children, side = "end"}: TooltipProps) {
  const id = useId();

  return (
    <span className="group/tooltip relative inline-flex" aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute top-1/2 z-[80] hidden w-max max-w-56 -translate-y-1/2 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover/tooltip:block group-focus-within/tooltip:block ${side === "end" ? "start-full ms-2" : "end-full me-2"}`}
      >
        {content}
      </span>
    </span>
  );
}
