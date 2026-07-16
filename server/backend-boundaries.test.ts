import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
const now = new Date("2026-07-16T00:00:00.000Z");

function createContext(role: "admin" | "user" | null): TrpcContext {
  const user: AuthenticatedUser | null = role
    ? {
        id: role === "admin" ? 1 : 2,
        openId: `${role}-open-id`,
        email: `${role}@example.com`,
        name: role === "admin" ? "Admin" : "Learner",
        loginMethod: "manus",
        role,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      }
    : null;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const projectFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("backend domain boundaries", () => {
  it("keeps the root router as a composition-only module", () => {
    const source = projectFile("server/routers.ts");
    expect(source.split("\n").length).toBeLessThan(60);
    expect(source).not.toContain(".query(");
    expect(source).not.toContain(".mutation(");
    expect(source).not.toContain("ctx.user.role");
  });

  it.each([
    ["server/routers/questions.ts", "../repositories/questions"],
    ["server/routers/taxonomy.ts", "../repositories/taxonomy"],
    ["server/routers/flags.ts", "../repositories/featureFlags"],
  ])("routes %s through its focused repository", (routerPath, repositoryImport) => {
    expect(projectFile(routerPath)).toContain(repositoryImport);
  });

  it("uses the centralized administrator procedure for question and taxonomy writes", async () => {
    const learner = appRouter.createCaller(createContext("user"));

    await expect(
      learner.questions.import({
        fileName: "questions.csv",
        questions: [
          {
            question_id: "Q-1",
            question_text: "Stimulus and question",
            option_a: "A",
            option_b: "B",
            option_c: "C",
            option_d: "D",
            correct_answer: "A",
            explanation: "Explanation",
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(learner.tags.delete({ tagId: 1 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("requires authentication before generating a legacy AI plan draft", async () => {
    const guest = appRouter.createCaller(createContext(null));
    await expect(
      guest.lessonPlan.generate({
        currentScore: "untested",
        targetScore: 170,
        testDate: "2026-12-01",
        hoursPerWeek: "8",
        weakAreas: ["Assumption"],
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
