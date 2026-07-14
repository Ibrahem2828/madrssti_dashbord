# Phase 1 architecture

Central and School portals are separate route trees: `/[locale]/central` and `/[locale]/school`, each with declarative navigation and a distinct BFF gateway. Legacy `/admin` remains outside new navigation.

```text
Browser -> same-origin Next Route Handler -> Django API
        <- sanitized JSON / binary response <-
```

```text
Central login: Browser -> /api/auth/central/login -> /central/auth/login -> HttpOnly cookies -> /central/me
School login:  Browser -> /api/auth/school/login  -> /auth/login         -> HttpOnly cookies -> /me
Refresh:       Browser -> /api/auth/refresh       -> /auth/refresh       -> rotated access cookie
Switch school: Browser -> BFF switch route         -> /me/switch-school  -> active-school cookie after success
```

`API_BASE_URL` is server-only. Client code calls only `/api/*`. Locale messages live in `i18n/messages`; the locale layout initializes document language/direction. Semantic CSS variables are the theme source of truth. Session data is sanitized before it reaches React. Permissions filter UI only; Django remains authoritative.
