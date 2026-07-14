import type {ReactNode} from "react";

import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";

function StateCard({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  );
}

export function EmptyState({
  namespace = "emptyStates",
  title,
  description,
  action,
}: {
  namespace?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  const t = useTranslations(namespace);

  return <StateCard title={title ?? t("title")} description={description ?? t("description")} action={action} />;
}

export function FilteredEmptyState({title, description, action}: {title: string; description: string; action?: ReactNode}) {
  return <StateCard title={title} description={description} action={action} />;
}

export function ForbiddenState() {
  const t = useTranslations("errors");

  return <StateCard title={t("forbidden")} description={t("forbiddenDescription")} />;
}

export function UnsupportedState() {
  const t = useTranslations("errors");

  return <StateCard title={t("unsupported")} description={t("unsupportedDescription")} />;
}

export function UnavailableState({title, description}: {title: string; description: string}) {
  return <StateCard title={title} description={description} />;
}

export function ErrorState({onRetry, requestId}: {onRetry?: () => void; requestId?: string}) {
  const t = useTranslations("errors");

  return (
    <StateCard
      title={t("unexpected")}
      description={requestId ? t("requestId", {requestId}) : t("unexpectedDescription")}
      action={
        onRetry ? (
          <Button type="button" onClick={onRetry}>
            {t("retry")}
          </Button>
        ) : undefined
      }
    />
  );
}
