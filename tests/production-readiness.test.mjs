import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Phase 2 keeps a single shared dashboard loading primitive for both portals", async () => {
  const [framework, centralLoading, schoolLoading] = await Promise.all([
    read("src/components/layout/product-framework.tsx"),
    read("src/app/[locale]/(central)/central/loading.tsx"),
    read("src/app/[locale]/(school)/school/loading.tsx"),
  ]);

  assert.match(framework, /export function DashboardRouteLoading/);
  assert.match(centralLoading, /DashboardRouteLoading/);
  assert.match(schoolLoading, /DashboardRouteLoading/);
});

test("Playwright coverage is configured with public smoke checks and explicit authenticated safeguards", async () => {
  const [config, publicSpec, authenticatedSpec] = await Promise.all([
    read("playwright.config.ts"),
    read("e2e/public-shell.spec.ts"),
    read("e2e/authenticated-workflows.spec.ts"),
  ]);

  assert.match(config, /mobile-chromium/);
  assert.match(publicSpec, /login\/central/);
  assert.match(publicSpec, /scrollWidth <= window\.innerWidth/);
  assert.match(authenticatedSpec, /E2E_RUN_AUTHENTICATED/);
  assert.match(authenticatedSpec, /test\.skip/);
});
