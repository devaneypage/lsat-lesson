export const SAMPLE_LOGICAL_REASONING_SOURCE = "LSAT Nexus Original Sample Set";

export type LogicalReasoningSampleQuestion = {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
};

/**
 * Original LSAT-style items written specifically for the initial Question Bank
 * sample set. These are not official LSAC questions and are safe to seed
 * idempotently by their stable `questionId` values.
 */
export const SAMPLE_LOGICAL_REASONING_QUESTIONS: LogicalReasoningSampleQuestion[] = [
  {
    questionId: "nexus-lr-sample-001",
    category: "Necessary Assumption",
    difficulty: "easy",
    questionText:
      "A transit authority plans to replace cash fare boxes with contactless card readers. The authority predicts that the replacement will reduce average passenger boarding times because the new readers process a card payment more quickly than the current cash fare boxes process a cash payment. The authority's prediction depends on which one of the following assumptions?",
    optionA:
      "At least some passengers who use the transit system currently pay their fares with cash.",
    optionB:
      "Most passengers prefer using a contactless card to using cash when both payment methods are available.",
    optionC:
      "The transit authority can install the new card readers without increasing ticket prices.",
    optionD:
      "Other transit systems that use contactless card readers have shorter routes than this transit authority does.",
    optionE:
      "The new card readers will remain functional in all types of weather.",
    correctAnswer: "A",
    explanation:
      "The claimed time savings arise from replacing cash processing with faster card processing. If no passenger currently paid with cash, the stated difference in processing speed could not reduce average boarding time. Choices B through E may be desirable, but the prediction does not require them.",
  },
  {
    questionId: "nexus-lr-sample-002",
    category: "Sufficient Assumption",
    difficulty: "easy",
    questionText:
      "Every organization that discharges industrial waste into Lake Rutledge is required to submit a monthly emissions report. The North Shore Paper Mill discharges industrial waste into Lake Rutledge. Which one of the following, if assumed, enables the conclusion that the North Shore Paper Mill is required to submit a monthly emissions report to be properly drawn?",
    optionA:
      "The North Shore Paper Mill is an organization.",
    optionB:
      "The North Shore Paper Mill employs more than fifty workers.",
    optionC:
      "Most organizations that submit monthly emissions reports discharge industrial waste into a lake.",
    optionD:
      "Lake Rutledge is the largest lake in the county.",
    optionE:
      "The North Shore Paper Mill has submitted emissions reports in previous years.",
    correctAnswer: "A",
    explanation:
      "The rule applies to organizations that discharge industrial waste into Lake Rutledge. We are told that the mill discharges into the lake, so adding that it is an organization completes the sufficient condition for the reporting requirement.",
  },
  {
    questionId: "nexus-lr-sample-003",
    category: "Flaw in Reasoning",
    difficulty: "medium",
    questionText:
      "A food critic argues that the Culinary Institute's advanced program produces award-winning chefs. As evidence, the critic notes that three chefs who recently received prestigious restaurant awards all completed the program. The critic's reasoning is most vulnerable to criticism on the grounds that it",
    optionA:
      "takes for granted that a factor shared by several successful chefs caused their success.",
    optionB:
      "fails to distinguish between chefs who manage restaurants and chefs who own restaurants.",
    optionC:
      "presumes, without providing evidence, that restaurant awards are given every year.",
    optionD:
      "bases a generalization about restaurant awards on an insufficiently large group of awards.",
    optionE:
      "concludes that a program is popular merely because several people have completed it.",
    correctAnswer: "A",
    explanation:
      "The evidence establishes only that the three award recipients completed the program. It does not establish that completing the program caused their awards; other training, experience, or selection factors could explain the association.",
  },
  {
    questionId: "nexus-lr-sample-004",
    category: "Strengthen",
    difficulty: "medium",
    questionText:
      "A college health office is considering shifting routine appointments to a virtual format. Its director concludes that students will attend more appointments if the shift occurs, because students would no longer need to travel across campus. Which one of the following, if true, most strengthens the director's conclusion?",
    optionA:
      "Students who have missed routine appointments most often cite travel time across campus as a reason for missing them.",
    optionB:
      "The health office has enough staff members to provide appointments both in person and virtually.",
    optionC:
      "Several other departments at the college already use virtual meetings.",
    optionD:
      "Some students prefer to discuss health concerns with a provider in person.",
    optionE:
      "The health office's current appointment reminder messages are sent by email.",
    correctAnswer: "A",
    explanation:
      "The conclusion predicts improved attendance because virtual visits eliminate travel. Evidence that travel is a leading cause of missed appointments directly links the proposed change to the desired result.",
  },
  {
    questionId: "nexus-lr-sample-005",
    category: "Must Be True",
    difficulty: "hard",
    questionText:
      "Every student who works as a research assistant is a second-year student. Some student who contributes articles to the university journal works as a research assistant. No first-year student contributes articles to the university journal. If the statements above are true, which one of the following must also be true?",
    optionA:
      "Some contributor to the university journal is a second-year student.",
    optionB:
      "Every second-year student contributes articles to the university journal.",
    optionC:
      "No third-year student works as a research assistant.",
    optionD:
      "Every contributor to the university journal works as a research assistant.",
    optionE:
      "Some first-year student works as a research assistant.",
    correctAnswer: "A",
    explanation:
      "At least one journal contributor is a research assistant, and every research assistant is a second-year student. Therefore, at least one journal contributor is a second-year student. The other choices make claims that are not entailed by the statements.",
  },
];

export function validateSampleLogicalReasoningQuestions(
  questions: LogicalReasoningSampleQuestion[] = SAMPLE_LOGICAL_REASONING_QUESTIONS,
): void {
  if (questions.length !== 5) {
    throw new Error("The initial Logical Reasoning sample set must contain exactly five questions.");
  }

  const ids = new Set(questions.map((question) => question.questionId));
  if (ids.size !== questions.length) {
    throw new Error("Sample Logical Reasoning question IDs must be unique.");
  }

  for (const question of questions) {
    const choices = [question.optionA, question.optionB, question.optionC, question.optionD, question.optionE];
    if (choices.some((choice) => !choice.trim())) {
      throw new Error(`Sample question ${question.questionId} must contain five non-empty answer choices.`);
    }
    if (!choices[question.correctAnswer.charCodeAt(0) - 65]) {
      throw new Error(`Sample question ${question.questionId} has an invalid correct answer.`);
    }
  }
}
