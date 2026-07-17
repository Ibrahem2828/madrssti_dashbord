import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => readFileSync(resolve(root, relativePath), "utf8");

test("Central school-user endpoints are explicit and school-scoped", () => {
  const endpoints = read("src/config/endpoints.central.ts");
  assert.match(endpoints, /central\/schools\/\$\{entity\(schoolId\)\}\/users/);
  ["/enable", "/disable", "/reset-password", "/roles", "/effective-permissions", "/permissions/grant", "/permissions/revoke", "/audit-log"].forEach((fragment) => {
    assert.match(endpoints, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("Central client uses the same-origin Central BFF and contains no backend origin", () => {
  const source = read("src/features/central/school-users/api.ts");
  assert.match(source, /browserApi<unknown>\("central"/);
  assert.doesNotMatch(source, /https?:\/\//);
  assert.doesNotMatch(source, /X-School-ID/);
});

test("Central school-user routes are present and render the typed management screens", () => {
  [
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/page.tsx",
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/new/page.tsx",
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/[userId]/page.tsx",
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/[userId]/roles/page.tsx",
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/[userId]/permissions/page.tsx",
    "src/app/[locale]/(central)/central/schools/[schoolId]/users/[userId]/activity/page.tsx",
  ].forEach((file) => assert.equal(existsSync(resolve(root, file)), true, `Missing ${file}`));
});

test("Central user UI gates sensitive operations and clears temporary passwords from its dialog state", () => {
  const source = read("src/features/central/school-users/screens.tsx");
  [
    "CENTRAL_PERMISSIONS.schoolUsersCreate",
    "CENTRAL_PERMISSIONS.schoolUsersEnableDisable",
    "CENTRAL_PERMISSIONS.schoolUsersResetPassword",
    "CENTRAL_PERMISSIONS.schoolRbacGrantPermission",
    "CENTRAL_PERMISSIONS.schoolRbacRevokePermission",
    "setTemporaryPassword(null)",
    "confirmSensitiveAction",
    "permissionAction",
    "confirmPermissionChange",
    "requestPermissionChange",
  ].forEach((fragment) => assert.match(source, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
