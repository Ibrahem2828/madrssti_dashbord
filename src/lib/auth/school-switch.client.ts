"use client";

function readCsrfCookie(): string | null {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith("madrasti_csrf="))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

/** Performs the only browser-side part of a school switch; session refresh stays with the caller. */
export async function requestSchoolSwitch(schoolId: string): Promise<boolean> {
  const csrf = readCsrfCookie();
  const response = await fetch("/api/auth/school/switch-school", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? {"X-CSRF-Token": csrf} : {}),
    },
    body: JSON.stringify({schoolId}),
  });

  return response.ok;
}
