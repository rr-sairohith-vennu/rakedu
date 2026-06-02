import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

export default defineConfig({
  testDir: "./tests/bdd",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "local-anonymous",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "local-verified",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/verified-user.json",
      },
    },
    {
      name: "local-unverified",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/unverified-user.json",
      },
    },
  ],
});
