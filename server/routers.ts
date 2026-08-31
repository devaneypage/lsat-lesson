import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { analyticsRouter } from "./routers/analytics";
import { authRouter } from "./routers/auth";
import { flagsRouter } from "./routers/flags";
import { learnerRouter } from "./routers/learner";
import { lessonPlanRouter } from "./routers/lessonPlan";
import { nexusRouter } from "./routers/nexus";
import { practiceRouter } from "./routers/practice";
import { preferencesRouter } from "./routers/preferences";
import { questionsRouter } from "./routers/questions";
import { questionAuthoringRouter } from "./routers/questionAuthoring";
import { reviewRouter } from "./routers/review";
import { searchRouter } from "./routers/search";
import { studyPlanRouter } from "./routers/studyPlan";
import { taxonomyRouter } from "./routers/taxonomy";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  learner: learnerRouter,
  preferences: preferencesRouter,
  practice: practiceRouter,
  review: reviewRouter,
  search: searchRouter,
  studyPlan: studyPlanRouter,
  analytics: analyticsRouter,
  questions: questionsRouter,
  questionAuthoring: questionAuthoringRouter,
  tags: taxonomyRouter,
  flags: flagsRouter,
  lessonPlan: lessonPlanRouter,
  nexus: nexusRouter,
});

export type AppRouter = typeof appRouter;
