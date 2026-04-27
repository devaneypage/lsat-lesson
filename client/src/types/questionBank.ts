import { z } from "zod";

/**
 * Question Bank Data Model
 * Comprehensive TypeScript interfaces for managing 1,000+ LSAT questions
 */

// Question Type Enums
export enum LRQuestionType {
  NECESSARY_ASSUMPTION = "necessary-assumption",
  SUFFICIENT_ASSUMPTION = "sufficient-assumption",
  STRENGTHEN = "strengthen",
  WEAKEN = "weaken",
  MAIN_POINT = "main-point",
  INFERENCE = "inference",
  ROLE_OF_STATEMENT = "role-of-statement",
  PARALLEL_REASONING = "parallel-reasoning",
  FLAW = "flaw",
  PRINCIPLE = "principle",
  METHOD_OF_REASONING = "method-of-reasoning",
  COMPARATIVE = "comparative",
}

export enum RCQuestionType {
  MAIN_IDEA = "main-idea",
  DETAIL = "detail",
  INFERENCE = "inference",
  TONE = "tone",
  FUNCTION = "function",
  COMPARISON = "comparison",
  APPLICATION = "application",
  AUTHOR_ATTITUDE = "author-attitude",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum Section {
  LOGICAL_REASONING = "logical-reasoning",
  READING_COMPREHENSION = "reading-comprehension",
  FORMAL_LOGIC = "formal-logic",
}

// Main Question Interface
export interface Question {
  id: string;
  section: Section;
  type: LRQuestionType | RCQuestionType | string;
  difficulty: Difficulty;
  topic: string; // e.g., "Assumptions", "Strengthen/Weaken", "Passage Mapping"
  stimulus: string; // The question text/passage
  options: QuestionOption[];
  correctAnswerId: string;
  explanation: string;
  estimatedTime?: number; // in seconds
  source?: string; // e.g., "PrepTest 90", "Study Master Guide"
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// User Response & Statistics
export interface UserResponse {
  userId: string;
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: Date;
  attemptNumber: number;
}

export interface QuestionStatistics {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number; // 0-100
  averageTimeSpent: number; // in seconds
  difficulty: Difficulty;
}

// Question Set (Collection of questions)
export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  section: Section;
  difficulty?: Difficulty;
  estimatedTime?: number;
  tags?: string[];
}

// Practice Session
export interface PracticeSession {
  id: string;
  userId: string;
  questionSetId?: string;
  questions: Question[];
  responses: UserResponse[];
  startedAt: Date;
  completedAt?: Date;
  score: number;
  totalQuestions: number;
}

// Zod Schemas for Validation
export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  section: z.enum([
    Section.LOGICAL_REASONING,
    Section.READING_COMPREHENSION,
    Section.FORMAL_LOGIC,
  ]),
  type: z.string(),
  difficulty: z.enum([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]),
  topic: z.string(),
  stimulus: z.string(),
  options: z.array(QuestionOptionSchema),
  correctAnswerId: z.string(),
  explanation: z.string(),
  estimatedTime: z.number().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const QuestionSetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema),
  section: z.enum([
    Section.LOGICAL_REASONING,
    Section.READING_COMPREHENSION,
    Section.FORMAL_LOGIC,
  ]),
  difficulty: z
    .enum([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD])
    .optional(),
  estimatedTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

// Sample Questions for Testing
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    section: Section.LOGICAL_REASONING,
    type: LRQuestionType.NECESSARY_ASSUMPTION,
    difficulty: Difficulty.MEDIUM,
    topic: "Assumptions",
    stimulus:
      "The city council proposed a new tax on commercial real estate. Critics argue this will drive businesses away. However, the council points out that neighboring cities with similar taxes have not experienced significant business departures.",
    options: [
      {
        id: "a",
        text: "The neighboring cities' experiences are relevant to predicting the outcome in this city.",
        isCorrect: true,
      },
      {
        id: "b",
        text: "Commercial real estate taxes are the primary factor determining business location decisions.",
        isCorrect: false,
      },
      {
        id: "c",
        text: "The new tax will generate sufficient revenue for the city.",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Businesses in this city are more mobile than those in neighboring cities.",
        isCorrect: false,
      },
    ],
    correctAnswerId: "a",
    explanation:
      "The council's argument relies on the assumption that the neighboring cities' experiences are comparable to this city's situation. Without this assumption, the analogy would be invalid.",
    estimatedTime: 90,
    source: "Practice Set 1",
    tags: ["assumptions", "analogy"],
  },
  {
    id: "q2",
    section: Section.LOGICAL_REASONING,
    type: LRQuestionType.STRENGTHEN,
    difficulty: Difficulty.HARD,
    topic: "Strengthen/Weaken",
    stimulus:
      "Studies show that people who exercise regularly report higher life satisfaction. Therefore, exercise causes increased life satisfaction.",
    options: [
      {
        id: "a",
        text: "People with higher life satisfaction are more likely to exercise.",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Exercise increases endorphin production, which improves mood.",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Some people who exercise do not report high life satisfaction.",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Life satisfaction is influenced by many factors beyond exercise.",
        isCorrect: false,
      },
    ],
    correctAnswerId: "b",
    explanation:
      "This answer strengthens the causal claim by providing a mechanism through which exercise could cause increased life satisfaction.",
    estimatedTime: 120,
    source: "Practice Set 1",
    tags: ["strengthen", "causation"],
  },
];
