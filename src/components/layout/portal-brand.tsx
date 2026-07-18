import {Building2, ShieldCheck, X} from "lucide-react";

import {Button} from "@/components/ui/button";
import type {Portal} from "@/config/routes";
import {cn} from "@/lib/utils";

type PortalBrandProps = {
  portal: Portal;
  title: string;
  subtitle: string;
  collapsed?: boolean;
  onClose?: () => void;
  closeLabel?: string;
};

/** The only portal-identity surface used by the desktop sidebar and mobile drawer. */
export function PortalBrand({
  portal,
  title,
  subtitle,
  collapsed = false,
  onClose,
  closeLabel = "Close navigation",
}: PortalBrandProps) {
  const Icon = portal === "central" ? ShieldCheck : Building2;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-active text-accent-foreground" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-1 truncate text-xs text-sidebar-foreground/70">{subtitle}</p>
        </div>
      ) : null}
      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-sidebar-foreground hover:bg-sidebar-border"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
