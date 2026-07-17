import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("school session mapper accepts the verified user/session/memberships envelope", () => {
  const source = read("src/lib/auth/session.ts");

  assert.match(source, /const user = isRecord\(data\.user\) \? data\.user : data/);
  assert.match(source, /backendSession\?\.school/);
  assert.match(source, /const memberships = Array\.isArray\(data\.memberships\)/);
  assert.match(source, /roles: roleNames\(roleSource\)/);
  assert.match(source, /permissions: strings\(permissionSource\)/);
});

test("active school context is server-derived and stale context is cleared at login", () => {
  const session = read("src/lib/auth/session.ts");
  const cookies = read("src/lib/auth/cookies.ts");

  assert.match(session, /setActiveSchool\(session\.activeSchool\.id\)/);
  assert.match(cookies, /jar\.set\(COOKIE_NAMES\.activeSchool, "", \{\.\.\.base, httpOnly: true, maxAge: 0\}\)/);
  assert.doesNotMatch(session, /localStorage|sessionStorage/);
});

test("school portal waits for session context and distinguishes principal access", () => {
  const layout = read("src/app/[locale]/(school)/school/layout.tsx");
  const gate = read("src/features/school/components/school-portal-gate.tsx");
  const shell = read("src/components/layout/portal-shell.tsx");
  const dashboard = read("src/features/school/components/dashboard-screen.tsx");

  assert.match(layout, /SchoolPortalGate/);
  assert.match(gate, /!session\.activeSchool/);
  assert.match(gate, /refreshSession/);
  assert.match(shell, /schoolAccessKey\(session\.roles\)/);
  assert.match(dashboard, /SCHOOL_PERMISSIONS\.dashboardView/);
  assert.match(dashboard, /principalProvisioningTitle/);
});

test("session failures preserve only a safe error code and request reference for the school gate", () => {
  const provider = read("src/providers/auth-provider.tsx");
  const gate = read("src/features/school/components/school-portal-gate.tsx");
  const serverSession = read("src/lib/auth/session.ts");

  assert.match(provider, /sessionError: \{code: string; requestId\?: string\} \| null/);
  assert.match(provider, /response\.headers\.get\("x-request-id"\)/);
  assert.match(gate, /issue=\{sessionError\}/);
  assert.match(gate, /errorCode/);
  assert.match(serverSession, /code: "SESSION_EXPIRED"/);
  assert.match(serverSession, /extractErrorCode\(body, "SCHOOL_ACCESS_DENIED"\)/);
});
