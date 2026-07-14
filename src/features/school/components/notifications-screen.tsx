"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {FilteredEmptyState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {
  ActiveFilterChips,
  Card,
  FilterBar,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  MobileRecordCard,
  PageHeader,
  PageStack,
  Pagination,
} from "@/features/school/components/common";
import {Button} from "@/components/ui/button";
import {Select} from "@/components/ui/select";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {formatDate} from "@/lib/formatting/dates";
import {usePortalSession} from "@/providers/auth-provider";

import {fetchSchoolNotifications, markSchoolNotificationRead} from "../services/school-api";
import type {PaginatedResult, SchoolNotification} from "../types/contracts";

type Filters = Record<string, string>;

const allowedFilterKeys = ["is_read", "type", "ordering", "page"] as const;

function readFilters(searchParams: Readonly<{get(name: string): string | null}>): Filters {
  const filters: Filters = {};
  allowedFilterKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
    }
  });
  return filters;
}

export function SchoolNotificationsScreen() {
  const t = useTranslations("notifications");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams));
  const [result, setResult] = useState<PaginatedResult<SchoolNotification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key, value]) => key !== "page" && Boolean(value))
        .map(([key, value]) => ({
          key,
          label: t(`filterLabels.${key}`),
          value:
            key === "is_read"
              ? value === "true"
                ? t("read")
                : t("unread")
              : key === "type"
                ? value === "ALERT"
                  ? t("typeAlert")
                  : t("typeInfo")
                : value,
        })),
    [filters, t],
  );

  const updateFilters = (next: Filters) => {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const notifications = await fetchSchoolNotifications({
      is_read: filters.is_read || undefined,
      type: filters.type || undefined,
      ordering: filters.ordering || "-created_at",
      page: filters.page || "1",
    });

    if (!notifications.success) {
      setError(notifications.error.message);
      setLoading(false);
      return;
    }

    setResult(notifications.data);
    setLoading(false);
  }, [filters.is_read, filters.ordering, filters.page, filters.type]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    setPendingId(id);
    setError(null);
    setMessage(null);
    const notification = await markSchoolNotificationRead(id);
    setPendingId(null);
    if (!notification.success) {
      setError(notification.error.message);
      return;
    }
    setMessage(t("markedRead"));
    await load();
  };

  if (!hasCapability("school.notifications")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.notificationsRead)) {
    return <ForbiddenState />;
  }

  return (
    <PageStack>
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <FilterBar
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => updateFilters({ordering: "-created_at", page: "1"})}
          >
            {common("clear")}
          </Button>
        }
      >
        <Select aria-label={t("readState")} value={filters.is_read ?? ""} onChange={(event) => updateFilters({...filters, is_read: event.target.value, page: "1"})}>
          <option value="">{t("allReadStates")}</option>
          <option value="false">{t("unread")}</option>
          <option value="true">{t("read")}</option>
        </Select>
        <Select aria-label={t("typeLabel")} value={filters.type ?? ""} onChange={(event) => updateFilters({...filters, type: event.target.value, page: "1"})}>
          <option value="">{t("allTypes")}</option>
          <option value="INFO">{t("typeInfo")}</option>
          <option value="ALERT">{t("typeAlert")}</option>
        </Select>
        <Select aria-label={t("ordering")} value={filters.ordering ?? "-created_at"} onChange={(event) => updateFilters({...filters, ordering: event.target.value, page: "1"})}>
          <option value="-created_at">{t("newestFirst")}</option>
          <option value="created_at">{t("oldestFirst")}</option>
          <option value="is_read">{t("readFirst")}</option>
          <option value="-is_read">{t("unreadFirst")}</option>
        </Select>
      </FilterBar>
      <ActiveFilterChips
        items={activeFilters}
        clearLabel={common("clear")}
        clearAllLabel={t("clearFilters")}
        onClear={(key) => updateFilters({...filters, [key]: "", page: "1"})}
        onClearAll={() => updateFilters({ordering: "-created_at", page: "1"})}
      />
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {!loading && result && result.results.length === 0 ? (
        Object.keys(filters).some((key) => key !== "page" && filters[key]) ? (
          <FilteredEmptyState title={t("filteredEmptyTitle")} description={t("filteredEmptyDescription")} />
        ) : (
          <FilteredEmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        )
      ) : null}
      {result && result.results.length > 0 ? (
        <Card title={t("listTitle")}>
          <div className="hidden divide-y md:block">
            {result.results.map((notification) => (
              <article key={notification.id} className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.isRead ? <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{t("unread")}</span> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt, locale)}</p>
                </div>
                {!notification.isRead ? (
                  <Button type="button" variant="secondary" loading={pendingId === notification.id} onClick={() => void markRead(notification.id)}>
                    {t("markRead")}
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
          <div className="grid gap-3 md:hidden">
            {result.results.map((notification) => (
              <MobileRecordCard
                key={notification.id}
                title={notification.title}
                subtitle={formatDate(notification.createdAt, locale)}
                actions={
                  !notification.isRead ? (
                    <Button type="button" variant="secondary" loading={pendingId === notification.id} onClick={() => void markRead(notification.id)}>
                      {t("markRead")}
                    </Button>
                  ) : undefined
                }
              >
                <p>{notification.body}</p>
                <p className="text-xs text-muted-foreground">{notification.isRead ? t("read") : t("unread")}</p>
              </MobileRecordCard>
            ))}
          </div>
          <Pagination
            count={result.count}
            page={Number(filters.page ?? "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page ?? "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page ?? "1") + 1)})}
          />
        </Card>
      ) : null}
    </PageStack>
  );
}
