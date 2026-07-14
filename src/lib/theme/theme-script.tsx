import {cookies} from "next/headers";

import {COOKIE_NAMES} from "@/lib/auth/cookies";

export function ThemeScript() {
  const theme = cookies().get(COOKIE_NAMES.theme)?.value === "dark" ? "dark" : "light";

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.classList.toggle('dark',${JSON.stringify(theme === "dark")});document.documentElement.style.colorScheme=${JSON.stringify(theme)};`,
      }}
    />
  );
}
