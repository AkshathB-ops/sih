// Centralized, typed environment access.
// Loaded by Next.js for the app; explicitly loaded for CLI/test contexts.

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  testDatabaseUrl: process.env.TEST_DATABASE_URL ?? "",
  authSecret: process.env.AUTH_SECRET ?? "sih-dev-secret-change-me",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "sih_session",
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  storageLocalDir: process.env.STORAGE_LOCAL_DIR ?? "./storage/local",
  aiProvider: (process.env.AI_PROVIDER ?? "deterministic") as
    | "none"
    | "deterministic",
  seedDemoData: (process.env.SEED_DEMO_DATA ?? "true") === "true",
  isProduction: process.env.NODE_ENV === "production",
};

export function assertRequiredEnv(): void {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }
}