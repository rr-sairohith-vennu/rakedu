import { test as setup, expect } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BASE_URL = "http://localhost:3000";

setup("create verified user auth state", async ({ page }) => {
  const email = process.env.LOCAL_VERIFIED_EMAIL ?? "svennu@mail.edu";
  const password = process.env.LOCAL_VERIFIED_PASSWORD ?? "test123";

  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/localhost:3000/, { timeout: 10000 });

  await page.context().storageState({ path: ".auth/verified-user.json" });
});

setup("create unverified user auth state", async ({ page }) => {
  const email = process.env.LOCAL_UNVERIFIED_EMAIL ?? "unverified@test.com";
  const password = process.env.LOCAL_UNVERIFIED_PASSWORD ?? "test123";

  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/localhost:3000/, { timeout: 10000 });

  await page.context().storageState({ path: ".auth/unverified-user.json" });
});
