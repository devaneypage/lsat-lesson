import { describe, expect, it } from "vitest";
import { planLegacyProgressImport } from "./learnerDb";

const progress = (
  lessonId: string,
  status: "not_started" | "in_progress" | "completed" = "in_progress",
) => ({ lessonId, status, percentComplete: status === "completed" ? 100 : 40 });

describe("planLegacyProgressImport", () => {
  it("imports only canonical lessons that do not already have durable state", () => {
    const result = planLegacyProgressImport(
      [progress("necessary-assumptions"), progress("sufficient-assumptions"), progress("unknown-lesson")],
      ["sufficient-assumptions"],
    );

    expect(result.toImport.map(item => item.lessonId)).toEqual(["necessary-assumptions"]);
    expect(result).toMatchObject({ imported: 1, skipped: 1, ignored: 1 });
  });

  it("deduplicates browser entries by lesson and keeps the latest value", () => {
    const result = planLegacyProgressImport(
      [progress("necessary-assumptions", "in_progress"), progress("necessary-assumptions", "completed")],
      [],
    );

    expect(result.toImport).toHaveLength(1);
    expect(result.toImport[0]).toMatchObject({ lessonId: "necessary-assumptions", status: "completed" });
    expect(result).toMatchObject({ imported: 1, skipped: 0, ignored: 1 });
  });

  it("is idempotent when every canonical lesson already has durable state", () => {
    const items = [progress("necessary-assumptions"), progress("sufficient-assumptions", "completed")];
    const result = planLegacyProgressImport(items, items.map(item => item.lessonId));

    expect(result.toImport).toEqual([]);
    expect(result).toMatchObject({ imported: 0, skipped: 2, ignored: 0 });
  });
});
