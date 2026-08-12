import mysql from "mysql2/promise";

const required = ["DATABASE_URL", "OWNER_OPEN_ID", "E2E_IDEMPOTENCY_KEY", "E2E_QUESTION_ID", "E2E_STARTED_AT"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [users] = await connection.execute(
    "SELECT id FROM users WHERE openId = ? LIMIT 1",
    [process.env.OWNER_OPEN_ID],
  );
  const user = users[0];
  if (!user) throw new Error("Owner test account was not found");

  const questionId = Number(process.env.E2E_QUESTION_ID);
  if (!Number.isInteger(questionId)) throw new Error("E2E_QUESTION_ID must be an integer");

  await connection.beginTransaction();

  const [attemptResult] = await connection.execute(
    "DELETE FROM questionAttempts WHERE userId = ? AND questionId = ? AND idempotencyKey = ?",
    [user.id, questionId, process.env.E2E_IDEMPOTENCY_KEY],
  );

  const [eventResult] = await connection.execute(
    `DELETE FROM productEvents
      WHERE userId = ?
        AND eventName IN ('question_started', 'question_submitted', 'question_completed')
        AND route = '/practice'
        AND occurredAt >= ?
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.contentId')) = ?`,
    [user.id, process.env.E2E_STARTED_AT, String(questionId)],
  );

  await connection.commit();

  process.stdout.write(JSON.stringify({
    removedAttempts: attemptResult.affectedRows,
    removedEvents: eventResult.affectedRows,
  }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
