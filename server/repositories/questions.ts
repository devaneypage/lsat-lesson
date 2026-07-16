import type { InsertImportHistory, InsertQuestion } from "../../drizzle/schema";
import {
  createImportHistory as createImportHistoryLegacy,
  getQuestionCount as getQuestionCountLegacy,
  getQuestions as getQuestionsLegacy,
  insertQuestions as insertQuestionsLegacy,
} from "../db";

/**
 * Question persistence boundary.
 *
 * The legacy database module remains the low-level implementation during the
 * incremental rebuild. Routers import this domain repository so query behavior
 * can be replaced or optimized without changing public procedure contracts.
 */
export const questionRepository = {
  insertMany(questions: InsertQuestion[]) {
    return insertQuestionsLegacy(questions);
  },

  list(limit: number, offset: number) {
    return getQuestionsLegacy(limit, offset);
  },

  count() {
    return getQuestionCountLegacy();
  },

  recordImport(data: InsertImportHistory) {
    return createImportHistoryLegacy(data);
  },
};

export type QuestionRepository = typeof questionRepository;
