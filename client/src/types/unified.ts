/**
 * Unified LSAT Platform Data Model
 * Comprehensive TypeScript interfaces for curriculum, questions, and study plans
 */

import { z } from "zod";

// ============================================================================
// CURRICULUM TYPES
// ============================================================================

export type CurriculumPartType = "LR" | "FL" | "RC" | "TEST_STRATEGY";

export interface CurriculumPart {
  id: string;
  type: CurriculumPartType;
  title: string;
  description: string;
  estimatedHours: number;
  chapters: Chapter[];
  color: string; // Accent color for this part
}

export interface Chapter {
  id: string;
  partId: string;
  number: number;
  title: string;
  description: string;
  estimatedHours: number;
  topics: string[];
  lessons: Lesson[];
  drills: Drill[];
  completed: boolean;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  type: "interactive" | "reading" | "video";
  duration: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  content: string; // markdown or HTML
  objectives: string[];
  completed: boolean;
  completedAt?: Date;
}

export interface Drill {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  questions: string[]; // question IDs
  estimatedTime: number; // minutes
  completed: boolean;
}

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type LRQuestionType =
  | "MAIN_POINT"
  | "ROLE_OF_STATEMENT"
  | "METHOD_OF_ARGUMENT"
  | "POINT_AT_ISSUE"
  | "PARALLEL_REASONING"
  | "EVALUATE"
  | "FLAW"
  | "NECESSARY_ASSUMPTION"
  | "SUFFICIENT_ASSUMPTION"
  | "STRENGTHEN"
  | "WEAKEN"
  | "SUPPORTING_PRINCIPLE"
  | "REASONING_CONFORMS_TO"
  | "MUST_BE_TRUE"
  | "MOST_STRONGLY_SUPPORTED"
  | "COMPLETE_THE_ARGUMENT"
  | "CANNOT_BE_TRUE"
  | "RESOLVE_THE_PARADOX";

export type RCQuestionType =
  | "MAIN_IDEA"
  | "SPECIFIC_REFERENCE"
  | "INFERENCE"
  | "AUTHOR_ATTITUDE"
  | "FUNCTION"
  | "PARALLEL_REASONING"
  | "COMPARATIVE";

export type QuestionType = LRQuestionType | RCQuestionType;

export interface Question {
  id: string;
  type: QuestionType;
  section: "LR" | "RC";
  difficulty: "easy" | "medium" | "hard";
  prepTestNumber?: number;
  prepTestSection?: number;
  stimulus: string; // question text/passage
  answerChoices: {
    letter: "A" | "B" | "C" | "D" | "E";
    text: string;
  }[];
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  topic?: string;
  source?: string;
  tags?: string[];
}

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  type: "drill" | "practice_test" | "mixed";
  difficulty: "easy" | "medium" | "hard" | "mixed";
  estimatedTime: number; // minutes
  completed: boolean;
}

// ============================================================================
// STUDENT PATH TYPES
// ============================================================================

export type StudentPathType =
  | "LOGICAL_REASONING"
  | "READING_COMPREHENSION"
  | "FORMAL_LOGIC"
  | "TEST_STRATEGY"
  | "COMPREHENSIVE";

export interface StudentPath {
  id: string;
  type: StudentPathType;
  title: string;
  description: string;
  estimatedHours: number;
  targetScore?: number;
  topics: string[];
  color: string;
}

// ============================================================================
// STUDY PLAN TYPES
// ============================================================================

export interface StudyPlan {
  id: string;
  studentId: string;
  pathType: StudentPathType;
  createdAt: Date;
  startDate: Date;
  targetDate: Date;
  targetScore: number;
  currentScore?: number;
  progress: StudyProgress;
  recommendations: string[];
}

export interface StudyProgress {
  lessonsCompleted: number;
  lessonsTotal: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number; // percentage
  hoursSpent: number;
  lastActivityAt?: Date;
  completedChapters: string[]; // chapter IDs
  completedLessons: string[]; // lesson IDs
  completedDrills: string[]; // drill IDs
}

export interface PerformanceData {
  questionId: string;
  answered: boolean;
  correct: boolean;
  timeSpent: number; // seconds
  attemptedAt: Date;
  explanation?: string;
}

// ============================================================================
// STUDENT PROFILE TYPES
// ============================================================================

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  selectedPath: StudentPathType;
  createdAt: Date;
  studyPlans: StudyPlan[];
  performance: PerformanceData[];
  preferences: StudentPreferences;
}

export interface StudentPreferences {
  dailyGoalMinutes: number;
  preferredStudyTime: "morning" | "afternoon" | "evening";
  notificationsEnabled: boolean;
  theme: "light" | "dark";
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "article" | "tool";
  url: string;
  fileSize?: number; // bytes
  downloadCount: number;
  relatedTopics: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  section: z.enum(["LR", "RC"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  stimulus: z.string(),
  answerChoices: z.array(
    z.object({
      letter: z.enum(["A", "B", "C", "D", "E"]),
      text: z.string(),
    })
  ),
  correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
  explanation: z.string(),
});

export const StudyProgressSchema = z.object({
  lessonsCompleted: z.number(),
  lessonsTotal: z.number(),
  questionsAnswered: z.number(),
  questionsCorrect: z.number(),
  accuracy: z.number(),
  hoursSpent: z.number(),
});

export const StudentPathSchema = z.object({
  type: z.enum([
    "LOGICAL_REASONING",
    "READING_COMPREHENSION",
    "FORMAL_LOGIC",
    "TEST_STRATEGY",
    "COMPREHENSIVE",
  ]),
  title: z.string(),
  description: z.string(),
});

export type QuestionType_Zod = z.infer<typeof QuestionSchema>;
export type StudyProgress_Zod = z.infer<typeof StudyProgressSchema>;
export type StudentPath_Zod = z.infer<typeof StudentPathSchema>;
