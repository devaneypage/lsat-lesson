import { z } from "zod";

/**
 * Session Plan Data Model
 * Defines the structure for individual tutoring session plans
 * with customizable activities, timing, and materials
 */

// Activity within a session plan
export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  materials: string[]; // list of material names needed
  notes?: string;
  type: "warmup" | "instruction" | "drill" | "practice" | "review" | "other";
}

// Material needed for a session
export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., "copies", "sets", "pages"
  notes?: string;
}

// Complete session plan
export interface SessionPlan {
  id: string;
  title: string;
  description?: string;
  duration: number; // total duration in minutes
  objectives: string[]; // learning objectives
  activities: Activity[];
  materials: Material[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas
export const ActivitySchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substr(2, 9)),
  name: z.string().min(1, "Activity name is required"),
  description: z.string().optional().default(""),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(480, "Duration cannot exceed 8 hours"),
  materials: z.array(z.string()).default([]),
  notes: z.string().optional(),
  type: z.enum(["warmup", "instruction", "drill", "practice", "review", "other"]).default("instruction"),
});

export const MaterialSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substr(2, 9)),
  name: z.string().min(1, "Material name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().optional().default(""),
  notes: z.string().optional(),
});

export const SessionPlanSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substr(2, 9)),
  title: z.string().min(1, "Session title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().optional().default(""),
  duration: z.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
  objectives: z.array(z.string().min(1)).min(1, "At least one objective is required"),
  activities: z.array(ActivitySchema).min(1, "At least one activity is required"),
  materials: z.array(MaterialSchema).default([]),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ActivityFormData = z.infer<typeof ActivitySchema>;
export type MaterialFormData = z.infer<typeof MaterialSchema>;
export type SessionPlanFormData = z.infer<typeof SessionPlanSchema>;

// Sample data for testing
export const SAMPLE_SESSION_PLAN: SessionPlan = {
  id: "sample-1",
  title: "Necessary Assumptions Deep Dive",
  description: "A comprehensive session on identifying necessary assumptions in LSAT arguments",
  duration: 60,
  objectives: [
    "Understand the definition of necessary assumptions",
    "Master the Negation Test™ methodology",
    "Identify assumptions in complex arguments",
    "Distinguish necessary from sufficient assumptions",
  ],
  activities: [
    {
      id: "activity-1",
      name: "Warm-up: Assumption Review",
      description: "Quick review of assumption types and definitions",
      duration: 5,
      materials: [],
      type: "warmup",
    },
    {
      id: "activity-2",
      name: "Instruction: The Negation Test™",
      description: "Teach the systematic Negation Test™ framework for identifying necessary assumptions",
      duration: 15,
      materials: ["Whiteboard", "Markers", "Handout: Negation Test™ Guide"],
      type: "instruction",
    },
    {
      id: "activity-3",
      name: "Guided Practice: Simple Arguments",
      description: "Work through 3-4 simple arguments together using the Negation Test™",
      duration: 15,
      materials: ["Practice Set A (3-4 questions)"],
      type: "practice",
    },
    {
      id: "activity-4",
      name: "Independent Drill: Complex Arguments",
      description: "Student works through 5-6 complex arguments independently",
      duration: 20,
      materials: ["Practice Set B (5-6 questions)", "Answer Key"],
      type: "drill",
    },
    {
      id: "activity-5",
      name: "Review & Q&A",
      description: "Review student performance, address misconceptions, answer questions",
      duration: 5,
      materials: [],
      type: "review",
    },
  ],
  materials: [
    {
      id: "material-1",
      name: "Whiteboard",
      quantity: 1,
      unit: "set",
      notes: "For live diagramming",
    },
    {
      id: "material-2",
      name: "Markers",
      quantity: 3,
      unit: "set",
      notes: "Multiple colors recommended",
    },
    {
      id: "material-3",
      name: "Handout: Negation Test™ Guide",
      quantity: 1,
      unit: "copy",
      notes: "One per student",
    },
    {
      id: "material-4",
      name: "Practice Set A (3-4 questions)",
      quantity: 1,
      unit: "set",
    },
    {
      id: "material-5",
      name: "Practice Set B (5-6 questions)",
      quantity: 1,
      unit: "set",
    },
    {
      id: "material-6",
      name: "Answer Key",
      quantity: 1,
      unit: "copy",
    },
  ],
  notes: "Ensure student has mastered basic argument structure before this session. Have backup questions ready if student progresses quickly.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Activity type labels for UI
export const ACTIVITY_TYPE_LABELS: Record<Activity["type"], string> = {
  warmup: "Warm-up",
  instruction: "Instruction",
  drill: "Drill",
  practice: "Practice",
  review: "Review",
  other: "Other",
};

// Activity type colors for UI
export const ACTIVITY_TYPE_COLORS: Record<Activity["type"], string> = {
  warmup: "#FFD700",
  instruction: "#3366FF",
  drill: "#FF6B35",
  practice: "#46E291",
  review: "#9D4EDD",
  other: "#999999",
};
