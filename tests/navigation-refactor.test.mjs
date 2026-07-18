import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => readFileSync(resolve(root, relativePath), "utf8");

test("the shell uses one navigation policy and one route matcher", () => {
  const shell = read("src/components/layout/portal-shell.tsx");
  const policy = read("src/lib/navigation/portal-navigation.ts");

  assert.match(shell, /filterNavigationForSession\(navigation, session\.permissions\)/);
  assert.match(shell, /isNavigationItemActive\(pathname, item\)/);
  assert.match(policy, /normalizeNavigationPath/);
  assert.match(policy, /canAny\(permissions, item\.permissionsAny\)/);
  assert.match(policy, /canAll\(permissions, item\.permissionsAll\)/);
  assert.doesNotMatch(shell, /function isActivePath/);
  assert.doesNotMatch(shell, /function canAccess/);
});

test("the drawer uses PortalBrand once instead of duplicating its generic header", () => {
  const shell = read("src/components/layout/portal-shell.tsx");
  const drawer = read("src/components/ui/drawer.tsx");

  assert.match(shell, /header=\{\s*<PortalBrand/);
  assert.match(shell, /!mobile \? \(/);
  assert.match(drawer, /header\?: ReactNode/);
  assert.match(drawer, /aria-label=\{header \? title : undefined\}/);
  assert.match(drawer, /motion-surface-enter/);
});
