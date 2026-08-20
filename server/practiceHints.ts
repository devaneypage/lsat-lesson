import { invokeLLM } from "./_core/llm";

export type PracticeHintContext = {
  category: string | null;
  questionText: string;
};

const DISCLOSURE_PATTERN = /\b(correct\s+(?:answer|option|choice)|answer\s*(?:is|:)|option\s*[A-E]\b|choice\s*[A-E]\b|[A-E]\s+(?:is\s+)?(?:correct|right)|the\s+(?:right|best)\s+(?:answer|choice)|select\s+(?:[A-E]|the\s+option))\b/i;

export function buildPracticeHintMessages(context: PracticeHintContext) {
  return [
    {
      role: "system" as const,
      content: "You are a precise LSAT tutor offering one brief Socratic hint before a learner submits an answer. Never reveal, identify, rank, name, quote, or paraphrase any answer choice. Never state the credited answer, the full explanation, a complete argument analysis, or a solution path. Do not use answer-letter labels. Give exactly one or two sentences that direct attention to a relevant reasoning task, distinction, or passage feature. If an answer-safe hint is not possible, say only: Focus on the conclusion and the evidence offered for it.",
    },
    {
      role: "user" as const,
      content: `Question type: ${context.category ?? "LSAT practice"}\n\nQuestion stem:\n${context.questionText}\n\nReturn one answer-safe contextual hint only.`,
    },
  ];
}

export function sanitizePracticeHint(content: string) {
  const hint = content.replace(/\s+/g, " ").trim().slice(0, 420);
  if (hint.length < 12 || DISCLOSURE_PATTERN.test(hint)) return null;
  return hint;
}

export async function generatePracticeHint(context: PracticeHintContext) {
  const response = await invokeLLM({
    messages: buildPracticeHintMessages(context),
    maxTokens: 180,
  });
  const content = response.choices?.[0]?.message?.content;
  const hint = sanitizePracticeHint(typeof content === "string" ? content : "");
  if (!hint) throw new Error("AI returned an answer-revealing or empty hint.");
  return hint;
}
