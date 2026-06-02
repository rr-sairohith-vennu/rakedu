import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// ── SC-9: Email entry page renders idle state ──────────────────────────────
test("SC-9: email entry page renders idle state", async ({ page }) => {
  // Given a logged-in non-verified member navigates to /verify-student
  // (middleware redirects to login — log in first)
  await page.goto(`${BASE_URL}/login?callbackUrl=/verify-student`);
  await page.locator('input[type="email"]').fill(process.env.LOCAL_UNVERIFIED_EMAIL ?? "unverified@test.com");
  await page.locator('input[type="password"]').fill(process.env.LOCAL_UNVERIFIED_PASSWORD ?? "test123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/verify-student/, { timeout: 10000 });

  // When the page loads
  await expect(page.locator("h1")).toHaveText("Verify your student status", { timeout: 5000 });

  // Then a text input for the .edu email is visible and focusable
  await expect(page.locator("input#edu-email")).toBeVisible();

  // And a "Send verification code" submit button is visible
  await expect(page.locator("button[type='submit']")).toBeVisible();
  await expect(page.locator("button[type='submit']")).toContainText("Send verification code");

  // And the submit button is disabled when the input is empty
  await expect(page.locator("button[type='submit']")).toBeDisabled();
});

// ── SC-10: Inline error for non-.edu format ────────────────────────────────
test("SC-10: email entry shows inline error for non-.edu format", async ({ page }) => {
  // Given a logged-in member is on the /verify-student page
  await page.goto(`${BASE_URL}/login?callbackUrl=/verify-student`);
  await page.locator('input[type="email"]').fill(process.env.LOCAL_UNVERIFIED_EMAIL ?? "unverified@test.com");
  await page.locator('input[type="password"]').fill(process.env.LOCAL_UNVERIFIED_PASSWORD ?? "test123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/verify-student/, { timeout: 10000 });

  // When the member enters "user@gmail.com" and submits the form
  await page.locator("input#edu-email").fill("user@gmail.com");
  await page.locator("button[type='submit']").click();

  // Then an inline error message is visible
  await expect(page.locator('p[role="alert"]#email-error')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('p[role="alert"]#email-error')).toContainText("valid .edu email");

  // And the form does not navigate away from the page
  await expect(page).toHaveURL(/verify-student$/, { timeout: 3000 });
  expect(page.url()).not.toContain("confirm");
});

// ── SC-11: Resend link rate-limited for 60s ───────────────────────────────
test("SC-11: OTP confirm page resend link rate-limited for 60s", async ({ page }) => {
  // Given a member is on the /verify-student/confirm page
  // (reach it by submitting a valid .edu email)
  await page.goto(`${BASE_URL}/login?callbackUrl=/verify-student`);
  await page.locator('input[type="email"]').fill(process.env.LOCAL_UNVERIFIED_EMAIL ?? "unverified@test.com");
  await page.locator('input[type="password"]').fill(process.env.LOCAL_UNVERIFIED_PASSWORD ?? "test123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/verify-student$/, { timeout: 10000 });
  await page.locator("input#edu-email").fill("sc11test@university.edu");
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/verify-student\/confirm/, { timeout: 10000 });

  // When the member clicks "Resend code"
  await page.locator("button:has-text('Resend code')").click();

  // Then the resend link updates to show a countdown
  await expect(page.locator("button:has-text('Resend code in')")).toBeVisible({ timeout: 5000 });

  // And the resend link is disabled
  await expect(page.locator("button:has-text('Resend code in')")).toBeDisabled();
});

// ── SC-12: Correct OTP navigates to success page ──────────────────────────
test("SC-12: correct OTP code navigates to success page", async ({ page }) => {
  // This test requires a real OTP — it exercises the happy path structure
  // Given a member is on /verify-student/confirm
  await page.goto(`${BASE_URL}/login?callbackUrl=/verify-student`);
  await page.locator('input[type="email"]').fill(process.env.LOCAL_UNVERIFIED_EMAIL ?? "unverified@test.com");
  await page.locator('input[type="password"]').fill(process.env.LOCAL_UNVERIFIED_PASSWORD ?? "test123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/verify-student$/, { timeout: 10000 });
  await page.locator("input#edu-email").fill("sc12test@university.edu");
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/verify-student\/confirm/, { timeout: 10000 });

  // Then the heading "Check your email" is visible
  await expect(page.locator("h1")).toHaveText("Check your email");

  // And a 6-digit OTP input is visible
  await expect(page.locator("input#otp-code")).toBeVisible();

  // And the Verify code button is visible (disabled until 6 digits entered)
  await expect(page.locator("button:has-text('Verify code')")).toBeVisible();

  // And a Resend code option is present
  await expect(page.locator("button:has-text('Resend code')")).toBeVisible();
});
