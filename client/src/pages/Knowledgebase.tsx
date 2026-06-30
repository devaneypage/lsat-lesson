/**
 * Knowledgebase — Searchable LSAT concept reference for tutors and students.
 * Organized by category: Question Types, Flaw Types, RC Strategies, Formal Logic.
 * Each entry has a summary, detailed explanation, examples, and a link to practice questions.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  Layers,
  GitBranch,
  Target,
  Zap,
  FileText,
  Brain,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category =
  | "Question Types"
  | "Flaw Types"
  | "RC Strategies"
  | "Formal Logic"
  | "Core Concepts";

interface KBEntry {
  id: string;
  title: string;
  category: Category;
  summary: string;
  detail: string;
  tips: string[];
  example?: string;
  questionBankFilter?: string; // category value to filter question bank by
}

// ─── Content ──────────────────────────────────────────────────────────────────

const ENTRIES: KBEntry[] = [
  // ── Core Concepts ──────────────────────────────────────────────────────────
  {
    id: "argument-core",
    title: "Argument Core",
    category: "Core Concepts",
    summary: "The essential logical skeleton of an LSAT argument: conclusion + supporting premise(s).",
    detail:
      "Every LSAT Logical Reasoning argument has an argument core — the stripped-down logical relationship between the evidence (premises) and the claim being supported (conclusion). Peripheral information like background context, opposing viewpoints mentioned only to be dismissed, and rhetorical filler does not belong to the argument core. Identifying the core precisely is the prerequisite for every LR question type.",
    tips: [
      "Use conclusion keywords (therefore, thus, so, hence, consequently) to pinpoint the conclusion.",
      "Once you have the conclusion, ask: 'What evidence is provided to support this claim?' Those are your premises.",
      "Subsidiary conclusions act as both conclusion (relative to premises below) and premise (relative to the main conclusion above).",
      "Everything that is NOT conclusion or premise is peripheral — don't let it distract you.",
    ],
    example:
      "All politicians distort the truth. Smith is a politician. Therefore, Smith distorts the truth.\n\nCore: Premises → All politicians distort the truth + Smith is a politician. Conclusion → Smith distorts the truth.",
  },
  {
    id: "conditional-logic",
    title: "Conditional Reasoning",
    category: "Core Concepts",
    summary: "If-then logic: sufficient conditions trigger necessary conditions. Mastering contrapositives is essential.",
    detail:
      "A conditional statement takes the form 'If A then B' (A → B), where A is the sufficient condition and B is the necessary condition. The contrapositive (~B → ~A) is logically equivalent. The two common invalid inferences are: Affirming the Consequent (B → A) and Denying the Antecedent (~A → ~B). Many LSAT flaw and assumption questions hinge on misusing conditional logic.",
    tips: [
      "Sufficient condition indicators: if, when, whenever, all, every, any, people who.",
      "Necessary condition indicators: only if, must, requires, only, unless (negate and make sufficient).",
      "'Unless' translates to: ~(unless-term) → (rest of sentence). Equivalently: negate the unless-clause and make it the sufficient condition.",
      "Always take the contrapositive: if A → B, then ~B → ~A.",
      "Never affirm the consequent or deny the antecedent — these are invalid inferences.",
    ],
    example:
      "If it rains, the ground gets wet.\nValid: Ground not wet → Did not rain (contrapositive).\nInvalid: Ground is wet → It rained (affirming the consequent).",
    questionBankFilter: "Conditional Reasoning",
  },
  {
    id: "correlation-causation",
    title: "Correlation vs. Causation",
    category: "Core Concepts",
    summary: "Two events occurring together does not prove one caused the other — a foundational LSAT principle.",
    detail:
      "The LSAT frequently presents arguments that infer a causal relationship from a mere correlation. When A and B co-occur, five alternative explanations exist: (1) A causes B, (2) B causes A, (3) a third factor C causes both, (4) the correlation is coincidental, (5) the data is biased or measured incorrectly. Causal flaw questions ask you to identify when an argument wrongly jumps from correlation to causation.",
    tips: [
      "Look for language like 'leads to,' 'results in,' 'is responsible for,' 'causes' — these signal causal claims.",
      "Strengthen a causal argument by ruling out alternative causes or showing directionality.",
      "Weaken it by providing an alternative cause or reversing the direction.",
      "Necessary Assumption questions about causal arguments often require ruling out reverse causation or a third common cause.",
    ],
    questionBankFilter: "Causal Flaw",
  },

  // ── Question Types ─────────────────────────────────────────────────────────
  {
    id: "necessary-assumption",
    title: "Necessary Assumption",
    category: "Question Types",
    summary: "Identify the unstated premise the argument MUST rely on to hold together.",
    detail:
      "A Necessary Assumption (NA) is an unstated premise without which the argument falls apart. The Negation Test is the definitive method: negate the answer choice — if the negated version destroys the argument, the choice is a necessary assumption. NA answers do NOT need to make the argument airtight; they just need to be required. Watch for answer choices that go beyond what is logically required — these are classic traps.",
    tips: [
      "Apply the Negation Test: negate each answer choice. If negating it kills the argument, it's the NA.",
      "The correct NA is required but may not be sufficient — it holds the argument together without proving it.",
      "Wrong answers often: state something too strong (the argument doesn't need this much), state something already established in the premises, or are irrelevant.",
      "Common NA patterns: bridging a gap between the evidence and the conclusion, ruling out an alternative explanation.",
    ],
    questionBankFilter: "Necessary Assumption",
  },
  {
    id: "sufficient-assumption",
    title: "Sufficient Assumption",
    category: "Question Types",
    summary: "Find the premise that, if added, would GUARANTEE the conclusion is true.",
    detail:
      "A Sufficient Assumption (SA) question asks for a premise that makes the conclusion logically inescapable. Unlike NA questions, the correct answer often provides more than is strictly needed — it guarantees the conclusion. The Conditional Bridge Method is useful: identify what the premises establish, identify what the conclusion requires, then find the answer that builds the logical bridge. SA answers typically form valid deductive arguments when added to the premises.",
    tips: [
      "The correct SA, combined with the premises, must make the conclusion 100% certain.",
      "Look for an answer that bridges the gap between the evidence and conclusion using conditional or universal language.",
      "Wrong answers often merely strengthen (but don't guarantee) the conclusion.",
      "SA correct answers tend to be stronger / more absolute than NA correct answers.",
    ],
    questionBankFilter: "Sufficient Assumption",
  },
  {
    id: "strengthen",
    title: "Strengthen",
    category: "Question Types",
    summary: "Select the answer that provides the most additional support for the argument's conclusion.",
    detail:
      "Strengthen questions ask you to find new information that makes the conclusion more likely to be true. You are not proving the conclusion — you are nudging the probability upward. The correct answer frequently: supports a key premise, rules out an alternative explanation, establishes a causal link, or closes a gap in the reasoning. Always ask: 'Does this make the conclusion more likely?' rather than 'Does this prove the conclusion?'",
    tips: [
      "Wrong answers often strengthen only a premise (not the conclusion), or are irrelevant to the specific gap in the argument.",
      "The most powerful strengtheners rule out the most damaging alternative explanations.",
      "Consider what would weaken the argument, then look for an answer that does the opposite.",
      "Scope matters: the strengthener must be relevant to the conclusion as stated.",
    ],
    questionBankFilter: "Strengthen",
  },
  {
    id: "weaken",
    title: "Weaken",
    category: "Question Types",
    summary: "Find new information that makes the argument's conclusion less likely to be true.",
    detail:
      "Weaken questions are the mirror of Strengthen. You are finding information that, if true, reduces the probability that the conclusion follows from the premises. Common weakeners: provide an alternative cause, undermine a key premise, show the evidence doesn't apply to the specific situation, or reveal a flaw in the reasoning. Remember: you don't need to destroy the argument — just damage it.",
    tips: [
      "The correct answer must be inconsistent with (or damaging to) the argument as presented.",
      "A classic weakener for causal arguments is an alternative cause.",
      "A classic weakener for surveys/studies is that the sample was unrepresentative.",
      "Pre-phrase what would hurt the argument before looking at answer choices.",
    ],
    questionBankFilter: "Weaken",
  },
  {
    id: "main-point",
    title: "Main Point",
    category: "Question Types",
    summary: "Identify the primary conclusion the author is trying to establish in the stimulus.",
    detail:
      "Main Point (MP) questions ask you to identify the main conclusion — the 'so what?' of the argument. The correct answer must capture the conclusion precisely: not broader, not narrower, not merely a premise. Subsidiary conclusions are common traps because they look like conclusions but actually serve as evidence for the main conclusion. The 'therefore test': a statement is the conclusion if 'therefore [statement]' is supported by everything else.",
    tips: [
      "Look for conclusion keywords: therefore, thus, so, hence, consequently, clearly, this shows that.",
      "Check whether the candidate conclusion is supported by other statements, or whether it supports them.",
      "If two statements could be conclusions, ask which one is the main point the other is used to prove.",
      "Wrong answers often: are too broad, too narrow, state a premise as the conclusion, or restate only background context.",
    ],
    questionBankFilter: "Main Point",
  },
  {
    id: "flaw",
    title: "Flaw in the Reasoning",
    category: "Question Types",
    summary: "Identify and name the logical error the argument commits.",
    detail:
      "Flaw questions ask you to characterize the logical mistake the argument makes. The correct answer will describe the flaw in abstract terms ('the argument assumes that…', 'the argument mistakes…'). You need to both identify the flaw and match it to the abstract description in the answer choice. Common flaw types include: causal fallacy, circular reasoning, ad hominem, false dichotomy, sampling error, scope shift, and more.",
    tips: [
      "Pre-phrase the flaw in your own words before reading the choices.",
      "The correct answer will characterize the flaw abstractly (not repeat the argument's specific language).",
      "Eliminate answers describing flaws the argument does NOT commit, even if they describe a real flaw.",
      "Watch for: answers that correctly identify a flaw but exaggerate its severity, or are too vague to be meaningful.",
    ],
    questionBankFilter: "Flaw",
  },
  {
    id: "point-at-issue",
    title: "Point at Issue",
    category: "Question Types",
    summary: "Find the specific claim that Speaker A and Speaker B explicitly disagree about.",
    detail:
      "Point at Issue (PAI) questions present two speakers and ask what they disagree about. The correct answer must satisfy both conditions: Speaker A would answer the question one way (yes/no or agree/disagree), AND Speaker B would answer the opposite way. This is a strict two-prong test. Wrong answers often: state something only one speaker addresses, state something both agree on, or go beyond what either speaker explicitly argues.",
    tips: [
      "Apply the Disagreement Test: would A say yes and B say no (or vice versa) to this claim?",
      "Both speakers must take clear, opposing positions on the correct answer — not just different topics.",
      "If a speaker is silent on a claim, that claim cannot be the point of issue.",
      "Focus on what each speaker explicitly states, not what could be inferred.",
    ],
    questionBankFilter: "Point at Issue",
  },
  {
    id: "method-of-argument",
    title: "Method of Argument",
    category: "Question Types",
    summary: "Describe the argumentative technique or logical structure the author uses.",
    detail:
      "Method of Argument questions ask you to identify HOW the author argues, not what the argument concludes. Correct answers describe the argument's structure in abstract terms (e.g., 'cites a counterexample to refute a generalization,' 'draws an analogy,' 'assumes what it sets out to prove'). You need strong structural comprehension of the argument before reading the answer choices.",
    tips: [
      "Map the structure: what moves does the author make? (Example, counterexample, analogy, appeal to authority, etc.)",
      "Correct answers are abstract and would accurately describe many arguments with the same structure.",
      "Wrong answers often misdescribe the structure or attribute a method the argument doesn't use.",
      "Practice recognizing: reductio ad absurdum, analogy, appeal to authority, counterexample, necessary vs. sufficient.",
    ],
    questionBankFilter: "Method of Argument",
  },
  {
    id: "resolve-paradox",
    title: "Resolve the Paradox",
    category: "Question Types",
    summary: "Find information that explains how two seemingly contradictory facts can both be true.",
    detail:
      "Paradox (or Resolve/Explain) questions present two facts that appear contradictory and ask you to find an answer that makes both facts true simultaneously. The correct answer does NOT favor one fact over the other — it reconciles both. Common wrong answer types: explain only one of the two facts, make the paradox worse, or are irrelevant to either fact.",
    tips: [
      "Identify the two contradictory facts precisely before reading answer choices.",
      "The correct answer must allow BOTH facts to be true at the same time.",
      "Answers that explain only one fact are the most common trap.",
      "Ask: 'Does this explain why X occurs despite Y?' or 'Does this make both compatible?'",
    ],
    questionBankFilter: "Resolve the Paradox",
  },
  {
    id: "inference",
    title: "Inference / Must Be True",
    category: "Question Types",
    summary: "Identify what MUST be true given the statements in the stimulus — no more, no less.",
    detail:
      "Inference questions (Must Be True, Most Strongly Supported, Cannot Be True) ask what can be validly concluded from the stimulus. Unlike other LR questions, there is no 'argument' with a flaw — you simply draw valid logical conclusions from the facts given. 'Must Be True' means the inference is certain given the stimulus. 'Most Strongly Supported' means it is most strongly implied (but might not be certain). 'Cannot Be True' means it contradicts the stimulus.",
    tips: [
      "Stay close to the stimulus — correct answers follow directly from the stated information.",
      "Beware of answers that are probably true but not guaranteed by the stimulus.",
      "For Must Be True: if there is any possible scenario where the stimulus is true but the answer is false, eliminate it.",
      "For Cannot Be True: if there is any possible scenario where both the stimulus and the answer are true, eliminate it.",
    ],
    questionBankFilter: "Inference",
  },
  {
    id: "parallel-reasoning",
    title: "Parallel Reasoning",
    category: "Question Types",
    summary: "Find the answer whose argument structure exactly mirrors the structure of the stimulus argument.",
    detail:
      "Parallel Reasoning questions ask you to find an answer choice whose logical structure is identical to the stimulus — same argument form, same validity/invalidity status, same relationship between premises and conclusion. Content is irrelevant; structure is everything. Diagram the stimulus argument abstractly (using letters or variables) and find the answer that maps to the same structure.",
    tips: [
      "Abstract the stimulus to its logical form: All A are B. C is A. Therefore C is B.",
      "Match: validity/invalidity, number of premises, conclusion type, quantifiers (all/some/no).",
      "Wrong answers often have the right topic but a different structure.",
      "For Parallel Flaw questions: ensure the flaw type is identical, not just similar.",
    ],
    questionBankFilter: "Parallel Reasoning",
  },
  {
    id: "role-of-statement",
    title: "Role of Statement",
    category: "Question Types",
    summary: "Determine the logical function a specific statement plays within the overall argument.",
    detail:
      "Role of Statement (ROS) questions identify the function of a bolded or quoted statement within the stimulus: is it the main conclusion, a premise, a subsidiary conclusion, background context, an opposing viewpoint, or a concession? Understanding the structural role of each statement is essential. ROS questions require complete argument mapping before you can select an answer.",
    tips: [
      "Map the entire argument first: conclusion, premises, subsidiary conclusions, background.",
      "Ask: does this statement support something else, or is it being supported by something else?",
      "Subsidiary conclusions are both supported (by lower premises) and supporting (the main conclusion).",
      "Background and context statements don't directly support the conclusion — they set the stage.",
    ],
    questionBankFilter: "Role of Statement",
  },
  {
    id: "supporting-principle",
    title: "Supporting Principle",
    category: "Question Types",
    summary: "Find a general rule or principle that justifies the specific judgment made in the argument.",
    detail:
      "Supporting Principle questions ask you to find a general rule that, when applied to the specific situation in the stimulus, justifies or supports the conclusion. These are similar to Sufficient Assumption questions but framed as general principles ('A person should always X if Y'). The correct answer is typically a universal or general rule, not a specific factual claim.",
    tips: [
      "The principle must be general enough to justify the specific case in the stimulus.",
      "Treat it like a Sufficient Assumption question: what rule, combined with the facts, guarantees the conclusion?",
      "Wrong answers often describe principles that are plausible but don't directly justify this specific conclusion.",
      "Check: does applying the principle to the facts in the stimulus yield the conclusion?",
    ],
    questionBankFilter: "Supporting Principle",
  },
  {
    id: "reasoning-conforms",
    title: "Reasoning Conforms To / Illustrates",
    category: "Question Types",
    summary: "Find the specific case that exemplifies a stated general principle or argument structure.",
    detail:
      "Reasoning Conforms To questions give you a general rule or principle and ask you to find which answer choice situation follows (instantiates) that principle. This is the reverse of Supporting Principle. You apply the general rule to each answer choice and determine which one the rule correctly governs. Abstract the principle into a logical form and test each answer.",
    tips: [
      "Abstract the principle: 'If condition X, then conclusion Y applies.'",
      "For each answer, ask: does X hold in this situation? If yes, does Y follow?",
      "The correct answer must both satisfy the antecedent conditions AND reach the conclusion the principle prescribes.",
      "Wrong answers often satisfy the antecedent but reach a different conclusion, or don't satisfy the antecedent at all.",
    ],
    questionBankFilter: "Reasoning Conforms To",
  },

  // ── Flaw Types ─────────────────────────────────────────────────────────────
  {
    id: "flaw-causal",
    title: "Causal Fallacy",
    category: "Flaw Types",
    summary: "The argument infers causation from correlation without ruling out alternative explanations.",
    detail:
      "The most common LSAT flaw. The argument sees that A and B co-occur and concludes A caused B, ignoring: reverse causation (B caused A), a common cause (C caused both), coincidence, or sampling bias. To identify: look for causal language in the conclusion ('leads to,' 'causes,' 'results in') based on correlational evidence ('studies show that X and Y occur together').",
    tips: [
      "Standard flaw description: 'The argument mistakes correlation for causation.'",
      "Or: 'The argument fails to consider that the relationship might be reversed.'",
      "Or: 'The argument overlooks a third factor that could explain both observations.'",
      "Strengthen by ruling out alternative causes; weaken by introducing one.",
    ],
    questionBankFilter: "Causal Flaw",
  },
  {
    id: "flaw-scope",
    title: "Scope Shift / Equivocation",
    category: "Flaw Types",
    summary: "The argument uses a key term in two different senses, or shifts the topic between evidence and conclusion.",
    detail:
      "Scope Shift occurs when the argument's conclusion is about something subtly or significantly different from what the premises establish. Equivocation is a specific form where the same word is used with different meanings. These are related but distinct: scope shift changes the topic; equivocation exploits lexical ambiguity in a single term.",
    tips: [
      "Flag whenever the conclusion introduces a new term not in the premises.",
      "Or when a term appears in both evidence and conclusion but could mean different things.",
      "Flaw description: 'The argument confuses [term meaning 1] with [term meaning 2].'",
      "Or: 'The argument's conclusion concerns X, but the evidence only establishes Y.'",
    ],
    questionBankFilter: "Scope Shift",
  },
  {
    id: "flaw-false-dichotomy",
    title: "False Dichotomy",
    category: "Flaw Types",
    summary: "The argument presents only two options as if they are the only possibilities, when more exist.",
    detail:
      "Also called a false dilemma. The argument assumes that if one option is ruled out, the other must be true — ignoring middle ground or third alternatives. Keywords: 'either…or,' 'if not X, then Y,' 'the only alternative.' This flaw is particularly common in arguments about policy choices or binary decisions.",
    tips: [
      "Flaw description: 'The argument assumes that there are only two possibilities when more may exist.'",
      "Weaken by introducing a third option the argument ignores.",
      "Necessary assumption: that no other options exist.",
      "The 'either/or' structure is the giveaway.",
    ],
    questionBankFilter: "False Dichotomy",
  },
  {
    id: "flaw-circular",
    title: "Circular Reasoning",
    category: "Flaw Types",
    summary: "The conclusion is assumed within the premises — the argument proves itself by using itself.",
    detail:
      "In circular reasoning (begging the question), the conclusion is effectively restated as a premise, often in different words. The argument has no independent logical support for its conclusion because the conclusion must already be accepted for the premises to hold. Circular arguments are technically valid (if premises are true, conclusion must be true) but are logically useless.",
    tips: [
      "Flaw description: 'The argument assumes what it is trying to prove.'",
      "Or: 'The argument's conclusion is presupposed in its premises.'",
      "Look for: arguments where premises only hold if the conclusion is already granted.",
      "Circular reasoning is rarely tested on the LSAT but worth recognizing.",
    ],
    questionBankFilter: "Circular Reasoning",
  },
  {
    id: "flaw-ad-hominem",
    title: "Ad Hominem",
    category: "Flaw Types",
    summary: "The argument attacks the person making a claim rather than the claim itself.",
    detail:
      "Ad hominem (Latin: 'to the person') occurs when an argument dismisses a position by attacking the character, motives, or credibility of the person who holds it, rather than engaging with the merits of the position. The LSAT form often looks like: 'X says Y, but X has a financial interest in Y being true, so Y is false.' Even if X has a bias, their claim could still be correct.",
    tips: [
      "Flaw description: 'The argument dismisses a claim by attacking the source rather than the substance.'",
      "Or: 'The argument rejects a position by questioning the motives of those who hold it.'",
      "Even a biased source can make a true claim — the argument must engage with the substance.",
      "Watch for: 'Of course he says X — he benefits from X being true!'",
    ],
    questionBankFilter: "Ad Hominem",
  },
  {
    id: "flaw-sampling",
    title: "Sampling / Unrepresentative Sample",
    category: "Flaw Types",
    summary: "The argument draws a general conclusion from a sample that is too small or biased.",
    detail:
      "Sampling flaws occur when an argument generalizes from a sample to a larger population, but the sample is not representative (biased, too small, or otherwise skewed). The conclusion overstates what the evidence warrants. This is common in arguments based on surveys, studies, or anecdotes.",
    tips: [
      "Flaw description: 'The argument generalizes from a sample that may not be representative of the whole.'",
      "Weaken by showing the sample is unrepresentative or too small.",
      "Necessary assumption: that the sample is representative of the population.",
      "Look for: 'a survey of X found…' followed by a sweeping general conclusion.",
    ],
    questionBankFilter: "Sampling Error",
  },
  {
    id: "flaw-analogy",
    title: "Faulty Analogy",
    category: "Flaw Types",
    summary: "Two cases are compared, but the relevant differences between them undermine the comparison.",
    detail:
      "An analogy argument claims that because A and B are similar in some ways, a conclusion that holds for A also holds for B. A faulty analogy overlooks relevant differences that make the two cases dissimilar in the way that matters for the conclusion. The LSAT expects you to identify what relevant difference undermines the comparison.",
    tips: [
      "Flaw description: 'The argument assumes that two situations are relevantly similar when they may differ in important ways.'",
      "Weaken by identifying the relevant difference between the two compared cases.",
      "Strengthen by ruling out the relevant differences.",
      "Look for comparisons between individuals and groups, or between different time periods or contexts.",
    ],
    questionBankFilter: "Faulty Analogy",
  },
  {
    id: "flaw-overlooked-possibilities",
    title: "Overlooked Possibilities",
    category: "Flaw Types",
    summary: "The argument ignores alternative explanations, causes, or outcomes that could equally explain the evidence.",
    detail:
      "This is the broadest flaw category — it captures any argument that ignores a relevant alternative. The argument sees one possible explanation or outcome and treats it as the only one. This overlaps with causal fallacy (overlooked alternative causes), false dichotomy (overlooked third options), and others. On the LSAT, this description often appears on flaw answer choices as a catch-all.",
    tips: [
      "Flaw description: 'The argument overlooks the possibility that…'",
      "Always ask: what alternatives exist that the argument ignores?",
      "This is the most common flaw description on the LSAT — be specific about which alternative is overlooked.",
      "Correct answers should name a specific alternative, not just say 'there might be other explanations.'",
    ],
    questionBankFilter: "Overlooked Possibilities",
  },
  {
    id: "flaw-appeal",
    title: "Inappropriate Appeal",
    category: "Flaw Types",
    summary: "The argument relies on an appeal to authority, popularity, tradition, or emotion as logical support.",
    detail:
      "Inappropriate appeals treat non-logical factors as logical justification. Appeal to Authority: 'Expert X says Y, therefore Y.' (valid only if X is genuinely an expert in the relevant domain). Appeal to Popularity: 'Most people believe X, so X is true.' Appeal to Tradition: 'We've always done it this way, so it must be right.' The LSAT primarily tests appeals to authority and popularity.",
    tips: [
      "For Appeal to Authority: the authority must be a genuine expert in the relevant field.",
      "For Appeal to Popularity: what's popular is not necessarily true.",
      "Flaw description: 'The argument assumes that [popular belief / expert opinion] is sufficient grounds for the conclusion.'",
      "These are weaker flaws — the argument might still have some merit. Focus on why the appeal is insufficient.",
    ],
    questionBankFilter: "Inappropriate Appeal",
  },

  // ── RC Strategies ──────────────────────────────────────────────────────────
  {
    id: "rc-passage-mapping",
    title: "RC Passage Mapping",
    category: "RC Strategies",
    summary: "Annotate the passage structure as you read — topic, scope, purpose, main point, author's view.",
    detail:
      "Effective passage mapping means tracking the author's argument, the rhetorical moves, and the structure of the passage as you read — not after. Mark: the topic (subject), scope (specific aspect of topic discussed), author's purpose (inform, argue, critique), main point (thesis), and key structural transitions. The goal is not to memorize content but to build a mental map so you can locate information quickly when answering questions.",
    tips: [
      "Topic → Scope → Purpose → Main Point: build this framework for every passage.",
      "Note the author's tone: neutral/informative vs. argumentative/critical.",
      "Mark structural transitions: 'however,' 'in contrast,' 'similarly,' 'therefore' reveal the passage's logic.",
      "Don't over-annotate — capture the structure, not every detail.",
    ],
  },
  {
    id: "rc-main-point",
    title: "RC Main Point Questions",
    category: "RC Strategies",
    summary: "Identify the author's primary thesis — the central claim the entire passage supports.",
    detail:
      "RC Main Point questions ask for the author's primary thesis. The correct answer captures the main point precisely — not a detail, not a supporting example, not just the topic. The main point typically appears in the first or last paragraph, but may be synthesized across the passage. Wrong answers often: capture only a detail, overstate the scope, understate the scope, or mischaracterize the author's position.",
    tips: [
      "Use your passage map: what is the author ultimately arguing or establishing?",
      "The correct answer must be supported by ALL major sections of the passage.",
      "Eliminate answers that are too narrow (only one paragraph's point) or too broad (beyond the passage's scope).",
      "Watch out for: answers that sound like the main point but include elements the author doesn't argue.",
    ],
  },
  {
    id: "rc-detail",
    title: "RC Detail Questions",
    category: "RC Strategies",
    summary: "Questions that ask about specific facts stated in the passage — locate-and-verify.",
    detail:
      "Detail (or Specific Reference) questions ask about something explicitly stated in the passage. The answer is in the text — your job is to locate it and verify the answer choice against the passage. Never rely on memory alone; always go back to the relevant section. Common wrong answer patterns: information present in the passage but used out of context, information that is the opposite of what the passage says, or plausible information not stated in the passage.",
    tips: [
      "Use your passage map to locate the relevant paragraph quickly.",
      "Read a few lines above and below the specific reference — context matters.",
      "Compare each answer choice directly against the passage text.",
      "The correct answer will be a paraphrase (not a verbatim copy) of something explicitly stated.",
    ],
  },
  {
    id: "rc-inference",
    title: "RC Inference Questions",
    category: "RC Strategies",
    summary: "Identify what can be most reasonably inferred from the passage — must be supported, not stated.",
    detail:
      "RC Inference questions ask what must be true (or is most strongly implied) based on the passage. The correct answer follows necessarily or very directly from what the passage states — it is not simply consistent with the passage, and it is not explicitly stated. The spectrum runs from Must Be True (very tight inference) to Most Strongly Supported (most directly implied). Stay close to the passage; correct answers rarely go far beyond what's stated.",
    tips: [
      "The inference must be supported by specific content in the passage.",
      "Avoid choosing answers that are plausible but not directly supported.",
      "If an answer requires you to add knowledge from outside the passage, eliminate it.",
      "Weigh the answers against the passage: which one the passage most directly supports?",
    ],
  },
  {
    id: "rc-author-attitude",
    title: "Author's Attitude / Tone",
    category: "RC Strategies",
    summary: "Determine the author's perspective, stance, or emotional register toward the topic.",
    detail:
      "Author Attitude questions ask how the author feels about the topic, a theory, a group of people, or an argument in the passage. Look for tone language: evaluative adjectives ('misguided,' 'compelling'), adverbs ('unfortunately,' 'surprisingly'), and the structure of the argument (is the author critiquing, defending, or neutrally presenting?). Many LSAT passages present multiple views — be clear about which view is the author's vs. a view the author is reporting.",
    tips: [
      "Distinguish: the view the author is reporting vs. the view the author holds.",
      "Tone descriptors in wrong answers are often too extreme (contemptuous, enthusiastic) or too neutral for a passage where the author clearly takes a side.",
      "Look for language that reveals judgment: 'the flawed assumption,' 'the compelling evidence,' 'surprisingly.'",
      "Many passages have a mixed tone — critical of one thing, supportive of another.",
    ],
  },
  {
    id: "rc-comparative",
    title: "Comparative RC Passages",
    category: "RC Strategies",
    summary: "Two shorter passages on related topics — identify where they agree, disagree, and differ in approach.",
    detail:
      "Comparative Passage sets present two shorter passages (Passage A and B) on the same topic but with different perspectives or emphases. Questions ask about: points of agreement, points of disagreement, how one author would react to the other's argument, shared assumptions, and differences in scope or method. Treat each passage individually first, then compare. Build a comparison matrix: same topic? Agree/disagree on X? Different methodology? Different conclusions?",
    tips: [
      "Read Passage A fully first, then Passage B — build a two-column comparison.",
      "For agreement questions: both authors must explicitly support the claim (not just fail to contradict it).",
      "For disagreement questions: both authors must explicitly take opposing positions.",
      "For 'how would A respond to B' questions: apply A's argument or principle to B's claim.",
    ],
  },

  // ── Formal Logic ──────────────────────────────────────────────────────────
  {
    id: "fl-contrapositive",
    title: "Contrapositive",
    category: "Formal Logic",
    summary: "The logically equivalent form of a conditional: if A → B, then ~B → ~A.",
    detail:
      "The contrapositive is the logically equivalent reverse-and-negate of a conditional statement. If 'All A are B' (A → B), then the contrapositive is 'All non-B are non-A' (~B → ~A). The two are logically equivalent — they carry exactly the same information. Mastering the contrapositive is foundational to diagramming conditional chains, identifying flaws, and answering Sufficient Assumption questions.",
    tips: [
      "To form the contrapositive: (1) reverse the terms, (2) negate both terms.",
      "A → B becomes ~B → ~A. NOT 'B → A' (that's affirming the consequent).",
      "NOT '~A → ~B' (that's denying the antecedent).",
      "Chain contrapositives: A → B → C means ~C → ~B → ~A.",
    ],
  },
  {
    id: "fl-quantifiers",
    title: "Quantifiers: All, Some, No",
    category: "Formal Logic",
    summary: "Logical translation of the three primary quantifiers that drive inference chains on the LSAT.",
    detail:
      "All A are B: A → B (sufficient: being A; necessary: being B).\nSome A are B: At least one thing is both A and B. Does NOT imply all, most, or even many.\nNo A are B: A → ~B (if A then not B; equivalently, if B then not A).\nThe word 'most' means more than half; the word 'some' means at least one. These cannot be equated. 'Most A are B' does NOT imply 'most B are A' — this is a common trap.",
    tips: [
      "'All A are B' does NOT imply 'All B are A' (converse is not equivalent).",
      "'Some A are B' means 'at least one A is B' — could be just one, could be all.",
      "'No A are B' means 'A → ~B' and also 'B → ~A' (contrapositives of each other).",
      "Combining 'All A are B' and 'All B are C' gives 'All A are C' (transitive chain).",
    ],
  },
  {
    id: "fl-chain",
    title: "Conditional Chains",
    category: "Formal Logic",
    summary: "Stringing multiple conditional statements together to derive conclusions through transitivity.",
    detail:
      "When conditional statements share terms, they can be chained together. If A → B and B → C, then A → C. The contrapositive chain runs in reverse: ~C → ~B → ~A. Conditional chains are fundamental to Sufficient Assumption and Parallel Reasoning questions. Practice diagramming a set of conditions and deriving all possible valid inferences — without committing the invalid inferences (affirming the consequent, denying the antecedent).",
    tips: [
      "Always diagram the contrapositive alongside the original — both are valid.",
      "Look for a 'sufficient' term to trigger the chain from the left end.",
      "Look for a 'necessary' term failure to trigger the contrapositive chain from the right end.",
      "Do not chain through the invalid directions: B → A is never warranted from A → B alone.",
    ],
  },
  {
    id: "fl-biconditional",
    title: "Biconditional (If and Only If)",
    category: "Formal Logic",
    summary: "'A if and only if B' means A → B AND B → A — the relationship flows both ways.",
    detail:
      "A biconditional (A ↔ B, 'A if and only if B') says A and B always occur together — neither can exist without the other. This is the conjunction of A → B and B → A. On the LSAT, biconditionals most often appear in Logic Games (ordering and grouping rules) but also appear in LR conditional chains. Recognizing a biconditional prevents the mistake of treating 'if and only if' as a simple 'if...then.'",
    tips: [
      "'A if and only if B' = 'A → B' AND 'B → A'.",
      "Equivalently: A and B are always the same (both in or both out; both true or both false).",
      "Do not confuse with one-directional 'if': 'if A then B' only gives A → B, NOT B → A.",
      "The contrapositive of a biconditional is itself: ~A ↔ ~B.",
    ],
  },
];

// ─── Category Metadata ────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: "Core Concepts", icon: <Brain size={16} />, color: "indigo" },
  { label: "Question Types", icon: <Target size={16} />, color: "blue" },
  { label: "Flaw Types", icon: <AlertCircle size={16} />, color: "rose" },
  { label: "RC Strategies", icon: <FileText size={16} />, color: "emerald" },
  { label: "Formal Logic", icon: <GitBranch size={16} />, color: "violet" },
];

const CATEGORY_STYLES: Record<Category, string> = {
  "Core Concepts": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Question Types": "bg-blue-100 text-blue-800 border-blue-200",
  "Flaw Types": "bg-rose-100 text-rose-800 border-rose-200",
  "RC Strategies": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Formal Logic": "bg-violet-100 text-violet-800 border-violet-200",
};

const CATEGORY_ACCENT: Record<Category, string> = {
  "Core Concepts": "border-l-indigo-500",
  "Question Types": "border-l-blue-500",
  "Flaw Types": "border-l-rose-500",
  "RC Strategies": "border-l-emerald-500",
  "Formal Logic": "border-l-violet-500",
};

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: KBEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [, navigate] = useLocation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`border-l-4 ${CATEGORY_ACCENT[entry.category]} bg-white shadow-sm hover:shadow-md transition-shadow`}
      >
        {/* Header row */}
        <button
          className="w-full text-left px-5 py-4 flex items-start gap-3"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span className="mt-0.5 text-slate-400 flex-shrink-0">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 text-[15px] leading-snug">
                {entry.title}
              </h3>
              <Badge
                variant="outline"
                className={`text-[11px] px-2 py-0 border ${CATEGORY_STYLES[entry.category]}`}
              >
                {entry.category}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{entry.summary}</p>
          </div>
        </button>

        {/* Expanded detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                {/* Full explanation */}
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {entry.detail}
                </p>

                {/* Example */}
                {entry.example && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs mb-1.5">
                      <Lightbulb size={13} />
                      Example
                    </div>
                    <p className="text-sm text-amber-900 font-mono whitespace-pre-line leading-relaxed">
                      {entry.example}
                    </p>
                  </div>
                )}

                {/* Tips */}
                {entry.tips.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs mb-2">
                      <Zap size={13} />
                      Tutor Tips
                    </div>
                    <ul className="space-y-1.5">
                      {entry.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Link to Question Bank */}
                {entry.questionBankFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                    onClick={() =>
                      navigate(
                        `/question-bank?category=${encodeURIComponent(entry.questionBankFilter!)}`
                      )
                    }
                  >
                    <ExternalLink size={12} className="mr-1.5" />
                    Practice {entry.questionBankFilter} questions
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Knowledgebase() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ENTRIES.filter((e) => {
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const countByCategory = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    ENTRIES.forEach((e) => {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen size={24} />
            </div>
            <span className="text-indigo-200 text-sm font-medium tracking-wide uppercase">
              Database · Workspace
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-3">LSAT Knowledgebase</h1>
          <p className="text-indigo-200 text-base max-w-2xl leading-relaxed">
            Comprehensive reference for LSAT concepts, question types, flaw taxonomy, reading comprehension
            strategies, and formal logic rules. Search or browse by category.
          </p>
          <div className="mt-5 text-indigo-300 text-sm">
            {ENTRIES.length} entries across {CATEGORIES.length} categories
          </div>
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm px-6 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              placeholder="Search concepts, strategies, flaw types…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === "All"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({ENTRIES.length})
            </button>
            {CATEGORIES.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === label
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label} ({countByCategory[label] ?? 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Entries ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Layers size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-base">No entries match your search.</p>
            <button
              className="mt-3 text-sm text-indigo-500 hover:underline"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group by category when showing All */}
            {activeCategory === "All" ? (
              CATEGORIES.map(({ label }) => {
                const group = filtered.filter((e) => e.category === label);
                if (group.length === 0) return null;
                return (
                  <div key={label} className="mb-8">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      {CATEGORIES.find((c) => c.label === label)?.icon}
                      {label}
                    </h2>
                    <div className="space-y-3">
                      {group.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-3">
                {filtered.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
