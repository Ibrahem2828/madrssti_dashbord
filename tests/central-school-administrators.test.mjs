import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("central navigation exposes the school administrators workspace with exact permissions", () => {
  const source = read("src/config/navigation.central.ts");

  assert.match(source, /id: "schoolAdministrators"/);
  assert.match(source, /href: "\/central\/school-administrators"/);
  assert.match(source, /CENTRAL_PERMISSIONS\.schoolAdminRead/);
  assert.match(source, /CENTRAL_PERMISSIONS\.schoolAdminCreate/);
});

test("central administrator workspace uses the verified one-school create-admin flow", () => {
  const screen = read("src/features/central/components/central-screens.tsx");
  const route = read("src/app/[locale]/(central)/central/school-administrators/page.tsx");
  const service = read("src/features/central/services/central-api.ts");

  assert.match(route, /CentralSchoolAdministratorsScreen/);
  assert.match(screen, /function CentralSchoolAdministratorsScreen/);
  assert.match(screen, /createCentralAdmin\(selectedSchool\.id, form\)/);
  assert.match(screen, /single primary administrator/);
  assert.match(screen, /CENTRAL_PERMISSIONS\.schoolAdminCreate/);
  assert.match(service, /centralEndpoints\.schools\.createAdmin\(id\)/);
});

test("central administrator credentials remain transient and are not persisted in browser storage", () => {
  const screen = read("src/features/central/components/central-screens.tsx");

  assert.match(screen, /setTemporaryPassword\(result\.data\.tempPassword\)/);
  assert.match(screen, /setTemporaryPassword\(null\)/);
  assert.doesNotMatch(screen, /localStorage|sessionStorage/);
});
