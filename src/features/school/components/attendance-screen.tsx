"use client";

import type {FormEvent} from "react";
import {useCallback, useEffect, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {
  ATTENDANCE_STATUSES,
  QR_OWNER_TYPES,
  ownerTypeTranslationKeys,
  statusTranslationKeys,
  translateEnum,
} from "@/lib/presentation/domain-enums";
import {usePortalSession} from "@/providers/auth-provider";

import {
  approveExcuse,
  fetchAttendanceRecords,
  fetchExcuses,
  fetchQrEntries,
  manualAttendanceRecord,
  regenerateQr,
  rejectExcuse,
  revokeQr,
  rotateQrYear,
  updateAttendanceRecord,
} from "../services/school-api";
import type {PaginatedResult, SchoolAttendanceRecord, SchoolExcuse, SchoolQrEntry} from "../types/contracts";
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

export function SchoolAttendanceScreen() {
  const t = useTranslations("attendance");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const qrT = useTranslations("qr");
  const confirmT = useTranslations("confirmations");
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams, ["status", "classroom_id", "from", "to", "page"]));
  const [records, setRecords] = useState<PaginatedResult<SchoolAttendanceRecord> | null>(null);
  const [excuses, setExcuses] = useState<PaginatedResult<SchoolExcuse> | null>(null);
  const [qrEntries, setQrEntries] = useState<SchoolQrEntry[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SchoolAttendanceRecord | null>(null);
  const [selectedQr, setSelectedQr] = useState<SchoolQrEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({studentId: "", date: "", status: "PRESENT", note: "", reason: ""});
  const [editForm, setEditForm] = useState({status: "PRESENT", note: "", reason: ""});
  const [qrForm, setQrForm] = useState({ownerType: "STUDENT", search: "", reason: "", year: ""});

  useEffect(() => {
    if (!selectedRecord) return;
    setEditForm({status: selectedRecord.status, note: selectedRecord.note, reason: ""});
  }, [selectedRecord]);

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
    const [recordResult, excuseResult, qrResult] = await Promise.all([
      fetchAttendanceRecords({
        status: filters.status || undefined,
        classroom_id: filters.classroom_id || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page: filters.page || "1",
      }),
      fetchExcuses({status: "PENDING", page: "1"}),
      fetchQrEntries({type: qrForm.ownerType, search: qrForm.search || undefined}),
    ]);
    if (!recordResult.success) {
      setError(recordResult.error.message);
      setLoading(false);
      return;
    }
    setRecords(recordResult.data);
    setExcuses(excuseResult.success ? excuseResult.data : null);
    setQrEntries(qrResult.success ? qrResult.data : []);
    setLoading(false);
  }, [filters.classroom_id, filters.from, filters.page, filters.status, filters.to, qrForm.ownerType, qrForm.search]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitManual = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await manualAttendanceRecord({
      student_id: manualForm.studentId,
      date: manualForm.date,
      status: manualForm.status,
      note: manualForm.note,
      reason: manualForm.reason,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setManualForm({studentId: "", date: "", status: "PRESENT", note: "", reason: ""});
    setMessage(t("manualCreated"));
    await load();
  };

  const submitEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRecord) return;
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateAttendanceRecord(selectedRecord.id, editForm);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("recordUpdated"));
    await load();
  };

  const actOnExcuse = async (id: string, mode: "approve" | "reject") => {
    if (!window.confirm(mode === "approve" ? confirmT("approveExcuse") : confirmT("rejectExcuse"))) {
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    const result = mode === "approve" ? await approveExcuse(id) : await rejectExcuse(id);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(mode === "approve" ? t("excuseApproved") : t("excuseRejected"));
    await load();
  };

  const regenerateSelectedQr = async () => {
    if (!selectedQr) return;
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await regenerateQr(selectedQr.ownerType, selectedQr.ownerId, qrForm.reason);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(result.data.token ? `${t("qrRegenerated")}: ${result.data.token}` : t("qrRegenerated"));
    await load();
  };

  const revokeSelectedQr = async () => {
    if (!selectedQr) return;
    if (!window.confirm(confirmT("revokeQr"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await revokeQr(selectedQr.id, qrForm.reason);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("qrRevoked"));
    await load();
  };

  const rotateYear = async () => {
    if (!window.confirm(confirmT("rotateQrYear"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await rotateQrYear({
      owner_type: qrForm.ownerType,
      year: qrForm.year ? Number(qrForm.year) : undefined,
      reason: qrForm.reason,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("qrRotated"));
    await load();
  };

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const ownerTypeLabel = (value: string) => translateEnum(value, qrT, ownerTypeTranslationKeys);

  if (!hasCapability("school.attendance")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.attendanceRead)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-3">
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={filters.status ?? ""} onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}>
            <option value="">{t("allStatuses")}</option>
            {ATTENDANCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <Input value={filters.classroom_id ?? ""} onChange={(event) => updateFilters({...filters, classroom_id: event.target.value, page: "1"})} placeholder={t("classroomId")} />
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
          <Input type="date" value={filters.from ?? ""} onChange={(event) => updateFilters({...filters, from: event.target.value, page: "1"})} />
          <Input type="date" value={filters.to ?? ""} onChange={(event) => updateFilters({...filters, to: event.target.value, page: "1"})} />
        </div>
      </Card>
      <Can permission={SCHOOL_PERMISSIONS.attendanceManual}>
        <Card title={t("manualTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitManual(event)}>
            <Input value={manualForm.studentId} onChange={(event) => setManualForm({...manualForm, studentId: event.target.value})} placeholder={t("studentId")} required />
            <Input type="date" value={manualForm.date} onChange={(event) => setManualForm({...manualForm, date: event.target.value})} required />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={manualForm.status} onChange={(event) => setManualForm({...manualForm, status: event.target.value})}>
              {ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <Input value={manualForm.reason} onChange={(event) => setManualForm({...manualForm, reason: event.target.value})} placeholder={common("reason")} required />
            <div className="md:col-span-2">
              <Textarea value={manualForm.note} onChange={(event) => setManualForm({...manualForm, note: event.target.value})} placeholder={common("notes")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={pending}>
                {t("manualAction")}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {records ? (
        <Card title={t("recordsTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("student")}</HeaderCell>
                  <HeaderCell>{common("date")}</HeaderCell>
                  <HeaderCell>{common("status")}</HeaderCell>
                  <HeaderCell>{t("classroom")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {records.results.map((record) => (
                  <tr key={record.id} className="border-t">
                    <BodyCell>
                      <button type="button" className="font-medium text-primary" onClick={() => setSelectedRecord(record)}>
                        {record.student.fullName}
                      </button>
                    </BodyCell>
                    <BodyCell>{record.date}</BodyCell>
                    <BodyCell>{statusLabel(record.status)}</BodyCell>
                    <BodyCell>{record.classroom?.name || common("none")}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={records.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
      {selectedRecord ? (
        <Can permission={SCHOOL_PERMISSIONS.attendanceEdit}>
          <Card title={t("editRecordTitle")}>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitEdit(event)}>
              <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={editForm.status} onChange={(event) => setEditForm({...editForm, status: event.target.value})}>
                {ATTENDANCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
              <Input value={editForm.reason} onChange={(event) => setEditForm({...editForm, reason: event.target.value})} placeholder={common("reason")} required />
              <div className="md:col-span-2">
                <Textarea value={editForm.note} onChange={(event) => setEditForm({...editForm, note: event.target.value})} placeholder={common("notes")} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" loading={pending}>
                  {common("save")}
                </Button>
              </div>
            </form>
          </Card>
        </Can>
      ) : null}
      {excuses ? (
        <Can permission={SCHOOL_PERMISSIONS.excusesManage}>
          <Card title={t("excusesTitle")}>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-muted">
                  <tr>
                    <HeaderCell>{t("student")}</HeaderCell>
                    <HeaderCell>{common("date")}</HeaderCell>
                    <HeaderCell>{common("reason")}</HeaderCell>
                    <HeaderCell>{common("actions")}</HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {excuses.results.map((excuse) => (
                    <tr key={excuse.id} className="border-t">
                      <BodyCell>{excuse.student.fullName}</BodyCell>
                      <BodyCell>{excuse.date}</BodyCell>
                      <BodyCell>{excuse.reason}</BodyCell>
                      <BodyCell>
                        <div className="flex gap-2">
                          <Button type="button" loading={pending} onClick={() => void actOnExcuse(excuse.id, "approve")}>
                            {t("approve")}
                          </Button>
                          <Button type="button" className="bg-danger text-danger-foreground" loading={pending} onClick={() => void actOnExcuse(excuse.id, "reject")}>
                            {t("reject")}
                          </Button>
                        </div>
                      </BodyCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Can>
      ) : null}
      <Can permission={SCHOOL_PERMISSIONS.qrRegenerate}>
        <Card title={t("qrTitle")}>
          <div className="grid gap-3 md:grid-cols-2">
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={qrForm.ownerType} onChange={(event) => setQrForm({...qrForm, ownerType: event.target.value})}>
              {QR_OWNER_TYPES.map((ownerType) => (
                <option key={ownerType} value={ownerType}>
                  {ownerTypeLabel(ownerType)}
                </option>
              ))}
            </select>
            <Input value={qrForm.search} onChange={(event) => setQrForm({...qrForm, search: event.target.value})} placeholder={t("searchOwner")} />
            <Input value={qrForm.reason} onChange={(event) => setQrForm({...qrForm, reason: event.target.value})} placeholder={common("reason")} />
            <Input value={qrForm.year} onChange={(event) => setQrForm({...qrForm, year: event.target.value})} placeholder={t("year")} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("ownerName")}</HeaderCell>
                  <HeaderCell>{common("status")}</HeaderCell>
                  <HeaderCell>{t("validFrom")}</HeaderCell>
                  <HeaderCell>{t("validTo")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {qrEntries.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <BodyCell>
                      <button type="button" className="font-medium text-primary" onClick={() => setSelectedQr(entry)}>
                        {entry.ownerName}
                      </button>
                    </BodyCell>
                    <BodyCell>{statusLabel(entry.status)}</BodyCell>
                    <BodyCell>{entry.validFrom}</BodyCell>
                    <BodyCell>{entry.validTo}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" loading={pending} onClick={() => void regenerateSelectedQr()} disabled={!selectedQr}>
              {t("regenerate")}
            </Button>
            <Can permission={SCHOOL_PERMISSIONS.qrRevoke}>
              <Button type="button" className="bg-danger text-danger-foreground" loading={pending} onClick={() => void revokeSelectedQr()} disabled={!selectedQr}>
                {t("revoke")}
              </Button>
            </Can>
            <Can permission={SCHOOL_PERMISSIONS.qrRotateYear}>
              <Button type="button" className="bg-secondary text-secondary-foreground" loading={pending} onClick={() => void rotateYear()}>
                {t("rotateYear")}
              </Button>
            </Can>
          </div>
        </Card>
      </Can>
    </div>
  );
}
