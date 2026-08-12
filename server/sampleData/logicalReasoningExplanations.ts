import type { AnswerLetter } from "../../shared/practiceEvidence";

type SampleExplanation = {
  reasoningStrategy: string;
  answerAnalysis: Record<AnswerLetter, string>;
};

export const SAMPLE_LOGICAL_REASONING_EXPLANATIONS: Record<string, SampleExplanation> = {
  "nexus-lr-sample-001": {
    reasoningStrategy: "For a necessary-assumption question, negate each choice. If negating it makes the conclusion fail, that choice is necessary. Here, negate A: no passengers pay cash. Then faster card processing cannot reduce average boarding time.",
    answerAnalysis: {
      A: "Correct. The prediction needs some current cash payments to replace; otherwise the proposed replacement has no source of time savings.",
      B: "Not necessary. Some riders could prefer cash and the plan could still reduce average boarding time if cash users switch or are accommodated differently.",
      C: "Irrelevant. Ticket prices do not determine whether faster processing reduces boarding time.",
      D: "Irrelevant comparison. Other systems' route lengths tell us nothing about the authority's payment-processing time.",
      E: "Too strong and not required. The prediction is about average boarding time, not uninterrupted operation in every possible weather condition.",
    },
  },
  "nexus-lr-sample-002": {
    reasoningStrategy: "For a sufficient-assumption question, identify the gap between the stated facts and the rule. The rule applies to organizations that discharge into Lake Rutledge; the fact gives discharge but not organizational status.",
    answerAnalysis: {
      A: "Correct. Adding organizational status satisfies every part of the rule's sufficient condition, so the reporting requirement follows.",
      B: "Irrelevant. Workforce size is not part of the reporting rule.",
      C: "Reverses the rule's direction. The rule does not say every reporter discharges into Lake Rutledge.",
      D: "Irrelevant. Lake size does not affect the stated requirement.",
      E: "Irrelevant history. Earlier reports do not establish why a current reporting duty applies.",
    },
  },
  "nexus-lr-sample-003": {
    reasoningStrategy: "Separate correlation from causation. The evidence shows that award-winning chefs completed the program; it does not establish that the program produced the awards.",
    answerAnalysis: {
      A: "Correct. The critic treats a shared background factor as the cause of success without eliminating alternative explanations.",
      B: "Irrelevant distinction. Restaurant management versus ownership is not part of the argument.",
      C: "Irrelevant. The argument needs only the cited awards, not evidence that awards occur every year.",
      D: "Misdescribes the flaw. The problem is causal inference, not a generalization about the awards themselves.",
      E: "Misdescribes the conclusion. The critic never concludes that the program is popular.",
    },
  },
  "nexus-lr-sample-004": {
    reasoningStrategy: "Strengthen by linking the proposal's mechanism to the desired outcome. The director claims virtual appointments will improve attendance because they remove travel time.",
    answerAnalysis: {
      A: "Correct. It identifies travel time as a real cause of missed appointments, directly strengthening the proposed causal link.",
      B: "Useful operationally, but it does not show that virtual visits will increase attendance.",
      C: "Weakly relevant at most. Other departments' meeting formats do not establish why health-office attendance will change.",
      D: "Tends to weaken by suggesting some students may avoid a virtual alternative.",
      E: "Irrelevant. The reminder channel does not establish whether eliminating travel improves attendance.",
    },
  },
  "nexus-lr-sample-005": {
    reasoningStrategy: "Chain the quantifiers precisely. Some contributor is a research assistant, and every research assistant is a second-year student. Therefore, that some contributor is a second-year student.",
    answerAnalysis: {
      A: "Correct. The existential contributor inherits second-year status through the universal research-assistant rule.",
      B: "Too broad. Nothing says every second-year student contributes to the journal.",
      C: "Unsupported. The premises never limit research assistants to only second-year students by excluding third-year students; they simply state every research assistant is second-year.",
      D: "Reverses the stated relationship. We know some contributor is an assistant, not that every contributor is one.",
      E: "Contradicts the first premise if that student is a research assistant, since research assistants are second-year students.",
    },
  },
};

export function getSampleLogicalReasoningExplanation(questionKey: string) {
  return SAMPLE_LOGICAL_REASONING_EXPLANATIONS[questionKey] ?? null;
}
