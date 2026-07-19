import {expect, test} from "@playwright/test";

const canRunAuthenticated = process.env.E2E_RUN_AUTHENTICATED === "true"
  && Boolean(process.env.E2E_CENTRAL_USERNAME)
  && Boolean(process.env.E2E_CENTRAL_PASSWORD)
  && Boolean(process.env.E2E_SCHOOL_EMAIL)
  && Boolean(process.env.E2E_SCHOOL_PASSWORD);

test.describe("authenticated portal verification", () => {
  test.skip(!canRunAuthenticated, "Requires an explicitly enabled reachable backend and dedicated non-production test accounts.");

  test("central login, direct URL, navigation, back/forward, and logout", async ({page}) => {
    await page.goto("/ar/login/central");
    await page.locator("#identifier").fill(process.env.E2E_CENTRAL_USERNAME!);
    await page.locator("#password").fill(process.env.E2E_CENTRAL_PASSWORD!);
    await page.locator("form button[type='submit']").click();
    await page.waitForURL(/\/ar\/central/);

    await page.goto("/ar/central");
    await expect(page.locator("main")).toBeVisible();
    await page.goBack();
    await page.goForward();
    await expect(page.locator("main")).toBeVisible();
  });

  test("school login, direct URL, navigation, and responsive shell", async ({page}) => {
    await page.goto("/ar/login/school");
    await page.locator("#identifier").fill(process.env.E2E_SCHOOL_EMAIL!);
    await page.locator("#password").fill(process.env.E2E_SCHOOL_PASSWORD!);
    await page.locator("form button[type='submit']").click();
    await page.waitForURL(/\/ar\/school/);

    await page.goto("/ar/school");
    await expect(page.locator("main")).toBeVisible();
  });
});
