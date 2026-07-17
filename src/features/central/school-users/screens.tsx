"use client";

import type {FormEvent, ReactNode} from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {KeyRound, UserCheck, UserX} from "lucide-react";
import {useSearchParams} from "next/navigation";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {ErrorState, FilteredEmptyState, ForbiddenState} from "@/components/feedback/states";
import {CENTRAL_PERMISSIONS} from "@/config/permissions";
import {fetchCentralSchool} from "@/features/central/services/central-api";
import type {CentralSchool} from "@/features/central/types/contracts";
import {formatDate} from "@/lib/formatting/dates";
import {Link, usePathname, useRouter} from "@/i18n/routing";
import {usePortalSession} from "@/providers/auth-provider";
import {
  ActiveFilterChips,
  BodyCell,
  Card,
  DetailItem,
  FilterBar,
  HeaderCell,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  MobileRecordCard,
  PageHeader,
  PageStack,
  Pagination,
  ResponsiveTable,
  TableScroller,
  readFilters,
} from "@/features/school/components/common";

import {
  changeCentralSchoolUserPermissions,
  createCentralSchoolUser,
  fetchCentralSchoolPermissions,
  fetchCentralSchoolRoles,
  fetchCentralSchoolUser,
  fetchCentralSchoolUserAudit,
  fetchCentralSchoolUserPermissions,
  fetchCentralSchoolUsers,
  replaceCentralSchoolUserRoles,
  resetCentralSchoolUserPassword,
  setCentralSchoolUserStatus,
  updateCentralSchoolUser,
} from "./api";
import type {
  CentralSchoolPermission,
  CentralSchoolUser,
  CentralSchoolUserAuditEntry,
  CentralSchoolUserPage,
  CentralSchoolUserPermissions,
  CentralSchoolUserRole,
  CreateCentralSchoolUserPayload,
} from "./types";

type Filters = Record<string, string>;
type Failure = {message: string; code: string; requestId?: string; fieldErrors?: Record<string, string[]>} | null;
type UserForm = {email: string; fullName: string; phone: string};
type CreateForm = UserForm & {password: string; confirmPassword: string; active: boolean; roleIds: string[]; permissionCodes: string[]};
type PasswordForm = {reason: string; newPassword: string; confirmed: boolean};
type StatusForm = {reason: string; confirmed: boolean};
type PermissionForm = {permissionCodes: string[]; reason: string; search: string};

const initialCreateForm: CreateForm = {
  email: "",
  fullName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  active: true,
  roleIds: [],
  permissionCodes: [],
};

function toFailure<T>(result: {success: true; data: T} | {success: false; error: {message: string; code: string; fieldErrors?: Record<string, string[]>}; requestId?: string}): Failure {
  return result.success ? null : {message: result.error.message, code: result.error.code, requestId: result.requestId, fieldErrors: result.error.fieldErrors};
}

function roleNames(roles: CentralSchoolUserRole[], none: string) {
  return roles.map((role) => role.name).join(", ") || none;
}

function updateQuery(pathname: string, filters: Filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  window.history.replaceState(null, "", params.size ? `${pathname}?${params.toString()}` : pathname);
}

function useFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams, ["q", "status", "role", "has_direct_permissions", "ordering", "page", "page_size"]));
  const change = (next: Filters) => {
    setFilters(next);
    updateQuery(pathname, next);
  };
  return {filters, change};
}

function Field({label, children, required, hint}: {label: string; children: ReactNode; required?: boolean; hint?: string}) {
  return <label className="grid gap-1.5 text-sm font-medium"><span>{label}{required ? <span aria-hidden="true"> *</span> : null}</span>{children}{hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}</label>;
}

function FailureAlert({failure}: {failure: Failure}) {
  const t = useTranslations("centralSchoolUsers");
  return failure ? <InlineError message={`${failure.message} (${t("errorCode", {code: failure.code})})${failure.requestId ? ` • ${t("requestId", {requestId: failure.requestId})}` : ""}`} /> : null;
}

function TemporaryPasswordDialog({password, onClose}: {password: string | null; onClose: () => void}) {
  const t = useTranslations("centralSchoolUsers");
  return <Dialog open={Boolean(password)} onOpenChange={(open) => !open && onClose()} title={t("temporaryPasswordTitle")} description={t("temporaryPasswordDescription")} closeLabel={t("closeDialog")} footer={<Button onClick={onClose}>{t("temporaryPasswordClose")}</Button>}>
    <p className="rounded-md border bg-muted p-3 font-mono text-sm break-all" aria-live="polite">{password}</p>
  </Dialog>;
}

export function CentralSchoolUsersScreen({schoolId}: {schoolId: string}) {
  const t = useTranslations("centralSchoolUsers");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const {filters, change} = useFilters();
  const [users, setUsers] = useState<CentralSchoolUserPage | null>(null);
  const [roles, setRoles] = useState<CentralSchoolUserRole[]>([]);
  const [school, setSchool] = useState<CentralSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<Failure>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [usersResult, rolesResult, schoolResult] = await Promise.all([
      fetchCentralSchoolUsers(schoolId, {
        q: filters.q || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        has_direct_permissions: filters.has_direct_permissions || undefined,
        ordering: filters.ordering || undefined,
        page: filters.page || "1",
        page_size: filters.page_size || "20",
      }),
      fetchCentralSchoolRoles(schoolId),
      fetchCentralSchool(schoolId),
    ]);
    setUsers(usersResult.success ? usersResult.data : null);
    setRoles(rolesResult.success ? rolesResult.data : []);
    setSchool(schoolResult.success ? schoolResult.data : null);
    setFailure(toFailure(usersResult));
    setLoading(false);
  }, [filters, schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilters = useMemo(() => Object.entries(filters)
    .filter(([key, value]) => key !== "page" && key !== "page_size" && Boolean(value))
    .map(([key, value]) => ({key, value, label: t(`filterLabels.${key}`)})), [filters, t]);
  const visible = users?.results ?? [];
  const activeCount = visible.filter((user) => user.isActive).length;
  const inactiveCount = visible.filter((user) => !user.isActive).length;

  if (!access.can(CENTRAL_PERMISSIONS.schoolUsersRead)) return <ForbiddenState />;

  return <PageStack>
    <PageHeader
      title={t("title")}
      description={school ? t("descriptionForSchool", {school: school.name}) : t("description")}
      actions={access.can(CENTRAL_PERMISSIONS.schoolUsersCreate) ? <Link href={`/central/schools/${schoolId}/users/new`} className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t("createUser")}</Link> : undefined}
    />
    {school ? <div className="grid gap-4 md:grid-cols-3" aria-label={t("schoolContext")}>
      <DetailItem label={t("school")} value={school.name} />
      <DetailItem label={t("schoolCode")} value={school.code} />
      <DetailItem label={t("schoolStatus")} value={<Badge variant={school.isActive ? "success" : "warning"}>{school.isActive ? t("active") : t("inactive")}</Badge>} />
    </div> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DetailItem label={t("metrics.total")} value={users?.count ?? 0} />
      <DetailItem label={t("metrics.visibleActive")} value={activeCount} />
      <DetailItem label={t("metrics.visibleInactive")} value={inactiveCount} />
      <DetailItem label={t("metrics.availableRoles")} value={roles.length} />
    </div>
    <FilterBar actions={<Button type="button" variant="outline" onClick={() => change({})}>{common("clear")}</Button>}>
      <Input aria-label={t("search")} placeholder={t("search")} value={filters.q ?? ""} onChange={(event) => change({...filters, q: event.target.value, page: "1"})} />
      <Select aria-label={t("status")} value={filters.status ?? ""} onChange={(event) => change({...filters, status: event.target.value, page: "1"})}>
        <option value="">{t("allStatuses")}</option><option value="active">{t("active")}</option><option value="inactive">{t("inactive")}</option>
      </Select>
      <Select aria-label={t("role")} value={filters.role ?? ""} onChange={(event) => change({...filters, role: event.target.value, page: "1"})}>
        <option value="">{t("allRoles")}</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
      </Select>
      <Select aria-label={t("directPermissions")} value={filters.has_direct_permissions ?? ""} onChange={(event) => change({...filters, has_direct_permissions: event.target.value, page: "1"})}>
        <option value="">{t("allPermissionStates")}</option><option value="true">{t("hasDirectPermissions")}</option><option value="false">{t("noDirectPermissions")}</option>
      </Select>
      <Select aria-label={t("ordering")} value={filters.ordering ?? ""} onChange={(event) => change({...filters, ordering: event.target.value, page: "1"})}>
        <option value="">{t("defaultOrdering")}</option><option value="full_name">{t("nameAscending")}</option><option value="-full_name">{t("nameDescending")}</option><option value="-created_at">{t("newestFirst")}</option>
      </Select>
    </FilterBar>
    <ActiveFilterChips items={activeFilters} clearLabel={common("clear")} clearAllLabel={t("clearFilters")} onClear={(key) => change({...filters, [key]: "", page: "1"})} onClearAll={() => change({})} />
    <FailureAlert failure={failure} />
    {loading ? <LoadingBlock label={common("loading")} /> : null}
    {!loading && !failure && users?.results.length === 0 ? <FilteredEmptyState title={activeFilters.length ? t("noResultsTitle") : t("emptyTitle")} description={activeFilters.length ? t("noResultsDescription") : t("emptyDescription")} /> : null}
    {users && users.results.length > 0 ? <Card title={t("listTitle")} description={t("listDescription", {count: users.count})}>
      <div className="hidden md:block"><TableScroller><ResponsiveTable><thead className="bg-muted"><tr><HeaderCell>{common("fullName")}</HeaderCell><HeaderCell>{common("email")}</HeaderCell><HeaderCell>{t("role")}</HeaderCell><HeaderCell>{common("status")}</HeaderCell><HeaderCell>{t("lastLogin")}</HeaderCell><HeaderCell>{common("actions")}</HeaderCell></tr></thead><tbody>{users.results.map((user) => <tr key={user.id} className="border-t"><BodyCell><Link className="font-medium text-primary hover:underline" href={`/central/schools/${schoolId}/users/${user.id}`}>{user.fullName}</Link></BodyCell><BodyCell>{user.email}</BodyCell><BodyCell>{roleNames(user.roles, common("none"))}</BodyCell><BodyCell><Badge variant={user.isActive ? "success" : "warning"}>{user.isActive ? t("active") : t("inactive")}</Badge></BodyCell><BodyCell>{user.lastLogin ? formatDate(user.lastLogin, locale) : common("none")}</BodyCell><BodyCell><Link href={`/central/schools/${schoolId}/users/${user.id}`} className="inline-flex min-h-9 items-center rounded-md border px-3 text-xs font-medium hover:bg-muted">{t("view")}</Link></BodyCell></tr>)}</tbody></ResponsiveTable></TableScroller></div>
      <div className="grid gap-3 md:hidden">{users.results.map((user) => <MobileRecordCard key={user.id} title={user.fullName} subtitle={user.email} actions={<Link href={`/central/schools/${schoolId}/users/${user.id}`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{t("view")}</Link>}><p>{roleNames(user.roles, common("none"))}</p><Badge variant={user.isActive ? "success" : "warning"}>{user.isActive ? t("active") : t("inactive")}</Badge></MobileRecordCard>)}</div>
      <Pagination count={users.count} page={Number(filters.page ?? "1")} previousLabel={common("previous")} nextLabel={common("next")} onPrevious={() => change({...filters, page: String(Math.max(1, Number(filters.page ?? "1") - 1))})} onNext={() => change({...filters, page: String(Number(filters.page ?? "1") + 1)})} />
    </Card> : null}
  </PageStack>;
}

export function CentralSchoolUserCreateScreen({schoolId}: {schoolId: string}) {
  const t = useTranslations("centralSchoolUsers");
  const common = useTranslations("common");
  const access = usePortalSession();
  const router = useRouter();
  const [form, setForm] = useState<CreateForm>(initialCreateForm);
  const [roles, setRoles] = useState<CentralSchoolUserRole[]>([]);
  const [permissions, setPermissions] = useState<CentralSchoolPermission[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  useEffect(() => { void (async () => {
    const [rolesResult, permissionsResult] = await Promise.all([fetchCentralSchoolRoles(schoolId), fetchCentralSchoolPermissions(schoolId)]);
    if (rolesResult.success) setRoles(rolesResult.data);
    if (permissionsResult.success) setPermissions(permissionsResult.data);
  })(); }, [schoolId]);

  const filteredPermissions = useMemo(() => permissions.filter((permission) => `${permission.code} ${permission.description}`.toLowerCase().includes(permissionSearch.toLowerCase())), [permissionSearch, permissions]);
  if (!access.can(CENTRAL_PERMISSIONS.schoolUsersCreate)) return <ForbiddenState />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setFailure({code: "VALIDATION_ERROR", message: t("passwordMismatch")});
      return;
    }
    setSubmitting(true);
    const payload: CreateCentralSchoolUserPayload = {email: form.email, fullName: form.fullName, phone: form.phone || undefined, password: form.password || undefined, isActive: form.active, roleIds: form.roleIds, permissionCodes: form.permissionCodes};
    const result = await createCentralSchoolUser(schoolId, payload);
    setSubmitting(false);
    setFailure(toFailure(result));
    if (result.success) {
      setCreatedUserId(result.data.user.id);
      if (result.data.tempPassword) setTemporaryPassword(result.data.tempPassword);
      else router.push(`/central/schools/${schoolId}/users/${result.data.user.id}`);
    }
  };
  const toggle = (id: string, current: string[]) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  return <PageStack>
    <PageHeader title={t("createTitle")} description={t("createDescription")} actions={<Link href={`/central/schools/${schoolId}/users`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{common("cancel")}</Link>} />
    <FailureAlert failure={failure} />
    <form className="space-y-5" onSubmit={(event) => void submit(event)}>
      <Card title={t("basicInformation")}><div className="grid gap-4 md:grid-cols-2"><Field label={common("fullName")} required><Input value={form.fullName} onChange={(event) => setForm({...form, fullName: event.target.value})} autoComplete="name" required /></Field><Field label={common("email")} required><Input type="email" value={form.email} onChange={(event) => setForm({...form, email: event.target.value})} autoComplete="email" required /></Field><Field label={common("phone")}><Input value={form.phone} onChange={(event) => setForm({...form, phone: event.target.value})} autoComplete="tel" /></Field><label className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.active} onChange={(event) => setForm({...form, active: event.target.checked})} />{t("activateOnCreate")}</label></div></Card>
      <Card title={t("authentication")} description={t("authenticationDescription")}><div className="grid gap-4 md:grid-cols-2"><Field label={t("temporaryPassword")} hint={t("passwordOptionalHint")}><Input type="password" value={form.password} onChange={(event) => setForm({...form, password: event.target.value})} autoComplete="new-password" /></Field><Field label={t("confirmPassword")}><Input type="password" value={form.confirmPassword} disabled={!form.password} onChange={(event) => setForm({...form, confirmPassword: event.target.value})} autoComplete="new-password" /></Field></div></Card>
      <Card title={t("roles")} description={t("rolesDescription")}><div className="grid gap-3 md:grid-cols-2">{roles.map((role) => <label key={role.id} className="flex min-h-11 items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => setForm({...form, roleIds: toggle(role.id, form.roleIds)})} /><span><span className="block font-medium">{role.name}</span><span className="text-xs text-muted-foreground">{role.description || t("permissionsCount", {count: role.permissionsCount})}</span></span></label>)}</div></Card>
      {access.can(CENTRAL_PERMISSIONS.schoolRbacGrantPermission) ? <Card title={t("directPermissions")} description={t("directPermissionsDescription")}><Input aria-label={t("searchPermissions")} value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} placeholder={t("searchPermissions")} /><div className="mt-3 grid max-h-80 gap-2 overflow-y-auto md:grid-cols-2">{filteredPermissions.map((permission) => <label key={permission.code} className="flex min-h-11 items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={form.permissionCodes.includes(permission.code)} onChange={() => setForm({...form, permissionCodes: toggle(permission.code, form.permissionCodes)})} /><span><span className="block font-mono text-xs">{permission.code}</span><span className="text-xs text-muted-foreground">{permission.description}</span></span></label>)}</div></Card> : null}
      <div className="flex flex-wrap gap-3"><Button type="submit" loading={submitting}>{t("createUser")}</Button><Link href={`/central/schools/${schoolId}/users`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{common("cancel")}</Link></div>
    </form>
    <TemporaryPasswordDialog password={temporaryPassword} onClose={() => { setTemporaryPassword(null); if (createdUserId) router.push(`/central/schools/${schoolId}/users/${createdUserId}`); }} />
  </PageStack>;
}

export function CentralSchoolUserDetailScreen({schoolId, userId, initialTab = "overview"}: {schoolId: string; userId: string; initialTab?: "overview" | "roles" | "permissions" | "activity" | "security"}) {
  const t = useTranslations("centralSchoolUsers");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const [user, setUser] = useState<CentralSchoolUser | null>(null);
  const [roles, setRoles] = useState<CentralSchoolUserRole[]>([]);
  const [permissions, setPermissions] = useState<CentralSchoolPermission[]>([]);
  const [effective, setEffective] = useState<CentralSchoolUserPermissions | null>(null);
  const [audit, setAudit] = useState<CentralSchoolUserAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<Failure>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "roles" | "permissions" | "activity" | "security">(initialTab);
  const [edit, setEdit] = useState<UserForm>({email: "", fullName: "", phone: ""});
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [roleReason, setRoleReason] = useState("");
  const [permissionForm, setPermissionForm] = useState<PermissionForm>({permissionCodes: [], reason: "", search: ""});
  const [permissionAction, setPermissionAction] = useState<"grant" | "revoke" | null>(null);
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({reason: "", newPassword: "", confirmed: false});
  const [statusForm, setStatusForm] = useState<StatusForm>({reason: "", confirmed: false});
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [userResult, rolesResult, permissionsResult, effectiveResult, auditResult] = await Promise.all([
      fetchCentralSchoolUser(schoolId, userId),
      fetchCentralSchoolRoles(schoolId),
      fetchCentralSchoolPermissions(schoolId),
      access.can(CENTRAL_PERMISSIONS.schoolRbacViewEffectivePermissions) ? fetchCentralSchoolUserPermissions(schoolId, userId) : Promise.resolve(null),
      access.can(CENTRAL_PERMISSIONS.schoolUserAuditRead) ? fetchCentralSchoolUserAudit(schoolId, userId) : Promise.resolve(null),
    ]);
    if (!userResult.success) {
      setFailure(toFailure(userResult)); setLoading(false); return;
    }
    setUser(userResult.data);
    setEdit({email: userResult.data.email, fullName: userResult.data.fullName, phone: userResult.data.phone});
    setRoleIds(userResult.data.roles.map((role) => role.id));
    setRoles(rolesResult.success ? rolesResult.data : []);
    setPermissions(permissionsResult.success ? permissionsResult.data : []);
    if (effectiveResult?.success) setEffective(effectiveResult.data);
    if (auditResult?.success) setAudit(auditResult.data);
    setFailure(null); setLoading(false);
  }, [access, schoolId, userId]);

  useEffect(() => { void load(); }, [load]);
  if (!access.can(CENTRAL_PERMISSIONS.schoolUsersRead)) return <ForbiddenState />;
  if (loading) return <LoadingBlock label={common("loading")} />;
  if (!user) return <ErrorState requestId={failure?.requestId} onRetry={() => void load()} />;

  const toggle = (id: string, current: string[]) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  const saveProfile = async (event: FormEvent) => { event.preventDefault(); setPending(true); const result = await updateCentralSchoolUser(schoolId, userId, edit); setPending(false); setFailure(toFailure(result)); if (result.success) { setUser(result.data); setSuccess(t("profileSaved")); } };
  const saveRoles = async () => { setPending(true); const result = await replaceCentralSchoolUserRoles(schoolId, userId, roleIds, roleReason); setPending(false); setFailure(toFailure(result)); if (result.success) { setUser({...user, roles: result.data}); setSuccess(t("rolesSaved")); setRoleReason(""); } };
  const requestPermissionChange = (action: "grant" | "revoke") => { if (!permissionForm.reason || permissionForm.permissionCodes.length === 0) { setFailure({code: "VALIDATION_ERROR", message: t("reasonAndPermissionRequired")}); return; } setPermissionConfirmed(false); setPermissionAction(action); };
  const changePermissions = async () => { if (!permissionAction || !permissionConfirmed) { setFailure({code: "VALIDATION_ERROR", message: t("confirmationRequired")}); return; } const granted = permissionAction === "grant"; setPending(true); const result = await changeCentralSchoolUserPermissions(schoolId, userId, granted, permissionForm.permissionCodes, permissionForm.reason); setPending(false); setFailure(toFailure(result)); if (result.success) { setSuccess(granted ? t("permissionsGranted") : t("permissionsRevoked")); setPermissionForm({permissionCodes: [], reason: "", search: ""}); setPermissionAction(null); setPermissionConfirmed(false); await load(); } };
  const resetPassword = async () => { if (!passwordForm.reason || !passwordForm.confirmed) { setFailure({code: "VALIDATION_ERROR", message: t("confirmationRequired")}); return; } setPending(true); const result = await resetCentralSchoolUserPassword(schoolId, userId, passwordForm.reason, passwordForm.newPassword || undefined); setPending(false); setFailure(toFailure(result)); if (result.success) { setPasswordOpen(false); setPasswordForm({reason: "", newPassword: "", confirmed: false}); if (result.data.tempPassword) setTemporaryPassword(result.data.tempPassword); else setSuccess(t("passwordReset")); } };
  const changeStatus = async () => { const enabling = !user.isActive; if ((!enabling && !statusForm.reason) || !statusForm.confirmed) { setFailure({code: "VALIDATION_ERROR", message: t("confirmationRequired")}); return; } setPending(true); const result = await setCentralSchoolUserStatus(schoolId, userId, enabling, statusForm.reason); setPending(false); setFailure(toFailure(result)); if (result.success) { setUser(result.data); setStatusOpen(false); setStatusForm({reason: "", confirmed: false}); setSuccess(enabling ? t("userEnabled") : t("userDisabled")); } };
  const filteredPermissions = permissions.filter((permission) => `${permission.code} ${permission.description}`.toLowerCase().includes(permissionForm.search.toLowerCase()));
  const tabs: Array<typeof tab> = ["overview", "roles", "permissions", "activity", "security"];

  return <PageStack>
    <PageHeader title={user.fullName} description={t("detailDescription", {email: user.email})} actions={<Link href={`/central/schools/${schoolId}/users`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{t("backToUsers")}</Link>} />
    {success ? <InlineSuccess message={success} /> : null}<FailureAlert failure={failure} />
    <Card><div className="flex flex-wrap items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground" aria-hidden="true">{user.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}</span><div><p className="font-semibold">{user.fullName}</p><p className="text-sm text-muted-foreground">{user.email}</p></div><Badge variant={user.isActive ? "success" : "warning"}>{user.isActive ? t("active") : t("inactive")}</Badge></div></Card>
    <div role="tablist" aria-label={t("detailTabs")} className="flex flex-wrap gap-2 border-b pb-3">{tabs.map((entry) => <Button key={entry} type="button" variant={tab === entry ? "primary" : "outline"} role="tab" aria-selected={tab === entry} onClick={() => setTab(entry)}>{t(`tabs.${entry}`)}</Button>)}</div>
    {tab === "overview" ? <div className="space-y-5"><Card title={t("profile")}><form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void saveProfile(event)}><Field label={common("fullName")} required><Input value={edit.fullName} disabled={!access.can(CENTRAL_PERMISSIONS.schoolUsersUpdate)} onChange={(event) => setEdit({...edit, fullName: event.target.value})} required /></Field><Field label={common("email")} required><Input type="email" value={edit.email} disabled={!access.can(CENTRAL_PERMISSIONS.schoolUsersUpdate)} onChange={(event) => setEdit({...edit, email: event.target.value})} required /></Field><Field label={common("phone")}><Input value={edit.phone} disabled={!access.can(CENTRAL_PERMISSIONS.schoolUsersUpdate)} onChange={(event) => setEdit({...edit, phone: event.target.value})} /></Field>{access.can(CENTRAL_PERMISSIONS.schoolUsersUpdate) ? <div className="flex items-end"><Button type="submit" loading={pending}>{common("save")}</Button></div> : null}</form></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><DetailItem label={t("userType")} value={user.userType} /><DetailItem label={t("createdAt")} value={user.createdAt ? formatDate(user.createdAt, locale) : common("none")} /><DetailItem label={t("lastLogin")} value={user.lastLogin ? formatDate(user.lastLogin, locale) : common("none")} /><DetailItem label={t("membershipStatus")} value={user.membership?.status ?? common("none")} /></div></div> : null}
    {tab === "roles" ? <Card title={t("roles")} description={t("rolesDescription")}><div className="grid gap-3 md:grid-cols-2">{roles.map((role) => <label key={role.id} className="flex min-h-11 items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" disabled={!access.can(CENTRAL_PERMISSIONS.schoolRbacAssignRole)} checked={roleIds.includes(role.id)} onChange={() => setRoleIds(toggle(role.id, roleIds))} /><span><span className="block font-medium">{role.name}</span><span className="text-xs text-muted-foreground">{role.description || t("permissionsCount", {count: role.permissionsCount})}</span></span></label>)}</div>{access.can(CENTRAL_PERMISSIONS.schoolRbacAssignRole) ? <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><Input aria-label={common("reason")} placeholder={t("roleChangeReason")} value={roleReason} onChange={(event) => setRoleReason(event.target.value)} /><Button loading={pending} type="button" onClick={() => void saveRoles()}>{t("saveRoles")}</Button></div> : null}</Card> : null}
    {tab === "permissions" ? <div className="space-y-5"><Card title={t("effectivePermissions")} description={t("effectivePermissionsDescription")}><div className="grid gap-2">{effective?.effectivePermissions.map((permission) => <div key={permission.code} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"><div><p className="font-mono text-xs">{permission.code}</p><p className="text-sm text-muted-foreground">{permission.description}</p></div><Badge variant="neutral">{permission.source}</Badge></div>) ?? <p className="text-sm text-muted-foreground">{t("effectivePermissionsUnavailable")}</p>}</div></Card>{access.can(CENTRAL_PERMISSIONS.schoolRbacGrantPermission) || access.can(CENTRAL_PERMISSIONS.schoolRbacRevokePermission) ? <Card title={t("directPermissions")} description={t("directPermissionsDescription")}><Input aria-label={t("searchPermissions")} value={permissionForm.search} onChange={(event) => setPermissionForm({...permissionForm, search: event.target.value})} placeholder={t("searchPermissions")} /><div className="mt-3 grid max-h-72 gap-2 overflow-y-auto md:grid-cols-2">{filteredPermissions.map((permission) => <label key={permission.code} className="flex min-h-11 items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={permissionForm.permissionCodes.includes(permission.code)} onChange={() => setPermissionForm({...permissionForm, permissionCodes: toggle(permission.code, permissionForm.permissionCodes)})} /><span><span className="block font-mono text-xs">{permission.code}</span><span className="text-xs text-muted-foreground">{permission.description}</span></span></label>)}</div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]"><Input aria-label={common("reason")} placeholder={t("permissionChangeReason")} value={permissionForm.reason} onChange={(event) => setPermissionForm({...permissionForm, reason: event.target.value})} />{access.can(CENTRAL_PERMISSIONS.schoolRbacGrantPermission) ? <Button loading={pending} type="button" onClick={() => requestPermissionChange("grant")}>{t("grant")}</Button> : null}{access.can(CENTRAL_PERMISSIONS.schoolRbacRevokePermission) ? <Button loading={pending} variant="outline" type="button" onClick={() => requestPermissionChange("revoke")}>{t("revoke")}</Button> : null}</div></Card> : null}</div> : null}
    {tab === "activity" ? <Card title={t("activity")}><div className="space-y-3">{audit.length ? audit.map((entry) => <div key={entry.id} className="rounded-md border p-3"><p className="font-medium">{entry.action}</p><p className="text-sm text-muted-foreground">{entry.actor ? `${entry.actor.fullName} • ${entry.actor.email}` : common("none")}</p><p className="text-xs text-muted-foreground">{entry.createdAt ? formatDate(entry.createdAt, locale) : common("none")}</p>{typeof entry.after?.request_id === "string" ? <p className="text-xs text-muted-foreground">{t("requestId", {requestId: entry.after.request_id})}</p> : null}</div>) : <p className="text-sm text-muted-foreground">{t("activityEmpty")}</p>}</div></Card> : null}
    {tab === "security" ? <Card title={t("security")}><div className="flex flex-wrap gap-3">{access.can(CENTRAL_PERMISSIONS.schoolUsersResetPassword) ? <Button type="button" onClick={() => setPasswordOpen(true)}><KeyRound className="me-2 h-4 w-4" aria-hidden="true" />{t("resetPassword")}</Button> : null}{access.can(CENTRAL_PERMISSIONS.schoolUsersEnableDisable) ? <Button type="button" variant={user.isActive ? "danger" : "primary"} onClick={() => setStatusOpen(true)}>{user.isActive ? <UserX className="me-2 h-4 w-4" aria-hidden="true" /> : <UserCheck className="me-2 h-4 w-4" aria-hidden="true" />}{user.isActive ? t("disable") : t("enable")}</Button> : null}<DetailItem label={common("status")} value={user.isActive ? t("active") : t("inactive")} /></div></Card> : null}
    <Dialog open={passwordOpen} onOpenChange={setPasswordOpen} title={t("resetPassword")} description={t("resetPasswordDescription")} closeLabel={t("closeDialog")} footer={<Button loading={pending} onClick={() => void resetPassword()}>{t("confirmReset")}</Button>}><div className="grid gap-4"><Field label={common("reason")} required><Input value={passwordForm.reason} onChange={(event) => setPasswordForm({...passwordForm, reason: event.target.value})} required /></Field><Field label={t("temporaryPassword")} hint={t("passwordOptionalHint")}><Input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({...passwordForm, newPassword: event.target.value})} autoComplete="new-password" /></Field><label className="flex gap-2 text-sm"><input type="checkbox" checked={passwordForm.confirmed} onChange={(event) => setPasswordForm({...passwordForm, confirmed: event.target.checked})} />{t("confirmSensitiveAction")}</label></div></Dialog>
    <Dialog open={statusOpen} onOpenChange={setStatusOpen} title={user.isActive ? t("disable") : t("enable")} description={user.isActive ? t("disableDescription") : t("enableDescription")} closeLabel={t("closeDialog")} footer={<Button loading={pending} variant={user.isActive ? "danger" : "primary"} onClick={() => void changeStatus()}>{user.isActive ? t("confirmDisable") : t("confirmEnable")}</Button>}><div className="grid gap-4">{user.isActive ? <Field label={common("reason")} required><Input value={statusForm.reason} onChange={(event) => setStatusForm({...statusForm, reason: event.target.value})} required /></Field> : null}<label className="flex gap-2 text-sm"><input type="checkbox" checked={statusForm.confirmed} onChange={(event) => setStatusForm({...statusForm, confirmed: event.target.checked})} />{t("confirmSensitiveAction")}</label></div></Dialog>
    <Dialog open={permissionAction !== null} onOpenChange={(open) => { if (!open) { setPermissionAction(null); setPermissionConfirmed(false); } }} title={t("confirmPermissionChange")} description={t("confirmPermissionChangeDescription")} closeLabel={t("closeDialog")} footer={<Button loading={pending} onClick={() => void changePermissions()}>{t("confirmPermissionChangeAction")}</Button>}><div className="grid gap-4"><p className="text-sm text-muted-foreground">{t("permissionChangeCount", {count: permissionForm.permissionCodes.length})}</p><label className="flex gap-2 text-sm"><input type="checkbox" checked={permissionConfirmed} onChange={(event) => setPermissionConfirmed(event.target.checked)} />{t("confirmSensitiveAction")}</label></div></Dialog>
    <TemporaryPasswordDialog password={temporaryPassword} onClose={() => setTemporaryPassword(null)} />
  </PageStack>;
}
