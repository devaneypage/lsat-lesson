/**
 * One-shot script to enable all Nexus UX feature flags.
 * Run: node scripts/enable-nexus-flags.mjs
 */
import { createRequire } from "module";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

// Load drizzle + mysql2 directly
const { drizzle } = await import("drizzle-orm/mysql2");
const { eq } = await import("drizzle-orm");

// Inline schema reference
const { featureFlags } = await import("../drizzle/schema.js");

const FLAGS_TO_ENABLE = [
  "nexus_dashboard",
  "lesson_grid",
  "concept_map",
  "score_card",
  "booking_cta",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set — cannot connect.");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  for (const key of FLAGS_TO_ENABLE) {
    try {
      await db
        .update(featureFlags)
        .set({ enabled: 1, rolloutPercentage: 100 })
        .where(eq(featureFlags.key, key));
      console.log(`✓ Enabled: ${key}`);
    } catch (err) {
      console.error(`✗ Failed to enable ${key}:`, err.message);
    }
  }

  // Verify
  const rows = await db.select().from(featureFlags);
  console.log("\nCurrent flag state:");
  rows.forEach((r) => {
    console.log(`  ${r.enabled ? "ON " : "OFF"} [${r.rolloutPercentage}%] ${r.key}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
