"use client";

import {ChevronDown, LogOut, UserRoundPen} from "lucide-react";
import {useEffect, useId, useRef, useState, type ReactNode} from "react";
import {useTranslations} from "next-intl";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {getInitials} from "@/lib/utils";

export function UserMenu({
  fullName,
  email,
  portalLabel,
  schoolName,
  roleLabel,
  contextControls,
  onManageAccount,
  onLogout,
}: {
  fullName: string;
  email: string;
  portalLabel: string;
  schoolName?: string;
  roleLabel?: string;
  /** Compact-only controls (school, language, and theme) live in the menu on phones. */
  contextControls?: ReactNode;
  onManageAccount: () => void;
  onLogout: () => Promise<void>;
}) {
  const t = useTranslations("common");
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        className="gap-3 ps-2 pe-3"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {getInitials(fullName)}
        </span>
        <span className="hidden text-start sm:block">
          <span className="block text-sm font-medium text-foreground">{fullName}</span>
          <span className="block text-xs text-muted-foreground">{email}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={fullName}
          className="absolute end-0 z-40 mt-2 w-72 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl"
        >
          <div className="space-y-1">
            <p className="font-medium">{fullName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <Badge className="mt-2">{portalLabel}</Badge>
            {schoolName ? <p className="mt-2 truncate text-sm text-muted-foreground">{schoolName}</p> : null}
            {roleLabel ? <p className="mt-1 text-xs text-muted-foreground">{roleLabel}</p> : null}
          </div>
          {contextControls ? <div className="mt-4 border-t pt-4">{contextControls}</div> : null}
          <div className="mt-4 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onManageAccount();
              }}
            >
              <UserRoundPen className="h-4 w-4" aria-hidden="true" />
              {t("manageAccount")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await onLogout();
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t("logout")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
