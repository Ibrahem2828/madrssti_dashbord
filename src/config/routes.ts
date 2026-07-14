export const ROUTES = {login: "/login", centralLogin: "/login/central", schoolLogin: "/login/school", central: "/central", school: "/school", unauthorized: "/unauthorized", sessionExpired: "/session-expired"} as const;
export type Portal = "central" | "school";
export type RouteAccess = {portal: Portal; anyOf?: readonly string[]; allOf?: readonly string[]};
export function safeInternalPath(value: string | null, fallback: string): string { return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback; }
