import { describe, expect, it, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Test suite for CSV import validation and data transformation
 */

// Validation schema (mirrors the tRPC input validation)
const QuestionImportSchema = z.object({
  question_id: z.string(),
  question_text: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  option_d: z.string(),
  option_e: z.string().optional(),
  correct_answer: z.string().regex(/^[A-E]$/),
  explanation: z.string(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  source: z.string().optional(),
});

type QuestionImport = z.infer<typeof QuestionImportSchema>;

describe("CSV Import Validation", () => {
  describe("QuestionImportSchema", () => {
    it("should validate a complete question with all fields", () => {
      const validQuestion: QuestionImport = {
        question_id: "Q001",
        question_text: "What is the main idea?",
        option_a: "Option A",
        option_b: "Option B",
        option_c: "Option C",
        option_d: "Option D",
        option_e: "Option E",
        correct_answer: "A",
        explanation: "This is the correct answer because...",
        category: "Reading Comprehension",
        difficulty: "medium",
        source: "PrepTest 1",
      };

      const result = QuestionImportSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it("should validate a question with minimal required fields", () => {
      const minimalQuestion: QuestionImport = {
        question_id: "Q002",
        question_text: "What is the assumption?",
        option_a: "Assume A",
        option_b: "Assume B",
        option_c: "Assume C",
        option_d: "Assume D",
        correct_answer: "B",
        explanation: "The assumption is B",
      };

      const result = QuestionImportSchema.safeParse(minimalQuestion);
      expect(result.success).toBe(true);
    });

    it("should reject question with invalid correct_answer", () => {
      const invalidQuestion = {
        question_id: "Q003",
        question_text: "What is correct?",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correct_answer: "F", // Invalid - must be A-E
        explanation: "Explanation",
      };

      const result = QuestionImportSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it("should reject question missing required fields", () => {
      const incompleteQuestion = {
        question_id: "Q004",
        question_text: "What is missing?",
        option_a: "A",
        option_b: "B",
        // Missing option_c, option_d, correct_answer, explanation
      };

      const result = QuestionImportSchema.safeParse(incompleteQuestion);
      expect(result.success).toBe(false);
    });
  });

  describe("Data Transformation", () => {
    it("should transform CSV data to database format", () => {
      const csvQuestion: QuestionImport = {
        question_id: "Q005",
        question_text: "Test question",
        option_a: "Option A",
        option_b: "Option B",
        option_c: "Option C",
        option_d: "Option D",
        correct_answer: "C",
        explanation: "Explanation here",
        category: "Logical Reasoning",
        difficulty: "hard",
      };

      // Simulate the transformation done in the tRPC procedure
      const transformed = {
        questionId: csvQuestion.question_id,
        questionText: csvQuestion.question_text,
        optionA: csvQuestion.option_a,
        optionB: csvQuestion.option_b,
        optionC: csvQuestion.option_c,
        optionD: csvQuestion.option_d,
        optionE: csvQuestion.option_e || null,
        correctAnswer: csvQuestion.correct_answer,
        explanation: csvQuestion.explanation,
        category: csvQuestion.category || null,
        difficulty: csvQuestion.difficulty || null,
        source: csvQuestion.source || null,
      };

      expect(transformed.questionId).toBe("Q005");
      expect(transformed.questionText).toBe("Test question");
      expect(transformed.optionE).toBeNull();
      expect(transformed.category).toBe("Logical Reasoning");
    });

    it("should handle optional fields correctly", () => {
      const csvQuestion: QuestionImport = {
        question_id: "Q006",
        question_text: "Minimal question",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correct_answer: "D",
        explanation: "Explanation",
      };

      const transformed = {
        questionId: csvQuestion.question_id,
        questionText: csvQuestion.question_text,
        optionA: csvQuestion.option_a,
        optionB: csvQuestion.option_b,
        optionC: csvQuestion.option_c,
        optionD: csvQuestion.option_d,
        optionE: csvQuestion.option_e || null,
        correctAnswer: csvQuestion.correct_answer,
        explanation: csvQuestion.explanation,
        category: csvQuestion.category || null,
        difficulty: csvQuestion.difficulty || null,
        source: csvQuestion.source || null,
      };

      expect(transformed.optionE).toBeNull();
      expect(transformed.category).toBeNull();
      expect(transformed.difficulty).toBeNull();
      expect(transformed.source).toBeNull();
    });
  });

  describe("Batch Import Validation", () => {
    it("should validate an array of questions", () => {
      const questions: QuestionImport[] = [
        {
          question_id: "Q007",
          question_text: "First question",
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          correct_answer: "A",
          explanation: "Explanation 1",
        },
        {
          question_id: "Q008",
          question_text: "Second question",
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          correct_answer: "B",
          explanation: "Explanation 2",
        },
      ];

      const results = questions.map((q) => QuestionImportSchema.safeParse(q));
      expect(results.every((r) => r.success)).toBe(true);
    });

    it("should identify invalid questions in a batch", () => {
      const questions = [
        {
          question_id: "Q009",
          question_text: "Valid question",
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          correct_answer: "A",
          explanation: "Explanation",
        },
        {
          question_id: "Q010",
          question_text: "Invalid question",
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          correct_answer: "Z", // Invalid
          explanation: "Explanation",
        },
      ];

      const results = questions.map((q) => QuestionImportSchema.safeParse(q));
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });
});
