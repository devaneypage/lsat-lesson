import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const weakAreaSchema = z.enum([
  "Main Point",
  "Assumption",
  "Strengthen/Weaken",
  "Flaw",
  "Inference",
  "Role of Statement",
  "Point at Issue",
  "Method of Argument",
  "Parallel Reasoning",
  "Conditional Reasoning",
  "Reading Comprehension",
]);

const validDateString = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((value) => Number.isFinite(Date.parse(value)), "Enter a valid test date");

export const lessonPlanRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        currentScore: z.union([z.number().int().min(120).max(180), z.literal("untested")]),
        targetScore: z.number().int().min(120).max(180),
        testDate: validDateString,
        hoursPerWeek: z.enum(["4", "8", "12", "16+"]),
        weakAreas: z.array(weakAreaSchema).min(1).max(11),
      }),
    )
    .mutation(async ({ input }) => {
      const parsedDate = new Date(input.testDate);
      const weeksUntilTest = Math.max(
        1,
        Math.round((parsedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)),
      );
      const scoreGap =
        input.currentScore === "untested"
          ? "unknown (no diagnostic taken yet)"
          : `${input.targetScore - input.currentScore} points`;

      const systemPrompt = `You are an expert LSAT instructor and curriculum designer. You create personalized, actionable LSAT study plans grounded in evidence-based instructional design. The 2026 LSAT does NOT include Logic Games — focus only on Logical Reasoning and Reading Comprehension.

Available Study Guide modules on the platform:
- Argument Anatomy (LR-0, LR-2a)
- Introduction to Argument-Based Questions (LR-1)
- Main Point Questions (LR-2)
- Role of Statement Questions (LR-3)
- Method of Argument Questions (LR-4)
- Point at Issue Questions (LR-5)
- Parallel Reasoning Questions (LR-6)
- Conditional Reasoning & Diagramming
- Necessary Assumptions (Bridge & Defender)
- Logical Flaws (19 Common Flaws)
- LSAT Vocabulary & Terminology
- Reading Comprehension Strategy

Format your response in clean Markdown with three clearly labeled sections:
1. ## Priority Rankings
2. ## Week-by-Week Schedule
3. ## Session Breakdowns (first 2 weeks only)

Be specific, practical, and encouraging. Reference the platform's modules by name.`;

      const userMessage = `Please create a personalized LSAT study plan for a student with the following profile:

- **Current Score:** ${input.currentScore === "untested" ? "No diagnostic taken yet" : input.currentScore}
- **Target Score:** ${input.targetScore}
- **Score Gap:** ${scoreGap}
- **Test Date:** ${parsedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- **Weeks Until Test:** ${weeksUntilTest}
- **Study Hours Per Week:** ${input.hoursPerWeek} hours
- **Self-Reported Weak Areas:** ${input.weakAreas.join(", ")}

Generate a complete study plan with:
1. **Priority Rankings** — Top 5 focus areas ranked by score impact, each with a 1-2 sentence rationale explaining why this area will yield the most improvement for this student
2. **Week-by-Week Schedule** — A full schedule from now until the test date, organized by week, with specific Study Guide modules and Question Bank practice sets for each session
3. **Session Breakdowns** — Detailed 45-60 minute session plans for Weeks 1 and 2, following a lesson → practice → review structure`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });
        const content = response.choices?.[0]?.message?.content ?? "";
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned an empty response. Please try again.",
          });
        }
        return { plan: content, weeksUntilTest, scoreGap };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[LessonPlan] LLM error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate lesson plan. Please try again.",
        });
      }
    }),
});
