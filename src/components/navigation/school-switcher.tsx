"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";

import {useToast} from "@/components/shared/toast";
import {Select} from "@/components/ui/select";
import {requestSchoolSwitch} from "@/lib/auth/school-switch.client";
import {usePortalSession} from "@/providers/auth-provider";

export function SchoolSwitcher() {
  const t = useTranslations("schoolSwitcher");
  const errors = useTranslations("errors");
  const {showToast} = useToast();
  const {session, refreshSession} = usePortalSession();
  const [pending, setPending] = useState(false);

  if (!session.activeSchool || session.schools.length < 2) {
    return null;
  }

  return (
    <div className="min-w-[12rem]">
      <label className="sr-only" htmlFor="school-switcher">
        {t("label")}
      </label>
      <Select
        id="school-switcher"
        value={session.activeSchool.id}
        disabled={pending}
        aria-label={t("label")}
        onChange={async (event) => {
          setPending(true);

          try {
            if (!await requestSchoolSwitch(event.target.value)) {
              showToast("error", t("label"), t("failed"));
              return;
            }

            await refreshSession();
          } catch {
            showToast("error", t("label"), errors("unexpectedDescription"));
          } finally {
            setPending(false);
          }
        }}
      >
        {session.schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
