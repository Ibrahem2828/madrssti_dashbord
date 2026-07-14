"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";

import {useToast} from "@/components/shared/toast";
import {Select} from "@/components/ui/select";
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
          const csrf = document.cookie
            .split("; ")
            .find((item) => item.startsWith("madrasti_csrf="))
            ?.split("=")[1];

          try {
            const response = await fetch("/api/auth/school/switch-school", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(csrf ? {"X-CSRF-Token": decodeURIComponent(csrf)} : {}),
              },
              body: JSON.stringify({schoolId: event.target.value}),
            });

            if (!response.ok) {
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
