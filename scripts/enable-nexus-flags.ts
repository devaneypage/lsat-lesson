/**
 * One-shot script to enable all Nexus UX feature flags.
 * Run: npx tsx scripts/enable-nexus-flags.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { featureFlags } from "../drizzle/schema";

const FLAGS_TO_ENABLE = [
  "nexus_dashboard",
  "lesson_grid",
  "concept_map",
  "score_card",
  "booking_cta",
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set — cannot connect.");
    process.exit(1);
  }

  const db = drizzle(dbUrl);

  for (const key of FLAGS_TO_ENABLE) {
    try {
      await db
        .update(featureFlags)
        .set({ enabled: 1, rolloutPercentage: 100 })
        .where(eq(featureFlags.key, key));
      console.log(`✓ Enabled: ${key}`);
    } catch (err: unknown) {
      console.error(`✗ Failed to enable ${key}:`, (err as Error).message);
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
