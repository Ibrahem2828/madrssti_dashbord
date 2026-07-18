import type {HTMLAttributes, LabelHTMLAttributes, ReactNode} from "react";

import {InlineAlert} from "@/components/layout/product-framework";
import {cn} from "@/lib/utils";

export function FormGrid({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)} {...props}>
      {children}
    </div>
  );
}

export function FormField({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * A permanent, visible label for a single form control. Wrapping the control
 * makes the label association work without relying on placeholders or IDs.
 */
export function FormControl({
  label,
  required,
  description,
  children,
  className,
}: {
  label: ReactNode;
  required?: boolean;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground", className)}>
      <span>
        {label}
        {required ? <span className="ms-1 text-danger" aria-hidden="true">*</span> : null}
      </span>
      {children}
      {description ? <span className="text-sm font-normal text-muted-foreground">{description}</span> : null}
    </label>
  );
}

export function FormLabel({
  children,
  className,
  required,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {required?: boolean}) {
  return (
    <label className={cn("text-sm font-medium text-foreground", className)} {...props}>
      {children}
      {required ? <span className="ms-1 text-danger" aria-hidden="true">*</span> : null}
    </label>
  );
}

export function FormDescription({children, className, ...props}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function FormError({children, className, ...props}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-danger", className)} role="alert" {...props}>
      {children}
    </p>
  );
}

export function FormErrorSummary({
  title,
  fieldErrors,
}: {
  title: string;
  fieldErrors?: Record<string, string[]>;
}) {
  const entries = Object.entries(fieldErrors ?? {}).filter(([, value]) => value.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <InlineAlert
      tone="danger"
      title={title}
      description={
        <span className="block">
          {entries.map(([field, messages]) => (
            <span key={field} className="block">
              {field}: {messages.join(", ")}
            </span>
          ))}
        </span>
      }
    />
  );
}

export function FormActions({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function focusFirstInvalidField(form: HTMLFormElement) {
  const invalid = form.querySelector<HTMLElement>(":invalid");
  invalid?.focus();
}

export function FormSection({title, description, children}: {title: string; description?: string; children: ReactNode}) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
