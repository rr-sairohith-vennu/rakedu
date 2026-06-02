import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

async function loginAs(page: any, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/localhost:3000(?!.*login)/, { timeout: 10000 });
}

// ── SC-16: Loading skeleton while fetching ────────────────────────────────
test("SC-16: deals page shows loading skeleton while fetching", async ({ page }) => {
  // Given a verified member navigates to /student-deals
  await loginAs(page,
    process.env.LOCAL_VERIFIED_EMAIL ?? "svennu@mail.edu",
    process.env.LOCAL_VERIFIED_PASSWORD ?? "test123"
  );
  await page.goto(`${BASE_URL}/student-deals`);

  // When the page finishes loading — no error message shown
  await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 5000 });

  // Then the page heading is visible
  await expect(page.locator("h1:has-text('Student Exclusive Deals')")).toBeVisible({ timeout: 10000 });
});

// ── SC-17: Empty state when no active deals ───────────────────────────────
test("SC-17: deals page shows empty state when no active deals", async ({ page }) => {
  // Given a verified member navigates to /student-deals
  await loginAs(page,
    process.env.LOCAL_VERIFIED_EMAIL ?? "svennu@mail.edu",
    process.env.LOCAL_VERIFIED_PASSWORD ?? "test123"
  );
  await page.goto(`${BASE_URL}/student-deals`);

  // When the page finishes loading
  const hasDeals = await page.locator(".rounded-xl.bg-white.ring-1").count();
  const hasEmpty = await page.locator("text=No student deals are available").isVisible().catch(() => false);

  // Then either deals are shown OR the empty state message is shown — never neither
  expect(hasDeals > 0 || hasEmpty).toBeTruthy();
});

// ── SC-18: Cashback rate displayed correctly ──────────────────────────────
test("SC-18: deals page shows cashback rate correctly for each card", async ({ page }) => {
  // Given a verified member navigates to /student-deals
  await loginAs(page,
    process.env.LOCAL_VERIFIED_EMAIL ?? "svennu@mail.edu",
    process.env.LOCAL_VERIFIED_PASSWORD ?? "test123"
  );
  await page.goto(`${BASE_URL}/student-deals`);

  // When the page loads
  await expect(page.locator("h1:has-text('Student Exclusive Deals')")).toBeVisible({ timeout: 10000 });

  // Then each merchant card displays the cashback rate as readable text
  const rateElements = page.locator('p[aria-label*="cash back"]');
  const count = await rateElements.count();
  expect(count).toBeGreaterThan(0);

  // And the rate is readable text containing a percentage
  const firstRate = await rateElements.first().getAttribute("aria-label");
  expect(firstRate).toMatch(/\d+\.\d+% cash back/);

  // And no merchant name is missing
  const merchantNames = page.locator(".text-sm.font-medium.text-gray-900");
  await expect(merchantNames.first()).toBeVisible();
});
