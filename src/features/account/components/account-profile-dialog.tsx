"use client";

import {KeyRound, Save, UserRoundPen} from "lucide-react";
import {useEffect, useId, useState} from "react";
import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {
  changeOwnPassword,
  getAccountProfile,
  updateAccountProfile,
} from "@/features/account/services/account-api";
import type {AccountProfile, AccountProfileInput} from "@/features/account/types";
import type {ApiFailure} from "@/lib/api/contracts";
import {usePortalSession} from "@/providers/auth-provider";

type AccountProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChanged: () => Promise<void>;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function AccountProfileDialog({open, onOpenChange, onPasswordChanged}: AccountProfileDialogProps) {
  const t = useTranslations("account");
  const common = useTranslations("common");
  const {session, refreshSession} = usePortalSession();
  const fullNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileForm, setProfileForm] = useState<AccountProfileInput>({fullName: "", email: "", phone: ""});
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [success, setSuccess] = useState<"profile" | null>(null);

  useEffect(() => {
    if (!open) {
      setPasswordForm(emptyPasswordForm);
      setFailure(null);
      setSuccess(null);
      return;
    }

    let active = true;
    setLoadingProfile(true);
    setFailure(null);

    void getAccountProfile().then((result) => {
      if (!active) {
        return;
      }

      setLoadingProfile(false);
      if (!result.success) {
        setFailure(result);
        return;
      }

      setProfile(result.data.profile);
      setProfileForm({
        fullName: result.data.profile.fullName,
        email: result.data.profile.email,
        phone: result.data.profile.phone,
      });
    });

    return () => {
      active = false;
    };
  }, [open]);

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPasswordForm(emptyPasswordForm);
      setFailure(null);
      setSuccess(null);
    }
    onOpenChange(nextOpen);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure(null);
    setSuccess(null);

    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      setFailure(validationFailure(t("completeProfile")));
      return;
    }

    setSavingProfile(true);
    const result = await updateAccountProfile({
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });
    setSavingProfile(false);

    if (!result.success) {
      setFailure(result);
      return;
    }

    setProfile(result.data.profile);
    setProfileForm({
      fullName: result.data.profile.fullName,
      email: result.data.profile.email,
      phone: result.data.profile.phone,
    });
    await refreshSession();
    setSuccess("profile");
  };

  const submitPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure(null);
    setSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setFailure(validationFailure(t("completePassword")));
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setFailure(validationFailure(t("passwordMustDiffer")));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFailure(validationFailure(t("passwordMismatch")));
      return;
    }

    setChangingPassword(true);
    const result = await changeOwnPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm(emptyPasswordForm);
    setChangingPassword(false);

    if (!result.success) {
      setFailure(result);
      return;
    }

    await onPasswordChanged();
  };

  const visibleProfile = profile ?? {
    id: session.user?.id ?? "",
    fullName: session.user?.fullName ?? "",
    email: session.user?.email ?? "",
    phone: "",
    userType: session.user?.userType ?? "",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title={t("title")}
      description={t("description")}
      closeLabel={common("close")}
      size="md"
    >
      <div className="space-y-8">
        {failure ? <FailureNotice failure={failure} /> : null}
        {success === "profile" ? <p role="status" className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{t("profileSaved")}</p> : null}

        <section aria-labelledby={`${fullNameId}-section`} className="space-y-4">
          <div className="flex items-start gap-3">
            <UserRoundPen className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h3 id={`${fullNameId}-section`} className="font-semibold">{t("personalInformation")}</h3>
              <p className="text-sm text-muted-foreground">{t("personalInformationDescription")}</p>
            </div>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void saveProfile(event)}>
            <label className="grid gap-2 text-sm font-medium" htmlFor={fullNameId}>
              {common("fullName")}
              <Input
                id={fullNameId}
                value={profileForm.fullName}
                disabled={loadingProfile || savingProfile}
                autoComplete="name"
                onChange={(event) => setProfileForm({...profileForm, fullName: event.target.value})}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={emailId}>
              {common("email")}
              <Input
                id={emailId}
                type="email"
                value={profileForm.email}
                disabled={loadingProfile || savingProfile}
                autoComplete="email"
                onChange={(event) => setProfileForm({...profileForm, email: event.target.value})}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={phoneId}>
              {common("phone")}
              <Input
                id={phoneId}
                type="tel"
                value={profileForm.phone}
                disabled={loadingProfile || savingProfile}
                autoComplete="tel"
                onChange={(event) => setProfileForm({...profileForm, phone: event.target.value})}
              />
            </label>
            <div className="grid content-end gap-2 text-sm">
              <span className="text-muted-foreground">{t("accountType")}</span>
              <span className="min-h-11 rounded-md border border-input bg-muted px-3 py-2">{visibleProfile.userType || common("none")}</span>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" loading={savingProfile || loadingProfile} loadingLabel={t("savingProfile")}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {t("saveProfile")}
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby={`${currentPasswordId}-section`} className="space-y-4 border-t pt-6">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h3 id={`${currentPasswordId}-section`} className="font-semibold">{t("changePassword")}</h3>
              <p className="text-sm text-muted-foreground">{t("changePasswordDescription")}</p>
            </div>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submitPasswordChange(event)}>
            <label className="grid gap-2 text-sm font-medium md:col-span-2" htmlFor={currentPasswordId}>
              {t("currentPassword")}
              <Input
                id={currentPasswordId}
                type="password"
                value={passwordForm.currentPassword}
                disabled={changingPassword}
                autoComplete="current-password"
                onChange={(event) => setPasswordForm({...passwordForm, currentPassword: event.target.value})}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={newPasswordId}>
              {t("newPassword")}
              <Input
                id={newPasswordId}
                type="password"
                value={passwordForm.newPassword}
                disabled={changingPassword}
                autoComplete="new-password"
                onChange={(event) => setPasswordForm({...passwordForm, newPassword: event.target.value})}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={confirmPasswordId}>
              {t("confirmNewPassword")}
              <Input
                id={confirmPasswordId}
                type="password"
                value={passwordForm.confirmPassword}
                disabled={changingPassword}
                autoComplete="new-password"
                onChange={(event) => setPasswordForm({...passwordForm, confirmPassword: event.target.value})}
                required
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="warning" loading={changingPassword} loadingLabel={t("changingPassword")}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {t("changePassword")}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Dialog>
  );
}

function FailureNotice({failure}: {failure: ApiFailure}) {
  const t = useTranslations("account");
  const message = failureMessage(failure.error.code, t);

  return (
    <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-3 text-sm text-danger">
      <p>{message}</p>
      {failure.requestId ? <p className="mt-1 text-xs">{t("requestReference", {requestId: failure.requestId})}</p> : null}
    </div>
  );
}

function failureMessage(code: string, t: ReturnType<typeof useTranslations<"account">>): string {
  const messages: Record<string, string> = {
    AUTH_REQUIRED: t("authRequired"),
    CURRENT_PASSWORD_INVALID: t("currentPasswordInvalid"),
    VALIDATION_ERROR: t("validationError"),
    CONFLICT: t("emailInUse"),
    RATE_LIMITED: t("rateLimited"),
    BACKEND_TIMEOUT: t("backendTimeout"),
    BACKEND_UNAVAILABLE: t("backendUnavailable"),
    INVALID_BACKEND_RESPONSE: t("invalidBackendResponse"),
    ENDPOINT_MAPPING_ERROR: t("serviceUnavailable"),
  };

  return messages[code] ?? t("requestFailed");
}

function validationFailure(message: string): ApiFailure {
  return {success: false, error: {code: "VALIDATION_ERROR", message}};
}
