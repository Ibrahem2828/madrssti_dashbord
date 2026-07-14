"use client";

import type {FormEvent} from "react";
import {useCallback, useEffect, useState} from "react";
import {useSearchParams, usePathname} from "next/navigation";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {usePortalSession} from "@/providers/auth-provider";

import {
  createAcademicYear,
  fetchAcademicYears,
  fetchClassrooms,
  fetchGrades,
  fetchSubjects,
  updateAcademicYear,
} from "../services/school-api";
import type {PaginatedResult, SchoolAcademicYear, SchoolClassroom, SchoolGrade, SchoolSubject} from "../types/contracts";
import {
  BodyCell,
  Card,
  HeaderCell,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
  Pagination,
  readFilters,
} from "./common";

export function SchoolAcademicScreen() {
  const t = useTranslations("academic");
  const common = useTranslations("common");
  const access = usePortalSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState(() => readFilters(searchParams, ["search", "page"]));
  const [years, setYears] = useState<PaginatedResult<SchoolAcademicYear> | null>(null);
  const [grades, setGrades] = useState<PaginatedResult<SchoolGrade> | null>(null);
  const [classrooms, setClassrooms] = useState<PaginatedResult<SchoolClassroom> | null>(null);
  const [subjects, setSubjects] = useState<PaginatedResult<SchoolSubject> | null>(null);
  const [selectedYear, setSelectedYear] = useState<SchoolAcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({name: "", startDate: "", endDate: "", isActive: true});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedYear) return;
    setYearForm({
      name: selectedYear.name,
      startDate: selectedYear.startDate,
      endDate: selectedYear.endDate,
      isActive: selectedYear.isActive,
    });
  }, [selectedYear]);

  const updateFilters = (next: Record<string, string>) => {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [yearResult, gradeResult, classroomResult, subjectResult] = await Promise.all([
      fetchAcademicYears({search: filters.search || undefined, page: filters.page || "1"}),
      fetchGrades({search: filters.search || undefined, page: "1"}),
      fetchClassrooms({search: filters.search || undefined, page: "1"}),
      fetchSubjects({search: filters.search || undefined, page: "1"}),
    ]);
    if (!yearResult.success) {
      setError(yearResult.error.message);
      setLoading(false);
      return;
    }
    setYears(yearResult.data);
    setGrades(gradeResult.success ? gradeResult.data : null);
    setClassrooms(classroomResult.success ? classroomResult.data : null);
    setSubjects(subjectResult.success ? subjectResult.data : null);
    setLoading(false);
  }, [filters.page, filters.search]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitYear = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const payload = {
      name: yearForm.name,
      start_date: yearForm.startDate,
      end_date: yearForm.endDate,
      is_active: yearForm.isActive,
    };
    const result = selectedYear ? await updateAcademicYear(selectedYear.id, payload) : await createAcademicYear(payload);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setSelectedYear(null);
    setYearForm({name: "", startDate: "", endDate: "", isActive: true});
    setMessage(selectedYear ? t("yearUpdated") : t("yearCreated"));
    await load();
  };

  if (!hasCapability("school.academics")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.academicYearsManage)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-[2fr_auto]">
          <Input value={filters.search ?? ""} onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})} placeholder={t("searchPlaceholder")} />
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      <Can permission={SCHOOL_PERMISSIONS.academicYearsManage}>
        <Card title={selectedYear ? t("editYearTitle") : t("createYearTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitYear(event)}>
            <Input value={yearForm.name} onChange={(event) => setYearForm({...yearForm, name: event.target.value})} placeholder={t("yearName")} required />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={yearForm.isActive ? "active" : "inactive"} onChange={(event) => setYearForm({...yearForm, isActive: event.target.value === "active"})}>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
            <Input type="date" value={yearForm.startDate} onChange={(event) => setYearForm({...yearForm, startDate: event.target.value})} required />
            <Input type="date" value={yearForm.endDate} onChange={(event) => setYearForm({...yearForm, endDate: event.target.value})} required />
            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" loading={pending}>
                {selectedYear ? common("save") : common("create")}
              </Button>
              {selectedYear ? (
                <Button type="button" className="bg-secondary text-secondary-foreground" onClick={() => setSelectedYear(null)}>
                  {common("cancel")}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </Can>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {years ? (
        <Card title={t("yearsTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("yearName")}</HeaderCell>
                  <HeaderCell>{t("startDate")}</HeaderCell>
                  <HeaderCell>{t("endDate")}</HeaderCell>
                  <HeaderCell>{common("status")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {years.results.map((year) => (
                  <tr key={year.id} className="border-t">
                    <BodyCell>
                      <button type="button" className="font-medium text-primary" onClick={() => setSelectedYear(year)}>
                        {year.name}
                      </button>
                    </BodyCell>
                    <BodyCell>{year.startDate}</BodyCell>
                    <BodyCell>{year.endDate}</BodyCell>
                    <BodyCell>{year.isActive ? t("active") : t("inactive")}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={years.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
      <SummaryTable title={t("gradesTitle")} rows={grades?.results.map((item) => [item.name, String(item.sortOrder), item.isActive ? t("active") : t("inactive")]) ?? []} headers={[t("name"), t("sortOrder"), common("status")]} />
      <SummaryTable title={t("classroomsTitle")} rows={classrooms?.results.map((item) => [item.name, item.gradeLevelId || common("none"), item.isActive ? t("active") : t("inactive")]) ?? []} headers={[t("name"), t("gradeLevel"), common("status")]} />
      <SummaryTable title={t("subjectsTitle")} rows={subjects?.results.map((item) => [item.name, item.code, item.isActive ? t("active") : t("inactive")]) ?? []} headers={[t("name"), t("code"), common("status")]} />
    </div>
  );
}

function SummaryTable({title, headers, rows}: {title: string; headers: string[]; rows: string[][]}) {
  return (
    <Card title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map((header) => (
                <HeaderCell key={header}>{header}</HeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t">
                {row.map((cell) => (
                  <BodyCell key={`${title}-${index}-${cell}`}>{cell}</BodyCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
