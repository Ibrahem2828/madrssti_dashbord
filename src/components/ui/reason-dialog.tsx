"use client";

import {useId} from "react";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";

type ReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  reasonLabel: string;
  reasonDescription?: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  variant?: "primary" | "danger";
};

/** A confirmation dialog for backend contracts that require an auditable reason. */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasonLabel,
  reasonDescription,
  reason,
  onReasonChange,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  variant = "primary",
}: ReasonDialogProps) {
  const reasonId = useId();
  const canConfirm = reason.trim().length > 0 && !loading;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      closeLabel={cancelLabel}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant} onClick={onConfirm} disabled={!canConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <label htmlFor={reasonId} className="flex flex-col gap-2 text-sm font-medium text-foreground">
          <span>{reasonLabel}<span className="ms-1 text-danger" aria-hidden="true">*</span></span>
          <Input id={reasonId} value={reason} onChange={(event) => onReasonChange(event.target.value)} required aria-required="true" />
        </label>
        {reasonDescription ? <p className="text-sm text-muted-foreground">{reasonDescription}</p> : null}
      </div>
    </Dialog>
  );
}
