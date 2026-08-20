import { getDb } from "../server/db.ts";
import { users } from "../drizzle/schema.ts";
import { practiceRouter } from "../server/routers/practice.ts";

const db = await getDb();
if (!db) throw new Error("Database is unavailable for protected hint verification.");
const [user] = await db.select().from(users).limit(1);
if (!user) throw new Error("No persisted user is available for protected hint verification.");

const caller = practiceRouter.createCaller({
  user,
  req: { protocol: "https", headers: {} },
  res: {},
});
const result = await caller.hint({ questionId: 60003 });
if (!result.hint || /\b(correct\s+(?:answer|option|choice)|answer\s*(?:is|:)|option\s*[A-E]\b|choice\s*[A-E]\b|[A-E]\s+(?:is\s+)?(?:correct|right))\b/i.test(result.hint)) {
  throw new Error("Protected hint response failed answer-safety validation.");
}
console.log(JSON.stringify({ questionId: 60003, hint: result.hint }, null, 2));
