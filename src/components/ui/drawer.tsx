"use client";

import {X} from "lucide-react";
import {useEffect, useId, useRef, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "start" | "end";
  widthClassName?: string;
  closeLabel?: string;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  header,
  children,
  footer,
  side = "end",
  widthClassName = "w-full max-w-md",
  closeLabel = "Close panel",
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus();
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = containerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = node?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? node)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab" || !node) {
        return;
      }

      const focusableElements = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) {
        event.preventDefault();
        node.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[65] bg-black/50" role="presentation" onClick={() => onOpenChange(false)}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={header ? title : undefined}
        aria-labelledby={header ? undefined : titleId}
        aria-describedby={header ? undefined : description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "motion-surface-enter absolute inset-y-0 flex flex-col border bg-card text-card-foreground shadow-2xl",
          widthClassName,
          side === "end" ? "end-0" : "start-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {header ? (
          <div className="border-b px-5 py-4">{header}</div>
        ) : (
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div className="space-y-1">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={closeLabel}
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
