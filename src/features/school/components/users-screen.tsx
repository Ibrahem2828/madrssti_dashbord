"use client";

import type {FormEvent, ReactNode} from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Eye, EyeOff, KeyRound, ShieldCheck} from "lucide-react";

import {useSearchParams} from "next/navigation";
import {Link, usePathname, useRouter} from "@/i18n/routing";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {ErrorState, FilteredEmptyState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {InlineAlert} from "@/components/layout/product-framework";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {profileTypeRequiresTeacherCode, schoolProfileTypeOptions} from "@/features/school/config/profile-types";
import {getPermissionGroupKey, schoolPermissionGroups} from "@/features/school/config/rbac";
import {useUnsavedChangesGuard} from "@/hooks/use-unsaved-changes-guard";
import {formatDate} from "@/lib/formatting/dates";
import {usePortalSession} from "@/providers/auth-provider";

import {
  assignSchoolRoles,
  createSchoolUser,
  disableSchoolUser,
  enableSchoolUser,
  fetchEffectivePermissions,
  fetchSchoolPermissions,
  fetchSchoolRoles,
  fetchSchoolUser,
  fetchSchoolUsers,
  grantSchoolPermissions,
  resetSchoolUserPassword,
  revokeSchoolPermissions,
  updateSchoolUser,
} from "../services/school-api";
import type {PaginatedResult, SchoolEffectivePermissions, SchoolPermission, SchoolRole, SchoolUser} from "../types/contracts";
import {
  ActiveFilterChips,
  BodyCell,
  Card,
  DetailItem,
  FilterBar,
  HeaderCell,
  LoadingBlock,
  MobileRecordCard,
  PageHeader,
  PageStack,
  Pagination,
  ResponsiveTable,
  TableScroller,
  readFilters,
} from "./common";

type Filters = Record<string, string>;
type Failure = {message: string; code: string; requestId?: string; fieldErrors?: Record<string, string[]>} | null;

type CreateForm = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  profileType: string;
  teacherCode: string;
  roleIds: string[];
};

type EditForm = {fullName: string; phone: string};
type ResetPasswordForm = {newPassword: string; confirmPassword: string; reason: string; confirmed: boolean};

const initialCreateForm: CreateForm = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phone: "",
  profileType: schoolProfileTypeOptions[0]?.value ?? "teacher",
  teacherCode: "",
  roleIds: [],
};

function toFailure<T>(result: {success: true; data: T} | {success: false; error: {message: string; code: string; fieldErrors?: Record<string, string[]>}; requestId?: string}): Failure {
  if (result.success) return null;
  return {message: result.error.message, code: result.error.code, requestId: result.requestId, fieldErrors: result.error.fieldErrors};
}

function getFieldError(failure: Failure, field: string) {
  return failure?.fieldErrors?.[field]?.[0] ?? null;
}

function updateQuery(pathname: string, filters: Filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
}

function profileLabel(value: string, t: ReturnType<typeof useTranslations>) {
  const option = schoolProfileTypeOptions.find((item) => item.value === value);
  return option ? t(option.translationKey) : value || t("unspecified");
}

function roleSummary(user: SchoolUser, fallback: string) {
  return user.roles.map((role) => role.name).join(", ") || fallback;
}

function userStatusVariant(isActive: boolean) {
  return isActive ? "success" : "warning";
}

function useUserFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams, ["search", "status", "role", "profile_type", "ordering", "page"]));
  const change = (next: Filters) => {
    setFilters(next);
    updateQuery(pathname, next);
  };
  return {filters, change};
}

export function SchoolUsersScreen() {
  const t = useTranslations("schoolUsers");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const {filters, change} = useUserFilters();
  const [users, setUsers] = useState<PaginatedResult<SchoolUser> | null>(null);
  const [roles, setRoles] = useState<SchoolRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<Failure>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [usersResult, rolesResult] = await Promise.all([
      fetchSchoolUsers({
        search: filters.search || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        profile_type: filters.profile_type || undefined,
        ordering: filters.ordering || undefined,
        page: filters.page || "1",
      }),
      fetchSchoolRoles(),
    ]);
    setFailure(toFailure(usersResult));
    setUsers(usersResult.success ? usersResult.data : null);
    setRoles(rolesResult.success ? rolesResult.data : []);
    setLoading(false);
  }, [filters.ordering, filters.page, filters.profile_type, filters.role, filters.search, filters.status]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== "page" && Boolean(value)).map(([key, value]) => ({key, label: t(`filterLabels.${key}`), value})),
    [filters, t],
  );

  const visibleUsers = users?.results ?? [];
  const activeVisible = visibleUsers.filter((user) => user.isActive).length;
  const inactiveVisible = visibleUsers.filter((user) => !user.isActive).length;

  if (!hasCapability("school.users")) return <UnsupportedState />;
  if (!access.can(SCHOOL_PERMISSIONS.usersRead)) return <ForbiddenState />;

  return (
    <PageStack>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={access.can(SCHOOL_PERMISSIONS.usersCreate) ? <Link href="/school/users/new" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t("newUserAction")}</Link> : undefined}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label={t("metrics.totalUsers")} value={users?.count ?? 0} />
        <DetailItem label={t("metrics.visibleActive")} value={activeVisible} />
        <DetailItem label={t("metrics.visibleInactive")} value={inactiveVisible} />
        <DetailItem label={t("metrics.rolesLoaded")} value={roles.length} />
      </div>
      <FilterBar actions={<Button type="button" variant="outline" onClick={() => change({})}>{common("clear")}</Button>}>
        <Input aria-label={t("searchPlaceholder")} value={filters.search ?? ""} onChange={(event) => change({...filters, search: event.target.value, page: "1"})} placeholder={t("searchPlaceholder")} />
        <Select aria-label={t("statusFilter")} value={filters.status ?? ""} onChange={(event) => change({...filters, status: event.target.value, page: "1"})}>
          <option value="">{t("allStatuses")}</option>
          <option value="active">{t("active")}</option>
          <option value="inactive">{t("inactive")}</option>
        </Select>
        <Select aria-label={t("roleFilter")} value={filters.role ?? ""} onChange={(event) => change({...filters, role: event.target.value, page: "1"})}>
          <option value="">{t("allRoles")}</option>
          {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
        </Select>
        <Select aria-label={t("profileTypeFilter")} value={filters.profile_type ?? ""} onChange={(event) => change({...filters, profile_type: event.target.value, page: "1"})}>
          <option value="">{t("allProfileTypes")}</option>
          {schoolProfileTypeOptions.map((option) => <option key={option.value} value={option.value}>{profileLabel(option.value, t)}</option>)}
        </Select>
        <Select aria-label={t("orderingFilter")} value={filters.ordering ?? ""} onChange={(event) => change({...filters, ordering: event.target.value, page: "1"})}>
          <option value="">{t("defaultOrdering")}</option>
          <option value="full_name">{t("orderByNameAsc")}</option>
          <option value="-full_name">{t("orderByNameDesc")}</option>
          <option value="email">{t("orderByEmailAsc")}</option>
          <option value="-created_at">{t("orderByNewest")}</option>
        </Select>
      </FilterBar>
      <ActiveFilterChips items={activeFilters} clearLabel={common("clear")} clearAllLabel={t("clearFilters")} onClear={(key) => change({...filters, [key]: "", page: "1"})} onClearAll={() => change({})} />
      {failure ? <ErrorState requestId={failure.requestId} onRetry={() => void load()} /> : null}
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {!loading && !failure && users && users.results.length === 0 ? (
        activeFilters.length > 0 ? <FilteredEmptyState title={t("filteredEmptyTitle")} description={t("filteredEmptyDescription")} /> : <FilteredEmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : null}
      {users && users.results.length > 0 ? (
        <Card title={t("listTitle")} description={t("listDescription", {count: users.count})}>
          <div className="hidden md:block">
            <TableScroller>
              <ResponsiveTable>
                <thead className="bg-muted"><tr><HeaderCell>{common("fullName")}</HeaderCell><HeaderCell>{common("email")}</HeaderCell><HeaderCell>{t("profileType")}</HeaderCell><HeaderCell>{common("status")}</HeaderCell><HeaderCell>{t("roles")}</HeaderCell><HeaderCell>{common("date")}</HeaderCell><HeaderCell>{common("actions")}</HeaderCell></tr></thead>
                <tbody>
                  {users.results.map((user) => (
                    <tr key={user.id} className="border-t">
                      <BodyCell><div className="space-y-1"><Link href={`/school/users/${user.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{user.fullName}</Link>{user.phone ? <p className="text-xs text-muted-foreground">{user.phone}</p> : null}</div></BodyCell>
                      <BodyCell>{user.email}</BodyCell>
                      <BodyCell>{profileLabel(user.profileType, t)}</BodyCell>
                      <BodyCell><Badge variant={userStatusVariant(user.isActive)}>{user.isActive ? t("active") : t("inactive")}</Badge></BodyCell>
                      <BodyCell>{roleSummary(user, common("none"))}</BodyCell>
                      <BodyCell>{user.createdAt ? formatDate(user.createdAt, locale) : common("none")}</BodyCell>
                      <BodyCell><Link href={`/school/users/${user.id}`} className="inline-flex min-h-9 items-center rounded-md border px-3 text-xs font-medium hover:bg-muted">{t("viewDetails")}</Link></BodyCell>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTable>
            </TableScroller>
          </div>
          <div className="grid gap-3 md:hidden">
            {users.results.map((user) => (
              <MobileRecordCard key={user.id} title={user.fullName} subtitle={user.email} actions={<Link href={`/school/users/${user.id}`} className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{t("viewDetails")}</Link>}>
                <p>{profileLabel(user.profileType, t)}</p>
                <p>{roleSummary(user, common("none"))}</p>
                <Badge variant={userStatusVariant(user.isActive)}>{user.isActive ? t("active") : t("inactive")}</Badge>
              </MobileRecordCard>
            ))}
          </div>
          <Pagination count={users.count} page={Number(filters.page ?? "1")} previousLabel={common("previous")} nextLabel={common("next")} onPrevious={() => change({...filters, page: String(Math.max(1, Number(filters.page ?? "1") - 1))})} onNext={() => change({...filters, page: String(Number(filters.page ?? "1") + 1)})} />
        </Card>
      ) : null}
    </PageStack>
  );
}

export function SchoolUserCreateScreen() {
  const t = useTranslations("schoolUsers");
  const common = useTranslations("common");
  const access = usePortalSession();
  const router = useRouter();
  const [roles, setRoles] = useState<SchoolRole[]>([]);
  const [form, setForm] = useState<CreateForm>(initialCreateForm);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useUnsavedChangesGuard(Boolean(form.email || form.password || form.confirmPassword || form.fullName || form.phone || form.teacherCode || form.roleIds.length), common("unsavedChanges"));

  useEffect(() => {
    void (async () => {
      const rolesResult = await fetchSchoolRoles();
      if (rolesResult.success) setRoles(rolesResult.data);
    })();
  }, []);

  if (!hasCapability("school.users")) return <UnsupportedState />;
  if (!access.can(SCHOOL_PERMISSIONS.usersCreate)) return <ForbiddenState />;

  const teacherCodeRequired = profileTypeRequiresTeacherCode(form.profileType);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFailure({code: "VALIDATION_ERROR", message: t("passwordMismatch")});
      return;
    }
    if (teacherCodeRequired && !form.teacherCode.trim()) {
      setFailure({code: "VALIDATION_ERROR", message: t("teacherCodeRequired")});
      return;
    }

    setSubmitting(true);
    const result = await createSchoolUser({
      email: form.email,
      password: form.password,
      full_name: form.fullName,
      phone: form.phone || undefined,
      profile_type: form.profileType,
      teacher_code: teacherCodeRequired ? form.teacherCode : undefined,
      role_ids: form.roleIds,
    });
    setSubmitting(false);
    setFailure(toFailure(result));
    if (result.success) router.push(result.data.id ? `/school/users/${result.data.id}` : "/school/users");
  };

  return (
    <PageStack>
      <PageHeader title={t("createTitle")} description={t("createDescription")} actions={<Link href="/school/users" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{common("cancel")}</Link>} />
      {failure ? <InlineAlert tone="danger" title={failure.message} description={failure.requestId ? `${t("requestIdLabel")}: ${failure.requestId}` : t("createFailureHint")} /> : null}
      <Card title={t("basicInfoTitle")} description={t("basicInfoDescription")}>
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={common("email")} required error={getFieldError(failure, "email")}>
              <Input type="email" value={form.email} autoComplete="email" onChange={(event) => setForm({...form, email: event.target.value})} required />
            </Field>
            <Field label={common("fullName")} required error={getFieldError(failure, "full_name")}>
              <Input value={form.fullName} onChange={(event) => setForm({...form, fullName: event.target.value})} required />
            </Field>
            <Field label={common("phone")} error={getFieldError(failure, "phone")}>
              <Input value={form.phone} autoComplete="tel" onChange={(event) => setForm({...form, phone: event.target.value})} />
            </Field>
            <Field label={t("profileType")} required>
              <Select value={form.profileType} onChange={(event) => setForm({...form, profileType: event.target.value})}>
                {schoolProfileTypeOptions.map((option) => <option key={option.value} value={option.value}>{profileLabel(option.value, t)}</option>)}
              </Select>
            </Field>
            <Field label={t("password")} required error={getFieldError(failure, "password")} description={t("passwordGuidance")}>
              <div className="relative"><Input type={showPassword ? "text" : "password"} value={form.password} autoComplete="new-password" onChange={(event) => setForm({...form, password: event.target.value})} required /><TogglePasswordButton visible={showPassword} onToggle={() => setShowPassword((value) => !value)} showLabel={t("showPassword")} hideLabel={t("hidePassword")} /></div>
            </Field>
            <Field label={t("confirmPassword")} required description={t("confirmPasswordDescription")}>
              <div className="relative"><Input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} autoComplete="new-password" onChange={(event) => setForm({...form, confirmPassword: event.target.value})} required /><TogglePasswordButton visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} showLabel={t("showPassword")} hideLabel={t("hidePassword")} /></div>
            </Field>
            {teacherCodeRequired ? <Field label={t("teacherCode")} required error={getFieldError(failure, "teacher_code")}><Input value={form.teacherCode} onChange={(event) => setForm({...form, teacherCode: event.target.value})} required /></Field> : null}
          </div>
          <Card title={t("rolesSectionTitle")} description={t("rolesSectionDescription")}>
            <div className="grid gap-3 md:grid-cols-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-start gap-3 rounded-xl border p-3 text-sm">
                  <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={(event) => setForm({...form, roleIds: event.target.checked ? [...form.roleIds, role.id] : form.roleIds.filter((item) => item !== role.id)})} />
                  <span><span className="block font-medium">{role.name}</span>{role.description ? <span className="text-muted-foreground">{role.description}</span> : null}</span>
                </label>
              ))}
            </div>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={submitting}>{t("createUserAction")}</Button>
            <Link href="/school/users" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{common("cancel")}</Link>
          </div>
        </form>
      </Card>
    </PageStack>
  );
}

export function SchoolUserDetailScreen({userId}: {userId: string}) {
  const t = useTranslations("schoolUsers");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const [user, setUser] = useState<SchoolUser | null>(null);
  const [roles, setRoles] = useState<SchoolRole[]>([]);
  const [permissions, setPermissions] = useState<SchoolPermission[]>([]);
  const [effective, setEffective] = useState<SchoolEffectivePermissions | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({fullName: "", phone: ""});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState<ResetPasswordForm>({newPassword: "", confirmPassword: "", reason: "", confirmed: false});
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [permissionReason, setPermissionReason] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);

  useUnsavedChangesGuard(Boolean((user && (editForm.fullName !== user.fullName || editForm.phone !== user.phone)) || permissionReason || temporaryPassword), common("unsavedChanges"));

  const load = useCallback(async () => {
    const [userResult, rolesResult, permissionsResult, effectiveResult] = await Promise.all([
      fetchSchoolUser(userId),
      fetchSchoolRoles(),
      fetchSchoolPermissions(),
      fetchEffectivePermissions(userId),
    ]);

    setFailure(toFailure(userResult));
    if (userResult.success) {
      setUser(userResult.data);
      setEditForm({fullName: userResult.data.fullName, phone: userResult.data.phone});
      setRoleIds(userResult.data.roles.map((role) => role.id));
    }
    setRoles(rolesResult.success ? rolesResult.data : []);
    setPermissions(permissionsResult.success ? permissionsResult.data : []);
    setEffective(effectiveResult.success ? effectiveResult.data : null);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("school.users")) return <UnsupportedState />;
  if (!access.can(SCHOOL_PERMISSIONS.usersRead)) return <ForbiddenState />;
  if (failure && !user) return <ErrorState requestId={failure.requestId} onRetry={() => void load()} />;
  if (!user) return <LoadingBlock label={common("loading")} />;

  const groupedPermissions = schoolPermissionGroups
    .map((group) => ({...group, items: permissions.filter((permission) => getPermissionGroupKey(permission.code) === group.key)}))
    .filter((group) => group.items.length > 0);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    const result = await updateSchoolUser(user.id, {full_name: editForm.fullName, phone: editForm.phone});
    setPending(false);
    setFailure(toFailure(result));
    if (result.success) {
      setSuccessMessage(t("updated"));
      await load();
    }
  };

  const applyRoles = async () => {
    const removingRoles = user.roles.some((role) => !roleIds.includes(role.id));
    if (removingRoles && !window.confirm(t("confirmRoleReplacement"))) return;
    setPending(true);
    const result = await assignSchoolRoles(user.id, roleIds);
    setPending(false);
    setFailure(toFailure(result));
    if (result.success) {
      setSuccessMessage(t("rolesAssigned"));
      await load();
    }
  };

  const changePermission = async (mode: "grant" | "revoke", code: string) => {
    if (!permissionReason.trim()) {
      setFailure({code: "AUDIT_REASON_REQUIRED", message: t("permissionReasonRequired")});
      return;
    }
    setPending(true);
    const result = mode === "grant" ? await grantSchoolPermissions(user.id, [code], permissionReason) : await revokeSchoolPermissions(user.id, [code], permissionReason);
    setPending(false);
    setFailure(toFailure(result));
    if (result.success) {
      setPermissionReason("");
      setSuccessMessage(mode === "grant" ? t("permissionsGranted") : t("permissionsRevoked"));
      const effectiveResult = await fetchEffectivePermissions(user.id);
      if (effectiveResult.success) setEffective(effectiveResult.data);
    }
  };

  const submitResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!resetForm.confirmed) {
      setFailure({code: "VALIDATION_ERROR", message: t("finalConfirmationRequired")});
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setFailure({code: "VALIDATION_ERROR", message: t("passwordMismatch")});
      return;
    }
    setPending(true);
    const result = await resetSchoolUserPassword(user.id, resetForm.newPassword, resetForm.reason);
    setPending(false);
    setFailure(toFailure(result));
    if (result.success) {
      setTemporaryPassword(result.data.temporaryPassword);
      setSuccessMessage(t("passwordReset"));
      setResetForm({newPassword: "", confirmPassword: "", reason: "", confirmed: false});
      if (!result.data.temporaryPassword) setResetOpen(false);
    }
  };

  const changeActivation = async () => {
    const isOwnAccount = user.id === access.session.user?.id;
    if (isOwnAccount) {
      setFailure({code: "SELF_ACCOUNT_PROTECTED", message: t("selfActivationProtected")});
      return;
    }

    const action = user.isActive ? "disable" : "enable";
    const confirmation = action === "disable" ? t("confirmDisable") : t("confirmEnable");
    if (!window.confirm(confirmation)) {
      return;
    }

    setPending(true);
    const result = action === "disable" ? await disableSchoolUser(user.id) : await enableSchoolUser(user.id);
    setPending(false);
    setFailure(toFailure(result));

    if (result.success) {
      setSuccessMessage(action === "disable" ? t("accountDisabled") : t("accountEnabled"));
      await load();
    }
  };

  return (
    <PageStack>
      <PageHeader
        title={user.fullName}
        description={t("detailDescription")}
        eyebrow={<><Badge variant={userStatusVariant(user.isActive)}>{user.isActive ? t("active") : t("inactive")}</Badge><Badge variant="neutral">{profileLabel(user.profileType, t)}</Badge>{access.session.activeSchool ? <Badge variant="accent">{access.session.activeSchool.name}</Badge> : null}</>}
        actions={<div className="flex flex-wrap gap-2"><Link href="/school/users" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">{t("backToUsers")}</Link>{access.can(SCHOOL_PERMISSIONS.usersResetPassword) ? <Button type="button" variant="secondary" onClick={() => setResetOpen(true)}><KeyRound className="h-4 w-4" aria-hidden />{t("resetPasswordAction")}</Button> : null}</div>}
      />
      {successMessage ? <InlineAlert tone="success" title={successMessage} /> : null}
      {failure ? <InlineAlert tone="danger" title={failure.message} description={failure.requestId ? `${t("requestIdLabel")}: ${failure.requestId}` : undefined} /> : null}
      {temporaryPassword ? <TemporaryPasswordNotice password={temporaryPassword} title={t("temporaryPasswordTitle")} description={t("temporaryPasswordDescription")} onDismiss={() => { setTemporaryPassword(null); setResetOpen(false); }} copyLabel={t("copyTemporaryPassword")} dismissLabel={common("close")} /> : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title={t("profileSectionTitle")} description={t("profileSectionDescription")}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label={common("fullName")} value={user.fullName} />
            <DetailItem label={common("email")} value={user.email} />
            <DetailItem label={common("phone")} value={user.phone || common("none")} />
            <DetailItem label={t("profileType")} value={profileLabel(user.profileType, t)} />
            <DetailItem label={t("schoolContext")} value={access.session.activeSchool?.name ?? common("none")} />
            <DetailItem label={t("roleSummary")} value={roleSummary(user, common("none"))} />
            <DetailItem label={t("createdAt")} value={user.createdAt ? formatDate(user.createdAt, locale) : common("none")} />
            <DetailItem label={t("updatedAt")} value={user.updatedAt ? formatDate(user.updatedAt, locale) : common("none")} />
            {user.teacherCode ? <DetailItem label={t("teacherCode")} value={user.teacherCode} /> : null}
          </div>
        </Card>
        <Card title={t("accountSecurityTitle")} description={t("accountSecurityDescription")}>
          <div className="space-y-4">
            <div className="rounded-xl border p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 text-primary" aria-hidden /><div className="space-y-1 text-sm"><p className="font-medium">{t("securityAuditNoticeTitle")}</p><p className="text-muted-foreground">{t("securityAuditNoticeDescription")}</p></div></div></div>
            <div className="rounded-xl border p-4">
              <p className="text-sm font-medium">{t("accountStatusTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user.isActive ? t("accountActiveDescription") : t("accountInactiveDescription")}</p>
              {access.can(SCHOOL_PERMISSIONS.usersDisableEnable) ? (
                user.id === access.session.user?.id ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t("selfActivationProtected")}</p>
                ) : (
                  <Button
                    type="button"
                    className="mt-3"
                    variant={user.isActive ? "danger" : "secondary"}
                    loading={pending}
                    onClick={() => void changeActivation()}
                  >
                    {user.isActive ? t("disableAccountAction") : t("enableAccountAction")}
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      {access.can(SCHOOL_PERMISSIONS.usersUpdate) ? <Card title={t("editTitle")} description={t("editDescription")}><form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void saveProfile(event)}><Field label={common("fullName")} required error={getFieldError(failure, "full_name")}><Input value={editForm.fullName} onChange={(event) => setEditForm({...editForm, fullName: event.target.value})} required /></Field><Field label={common("phone")} error={getFieldError(failure, "phone")}><Input value={editForm.phone} onChange={(event) => setEditForm({...editForm, phone: event.target.value})} /></Field><div className="md:col-span-2"><Button type="submit" loading={pending}>{common("save")}</Button></div></form></Card> : null}

            {access.can(SCHOOL_PERMISSIONS.rolesRead) ? <Card title={t("rolesManagementTitle")} description={t("rolesManagementDescription")}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{t("assignedRolesTitle")}</p><p className="text-sm text-muted-foreground">{t("assignedRolesDescription")}</p></div>{access.can(SCHOOL_PERMISSIONS.assignRole) ? <Button type="button" variant="secondary" loading={pending} onClick={() => void applyRoles()}>{t("assignRolesAction")}</Button> : null}</div><div className="grid gap-3 md:grid-cols-2">{roles.map((role) => <label key={role.id} className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={roleIds.includes(role.id)} onChange={(event) => setRoleIds((current) => event.target.checked ? [...current, role.id] : current.filter((item) => item !== role.id))} /><span><span className="block font-medium">{role.name}</span>{role.description ? <span className="text-muted-foreground">{role.description}</span> : null}</span></label>)}</div></Card> : null}

      {access.can(SCHOOL_PERMISSIONS.permissionsRead) ? <Card title={t("permissionsCatalogTitle")} description={t("permissionsCatalogDescription")}><div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]"><Input value={permissionReason} onChange={(event) => setPermissionReason(event.target.value)} placeholder={t("permissionReasonPlaceholder")} /><Badge variant="neutral" className="justify-center">{t("permissionReasonBadge")}</Badge></div><div className="space-y-6">{groupedPermissions.map((group) => <div key={group.key} className="space-y-3"><div><h3 className="font-semibold">{t(`permissionGroups.${group.titleKey}`)}</h3><p className="text-sm text-muted-foreground">{t(`permissionGroups.${group.descriptionKey}`)}</p></div><div className="grid gap-3 lg:grid-cols-2">{group.items.map((permission) => {const detail = effective?.permissionsDetail.find((item) => item.code === permission.code); const isEffective = effective?.permissions.includes(permission.code) ?? false; return <div key={permission.code} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-medium">{permission.code}</p><p className="text-sm text-muted-foreground">{permission.description ?? t("permissionDescriptionFallback")}</p></div><div className="flex flex-wrap gap-2"><Badge variant={isEffective ? "success" : "neutral"}>{isEffective ? t("effectivePermission") : t("notEffectivePermission")}</Badge>{detail?.source ? <Badge variant="warning">{detail.source}</Badge> : null}</div></div><div className="mt-4 flex flex-wrap gap-2">{access.can(SCHOOL_PERMISSIONS.grantPermission) ? <Button type="button" variant="secondary" size="sm" loading={pending} onClick={() => void changePermission("grant", permission.code)}>{t("grantSinglePermission")}</Button> : null}{access.can(SCHOOL_PERMISSIONS.revokePermission) ? <Button type="button" variant="danger" size="sm" loading={pending} onClick={() => void changePermission("revoke", permission.code)}>{t("revokeSinglePermission")}</Button> : null}</div></div>;})}</div></div>)}</div></Card> : null}

      {access.can(SCHOOL_PERMISSIONS.effectivePermissionsView) ? <Card title={t("effectivePermissionsTitle")} description={t("effectivePermissionsDescription")}>{effective && effective.permissions.length > 0 ? <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{effective.permissions.map((permission) => <Badge key={permission} variant="accent">{permission}</Badge>)}</div> : <FilteredEmptyState title={t("noEffectivePermissionsTitle")} description={t("noEffectivePermissionsDescription")} />}</Card> : null}

      <Dialog open={resetOpen} onOpenChange={(open) => { setResetOpen(open); if (!open) { setResetForm({newPassword: "", confirmPassword: "", reason: "", confirmed: false}); setTemporaryPassword(null); } }} title={t("resetPasswordTitle")} description={t("resetPasswordDescription")} closeLabel={common("close")}>
        <form className="space-y-4" onSubmit={(event) => void submitResetPassword(event)}>
          <Field label={t("password")} required><Input type="password" value={resetForm.newPassword} autoComplete="new-password" onChange={(event) => setResetForm({...resetForm, newPassword: event.target.value})} required /></Field>
          <Field label={t("confirmPassword")} required><Input type="password" value={resetForm.confirmPassword} autoComplete="new-password" onChange={(event) => setResetForm({...resetForm, confirmPassword: event.target.value})} required /></Field>
          <Field label={common("reason")} required error={getFieldError(failure, "reason")}><Input value={resetForm.reason} onChange={(event) => setResetForm({...resetForm, reason: event.target.value})} required /></Field>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={resetForm.confirmed} onChange={(event) => setResetForm({...resetForm, confirmed: event.target.checked})} /><span>{t("finalConfirmationLabel")}</span></label>
          <div className="flex flex-wrap gap-3"><Button type="submit" loading={pending}>{t("resetPasswordAction")}</Button><Button type="button" variant="outline" onClick={() => setResetOpen(false)}>{common("cancel")}</Button></div>
        </form>
      </Dialog>
    </PageStack>
  );
}

function Field({label, required = false, description, error, children}: {label: string; required?: boolean; description?: string; error?: string | null; children: ReactNode}) {
  return <label className="space-y-2 text-sm"><span className="font-medium">{label}{required ? <span className="text-danger"> *</span> : null}</span>{description ? <p className="text-xs text-muted-foreground">{description}</p> : null}{children}{error ? <p className="text-xs text-danger">{error}</p> : null}</label>;
}

function TogglePasswordButton({visible, onToggle, showLabel, hideLabel}: {visible: boolean; onToggle: () => void; showLabel: string; hideLabel: string}) {
  return <button type="button" className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={visible ? hideLabel : showLabel} onClick={onToggle}>{visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}</button>;
}

function TemporaryPasswordNotice({password, title, description, onDismiss, copyLabel, dismissLabel}: {password: string; title: string; description: string; onDismiss: () => void; copyLabel: string; dismissLabel: string}) {
  const [copied, setCopied] = useState(false);
  return <Card title={title} description={description}><div className="space-y-3"><div className="rounded-xl border bg-muted p-4 font-mono text-sm break-all">{password}</div><div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" onClick={async () => { await navigator.clipboard.writeText(password); setCopied(true); }}>{copied ? `${copyLabel} ?` : copyLabel}</Button><Button type="button" variant="outline" onClick={onDismiss}>{dismissLabel}</Button></div></div></Card>;
}
