import type { InsertTag } from "../../drizzle/schema";
import {
  addTagToQuestion as addTagToQuestionLegacy,
  bulkAddTagToQuestions as bulkAddTagToQuestionsLegacy,
  bulkRemoveTagFromQuestions as bulkRemoveTagFromQuestionsLegacy,
  createTag as createTagLegacy,
  deleteTag as deleteTagLegacy,
  getQuestionTags as getQuestionTagsLegacy,
  getQuestionsByTag as getQuestionsByTagLegacy,
  getQuestionsFilteredByTags as getQuestionsFilteredByTagsLegacy,
  getQuestionsWithTags as getQuestionsWithTagsLegacy,
  getTags as getTagsLegacy,
  getTagsWithCounts as getTagsWithCountsLegacy,
  removeTagFromQuestion as removeTagFromQuestionLegacy,
  updateTag as updateTagLegacy,
} from "../db";

export type TaxonomyUpdate = {
  name?: string;
  type?: "topic" | "objective" | "section" | "custom";
  description?: string;
  color?: string | null;
};

/** Focused taxonomy persistence boundary for administrator and discovery flows. */
export const taxonomyRepository = {
  create(data: InsertTag) {
    return createTagLegacy(data);
  },
  update(tagId: number, data: TaxonomyUpdate) {
    return updateTagLegacy(tagId, data);
  },
  delete(tagId: number) {
    return deleteTagLegacy(tagId);
  },
  list() {
    return getTagsLegacy();
  },
  listWithCounts() {
    return getTagsWithCountsLegacy();
  },
  listForQuestion(questionId: number) {
    return getQuestionTagsLegacy(questionId);
  },
  addToQuestion(questionId: number, tagId: number) {
    return addTagToQuestionLegacy(questionId, tagId);
  },
  removeFromQuestion(questionId: number, tagId: number) {
    return removeTagFromQuestionLegacy(questionId, tagId);
  },
  listQuestions(tagId: number, limit: number, offset: number) {
    return getQuestionsByTagLegacy(tagId, limit, offset);
  },
  bulkAdd(questionIds: number[], tagId: number) {
    return bulkAddTagToQuestionsLegacy(questionIds, tagId);
  },
  bulkRemove(questionIds: number[], tagId: number) {
    return bulkRemoveTagFromQuestionsLegacy(questionIds, tagId);
  },
  listQuestionsWithTags(limit: number, offset: number) {
    return getQuestionsWithTagsLegacy(limit, offset);
  },
  filterQuestions(input: {
    tagIds: number[];
    limit: number;
    offset: number;
    search?: string;
    category?: string;
  }) {
    return getQuestionsFilteredByTagsLegacy(
      input.tagIds,
      input.limit,
      input.offset,
      input.search,
      input.category,
    );
  },
};

export type TaxonomyRepository = typeof taxonomyRepository;
