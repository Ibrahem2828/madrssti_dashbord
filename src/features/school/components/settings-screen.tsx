"use client";

import type {FormEvent} from "react";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {usePortalSession} from "@/providers/auth-provider";

import {fetchSchoolSettings, updateSchoolFeatures, updateSchoolSettings} from "../services/school-api";
import type {SchoolSettings} from "../types/contracts";
import {Card, InlineError, InlineSuccess, LoadingBlock, PageHeader} from "./common";

export function SchoolSettingsScreen() {
  const t = useTranslations("schoolSettings");
  const common = useTranslations("common");
  const confirmT = useTranslations("confirmations");
  const access = usePortalSession();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [schoolForm, setSchoolForm] = useState({name: "", phone: "", address: "", timezone: ""});
  const [featureForm, setFeatureForm] = useState({aiEnabled: false, leaderboardEnabled: false, behaviorVisibility: "", pointsLimits: "{}", featureFlags: "{}"});

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchSchoolSettings();
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setSettings(result.data);
    setSchoolForm({
      name: result.data.school.name,
      phone: result.data.school.phone,
      address: result.data.school.address,
      timezone: result.data.school.timezone,
    });
    setFeatureForm({
      aiEnabled: result.data.settings.aiEnabled,
      leaderboardEnabled: result.data.settings.leaderboardEnabled,
      behaviorVisibility: result.data.settings.behaviorVisibility,
      pointsLimits: JSON.stringify(result.data.settings.pointsLimits, null, 2),
      featureFlags: JSON.stringify(result.data.settings.featureFlags, null, 2),
    });
    setLoading(false);
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!window.confirm(confirmT("saveSettings"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateSchoolSettings({
      school: schoolForm,
      settings: {
        ai_enabled: featureForm.aiEnabled,
        leaderboard_enabled: featureForm.leaderboardEnabled,
        behavior_visibility: featureForm.behaviorVisibility,
        points_limits: parseJson(featureForm.pointsLimits),
        feature_flags: parseJson(featureForm.featureFlags),
      },
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setSettings(result.data);
    setMessage(t("saved"));
  };

  const saveFeatures = async () => {
    if (!window.confirm(confirmT("saveFeatures"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateSchoolFeatures({
      ai_enabled: featureForm.aiEnabled,
      leaderboard_enabled: featureForm.leaderboardEnabled,
      behavior_visibility: featureForm.behaviorVisibility,
      points_limits: parseJson(featureForm.pointsLimits),
      feature_flags: parseJson(featureForm.featureFlags),
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("featuresSaved"));
    await load();
  };

  if (!hasCapability("school.settings")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.settingsUpdate)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {settings ? (
        <>
          <Card title={t("schoolInfoTitle")}>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void saveSettings(event)}>
              <Input value={schoolForm.name} onChange={(event) => setSchoolForm({...schoolForm, name: event.target.value})} placeholder={common("name")} required />
              <Input value={schoolForm.phone} onChange={(event) => setSchoolForm({...schoolForm, phone: event.target.value})} placeholder={common("phone")} />
              <Input value={schoolForm.timezone} onChange={(event) => setSchoolForm({...schoolForm, timezone: event.target.value})} placeholder={t("timezone")} required />
              <div className="md:col-span-2">
                <Textarea value={schoolForm.address} onChange={(event) => setSchoolForm({...schoolForm, address: event.target.value})} placeholder={common("address")} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" loading={pending}>
                  {common("save")}
                </Button>
              </div>
            </form>
          </Card>
          <Can permission={SCHOOL_PERMISSIONS.featuresManage}>
            <Card title={t("featuresTitle")}>
              <div className="grid gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={featureForm.aiEnabled} onChange={(event) => setFeatureForm({...featureForm, aiEnabled: event.target.checked})} />
                  {t("aiEnabled")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={featureForm.leaderboardEnabled} onChange={(event) => setFeatureForm({...featureForm, leaderboardEnabled: event.target.checked})} />
                  {t("leaderboardEnabled")}
                </label>
                <Input value={featureForm.behaviorVisibility} onChange={(event) => setFeatureForm({...featureForm, behaviorVisibility: event.target.value})} placeholder={t("behaviorVisibility")} />
                <Textarea value={featureForm.pointsLimits} onChange={(event) => setFeatureForm({...featureForm, pointsLimits: event.target.value})} placeholder={t("pointsLimits")} />
                <Textarea value={featureForm.featureFlags} onChange={(event) => setFeatureForm({...featureForm, featureFlags: event.target.value})} placeholder={t("featureFlags")} />
                <Button type="button" loading={pending} onClick={() => void saveFeatures()}>
                  {t("saveFeatures")}
                </Button>
              </div>
            </Card>
          </Can>
        </>
      ) : null}
    </div>
  );
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
