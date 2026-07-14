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
import {useUnsavedChangesGuard} from "@/hooks/use-unsaved-changes-guard";
import {usePortalSession} from "@/providers/auth-provider";

import {
  assignSchoolRoles,
  createSchoolUser,
  fetchEffectivePermissions,
  fetchSchoolPermissions,
  fetchSchoolRoles,
  fetchSchoolUsers,
  grantSchoolPermissions,
  resetSchoolUserPassword,
  revokeSchoolPermissions,
  updateSchoolUser,
} from "../services/school-api";
import type {PaginatedResult, SchoolEffectivePermissions, SchoolPermission, SchoolRole, SchoolUser} from "../types/contracts";
import {
  BodyCell,
  Card,
  DetailItem,
  HeaderCell,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
  Pagination,
  readFilters,
} from "./common";

export function SchoolUsersScreen() {
  const t = useTranslations("schoolUsers");
  const common = useTranslations("common");
  const confirmT = useTranslations("confirmations");
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams, ["search", "status", "page"]));
  const [users, setUsers] = useState<PaginatedResult<SchoolUser> | null>(null);
  const [roles, setRoles] = useState<SchoolRole[]>([]);
  const [permissions, setPermissions] = useState<SchoolPermission[]>([]);
  const [effective, setEffective] = useState<SchoolEffectivePermissions | null>(null);
  const [selectedUser, setSelectedUser] = useState<SchoolUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    profileType: "admin",
    roleIds: [] as string[],
  });
  const [editForm, setEditForm] = useState({fullName: "", phone: "", isActive: true});
  const [resetForm, setResetForm] = useState({newPassword: "", reason: ""});
  const [permissionForm, setPermissionForm] = useState({grantCodes: "", revokeCodes: "", reason: ""});
  const hasUnsavedChanges =
    Boolean(createForm.email || createForm.password || createForm.fullName || createForm.phone || createForm.roleIds.length) ||
    Boolean(resetForm.newPassword || resetForm.reason || permissionForm.grantCodes || permissionForm.revokeCodes || permissionForm.reason) ||
    Boolean(
      selectedUser &&
        (editForm.fullName !== selectedUser.fullName ||
          editForm.phone !== selectedUser.phone ||
          editForm.isActive !== selectedUser.isActive),
    );

  useUnsavedChangesGuard(hasUnsavedChanges, common("unsavedChanges"));

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
    const result = await fetchSchoolUsers({
      search: filters.search || undefined,
      status: filters.status || undefined,
      page: filters.page || "1",
    });
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setUsers(result.data);
    setLoading(false);
  }, [filters.page, filters.search, filters.status]);

  const loadReferenceData = useCallback(async () => {
    const [roleResult, permissionResult] = await Promise.all([fetchSchoolRoles(), fetchSchoolPermissions()]);
    if (roleResult.success) setRoles(roleResult.data);
    if (permissionResult.success) setPermissions(permissionResult.data);
  }, []);

  const loadEffective = useCallback(async (userId: string) => {
    const result = await fetchEffectivePermissions(userId);
    setEffective(result.success ? result.data : null);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setEditForm({
      fullName: selectedUser.fullName,
      phone: selectedUser.phone,
      isActive: selectedUser.isActive,
    });
    void loadEffective(selectedUser.id);
  }, [loadEffective, selectedUser]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await createSchoolUser({
      email: createForm.email,
      password: createForm.password,
      full_name: createForm.fullName,
      phone: createForm.phone,
      profile_type: createForm.profileType,
      role_ids: createForm.roleIds,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setCreateForm({email: "", password: "", fullName: "", phone: "", profileType: "admin", roleIds: []});
    setMessage(t("created"));
    await load();
  };

  const submitEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateSchoolUser(selectedUser.id, {
      full_name: editForm.fullName,
      phone: editForm.phone,
      is_active: editForm.isActive,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("updated"));
    await load();
  };

  const submitReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await resetSchoolUserPassword(selectedUser.id, resetForm.newPassword, resetForm.reason);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setResetForm({newPassword: "", reason: ""});
    setMessage(t("passwordReset"));
  };

  const submitRoleAssignment = async () => {
    if (!selectedUser) return;
    if (!window.confirm(confirmT("assignRoles"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await assignSchoolRoles(selectedUser.id, selectedUser.roles.map((role) => role.id));
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("rolesAssigned"));
    await load();
    await loadEffective(selectedUser.id);
  };

  const submitPermissionChange = async (mode: "grant" | "revoke") => {
    if (!selectedUser) return;
    const codes = (mode === "grant" ? permissionForm.grantCodes : permissionForm.revokeCodes)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (codes.length === 0) return;
    if (!window.confirm(mode === "grant" ? confirmT("grantPermissions") : confirmT("revokePermissions"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result =
      mode === "grant"
        ? await grantSchoolPermissions(selectedUser.id, codes, permissionForm.reason)
        : await revokeSchoolPermissions(selectedUser.id, codes, permissionForm.reason);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(mode === "grant" ? t("permissionsGranted") : t("permissionsRevoked"));
    await loadEffective(selectedUser.id);
  };

  if (!hasCapability("school.users")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.usersRead)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <Input value={filters.search ?? ""} onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})} placeholder={t("searchPlaceholder")} />
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={filters.status ?? ""} onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}>
            <option value="">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="inactive">{t("inactive")}</option>
          </select>
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      <Can permission={SCHOOL_PERMISSIONS.usersCreate}>
        <Card title={t("createTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitCreate(event)}>
            <Input value={createForm.email} onChange={(event) => setCreateForm({...createForm, email: event.target.value})} placeholder={common("email")} required />
            <Input value={createForm.password} type="password" onChange={(event) => setCreateForm({...createForm, password: event.target.value})} placeholder={t("password")} required />
            <Input value={createForm.fullName} onChange={(event) => setCreateForm({...createForm, fullName: event.target.value})} placeholder={common("fullName")} required />
            <Input value={createForm.phone} onChange={(event) => setCreateForm({...createForm, phone: event.target.value})} placeholder={common("phone")} />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={createForm.profileType} onChange={(event) => setCreateForm({...createForm, profileType: event.target.value})}>
              <option value="admin">{t("profileAdmin")}</option>
              <option value="teacher">{t("profileTeacher")}</option>
              <option value="staff">{t("profileStaff")}</option>
              <option value="student">{t("profileStudent")}</option>
            </select>
            <div className="rounded-md border p-3">
              <p className="mb-2 text-sm font-medium">{t("roles")}</p>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={createForm.roleIds.includes(role.id)}
                      onChange={(event) =>
                        setCreateForm({
                          ...createForm,
                          roleIds: event.target.checked
                            ? [...createForm.roleIds, role.id]
                            : createForm.roleIds.filter((item) => item !== role.id),
                        })
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={pending}>
                {common("create")}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {users ? (
        <Card title={t("listTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{common("fullName")}</HeaderCell>
                  <HeaderCell>{common("email")}</HeaderCell>
                  <HeaderCell>{common("status")}</HeaderCell>
                  <HeaderCell>{t("roles")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {users.results.map((user) => (
                  <tr key={user.id} className="border-t">
                    <BodyCell>
                      <button type="button" className="font-medium text-primary" onClick={() => setSelectedUser(user)}>
                        {user.fullName}
                      </button>
                    </BodyCell>
                    <BodyCell>{user.email}</BodyCell>
                    <BodyCell>{user.isActive ? t("active") : t("inactive")}</BodyCell>
                    <BodyCell>{user.roles.map((role) => role.name).join(", ") || common("none")}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={users.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
      {selectedUser ? (
        <div className="space-y-6">
          <Card title={t("selectedUserTitle")}>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label={common("fullName")} value={selectedUser.fullName} />
              <DetailItem label={common("email")} value={selectedUser.email} />
              <DetailItem label={common("status")} value={selectedUser.isActive ? t("active") : t("inactive")} />
              <DetailItem label={common("type")} value={selectedUser.userType} />
            </div>
          </Card>
          <Can permission={SCHOOL_PERMISSIONS.usersUpdate}>
            <Card title={t("editTitle")}>
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitEdit(event)}>
                <Input value={editForm.fullName} onChange={(event) => setEditForm({...editForm, fullName: event.target.value})} placeholder={common("fullName")} required />
                <Input value={editForm.phone} onChange={(event) => setEditForm({...editForm, phone: event.target.value})} placeholder={common("phone")} />
                <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={editForm.isActive ? "active" : "inactive"} onChange={(event) => setEditForm({...editForm, isActive: event.target.value === "active"})}>
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
                <div className="md:col-span-2">
                  <Button type="submit" loading={pending}>
                    {common("save")}
                  </Button>
                </div>
              </form>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.usersResetPassword}>
            <Card title={t("resetPasswordTitle")}>
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitReset(event)}>
                <Input type="password" value={resetForm.newPassword} onChange={(event) => setResetForm({...resetForm, newPassword: event.target.value})} placeholder={t("password")} required />
                <Input value={resetForm.reason} onChange={(event) => setResetForm({...resetForm, reason: event.target.value})} placeholder={common("reason")} required />
                <div className="md:col-span-2">
                  <Button type="submit" loading={pending}>
                    {t("resetPasswordAction")}
                  </Button>
                </div>
              </form>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.rolesRead}>
            <Card title={t("rolesManagementTitle")}>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedUser.roles.some((item) => item.id === role.id)}
                      onChange={(event) =>
                        setSelectedUser({
                          ...selectedUser,
                          roles: event.target.checked
                            ? [...selectedUser.roles, role]
                            : selectedUser.roles.filter((item) => item.id !== role.id),
                        })
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
              <Can permission={SCHOOL_PERMISSIONS.assignRole}>
                <Button type="button" className="mt-3" loading={pending} onClick={() => void submitRoleAssignment()}>
                  {t("assignRolesAction")}
                </Button>
              </Can>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.effectivePermissionsView}>
            <Card title={t("effectivePermissionsTitle")}>
              <div className="max-h-56 overflow-auto rounded-md border p-3 text-sm">
                {effective?.permissions.join(", ") || common("none")}
              </div>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.permissionsRead}>
            <Card title={t("permissionsCatalogTitle")}>
              <div className="max-h-56 overflow-auto rounded-md border p-3 text-sm">
                {permissions.map((permission) => (
                  <p key={permission.code}>{permission.code}</p>
                ))}
              </div>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.grantPermission}>
            <Card title={t("grantPermissionsTitle")}>
              <div className="grid gap-3">
                <Textarea value={permissionForm.grantCodes} onChange={(event) => setPermissionForm({...permissionForm, grantCodes: event.target.value})} placeholder={t("permissionCodesPlaceholder")} />
                <Input value={permissionForm.reason} onChange={(event) => setPermissionForm({...permissionForm, reason: event.target.value})} placeholder={common("reason")} />
                <Button type="button" loading={pending} onClick={() => void submitPermissionChange("grant")}>
                  {t("grantPermissionsAction")}
                </Button>
              </div>
            </Card>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.revokePermission}>
            <Card title={t("revokePermissionsTitle")}>
              <div className="grid gap-3">
                <Textarea value={permissionForm.revokeCodes} onChange={(event) => setPermissionForm({...permissionForm, revokeCodes: event.target.value})} placeholder={t("permissionCodesPlaceholder")} />
                <Input value={permissionForm.reason} onChange={(event) => setPermissionForm({...permissionForm, reason: event.target.value})} placeholder={common("reason")} />
                <Button type="button" loading={pending} onClick={() => void submitPermissionChange("revoke")}>
                  {t("revokePermissionsAction")}
                </Button>
              </div>
            </Card>
          </Can>
        </div>
      ) : null}
    </div>
  );
}
