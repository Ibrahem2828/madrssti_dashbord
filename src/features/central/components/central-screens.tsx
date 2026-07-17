"use client";

import type {FormEvent} from "react";
import {useCallback, useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {useSearchParams} from "next/navigation";
import {Link} from "@/i18n/routing";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ErrorState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {
  BodyCell as ProductBodyCell,
  InlineAlert,
  LoadingCard,
  MetadataList,
  MetricCard as ProductMetricCard,
  PageHeader as ProductPageHeader,
  PaginationBar,
  SurfaceCard,
  HeaderCell as ProductHeaderCell,
} from "@/components/layout/product-framework";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {hasCapability} from "@/config/capabilities";
import {CENTRAL_PERMISSIONS} from "@/config/permissions";
import {useUnsavedChangesGuard} from "@/hooks/use-unsaved-changes-guard";
import {
  TICKET_STATUSES,
  priorityTranslationKeys,
  statusTranslationKeys,
  translateEnum,
} from "@/lib/presentation/domain-enums";
import {usePortalSession} from "@/providers/auth-provider";

import {
  activateCentralSchool,
  assignCentralTicket,
  closeCentralTicket,
  createCentralAdmin,
  createCentralSchool,
  deactivateCentralSchool,
  fetchCentralAdminState,
  fetchCentralAudit,
  fetchCentralDashboard,
  fetchCentralPolicies,
  fetchCentralSchool,
  fetchCentralSchoolHealth,
  fetchCentralSchools,
  fetchCentralSystemHealth,
  fetchCentralTicket,
  fetchCentralTickets,
  resetCentralAdminPassword,
  updateCentralPolicy,
  updateCentralSchool,
} from "../services/central-api";
import type {
  CentralAdminState,
  CentralAuditEntry,
  CentralDashboardOverview,
  CentralPolicy,
  CentralSchool,
  CentralSchoolHealth,
  CentralSystemHealth,
  CentralTicket,
  PaginatedResult,
} from "../types/contracts";

type Filters = Record<string, string>;

export function CentralDashboardScreen() {
  const t = useTranslations("central");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const [overview, setOverview] = useState<CentralDashboardOverview | null>(null);
  const [health, setHealth] = useState<CentralSchoolHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [overviewResult, healthResult] = await Promise.all([fetchCentralDashboard(), fetchCentralSchoolHealth()]);

    if (!overviewResult.success) {
      setError(overviewResult.error.message);
      setLoading(false);
      return;
    }

    setOverview(overviewResult.data);
    setHealth(healthResult.success ? healthResult.data.slice(0, 5) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (error || !overview) {
    return <ErrorState onRetry={() => void load()} />;
  }

  const statusLabel = (value: string | null | undefined) => translateEnum(value, statusT, statusTranslationKeys);

  if (!hasCapability("central.dashboard")) {
    return <UnsupportedState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboardTitle")} description={t("dashboardDescription")} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("schoolsTotal")} value={overview.schoolsTotal} />
        <MetricCard label={t("schoolsActive")} value={overview.schoolsActive} />
        <MetricCard label={t("ticketsOpen")} value={overview.ticketsOpen} />
        <MetricCard label={t("usersTotal")} value={overview.usersTotal} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title={t("quickLinks")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/central/schools" label={t("schoolsTitle")} />
            <QuickLink href="/central/health" label={t("healthTitle")} />
            <QuickLink href="/central/tickets" label={t("ticketsTitle")} />
            <QuickLink href="/central/policies" label={t("policiesTitle")} />
          </div>
        </Card>
        <Card title={t("systemStatus")}>
          <p className="text-sm text-muted-foreground">{statusLabel(overview.systemStatus) || t("unknownStatus")}</p>
          <div className="mt-4 space-y-3">
            {health.map((entry) => (
              <div key={entry.schoolId} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{entry.name}</p>
                  <span className="text-xs text-muted-foreground">{statusLabel(entry.status)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("openTicketsInline", {count: entry.openTickets})}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CentralHealthScreen() {
  const t = useTranslations("health");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const [systemHealth, setSystemHealth] = useState<CentralSystemHealth | null>(null);
  const [schools, setSchools] = useState<CentralSchoolHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [systemResult, schoolResult] = await Promise.all([
      fetchCentralSystemHealth(),
      fetchCentralSchoolHealth(),
    ]);

    if (!systemResult.success) {
      setError(systemResult.error.message);
      setLoading(false);
      return;
    }

    setSystemHealth(systemResult.data);
    setSchools(schoolResult.success ? schoolResult.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (error || !systemHealth) {
    return <ErrorState onRetry={() => void load()} />;
  }

  const statusLabel = (value: string | null | undefined) => translateEnum(value, statusT, statusTranslationKeys);

  if (!hasCapability("central.health")) {
    return <UnsupportedState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t("system")} value={statusLabel(systemHealth.status) || t("unavailable")} />
        <MetricCard label={t("database")} value={statusLabel(systemHealth.database) || t("unavailable")} />
        <MetricCard label={t("redis")} value={statusLabel(systemHealth.redis) || t("unavailable")} />
      </div>
      <Card title={t("schoolsHealth")}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-muted">
              <tr>
                <HeaderCell>{t("school")}</HeaderCell>
                <HeaderCell>{t("status")}</HeaderCell>
                <HeaderCell>{t("openTickets")}</HeaderCell>
                <HeaderCell>{t("lastActivity")}</HeaderCell>
                <HeaderCell>{t("errorRate")}</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {schools.map((entry) => (
                <tr key={entry.schoolId} className="border-t">
                  <BodyCell>{entry.name}</BodyCell>
                  <BodyCell>{statusLabel(entry.status)}</BodyCell>
                  <BodyCell>{entry.openTickets}</BodyCell>
                  <BodyCell>{entry.lastActivityAt || t("unavailable")}</BodyCell>
                  <BodyCell>{entry.errorRate === null ? t("unavailable") : entry.errorRate}</BodyCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function CentralSchoolsScreen() {
  const t = useTranslations("schools");
  const common = useTranslations("common");
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams, ["search", "status", "page"]));
  const [data, setData] = useState<PaginatedResult<CentralSchool> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({name: "", code: "", phone: "", address: "", timezone: "Asia/Riyadh"});
  const hasUnsavedChanges = Boolean(form.name || form.code || form.phone || form.address || form.timezone !== "Asia/Riyadh");

  useUnsavedChangesGuard(hasUnsavedChanges, common("unsavedChanges"));

  useEffect(() => {
    setFilters(readFilters(searchParams, ["search", "status", "page"]));
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCentralSchools({
      page: filters.page || "1",
      search: filters.search || undefined,
      status: filters.status || undefined,
    });

    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setData(result.data);
    setLoading(false);
  }, [filters.page, filters.search, filters.status]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    const result = await createCentralSchool(form);
    setCreating(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setForm({name: "", code: "", phone: "", address: "", timezone: "Asia/Riyadh"});
    await load();
  };

  if (!hasCapability("central.schools")) {
    return <UnsupportedState />;
  }

  if (!access.can(CENTRAL_PERMISSIONS.schoolsRead)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <Input
            value={filters.search ?? ""}
            onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})}
            placeholder={t("searchPlaceholder")}
          />
          <select
            className="min-h-11 rounded-md border bg-background px-3 text-sm"
            value={filters.status ?? ""}
            onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}
          >
            <option value="">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="inactive">{t("inactive")}</option>
            <option value="pending_admin">{t("pendingAdmin")}</option>
          </select>
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      <Can permission={CENTRAL_PERMISSIONS.schoolsCreate}>
        <Card title={t("createTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
            <Input value={form.name} onChange={(event) => setForm({...form, name: event.target.value})} placeholder={t("name")} required />
            <Input value={form.code} onChange={(event) => setForm({...form, code: event.target.value})} placeholder={t("code")} required />
            <Input value={form.phone} onChange={(event) => setForm({...form, phone: event.target.value})} placeholder={t("phone")} required />
            <Input value={form.timezone} onChange={(event) => setForm({...form, timezone: event.target.value})} placeholder={t("timezone")} required />
            <div className="md:col-span-2">
              <Textarea value={form.address} onChange={(event) => setForm({...form, address: event.target.value})} placeholder={t("address")} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={creating}>
                {common("create")}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {error ? <InlineError message={error} /> : null}
      {data ? (
        <Card title={t("listTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("name")}</HeaderCell>
                  <HeaderCell>{t("code")}</HeaderCell>
                  <HeaderCell>{t("status")}</HeaderCell>
                  <HeaderCell>{t("adminState")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {data.results.map((school) => (
                  <tr key={school.id} className="border-t">
                    <BodyCell>
                      <Link href={`/central/schools/${school.id}`} className="font-medium text-primary">
                        {school.name}
                      </Link>
                    </BodyCell>
                    <BodyCell>{school.code}</BodyCell>
                    <BodyCell>{school.isActive ? t("active") : t("inactive")}</BodyCell>
                    <BodyCell>{school.admin ? school.admin.fullName : t("noAdmin")}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={data.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
    </div>
  );
}

export function CentralSchoolDetailScreen({schoolId}: {schoolId: string}) {
  const t = useTranslations("schools");
  const common = useTranslations("common");
  const confirmT = useTranslations("confirmations");
  const [school, setSchool] = useState<CentralSchool | null>(null);
  const [adminState, setAdminState] = useState<CentralAdminState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({name: "", code: "", phone: "", address: "", timezone: ""});
  const [adminForm, setAdminForm] = useState({fullName: "", email: "", phone: "", tempPassword: ""});
  const [resetForm, setResetForm] = useState({reason: "", newTempPassword: ""});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [schoolResult, adminResult] = await Promise.all([
      fetchCentralSchool(schoolId),
      fetchCentralAdminState(schoolId),
    ]);

    if (!schoolResult.success) {
      setError(schoolResult.error.message);
      setLoading(false);
      return;
    }

    setSchool(schoolResult.data);
    setEditForm({
      name: schoolResult.data.name,
      code: schoolResult.data.code,
      phone: schoolResult.data.phone,
      address: schoolResult.data.address,
      timezone: schoolResult.data.timezone,
    });
    setAdminState(adminResult.success ? adminResult.data : null);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveSchool = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateCentralSchool(schoolId, editForm);
    setSaving(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setSchool(result.data);
    setMessage(t("saved"));
  };

  const runAction = async (action: "activate" | "deactivate") => {
    const confirmed = window.confirm(action === "activate" ? confirmT("activateSchool") : confirmT("deactivateSchool"));
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage(null);
    const result =
      action === "activate" ? await activateCentralSchool(schoolId) : await deactivateCentralSchool(schoolId);
    setSaving(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setSchool(result.data);
    setMessage(action === "activate" ? t("activated") : t("deactivated"));
  };

  const createAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await createCentralAdmin(schoolId, adminForm);
    setSaving(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setAdminState(result.data.state);
    setTempPassword(result.data.tempPassword);
    setAdminForm({fullName: "", email: "", phone: "", tempPassword: ""});
    setMessage(t("adminCreated"));
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!window.confirm(confirmT("resetPrincipalPassword"))) {
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await resetCentralAdminPassword(schoolId, resetForm);
    setSaving(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setTempPassword(result.data.tempPassword);
    setResetForm({reason: "", newTempPassword: ""});
    setMessage(t("passwordReset"));
  };

  if (!hasCapability("central.schools")) {
    return <UnsupportedState />;
  }

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (error || !school) {
    return <ErrorState onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={school.name} description={t("detail")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("editTitle")}>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void saveSchool(event)}>
          <Input value={editForm.name} onChange={(event) => setEditForm({...editForm, name: event.target.value})} placeholder={t("name")} required />
          <Input value={editForm.code} onChange={(event) => setEditForm({...editForm, code: event.target.value})} placeholder={t("code")} required />
          <Input value={editForm.phone} onChange={(event) => setEditForm({...editForm, phone: event.target.value})} placeholder={t("phone")} required />
          <Input value={editForm.timezone} onChange={(event) => setEditForm({...editForm, timezone: event.target.value})} placeholder={t("timezone")} required />
          <div className="md:col-span-2">
            <Textarea value={editForm.address} onChange={(event) => setEditForm({...editForm, address: event.target.value})} placeholder={t("address")} required />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Can permission={CENTRAL_PERMISSIONS.schoolsUpdate}>
              <Button type="submit" loading={saving}>
                {common("save")}
              </Button>
            </Can>
            <Can permission={CENTRAL_PERMISSIONS.schoolsActivateDeactivate}>
              <Button type="button" onClick={() => void runAction("activate")} loading={saving}>
                {t("activate")}
              </Button>
            </Can>
            <Can permission={CENTRAL_PERMISSIONS.schoolsActivateDeactivate}>
              <Button type="button" className="bg-danger text-danger-foreground" onClick={() => void runAction("deactivate")} loading={saving}>
                {t("deactivate")}
              </Button>
            </Can>
          </div>
        </form>
      </Card>
      <Card title={t("adminState")}>
        <p className="text-sm text-muted-foreground">
          {adminState?.admin ? `${adminState.admin.fullName} • ${adminState.admin.email}` : t("noAdmin")}
        </p>
      </Card>
      <Can permission={CENTRAL_PERMISSIONS.schoolUsersRead}>
        <Card title={t("usersTitle")}>
          <p className="mb-3 text-sm text-muted-foreground">{t("usersDescription")}</p>
          <Link href={`/central/schools/${schoolId}/users`} className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            {t("manageUsers")}
          </Link>
        </Card>
      </Can>
      {!adminState?.hasAdmin ? (
        <Can permission={CENTRAL_PERMISSIONS.schoolAdminCreate}>
          <Card title={t("createAdminTitle")}>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void createAdmin(event)}>
              <Input value={adminForm.fullName} onChange={(event) => setAdminForm({...adminForm, fullName: event.target.value})} placeholder={t("adminFullName")} required />
              <Input value={adminForm.email} onChange={(event) => setAdminForm({...adminForm, email: event.target.value})} placeholder={t("adminEmail")} required />
              <Input value={adminForm.phone} onChange={(event) => setAdminForm({...adminForm, phone: event.target.value})} placeholder={t("phone")} />
              <Input value={adminForm.tempPassword} onChange={(event) => setAdminForm({...adminForm, tempPassword: event.target.value})} placeholder={t("temporaryPassword")} />
              <div className="md:col-span-2">
                <Button type="submit" loading={saving}>
                  {t("createAdminAction")}
                </Button>
              </div>
            </form>
          </Card>
        </Can>
      ) : null}
      <Can permission={CENTRAL_PERMISSIONS.schoolAdminResetPassword}>
        <Card title={t("resetPasswordTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void resetPassword(event)}>
            <Input value={resetForm.reason} onChange={(event) => setResetForm({...resetForm, reason: event.target.value})} placeholder={common("reason")} required />
            <Input value={resetForm.newTempPassword} onChange={(event) => setResetForm({...resetForm, newTempPassword: event.target.value})} placeholder={t("temporaryPassword")} />
            <div className="md:col-span-2">
              <Button type="submit" loading={saving}>
                {t("resetPassword")}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      {tempPassword ? (
        <Card title={t("temporaryPassword")}>
          <p className="rounded-md border bg-muted p-3 font-mono text-sm">{tempPassword}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("temporaryPasswordHint")}</p>
          <Button type="button" className="mt-3" onClick={() => setTempPassword(null)}>
            {common("close")}
          </Button>
        </Card>
      ) : null}
    </div>
  );
}

/**
 * Central IT provisions the single primary administrator for a school through
 * the verified `create-admin` endpoint. The backend owns the PRINCIPAL role
 * and its effective permissions; the browser never submits arbitrary role or
 * school identifiers outside the selected, server-validated school path.
 */
export function CentralSchoolAdministratorsScreen() {
  const t = useTranslations("centralSchoolAdministrators");
  const common = useTranslations("common");
  const access = usePortalSession();
  const [data, setData] = useState<PaginatedResult<CentralSchool> | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [form, setForm] = useState({fullName: "", email: "", phone: "", tempPassword: ""});

  const canReadSchools = access.can(CENTRAL_PERMISSIONS.schoolsRead);
  const canCreateAdministrator = access.can(CENTRAL_PERMISSIONS.schoolAdminCreate);
  const selectedSchool = data?.results.find((school) => school.id === selectedSchoolId) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCentralSchools({page: "1", search: search || undefined});

    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setData(result.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    if (access.loading || !canReadSchools) {
      return;
    }
    void load();
  }, [access.loading, canReadSchools, load]);

  const provision = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSchool || !canCreateAdministrator) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await createCentralAdmin(selectedSchool.id, form);
    setSaving(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setTemporaryPassword(result.data.tempPassword);
    setForm({fullName: "", email: "", phone: "", tempPassword: ""});
    setSelectedSchoolId(null);
    setMessage(t("created"));
    await load();
  };

  if (!hasCapability("central.schoolAdmin")) {
    return <UnsupportedState />;
  }

  if (access.loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (!canReadSchools) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}

      <Card title={t("directoryTitle")}>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
          />
          <Button type="button" onClick={() => void load()}>
            {t("search")}
          </Button>
        </div>

        {loading ? <div className="mt-4"><LoadingBlock label={common("loading")} /></div> : null}
        {data ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("school")}</HeaderCell>
                  <HeaderCell>{t("status")}</HeaderCell>
                  <HeaderCell>{t("administrator")}</HeaderCell>
                  <HeaderCell>{common("actions")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {data.results.map((school) => {
                  const isEligible = school.isActive && !school.admin;
                  return (
                    <tr key={school.id} className="border-t">
                      <BodyCell>
                        <Link href={`/central/schools/${school.id}`} className="font-medium text-primary hover:underline">
                          {school.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">{school.code}</p>
                      </BodyCell>
                      <BodyCell>{school.isActive ? t("active") : t("inactive")}</BodyCell>
                      <BodyCell>
                        {school.admin ? (
                          <div>
                            <p>{school.admin.fullName}</p>
                            <p className="text-xs text-muted-foreground">{school.admin.email}</p>
                          </div>
                        ) : (
                          t("noAdministrator")
                        )}
                      </BodyCell>
                      <BodyCell>
                        {school.admin ? (
                          <Link href={`/central/schools/${school.id}`} className="text-primary hover:underline">
                            {t("manage")}
                          </Link>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!isEligible || !canCreateAdministrator}
                            onClick={() => {
                              setError(null);
                              setMessage(null);
                              setSelectedSchoolId(school.id);
                            }}
                          >
                            {t("createAction")}
                          </Button>
                        )}
                      </BodyCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      {selectedSchool ? (
        <Card title={t("provisionTitle")}>
          <div className="mb-5 rounded-lg border bg-muted p-4 text-sm">
            <p className="font-medium">{selectedSchool.name}</p>
            <p className="mt-1 text-muted-foreground">{t("singleSchoolScope")}</p>
            <p className="mt-3 font-medium">{t("accessProfileTitle")}</p>
            <p className="mt-1 text-muted-foreground">{t("accessProfileDescription")}</p>
            <p className="mt-2 text-muted-foreground">{t("accessProfileLimitation")}</p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void provision(event)}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="central-admin-full-name">{t("fullName")}</label>
              <Input
                id="central-admin-full-name"
                value={form.fullName}
                onChange={(event) => setForm({...form, fullName: event.target.value})}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="central-admin-email">{t("email")}</label>
              <Input
                id="central-admin-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({...form, email: event.target.value})}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="central-admin-phone">{t("phone")}</label>
              <Input
                id="central-admin-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({...form, phone: event.target.value})}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="central-admin-password">{t("temporaryPassword")}</label>
              <Input
                id="central-admin-password"
                type="password"
                value={form.tempPassword}
                onChange={(event) => setForm({...form, tempPassword: event.target.value})}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("passwordOptional")}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" loading={saving}>{t("createAction")}</Button>
              <Button type="button" className="bg-secondary text-secondary-foreground" onClick={() => setSelectedSchoolId(null)}>
                {common("cancel")}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {temporaryPassword ? (
        <Card title={t("temporaryPassword")}>
          <p className="rounded-md border bg-muted p-3 font-mono text-sm">{temporaryPassword}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("temporaryPasswordHint")}</p>
          <Button type="button" className="mt-3" onClick={() => setTemporaryPassword(null)}>{common("close")}</Button>
        </Card>
      ) : null}
    </div>
  );
}

export function CentralTicketsScreen() {
  const t = useTranslations("centralTickets");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const priorityT = useTranslations("priority");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams, ["status", "school_id", "page"]));
  const [data, setData] = useState<PaginatedResult<CentralTicket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const priorityLabel = (value: string) => translateEnum(value, priorityT, priorityTranslationKeys);

  const updateFilters = (next: Filters) => {
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
    const result = await fetchCentralTickets({
      status: filters.status || undefined,
      school_id: filters.school_id || undefined,
      page: filters.page || "1",
    });
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setData(result.data);
    setLoading(false);
  }, [filters.page, filters.school_id, filters.status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("central.tickets")) {
    return <UnsupportedState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={filters.status ?? ""} onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}>
            <option value="">{t("allStatuses")}</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <Input value={filters.school_id ?? ""} onChange={(event) => updateFilters({...filters, school_id: event.target.value, page: "1"})} placeholder={t("schoolId")} />
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {error ? <InlineError message={error} /> : null}
      {data ? (
        <Card title={t("listTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("name")}</HeaderCell>
                  <HeaderCell>{t("status")}</HeaderCell>
                  <HeaderCell>{t("priority")}</HeaderCell>
                  <HeaderCell>{t("assignedTo")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {data.results.map((ticket) => (
                  <tr key={ticket.id} className="border-t">
                    <BodyCell>
                      <Link href={`/central/tickets/${ticket.id}`} className="font-medium text-primary">
                        {ticket.title}
                      </Link>
                    </BodyCell>
                    <BodyCell>{statusLabel(ticket.status)}</BodyCell>
                    <BodyCell>{priorityLabel(ticket.priority)}</BodyCell>
                    <BodyCell>{ticket.assignedTo || common("none")}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={data.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
    </div>
  );
}

export function CentralTicketDetailScreen({ticketId}: {ticketId: string}) {
  const t = useTranslations("centralTickets");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const priorityT = useTranslations("priority");
  const confirmT = useTranslations("confirmations");
  const [ticket, setTicket] = useState<CentralTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const priorityLabel = (value: string) => translateEnum(value, priorityT, priorityTranslationKeys);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCentralTicket(ticketId);
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setTicket(result.data);
    setAssignedTo(result.data.assignedTo || "");
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  const assign = async () => {
    setPending(true);
    setMessage(null);
    const result = await assignCentralTicket(ticketId, assignedTo);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("assigned"));
    await load();
  };

  const close = async () => {
    if (!window.confirm(confirmT("closeCentralTicket"))) {
      return;
    }
    setPending(true);
    setMessage(null);
    const result = await closeCentralTicket(ticketId);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("closedMessage"));
    await load();
  };

  if (!hasCapability("central.tickets")) {
    return <UnsupportedState />;
  }

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (error || !ticket) {
    return <ErrorState onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={ticket.title} description={ticket.description || t("detail")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("detailTitle")}>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label={t("status")} value={statusLabel(ticket.status)} />
          <DetailItem label={t("priority")} value={priorityLabel(ticket.priority)} />
          <DetailItem label={t("schoolId")} value={ticket.schoolId || common("none")} />
          <DetailItem label={t("assignedTo")} value={ticket.assignedTo || common("none")} />
        </div>
      </Card>
      <Can permission={CENTRAL_PERMISSIONS.ticketsAssign}>
        <Card title={t("assignTitle")}>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder={t("assignUserId")} />
            <Button type="button" loading={pending} onClick={() => void assign()}>
              {t("assignAction")}
            </Button>
          </div>
        </Card>
      </Can>
      <Can permission={CENTRAL_PERMISSIONS.ticketsClose}>
        <Card title={t("closeTitle")}>
          <Button type="button" loading={pending} onClick={() => void close()}>
            {t("closeAction")}
          </Button>
        </Card>
      </Can>
    </div>
  );
}

export function CentralAuditScreen() {
  const t = useTranslations("audit");
  const common = useTranslations("common");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() =>
    readFilters(searchParams, ["action", "actor_id", "school_id", "from", "to", "page"]),
  );
  const [data, setData] = useState<PaginatedResult<CentralAuditEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFilters = (next: Filters) => {
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
    const result = await fetchCentralAudit(filters);
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setData(result.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("central.audit")) {
    return <UnsupportedState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={filters.action ?? ""} onChange={(event) => updateFilters({...filters, action: event.target.value, page: "1"})} placeholder={t("action")} />
          <Input value={filters.actor_id ?? ""} onChange={(event) => updateFilters({...filters, actor_id: event.target.value, page: "1"})} placeholder={t("actor")} />
          <Input value={filters.school_id ?? ""} onChange={(event) => updateFilters({...filters, school_id: event.target.value, page: "1"})} placeholder={t("school")} />
          <Input type="date" value={filters.from ?? ""} onChange={(event) => updateFilters({...filters, from: event.target.value, page: "1"})} />
          <Input type="date" value={filters.to ?? ""} onChange={(event) => updateFilters({...filters, to: event.target.value, page: "1"})} />
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {error ? <InlineError message={error} /> : null}
      {data ? (
        <Card title={t("listTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("action")}</HeaderCell>
                  <HeaderCell>{t("actor")}</HeaderCell>
                  <HeaderCell>{t("school")}</HeaderCell>
                  <HeaderCell>{t("entity")}</HeaderCell>
                  <HeaderCell>{t("created")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {data.results.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <BodyCell>{entry.action}</BodyCell>
                    <BodyCell>{entry.actorUser || common("none")}</BodyCell>
                    <BodyCell>{entry.school || common("none")}</BodyCell>
                    <BodyCell>{`${entry.entityType} • ${entry.entityId}`}</BodyCell>
                    <BodyCell>{entry.createdAt}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={data.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
    </div>
  );
}

export function CentralPoliciesScreen() {
  const t = useTranslations("policies");
  const common = useTranslations("common");
  const confirmT = useTranslations("confirmations");
  const [policies, setPolicies] = useState<CentralPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCentralPolicies();
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setPolicies(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (policy: CentralPolicy) => {
    setEditingKey(policy.key);
    setDraft(JSON.stringify(policy.value, null, 2));
  };

  const save = async () => {
    if (!editingKey) return;
    if (!window.confirm(confirmT("savePolicies"))) {
      return;
    }
    setPending(true);
    setError(null);
    let parsed: unknown = draft;
    try {
      parsed = JSON.parse(draft);
    } catch {
      parsed = draft;
    }
    const result = await updateCentralPolicy(editingKey, parsed);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setPolicies(result.data);
    setEditingKey(null);
    setDraft("");
  };

  if (!hasCapability("central.policies")) {
    return <UnsupportedState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("listTitle")}>
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.key} className="rounded-md border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium">{policy.key}</p>
                  <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(policy.value, null, 2)}
                  </pre>
                </div>
                <Can permission={CENTRAL_PERMISSIONS.policiesUpdate}>
                  <Button type="button" onClick={() => startEdit(policy)}>
                    {common("edit")}
                  </Button>
                </Can>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {editingKey ? (
        <Can permission={CENTRAL_PERMISSIONS.policiesUpdate}>
          <Card title={t("editTitle", {key: editingKey})}>
            <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
            <div className="mt-3 flex gap-3">
              <Button type="button" loading={pending} onClick={() => void save()}>
                {common("save")}
              </Button>
              <Button type="button" className="bg-secondary text-secondary-foreground" onClick={() => setEditingKey(null)}>
                {common("cancel")}
              </Button>
            </div>
          </Card>
        </Can>
      ) : null}
    </div>
  );
}

function Card({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <SurfaceCard title={title}>
      {children}
    </SurfaceCard>
  );
}

function PageHeader({title, description}: {title: string; description: string}) {
  return <ProductPageHeader title={title} description={description} />;
}

function MetricCard({label, value}: {label: string; value: string | number}) {
  return <ProductMetricCard label={label} value={value} />;
}

function QuickLink({href, label}: {href: string; label: string}) {
  return (
    <Link href={href} className="rounded-md border p-4 text-sm font-medium transition-colors hover:bg-muted">
      {label}
    </Link>
  );
}

function DetailItem({label, value}: {label: string; value: string | number}) {
  return <MetadataList items={[{label, value}]} />;
}

function InlineError({message}: {message: string}) {
  return <InlineAlert tone="danger" title={message} />;
}

function InlineSuccess({message}: {message: string}) {
  return <InlineAlert tone="success" title={message} />;
}

function LoadingBlock({label}: {label: string}) {
  return (
    <div role="status" aria-label={label}>
      <LoadingCard lines={2} />
    </div>
  );
}

function HeaderCell({children}: {children: React.ReactNode}) {
  return <ProductHeaderCell>{children}</ProductHeaderCell>;
}

function BodyCell({children}: {children: React.ReactNode}) {
  return <ProductBodyCell>{children}</ProductBodyCell>;
}

function Pagination({
  count,
  page,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  count: number;
  page: number;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return <PaginationBar count={count} page={page} previousLabel={previousLabel} nextLabel={nextLabel} onPrevious={onPrevious} onNext={onNext} canPrevious={page > 1} />;
}

function readFilters(searchParams: Readonly<{get(name: string): string | null}>, allowed: readonly string[]): Filters {
  const filters: Filters = {};
  allowed.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
    }
  });
  return filters;
}
