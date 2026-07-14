import {forwardRef, type ButtonHTMLAttributes} from "react";

import {cn} from "@/lib/utils";

type SwitchProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({checked, className, disabled, ...props}, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-12 items-center rounded-full border border-transparent px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
          checked ? "translate-x-[1.15rem]" : "translate-x-0",
        )}
      />
    </button>
  ),
);

Switch.displayName = "Switch";
