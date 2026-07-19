import {expect, test} from "@playwright/test";

function collectConsoleErrors() {
  const errors: string[] = [];
  return {
    errors,
    onConsole(message: {type(): string; text(): string}) {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    },
  };
}

test.describe("public authentication shell", () => {
  test("central login is reachable directly, keyboard-addressable, and RTL", async ({page}) => {
    const consoleState = collectConsoleErrors();
    page.on("console", consoleState.onConsole);

    await page.goto("/ar/login/central");

    await expect(page).toHaveURL(/\/ar\/login\/central$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("form button[type='submit']")).toBeVisible();

    await page.locator("form button[type='submit']").click();
    await expect(page.locator("[role='alert']")).toBeVisible();
    expect(consoleState.errors).toEqual([]);
  });

  test("school login preserves locale direction and has no horizontal overflow on a phone", async ({page}) => {
    const consoleState = collectConsoleErrors();
    page.on("console", consoleState.onConsole);

    await page.goto("/en/login/school");

    await expect(page).toHaveURL(/\/en\/login\/school$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("#identifier")).toHaveAttribute("type", "email");
    await expect.poll(() => page.locator("body").evaluate((body: HTMLElement) => body.scrollWidth <= window.innerWidth)).toBe(true);
    expect(consoleState.errors).toEqual([]);
  });
});
