import type {HTMLAttributes} from "react";
import {cva, type VariantProps} from "class-variance-authority";

import {cn} from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "border-border bg-muted text-foreground",
      primary: "border-primary/20 bg-primary/10 text-primary",
      success: "border-success/20 bg-success/10 text-success",
      warning: "border-warning/20 bg-warning/10 text-warning",
      danger: "border-danger/20 bg-danger/10 text-danger",
      accent: "border-accent/30 bg-accent/15 text-accent-foreground",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({className, variant, ...props}: BadgeProps) {
  return <span className={cn(badgeVariants({variant}), className)} {...props} />;
}
