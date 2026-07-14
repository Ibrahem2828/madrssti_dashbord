"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {ErrorState, UnsupportedState} from "@/components/feedback/states";
import {hasCapability} from "@/config/capabilities";
import {statusTranslationKeys, translateEnum} from "@/lib/presentation/domain-enums";
import {fetchDocumentOverview, fetchSchoolKpis, fetchSchoolOverview} from "../services/school-api";
import {Card, LoadingBlock, MetricCard, PageHeader} from "./common";
import type {SchoolDashboardKpis, SchoolDashboardOverview, SchoolDocumentOverview} from "../types/contracts";

export function SchoolDashboardScreen() {
  const t = useTranslations("schoolDashboard");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const [overview, setOverview] = useState<SchoolDashboardOverview | null>(null);
  const [kpis, setKpis] = useState<SchoolDashboardKpis>({});
  const [documents, setDocuments] = useState<SchoolDocumentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [overviewResult, kpiResult, documentResult] = await Promise.all([
      fetchSchoolOverview(),
      fetchSchoolKpis(),
      fetchDocumentOverview(),
    ]);

    if (!overviewResult.success) {
      setError(overviewResult.error.message);
      setLoading(false);
      return;
    }

    setOverview(overviewResult.data);
    setKpis(kpiResult.success ? kpiResult.data : {});
    setDocuments(documentResult.success ? documentResult.data : null);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const kpiLabels: Record<string, string> = {
    schools_active: t("kpiSchoolsActive"),
    schools_inactive: t("kpiSchoolsInactive"),
    open_tickets: t("kpiOpenTickets"),
    today_sessions: t("kpiTodaySessions"),
    absent_today: t("kpiAbsentToday"),
    late_today: t("kpiLateToday"),
    notifications: t("kpiNotifications"),
    total_students: t("kpiTotalStudents"),
    attendance_today: t("kpiAttendanceToday"),
    at_risk: t("kpiAtRisk"),
    students: t("kpiStudents"),
    system_status: t("kpiSystemStatus"),
  };

  const formatKpiValue = (key: string, value: string | number | boolean | null) => {
    if (key === "system_status" && typeof value === "string") {
      return translateEnum(value, statusT, statusTranslationKeys);
    }

    return String(value);
  };

  if (!hasCapability("school.dashboard")) {
    return <UnsupportedState />;
  }

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (error || !overview) {
    return <ErrorState onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("students")} value={overview.students} />
        <MetricCard label={t("attendanceToday")} value={overview.attendanceToday} />
        <MetricCard label={t("ticketsOpen")} value={overview.ticketsOpen} />
        <MetricCard label={t("behaviorNotes")} value={overview.behaviorNotes} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title={t("kpisTitle")}>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(kpis).map(([key, value]) => (
              <div key={key} className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">{kpiLabels[key] ?? key}</p>
                <p className="mt-1 font-medium">{formatKpiValue(key, value)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t("documentsOverview")}>
          {documents ? (
            <div className="space-y-3 text-sm">
              <p>{t("documentsTotal", {count: documents.total})}</p>
              <p>{t("documentsIncoming", {count: documents.incoming})}</p>
              <p>{t("documentsOutgoing", {count: documents.outgoing})}</p>
              <p>{t("documentsNeedsReply", {count: documents.needsReply})}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("documentsUnavailable")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
