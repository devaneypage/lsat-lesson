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
    id: "lr-anatomy",
    title: "LR Foundations: Argument Anatomy",
    category: "LR",
    description: "Master the fundamental structure of LSAT arguments, identifying premises, conclusions, and logical flow.",
    drills: "Drills 1–7, 12–14",
    difficulty: "Foundational",
    estimatedHours: 8,
    keyTopics: ["Premise identification", "Conclusion recognition", "Argument structure", "Keyword analysis"],
  },
  {
    id: "lr-conditional",
    title: "Formal Logic: Conditional Reasoning",
    category: "LR",
    description: "Understand conditional statements, logical equivalences, and how to manipulate formal logic on the LSAT.",
    drills: "Drills 8, 11, 15",
    difficulty: "Foundational",
    estimatedHours: 6,
    keyTopics: ["If-then statements", "Contrapositive", "Logical equivalence", "Conditional chains"],
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
    id: "lr-na",
    title: "Necessary Assumptions",
    category: "LR",
    description: "Identify what the argument must assume to be true, and distinguish from sufficient assumptions.",
    drills: "Drills 70–72, 87",
    difficulty: "Intermediate",
    estimatedHours: 6,
    keyTopics: ["Assumption identification", "Negation test", "Sufficient vs. necessary", "Flaw recognition"],
  },
  {
    id: "lr-sa",
    title: "Sufficient Assumptions",
    category: "LR",
    description: "Master sufficient assumptions and principle questions that provide logical bridges.",
    drills: "Drills 73, 81",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Sufficient conditions", "Principle application", "Logical bridging", "Conditional logic"],
  },
  {
    id: "lr-flaw",
    title: "Logical Flaws: Error Identification",
    category: "LR",
    description: "Recognize common logical fallacies and reasoning errors in LSAT arguments.",
    drills: "Drills 44, 50, 56, 80, 85, 88–89",
    difficulty: "Intermediate",
    estimatedHours: 8,
    keyTopics: ["Overlooked possibilities", "Correlation vs. causation", "Necessity vs. sufficiency", "Part-to-whole errors"],
  },
  {
    id: "lr-weaken",
    title: "Weaken the Argument",
    category: "LR",
    description: "Find answers that undermine the logical support for the conclusion.",
    drills: "Drills 100–104",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Weakening strategies", "Counter-evidence", "Assumption attacks", "Scope limitations"],
  },
  {
    id: "lr-strengthen",
    title: "Strengthen the Argument",
    category: "LR",
    description: "Identify answers that provide additional support for the argument's conclusion.",
    drills: "Drills 100–104",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Strengthening strategies", "Supporting evidence", "Assumption confirmation", "Scope expansion"],
  },
  {
    id: "lr-inference",
    title: "Inference & Must Be True",
    category: "LR",
    description: "Master questions that require you to derive conclusions from given premises.",
    drills: "Drills 94–102",
    difficulty: "Advanced",
    estimatedHours: 7,
    keyTopics: ["Logical inference", "Deductive reasoning", "Scope management", "Answer certainty"],
  },
  {
    id: "lr-parallel",
    title: "Parallel Reasoning",
    category: "LR",
    description: "Identify arguments with matching logical structure and reasoning patterns.",
    drills: "Drills 103–108",
    difficulty: "Advanced",
    estimatedHours: 6,
    keyTopics: ["Argument structure matching", "Logical parallelism", "Pattern recognition", "Scope equivalence"],
  },
  {
    id: "lr-method",
    title: "Method of Argument",
    category: "LR",
    description: "Analyze how arguments are constructed and what techniques they employ.",
    drills: "Drills 68–69",
    difficulty: "Advanced",
    estimatedHours: 4,
    keyTopics: ["Argument technique", "Rhetorical strategy", "Logical structure", "Reasoning pattern"],
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
    description: "Explain apparent contradictions by finding the missing information that reconciles them.",
    drills: "Paradox drills",
    difficulty: "Advanced",
    estimatedHours: 4,
    keyTopics: ["Paradox resolution", "Hidden assumptions", "Scope distinctions", "Reconciliation"],
  },
];

const RC_MODULES: StudyModule[] = [
  {
    id: "rc-strategy",
    title: "RC Foundations: Reading Strategy",
    category: "RC",
    description: "Develop efficient passage mapping and annotation techniques for Reading Comprehension.",
    drills: "Drills 147–166",
    difficulty: "Foundational",
    estimatedHours: 8,
    keyTopics: ["Passage mapping", "Annotation", "Main idea identification", "Argument structure"],
  },
  {
    id: "rc-mapping",
    title: "RC Skill: Passage Mapping",
    category: "RC",
    description: "Master the art of capturing passage structure, tone, and key arguments efficiently.",
    drills: "Drills 23–33",
    difficulty: "Intermediate",
    estimatedHours: 6,
    keyTopics: ["Structural mapping", "Tone analysis", "Author's purpose", "Argument tracking"],
  },
  {
    id: "rc-main-point",
    title: "Main Point Questions",
    category: "RC",
    description: "Identify the primary argument and overall purpose of passages.",
    drills: "High frequency",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Main idea extraction", "Scope management", "Distractor recognition", "Precision reading"],
  },
  {
    id: "rc-inference",
    title: "RC Inference Questions",
    category: "RC",
    description: "Draw valid inferences from passage content without overextending.",
    drills: "High frequency",
    difficulty: "Intermediate",
    estimatedHours: 5,
    keyTopics: ["Valid inference", "Scope limitations", "Author's implications", "Evidence grounding"],
  },
  {
    id: "rc-attitude",
    title: "Attitude & Tone Questions",
    category: "RC",
    description: "Discern author's perspective, tone, and attitude toward subjects discussed.",
    drills: "Medium frequency",
    difficulty: "Advanced",
    estimatedHours: 4,
    keyTopics: ["Tone recognition", "Author's perspective", "Emotional language", "Implicit attitude"],
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
