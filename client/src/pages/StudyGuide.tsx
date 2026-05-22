/**
 * Study Guide Page
 * Integrated study materials with curriculum, practice tiers, and progress tracking
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronRight,
  BarChart3,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface StudyModule {
  id: string;
  title: string;
  category: "LR" | "RC" | "Practice";
  description: string;
  drills: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  estimatedHours: number;
  keyTopics: string[];
}

interface StudyTier {
  tier: number;
  title: string;
  description: string;
  drills: string;
  difficulty: string;
  estimatedHours: number;
}

const LR_MODULES: StudyModule[] = [
  {
    id: "lr-0",
    title: "Introduction: Lexicon & Approach",
    category: "LR",
    description: "Build the foundational vocabulary and four-step systematic approach for tackling every Logical Reasoning question. Learn to identify question types, untangle stimuli, predict answers, and evaluate choices.",
    drills: "Overview — no practice questions",
    difficulty: "Foundational",
    estimatedHours: 3,
    keyTopics: ["Argument Core", "Four-step LR method", "Question type identification", "Predict before evaluating", "Logical indicators"],
  },
  {
    id: "lr-1",
    title: "Introduction to Argument-Based Questions",
    category: "LR",
    description: "Master the two core components of every LSAT argument: the conclusion and the evidence. Learn to use conclusion keywords, identify subsidiary conclusions, and distinguish the argument core from peripheral information. Covers the full taxonomy of objective question types (Main Point, Role of Statement, Method of Argument, Point at Issue, Parallel Reasoning) and subjective types (Assumption, Flaw, Strengthen, Weaken). Includes the foundational four-step LR method.",
    drills: "LR_1 Lesson + Practice (15 questions)",
    difficulty: "Foundational",
    estimatedHours: 5,
    keyTopics: ["Conclusion vs. evidence", "Conclusion keywords", "Subsidiary conclusions", "Argument core", "Peripheral information", "Objective vs. Subjective question types", "Four-step LR method"],
  },
  {
    id: "anatomy-lr",
    title: "Anatomy of an LR Argument",
    category: "LR",
    description: "Master the core components of an LSAT argument: main conclusion, premises, intermediate conclusions, and peripheral information. Learn to identify opposing viewpoints, concessions, and background information, and distinguish core from non-core elements. Understand how the same argument can be approached from eight different question-type angles (Main Point, Flaw, Assumption, Strengthen, Weaken, Sufficient Assumption, Necessary Assumption, Parallel Reasoning).",
    drills: "6 practice questions + LR_II_1 Arguments & Tasks overview",
    difficulty: "Foundational",
    estimatedHours: 4,
    keyTopics: ["Argument Core", "Main Conclusion", "Premise", "Intermediate Conclusion", "Peripheral Information", "Opposing Viewpoints", "Concession", "Background Information", "Correlation vs. Causation", "Eight Question-Type Tasks"],
  },
  {
    id: "conditional-diagramming-drill",
    title: "Conditional Reasoning: Diagramming Drill",
    category: "LR",
    description: "Build fluency in diagramming conditional statements and their contrapositives. Practice translating if-then, unless, only if, and all/no statements into formal logical notation. Master sufficient and necessary conditions through 30 targeted diagramming exercises.",
    drills: "30 diagramming exercises",
    difficulty: "Foundational",
    estimatedHours: 6,
    keyTopics: ["Conditional statements", "Sufficient condition", "Necessary condition", "Contrapositive", "Logical equivalence", "Unless statements", "Only if statements", "Indicator words"],
  },
  {
    id: "lr-process",
    title: "LR Method: The Four-Step Process",
    category: "LR",
    description: "Learn the systematic approach to every Logical Reasoning question: read, identify, preprepare, eliminate.",
    drills: "Drills 34–67",
    difficulty: "Intermediate",
    estimatedHours: 12,
    keyTopics: ["Reading strategy", "Question type identification", "Answer prephrasing", "Elimination technique"],
  },
  {
    id: "assumption-bridge",
    title: "Necessary Assumptions: Bridge & Defender",
    category: "LR",
    description: "Master the two types of necessary assumptions: bridge assumptions that connect premises to conclusions by introducing a new concept (e.g., polyphenols → prevent illness), and defender assumptions that protect the argument by eliminating potential objections. Learn to use the negation test to verify assumptions — if negating the answer destroys the argument, it is a necessary assumption. Practice with 33 questions from LR_II_3 (#24-41) and LR_II_5 (#42-54).",
    drills: "33 Necessary Assumption practice questions (LR_II_3 #24-41, LR_II_5 #42-54)",
    difficulty: "Intermediate",
    estimatedHours: 8,
    keyTopics: ["Bridge Assumptions", "Defender Assumptions", "Necessary Assumptions", "Negation Test", "Premise-to-Conclusion connection", "Objection elimination", "Overlooked Possibilities", "New Concepts in Conclusion"],
  },
  {
    id: "lr-sa",
    title: "Sufficient Assumptions",
    category: "LR",
    description: "Master sufficient assumption questions — those that ask 'which one of the following, if assumed, enables the argument's conclusion to be properly drawn?' The correct answer establishes the conclusion on the basis of the evidence; the four wrong answers will not. Practice distinguishing sufficient from necessary assumptions using the guided step-by-step method (Step 1: identify type → Step 2: analyze argument → Step 3: predict assumption → Step 4: evaluate choices). Practice with 12 questions from LR_II_5 (#42-54).",
    drills: "12 Sufficient Assumption practice questions (LR_II_5 #42-54)",
    difficulty: "Intermediate",
    estimatedHours: 6,
    keyTopics: ["Sufficient Assumptions", "Follows logically if", "Enables the conclusion", "Step-by-step method", "Sufficient vs. Necessary distinction", "Conditional logic", "Principle application"],
  },
  {
    id: "flaws-trainer",
    title: "Logical Flaws: Critical Mindset & Error Identification",
    category: "LR",
    description: "Develop the critical mindset essential for LSAT Flaw questions. Learn to ask 'Why doesn't the support justify the point?' and describe flaws using precise language. Master the 'fails to consider' and 'takes for granted' frameworks. Practice with 56 flaw questions from LR_II_6a (#55-60), LR_II_6b (#73-80), LR_II_17 (Flaw & Match Flaw), and the mixed review sets.",
    drills: "56 Flaw practice questions (LR_II_6a #55-60, LR_II_6b #73-80, LR_II_17, mixed sets)",
    difficulty: "Intermediate",
    estimatedHours: 10,
    keyTopics: ["Critical Mindset", "Evaluating Arguments", "Identifying Flaws", "Fails to Consider", "Takes for Granted", "Bias in Argument Evaluation", "Conceptual Flaw Description", "Match the Flaw", "Parallel Flaw Reasoning"],
  },
  {
    id: "flaws-19",
    title: "19 Common Flaws in LSAT Arguments",
    category: "LR",
    description: "Master the 19 most frequently tested logical fallacies on the LSAT. From ad hominem and faulty analogy to correlation vs. causation and conditional logic flaws, this comprehensive reference covers every flaw type with examples and recognition strategies.",
    drills: "Flaw identification exercises",
    difficulty: "Intermediate",
    estimatedHours: 6,
    keyTopics: ["Ad Hominem", "Equivocation", "Faulty Analogy", "Correlation vs. Causation", "Conditional Logic Flaws", "False Dichotomy", "Fact vs. Opinion", "Overlooked Possibilities"],
  },
  {
    id: "lr-weaken",
    title: "Weaken the Argument",
    category: "LR",
    description: "Find answers that undermine the logical support for the conclusion. Weakening answers attack the argument's assumptions or provide counter-evidence that makes the conclusion less likely to follow. Practice with 17 weaken questions from LR_II_7+8 (#81-92) and the mixed pool (LR_II_c #65-84).",
    drills: "17 Weaken practice questions (LR_II_7+8 #81-92, LR_II_c #65-84)",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Weakening strategies", "Counter-evidence", "Assumption attacks", "Scope limitations", "Causal weakeners", "Alternative explanations"],
  },
  {
    id: "lr-strengthen",
    title: "Strengthen the Argument",
    category: "LR",
    description: "Identify answers that provide additional support for the argument's conclusion. Strengthening answers confirm assumptions, add supporting evidence, or eliminate alternative explanations. Practice with 21 strengthen questions from LR_II_7+8 (#81-92) and the mixed pool (LR_II_c #65-84).",
    drills: "21 Strengthen practice questions (LR_II_7+8 #81-92, LR_II_c #65-84)",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Strengthening strategies", "Supporting evidence", "Assumption confirmation", "Scope expansion", "Causal strengtheners", "Eliminating alternatives"],
  },
  {
    id: "lr-inference",
    title: "Inference Questions (All Subtypes)",
    category: "LR",
    description: "Master all four Inference question subtypes from LSAT Logical Reasoning by Type, Vol. 3. Must Be True (50 questions): the correct answer is proven true by the stimulus \u2014 eliminate anything that goes beyond or contradicts the passage. Most Strongly Supported (62 questions): the correct answer is best supported but not necessarily 100% proven \u2014 it is more strongly supported than the other choices. Cannot Be True (13 questions): the correct answer directly contradicts or is impossible given the stimulus \u2014 the other four choices could all be true. Complete the Argument (14 questions): the correct answer logically completes the argument, following directly from the premises and fitting the argument\u2019s structure. Key pitfall across all subtypes: scope creep \u2014 never choose an answer that introduces information not in the stimulus.",
    drills: "50 Must Be True + 62 Most Strongly Supported + 13 Cannot Be True + 14 Complete the Argument = 139 questions (LR V.3 Drill Sets)",
    difficulty: "Advanced",
    estimatedHours: 9,
    keyTopics: ["Must Be True: proven by stimulus", "Most Strongly Supported: best supported", "Cannot Be True: contradicts stimulus", "Complete the Argument: logical completion", "Scope management", "Certainty language", "Eliminating overreach", "Deductive vs. inductive inference"],
  },
  {
    id: "lr-parallel",
    title: "Parallel Reasoning",
    category: "LR",
    description: "Identify arguments with matching logical structure and reasoning patterns. Practice with 1 guided question from LR_6 plus additional parallel reasoning exercises. Key skill: strip the content from both arguments and compare only the abstract logical structure — conclusion type, premise types, and the relationship between them.",
    drills: "1 guided question (LR_6) + additional parallel reasoning exercises",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Argument structure matching", "Logical parallelism", "Pattern recognition", "Scope equivalence", "Abstract structure extraction", "Conclusion type matching"],
  },
  {
    id: "lr-2",
    title: "Main Point Questions",
    category: "LR",
    description: "Identify and answer Main Point questions by finding the argument's final conclusion. Learn to distinguish the main conclusion from evidence, background information, and subsidiary conclusions using the four-step method. Practice with 5 guided questions (LR_2) plus 30 additional conclusion-identification exercises from LR_I_iv and warm-up drills from LR_I_i and LR_I_iii. Includes the 'Stick to the steps' framework: (1) Understand your job, (2) Find the point, (3) Find the support, (4) Get rid of answers, (5) Confirm the right answer.",
    drills: "5 guided questions (LR_2) + 30 additional practice (LR_I_iv) + warm-up drills",
    difficulty: "Foundational",
    estimatedHours: 6,
    keyTopics: ["Main conclusion identification", "Paraphrasing conclusions", "Distinguishing evidence", "Background information", "Four-step method", "Conclusion keywords", "Subsidiary conclusions", "Stick to the steps"],
  },
  {
    id: "lr-3",
    title: "Role of Statement Questions",
    category: "LR",
    description: "Identify how a specific statement functions within an argument. Learn to classify statements as main conclusions, subsidiary conclusions, premises, background information, potential objections, or counterexamples. Practice with 4 guided questions from LR_3 plus 6 additional Role questions from the LR_I_a review set. Key skill: distinguishing a subsidiary conclusion (which supports the main conclusion) from a premise (which supports the subsidiary conclusion).",
    drills: "4 guided questions (LR_3) + 6 review questions (LR_I_a)",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Statement function", "Main conclusion vs. subsidiary conclusion", "Premise identification", "Background information", "Potential objection", "Counterexample", "Role classification", "Argument components"],
  },
  {
    id: "lr-4",
    title: "Method of Argument Questions",
    category: "LR",
    description: "Identify and describe the argumentative strategy an author uses. Learn to recognize techniques such as analogy, example, counterexample, appeal to authority, elimination of alternatives, and challenging a premise. Practice with 4 guided questions from LR_4 plus 9 additional Method questions from LR_I_a and LR_I_b review sets. Key distinction: Method questions ask HOW the argument is made, not WHAT the conclusion is.",
    drills: "4 guided questions (LR_4) + 9 review questions (LR_I_a, LR_I_b)",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Analogy", "Example & counterexample", "Appeal to authority", "Ad hominem", "Elimination of alternatives", "Challenging a premise", "Counterexample to a generalization", "HOW vs. WHAT distinction"],
  },
  {
    id: "lr-5",
    title: "Point at Issue Questions",
    category: "LR",
    description: "Pinpoint the specific issue on which two speakers disagree. Learn to use the Point at Issue Tree to systematically identify the exact claim one speaker affirms and the other denies. Practice with 3 guided questions from LR_5 plus 4 additional Point at Issue questions from the LR_I_b review set. Key test: the correct answer must be something Speaker A would say YES to and Speaker B would say NO to (or vice versa).",
    drills: "3 guided questions (LR_5) + 4 review questions (LR_I_b)",
    difficulty: "Intermediate",
    estimatedHours: 4,
    keyTopics: ["Dialogue stimulus", "Point of disagreement", "Point at Issue Tree", "Agreement vs. disagreement", "Speaker analysis", "YES/NO test for correct answer"],
  },
  {
    id: "lr-principle",
    title: "Principle Questions",
    category: "LR",
    description: "Apply general principles to specific situations and identify underlying rules.",
    drills: "Drills 100–102",
    difficulty: "Advanced",
    estimatedHours: 5,
    keyTopics: ["Principle application", "Rule extraction", "Logical generalization", "Case analysis"],
  },
  {
    id: "lr-resolve",
    title: "Resolve the Paradox",
    category: "LR",
    description: "Resolve the Paradox (also called Explain the Discrepancy) questions present two facts that seem contradictory and ask you to find the answer choice that explains how both can be true simultaneously. The correct answer introduces new information that makes both statements compatible — it does NOT eliminate one fact or simply restate the paradox. The four-step approach: (1) identify the two seemingly contradictory facts, (2) articulate exactly what makes them surprising together, (3) predict the type of information that would reconcile them, (4) select the answer that allows both facts to coexist. Common wrong answer patterns: answers that explain only one side of the paradox, answers that deepen the contradiction, answers that are irrelevant to the specific discrepancy, and answers that use extreme or absolute language. Source: LR Logical Reasoning by Type, Volume 3 (pp. 257–275), 71 questions.",
    drills: "LR_V.3 Resolve the Paradox (#1–71) + LR_III_5 Paradox Question Set + 6.ResolvetheParadoxQuestions",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Identifying the two contradictory facts", "Articulating the exact discrepancy", "Predicting reconciling information", "New information vs. restating the paradox", "One-sided explanations (wrong answer trap)", "Scope distinctions", "Causal paradoxes", "Statistical paradoxes"],
  },
];

const RC_MODULES: StudyModule[] = [
  {
    id: "rc-strategy",
    title: "RC Foundations: Reading for Reasoning Structure",
    category: "RC",
    description: "Master the four elements of RC reasoning structure: Main Points (why the passage was written), Reasons For and Against (supporting/opposing evidence), Background (contextual information), and Information & Application (results or usage of main points). RC passages may have 1–3 main points — unlike LR which has one. As you read, ask: 'Why did the author write this?' Author's view is often one of the main points. Includes the two-pass reading strategy from RC_22: first pass for main points and author's view, second pass for structural roles.",
    drills: "RC_22 Reading for Reasoning Structure drill (PT 26, Passage 3) + RC_23 Mini Drill Set",
    difficulty: "Foundational",
    estimatedHours: 8,
    keyTopics: ["Main Points", "Reasons For and Against", "Background information", "Information & Application", "Author's View", "Two-pass reading strategy", "Reasoning structure annotation"],
  },
  {
    id: "rc-mapping",
    title: "RC Skill: Passage Mapping & Question Types",
    category: "RC",
    description: "Master the full taxonomy of RC question types and their wrong answer patterns. Eight question types: Main Idea, Detail, Inference, Author's Opinion, Structure, Analogy, Vocabulary in Context, and Comparative. Wrong answer patterns include: Too Broad/Too Narrow, Outside the Scope, Extreme Language, Opposite Direction, Half Right/Half Wrong, and Distortion. Includes the RC_35 Questions in Categories Drill Set (2 full passages from PT 29 and PT 31) and the RC_40 Passage Types & Question Types Practice Set.",
    drills: "RC_35 Questions in Categories Drill Set (6 questions, 2 passages) + RC_40 Practice Set",
    difficulty: "Intermediate",
    estimatedHours: 6,
    keyTopics: ["Main Idea questions", "Detail questions", "Inference questions", "Author's Opinion questions", "Structure questions", "Analogy questions", "Vocabulary in Context", "Wrong answer patterns"],
  },
  {
    id: "rc-main-point",
    title: "RC Main Idea & Structure Questions",
    category: "RC",
    description: "Identify the primary argument and overall organizational structure of passages. Main Idea questions ask for the passage's central claim or purpose — the answer must be neither too broad nor too narrow. Structure questions ask about the author's purpose or how a specific component functions in the passage. Key skill: distinguish the main point from supporting evidence, background, and application. Includes 5 Main Idea questions and 4 Structure questions from RC_35 and RC_38.",
    drills: "5 Main Idea + 4 Structure questions (RC_35, RC_38)",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Main idea extraction", "Scope management", "Author's purpose", "Passage organization", "Component function", "Too broad vs. too narrow"],
  },
  {
    id: "rc-inference",
    title: "RC Inference & Detail Questions",
    category: "RC",
    description: "Draw valid inferences from passage content without overextending, and locate specific details accurately. Inference questions ask what can be concluded or what the author would most likely agree with — the correct answer must be directly supported by the passage. Detail questions ask what the passage states according to the author. Key pitfall: confusing what the passage implies with what it explicitly states. Includes 5 Inference questions and 10 Detail questions from RC_35 and RC_38.",
    drills: "5 Inference + 10 Detail questions (RC_35, RC_38)",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Valid inference", "Scope limitations", "Evidence grounding", "Detail location", "Explicit vs. implied", "EXCEPT questions"],
  },
  {
    id: "rc-attitude",
    title: "Author's Opinion, Analogy & Comparative Questions",
    category: "RC",
    description: "Discern the author's perspective and attitude, identify analogous situations, and handle comparative passage questions. Author's Opinion questions ask what the author believes or would agree with — the author's view is often embedded in word choice and emphasis. Analogy questions ask which situation is most closely parallel to something described in the passage. Comparative questions ask about the relationship between two passages or what one author would think about the other. Includes 5 Author's Opinion, 2 Analogy, 1 Comparative, and 3 Vocabulary in Context questions from RC_35 and RC_38.",
    drills: "5 Author's Opinion + 2 Analogy + 1 Comparative + 3 Vocabulary in Context (RC_35, RC_38)",
    difficulty: "Advanced",
    estimatedHours: 5,
    keyTopics: ["Author's perspective", "Tone and word choice", "Analogous situations", "Comparative passages", "Passage A vs. Passage B relationship", "Vocabulary in context"],
  },
  {
    id: "rc-comparative",
    title: "Comparative Passages",
    category: "RC",
    description: "Master the unique format of comparative RC passages — two shorter passages on the same topic. Learn to identify the relationship between the passages (agreement, disagreement, complementary perspectives, or one responding to the other) and answer questions that require synthesizing both. Includes the RC_25 Comparative Passages lesson and Practice Set II.",
    drills: "RC_25 Comparative Passages Lesson + Practice Set II",
    difficulty: "Advanced",
    estimatedHours: 4,
    keyTopics: ["Passage relationship", "Agreement vs. disagreement", "Complementary perspectives", "Cross-passage inference", "What Author A would think of Passage B"],
  },
];

const PRACTICE_TIERS: StudyTier[] = [
  {
    tier: 1,
    title: "Tier 1: Foundational Practice",
    description: "Build core skills with targeted, lower-difficulty questions",
    drills: "Drills 70–75",
    difficulty: "Easy",
    estimatedHours: 6,
  },
  {
    tier: 2,
    title: "Tier 2: Intermediate Practice",
    description: "Strengthen skills with medium-difficulty mixed question sets",
    drills: "Drills 72, 81, 87–89",
    difficulty: "Medium",
    estimatedHours: 8,
  },
  {
    tier: 3,
    title: "Tier 3: Advanced Practice",
    description: "Master challenging questions and complex reasoning patterns",
    drills: "Drills 77, 83–84, 86",
    difficulty: "Hard",
    estimatedHours: 10,
  },
];

export default function StudyGuide() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "LR" | "RC">("all");
  const [, setLocation] = useLocation();

  const handlePracticeModule = (moduleId: string, moduleName: string) => {
    // Navigate to Question Bank with module filter
    setLocation(`/question-bank?module=${moduleId}&moduleName=${encodeURIComponent(moduleName)}`);
  };

  const allModules = [...LR_MODULES, ...RC_MODULES];
  const filteredModules = selectedCategory === "all" 
    ? allModules 
    : allModules.filter(m => m.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Foundational":
        return "bg-green-500/20 text-green-300";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-300";
      case "Advanced":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Study Guide</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive curriculum organized by skill level and question type. Master each module systematically before advancing.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="flex gap-3 mb-8">
          {(["all", "LR", "RC"] as const).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="transition-all"
            >
              {cat === "all" ? "All Modules" : cat === "LR" ? "Logical Reasoning" : "Reading Comprehension"}
            </Button>
          ))}
        </div>

        {/* Logical Reasoning Modules */}
        {(selectedCategory === "all" || selectedCategory === "LR") && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Logical Reasoning</h2>
            <div className="space-y-3">
              {LR_MODULES.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        
                        {expandedModule === module.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border space-y-3"
                          >
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Drills</p>
                              <p className="text-sm text-foreground">{module.drills}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Topics</p>
                              <div className="flex flex-wrap gap-2">
                                {module.keyTopics.map((topic) => (
                                  <Badge key={topic} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Estimated: {module.estimatedHours} hours</span>
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              variant="default"
                              onClick={() => handlePracticeModule(module.id, module.title)}
                            >
                              Practice Questions
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${
                          expandedModule === module.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reading Comprehension Modules */}
        {(selectedCategory === "all" || selectedCategory === "RC") && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Reading Comprehension</h2>
            <div className="space-y-3">
              {RC_MODULES.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        
                        {expandedModule === module.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border space-y-3"
                          >
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Drills</p>
                              <p className="text-sm text-foreground">{module.drills}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Topics</p>
                              <div className="flex flex-wrap gap-2">
                                {module.keyTopics.map((topic) => (
                                  <Badge key={topic} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Estimated: {module.estimatedHours} hours</span>
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              variant="default"
                              onClick={() => handlePracticeModule(module.id, module.title)}
                            >
                              Practice Questions
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${
                          expandedModule === module.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Tiers */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Practice Tiers</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PRACTICE_TIERS.map((tier) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: tier.tier * 0.1 }}
              >
                <Card className="p-6 h-full hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tier.title}</h3>
                      <Badge className={`${getDifficultyColor(tier.difficulty)} mt-2`}>
                        {tier.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Drills</p>
                    <p className="text-sm text-foreground">{tier.drills}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{tier.estimatedHours} hours</span>
                  </div>
                  <Button className="w-full" variant="default">
                    Start Tier {tier.tier}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
