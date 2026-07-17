"use client";

import type {ReactNode} from "react";
import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {usePortalSession} from "@/providers/auth-provider";

import {LoadingBlock} from "./common";

/**
 * Prevents school screens from sending gateway requests before the sanitized
 * session has supplied a server-validated active school. This closes the
 * initial-login race between session bootstrap and dashboard data loading.
 */
export function SchoolPortalGate({children}: {children: ReactNode}) {
  const t = useTranslations("schoolPortal");
  const common = useTranslations("common");
  const {session, loading, refreshSession, sessionError} = usePortalSession();

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (!session.authenticated || session.portal !== "school") {
    return <SchoolContextState
      title={t("sessionTitle")}
      description={t("sessionDescription")}
      issue={sessionError}
      onRetry={refreshSession}
      retryLabel={t("retry")}
    />;
  }

  if (!session.activeSchool) {
    return <SchoolContextState
      title={t("contextTitle")}
      description={t("contextDescription")}
      issue={sessionError}
      onRetry={refreshSession}
      retryLabel={t("retry")}
    />;
  }

  return <>{children}</>;
}

function SchoolContextState({
  title,
  description,
  issue,
  onRetry,
  retryLabel,
}: {
  title: string;
  description: string;
  issue: {code: string; requestId?: string} | null;
  onRetry: () => Promise<void>;
  retryLabel: string;
}) {
  const t = useTranslations("schoolPortal");

  return (
    <section className="rounded-2xl border bg-card p-8 text-center shadow-sm" role="alert">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      {issue ? (
        <div className="mx-auto mt-4 max-w-2xl rounded-lg border bg-muted p-3 text-start text-sm" aria-live="polite">
          <p>{t("errorCode", {code: issue.code})}</p>
          {issue.requestId ? <p className="mt-1 text-muted-foreground">{t("requestId", {requestId: issue.requestId})}</p> : null}
        </div>
      ) : null}
      <Button type="button" className="mt-4" onClick={() => void onRetry()}>{retryLabel}</Button>
    </section>
  );
}
