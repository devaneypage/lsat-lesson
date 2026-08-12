import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { searchQuestions } from "../searchDb";

/** Unified server-backed question-search procedures are composed here. */
export const searchRouter = router({
  questions: protectedProcedure
    .input(z.object({
      query: z.string().trim().min(2).max(120),
      limit: z.number().int().min(1).max(20).default(8),
      offset: z.number().int().min(0).max(10_000).default(0),
    }))
    .query(({ input }) => searchQuestions(input)),
});
