"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {FilteredEmptyState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {
  ActiveFilterChips,
  BodyCell,
  Card,
  FilterBar,
  HeaderCell,
  InlineError,
  LoadingBlock,
  MetricCard,
  MobileRecordCard,
  PageHeader,
  PageStack,
  ResponsiveTable,
  SectionHeader,
  TableScroller,
} from "@/features/school/components/common";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {formatDate} from "@/lib/formatting/dates";
import {formatNumber} from "@/lib/formatting/numbers";
import {usePortalSession} from "@/providers/auth-provider";

import {
  fetchAttendanceReport,
  fetchAtRiskStudents,
  fetchBehaviorReport,
  fetchClassrooms,
  fetchGrades,
  fetchKpiReport,
  fetchPointsReport,
  fetchSchoolOverview,
} from "../services/school-api";
import type {
  SchoolAtRiskStudent,
  SchoolClassroom,
  SchoolDashboardOverview,
  SchoolGrade,
  SchoolKpiReport,
  SchoolPointsReportEntry,
} from "../types/contracts";

type Filters = Record<string, string>;

const allowedFilterKeys = ["from", "to", "classroom_id", "grade_id", "page"] as const;

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

export function SchoolReportsScreen() {
  const t = useTranslations("reports");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams));
  const [overview, setOverview] = useState<SchoolDashboardOverview | null>(null);
  const [kpis, setKpis] = useState<SchoolKpiReport | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<Record<string, number>>({});
  const [pointsReport, setPointsReport] = useState<SchoolPointsReportEntry[]>([]);
  const [behaviorReport, setBehaviorReport] = useState<Record<string, number>>({});
  const [atRiskStudents, setAtRiskStudents] = useState<SchoolAtRiskStudent[]>([]);
  const [classrooms, setClassrooms] = useState<SchoolClassroom[]>([]);
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewAnyReports = access.canAny([
    SCHOOL_PERMISSIONS.reportsView,
    SCHOOL_PERMISSIONS.attendanceReportsView,
    SCHOOL_PERMISSIONS.pointsLeaderboardView,
    SCHOOL_PERMISSIONS.atRiskView,
    SCHOOL_PERMISSIONS.coreReportsView,
  ]);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key, value]) => key !== "page" && Boolean(value))
        .map(([key, value]) => ({key, label: t(`filterLabels.${key}`), value})),
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

    const query = {
      from: filters.from || undefined,
      to: filters.to || undefined,
      classroom_id: filters.classroom_id || undefined,
      grade_id: filters.grade_id || undefined,
    };

    const [
      overviewResult,
      kpiResult,
      attendanceResult,
      pointsResult,
      behaviorResult,
      riskResult,
      classroomsResult,
      gradesResult,
    ] = await Promise.all([
      access.can(SCHOOL_PERMISSIONS.reportsView) ? fetchSchoolOverview() : Promise.resolve(null),
      access.can(SCHOOL_PERMISSIONS.coreReportsView) ? fetchKpiReport() : Promise.resolve(null),
      access.can(SCHOOL_PERMISSIONS.attendanceReportsView) ? fetchAttendanceReport(query) : Promise.resolve(null),
      access.can(SCHOOL_PERMISSIONS.reportsView) ? fetchPointsReport(query) : Promise.resolve(null),
      access.can(SCHOOL_PERMISSIONS.reportsView) ? fetchBehaviorReport(query) : Promise.resolve(null),
      access.can(SCHOOL_PERMISSIONS.atRiskView) ? fetchAtRiskStudents(query) : Promise.resolve(null),
      fetchClassrooms({page: "1"}),
      fetchGrades({page: "1"}),
    ]);

    const results = [overviewResult, kpiResult, attendanceResult, pointsResult, behaviorResult, riskResult, classroomsResult, gradesResult];
    for (const result of results) {
      if (result && !result.success) {
        setError(result.error.message);
        setLoading(false);
        return;
      }
    }

    if (overviewResult && overviewResult.success) {
      setOverview(overviewResult.data);
    }
    if (kpiResult && kpiResult.success) {
      setKpis(kpiResult.data);
    }
    if (attendanceResult && attendanceResult.success) {
      setAttendanceSummary(attendanceResult.data.summary);
    }
    if (pointsResult && pointsResult.success) {
      setPointsReport(pointsResult.data);
    }
    if (behaviorResult && behaviorResult.success) {
      setBehaviorReport(behaviorResult.data);
    }
    if (riskResult && riskResult.success) {
      setAtRiskStudents(riskResult.data);
    }
    if (classroomsResult.success) {
      setClassrooms(classroomsResult.data.results);
    }
    if (gradesResult.success) {
      setGrades(gradesResult.data.results);
    }

    setLoading(false);
  }, [access, filters.classroom_id, filters.from, filters.grade_id, filters.to]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("school.reports")) {
    return <UnsupportedState />;
  }

  if (!canViewAnyReports) {
    return <ForbiddenState />;
  }

  return (
    <PageStack>
      <div className="hidden print:block">
        <h1 className="text-2xl font-semibold">{t("printTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDate(new Date(), locale)} | {access.session.activeSchool?.name ?? common("none")}
        </p>
      </div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            {t("browserPrint")}
          </Button>
        }
      />
      {error ? <InlineError message={error} /> : null}
      <FilterBar
        actions={
          <Button type="button" variant="secondary" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        }
      >
        <Input aria-label={t("fromDate")} type="date" value={filters.from ?? ""} onChange={(event) => updateFilters({...filters, from: event.target.value})} />
        <Input aria-label={t("toDate")} type="date" value={filters.to ?? ""} onChange={(event) => updateFilters({...filters, to: event.target.value})} />
        <Select aria-label={t("classroom")} value={filters.classroom_id ?? ""} onChange={(event) => updateFilters({...filters, classroom_id: event.target.value})}>
          <option value="">{t("allClassrooms")}</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </Select>
        <Select aria-label={t("grade")} value={filters.grade_id ?? ""} onChange={(event) => updateFilters({...filters, grade_id: event.target.value})}>
          <option value="">{t("allGrades")}</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </Select>
      </FilterBar>
      <ActiveFilterChips
        items={activeFilters}
        clearLabel={common("clear")}
        clearAllLabel={t("clearFilters")}
        onClear={(key) => updateFilters({...filters, [key]: ""})}
        onClearAll={() => updateFilters({})}
      />
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {!loading ? (
        <>
          <Can permission={SCHOOL_PERMISSIONS.reportsView}>
            <Card title={t("overviewTitle")} description={t("overviewDescription")}>
              {overview ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard label={t("students")} value={formatNumber(overview.students, locale)} />
                  <MetricCard label={t("attendanceToday")} value={formatNumber(overview.attendanceToday, locale)} />
                  <MetricCard label={t("pointsTransactions")} value={formatNumber(overview.pointsTransactions, locale)} />
                  <MetricCard label={t("behaviorNotes")} value={formatNumber(overview.behaviorNotes, locale)} />
                  <MetricCard label={t("ticketsOpen")} value={formatNumber(overview.ticketsOpen, locale)} />
                </div>
              ) : (
                <FilteredEmptyState title={t("unavailableTitle")} description={t("overviewUnavailable")} />
              )}
            </Card>
          </Can>

          <Can permission={SCHOOL_PERMISSIONS.coreReportsView}>
            <Card title={t("kpiTitle")} description={t("kpiDescription")}>
              {kpis ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard label={t("students")} value={formatNumber(kpis.students, locale)} />
                  <MetricCard label={t("staff")} value={formatNumber(kpis.staff, locale)} />
                  <MetricCard label={t("attendanceToday")} value={formatNumber(kpis.attendanceToday, locale)} />
                </div>
              ) : (
                <FilteredEmptyState title={t("unavailableTitle")} description={t("kpiUnavailable")} />
              )}
            </Card>
          </Can>

          <Can permission={SCHOOL_PERMISSIONS.attendanceReportsView}>
            <Card title={t("attendanceReportTitle")} description={t("attendanceReportDescription")}>
              {Object.keys(attendanceSummary).length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(attendanceSummary).map(([status, total]) => (
                    <MetricCard key={status} label={status} value={formatNumber(total, locale)} />
                  ))}
                </div>
              ) : (
                <FilteredEmptyState title={t("emptyTitle")} description={t("attendanceEmpty")} />
              )}
            </Card>
          </Can>

          <Can permission={SCHOOL_PERMISSIONS.reportsView}>
            <Card title={t("pointsReportTitle")} description={t("pointsReportDescription")}>
              {pointsReport.length > 0 ? (
                <>
                  <TableScroller>
                    <ResponsiveTable>
                      <thead className="bg-muted">
                        <tr>
                          <HeaderCell>{t("studentId")}</HeaderCell>
                          <HeaderCell>{t("points")}</HeaderCell>
                        </tr>
                      </thead>
                      <tbody>
                        {pointsReport.map((entry) => (
                          <tr key={entry.studentId} className="border-t">
                            <BodyCell>{entry.studentId}</BodyCell>
                            <BodyCell>{formatNumber(entry.points, locale)}</BodyCell>
                          </tr>
                        ))}
                      </tbody>
                    </ResponsiveTable>
                  </TableScroller>
                  <div className="mt-4 grid gap-3 md:hidden">
                    {pointsReport.map((entry) => (
                      <MobileRecordCard key={entry.studentId} title={entry.studentId} subtitle={t("points")}>
                        <p>{formatNumber(entry.points, locale)}</p>
                      </MobileRecordCard>
                    ))}
                  </div>
                </>
              ) : (
                <FilteredEmptyState title={t("emptyTitle")} description={t("pointsEmpty")} />
              )}
            </Card>
          </Can>

          <Can permission={SCHOOL_PERMISSIONS.reportsView}>
            <Card title={t("behaviorReportTitle")} description={t("behaviorReportDescription")}>
              {Object.keys(behaviorReport).length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(behaviorReport).map(([severity, total]) => (
                    <MetricCard key={severity} label={severity} value={formatNumber(total, locale)} />
                  ))}
                </div>
              ) : (
                <FilteredEmptyState title={t("emptyTitle")} description={t("behaviorEmpty")} />
              )}
            </Card>
          </Can>

          <Can permission={SCHOOL_PERMISSIONS.atRiskView}>
            <Card title={t("atRiskTitle")} description={t("atRiskDescription")}>
              {atRiskStudents.length > 0 ? (
                <>
                  <div className="hidden md:block">
                    <TableScroller>
                      <ResponsiveTable>
                        <thead className="bg-muted">
                          <tr>
                            <HeaderCell>{t("student")}</HeaderCell>
                            <HeaderCell>{t("studentCode")}</HeaderCell>
                            <HeaderCell>{t("absentDays")}</HeaderCell>
                            <HeaderCell>{t("points")}</HeaderCell>
                          </tr>
                        </thead>
                        <tbody>
                          {atRiskStudents.map((student) => (
                            <tr key={student.studentId} className="border-t">
                              <BodyCell>{student.fullName}</BodyCell>
                              <BodyCell>{student.studentCode}</BodyCell>
                              <BodyCell>{formatNumber(student.absentDays, locale)}</BodyCell>
                              <BodyCell>{formatNumber(student.points, locale)}</BodyCell>
                            </tr>
                          ))}
                        </tbody>
                      </ResponsiveTable>
                    </TableScroller>
                  </div>
                  <div className="grid gap-3 md:hidden">
                    {atRiskStudents.map((student) => (
                      <MobileRecordCard key={student.studentId} title={student.fullName} subtitle={student.studentCode}>
                        <p>{t("absentDays")}: {formatNumber(student.absentDays, locale)}</p>
                        <p>{t("points")}: {formatNumber(student.points, locale)}</p>
                      </MobileRecordCard>
                    ))}
                  </div>
                </>
              ) : (
                <FilteredEmptyState title={t("emptyTitle")} description={t("riskEmpty")} />
              )}
            </Card>
          </Can>

          <Card title={t("printNotesTitle")}>
            <SectionHeader title={t("printNotesTitle")} description={t("printNotesDescription")} />
          </Card>
        </>
      ) : null}
    </PageStack>
  );
}

