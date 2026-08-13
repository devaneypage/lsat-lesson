export const AUTHORING_STATUSES = ["draft", "submitted", "needs_revision", "approved", "rejected", "published"] as const;

export type AuthoringStatus = (typeof AUTHORING_STATUSES)[number];
export type ReviewDecision = "needs_revision" | "approved" | "rejected";

const transitions: Record<AuthoringStatus, readonly AuthoringStatus[]> = {
  draft: ["submitted"],
  submitted: ["needs_revision", "approved", "rejected"],
  needs_revision: ["draft", "submitted"],
  approved: ["published"],
  rejected: ["draft"],
  published: [],
};

export function canTransitionQuestionSubmission(from: AuthoringStatus, to: AuthoringStatus) {
  return transitions[from].includes(to);
}

export function requireReviewNotes(decision: ReviewDecision, notes?: string | null) {
  if (decision !== "approved" && !notes?.trim()) {
    throw new Error("Revision and rejection decisions require reviewer notes.");
  }
}

export function learnerQuestionKeyForSubmission(submissionKey: string) {
  return `nexus-original-${submissionKey.replace(/^submission-/, "")}`.slice(0, 64);
}

export function isLearnerVisibleSubmission(status: AuthoringStatus) {
  return status === "published";
}
