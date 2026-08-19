import type { InsertImportHistory, InsertQuestion, Question } from "../../drizzle/schema";
import {
  createImportHistory as createImportHistoryLegacy,
  getQuestionById as getQuestionByIdLegacy,
  getQuestionCount as getQuestionCountLegacy,
  getQuestionCountByLesson as getQuestionCountByLessonLegacy,
  getQuestionsByLesson as getQuestionsByLessonLegacy,
  getCurriculumPracticeCoverage as getCurriculumPracticeCoverageLegacy,
  getQuestions as getQuestionsLegacy,
  insertQuestions as insertQuestionsLegacy,
  seedOriginalLogicalReasoningSamples as seedOriginalLogicalReasoningSamplesLegacy,
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

  list(limit: number, offset: number): Promise<(Question & { category: string | null; difficulty: string | null; source: string | null })[]> {
    return getQuestionsLegacy(limit, offset);
  },

  listByLesson(lessonId: string, limit: number, offset: number): Promise<(Question & { category: string | null; difficulty: string | null; source: string | null })[]> {
    return getQuestionsByLessonLegacy(lessonId, limit, offset);
  },

  getById(questionId: number): Promise<(Question & { category: string | null; difficulty: string | null; source: string | null }) | null> {
    return getQuestionByIdLegacy(questionId);
  },

  count() {
    return getQuestionCountLegacy();
  },

  countByLesson(lessonId: string) {
    return getQuestionCountByLessonLegacy(lessonId);
  },

  curriculumCoverage() {
    return getCurriculumPracticeCoverageLegacy();
  },

  recordImport(data: InsertImportHistory) {
    return createImportHistoryLegacy(data);
  },

  seedOriginalSamples() {
    return seedOriginalLogicalReasoningSamplesLegacy();
  },
};

export type QuestionRepository = typeof questionRepository;
