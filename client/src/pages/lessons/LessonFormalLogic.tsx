/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Formal Logic Fundamentals
 * 
 * Teaches students logical notation, conditionals, negation, and quantifiers.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import BookingCTA from "@/components/BookingCTA";
import { useLessonStepProgress } from "@/hooks/useLessonStepProgress";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import PageMeta from "@/components/PageMeta";

type FLStep = "intro" | "notation" | "conditionals" | "negation" | "quantifiers" | "practice" | "recap";
const STEPS = ["intro", "notation", "conditionals", "negation", "quantifiers", "practice", "recap"] as const satisfies readonly FLStep[];

const NOTATION_CONCEPTS = [
  {
    symbol: "→",
    name: "Conditional (If...then)",
    example: "P → Q",
    meaning: "If P is true, then Q must be true",
    color: "#2E7D52",
  },
  {
    symbol: "¬",
    name: "Negation (Not)",
    example: "¬P",
    meaning: "The opposite of P; if P is true, ¬P is false",
    color: "#B84030",
  },
  {
    symbol: "∧",
    name: "Conjunction (And)",
    example: "P ∧ Q",
    meaning: "Both P and Q are true",
    color: "#C8860A",
  },
  {
    symbol: "∨",
    name: "Disjunction (Or)",
    example: "P ∨ Q",
    meaning: "At least one of P or Q is true (or both)",
    color: "#5B4A8A",
  },
];

const CONDITIONAL_RULES = [
  {
    rule: "Original",
    statement: "If P, then Q (P → Q)",
    example: "If it rains, then the ground is wet.",
    valid: true,
  },
  {
    rule: "Contrapositive",
    statement: "If not Q, then not P (¬Q → ¬P)",
    example: "If the ground is not wet, then it did not rain.",
    valid: true,
  },
  {
    rule: "Converse (INVALID)",
    statement: "If Q, then P (Q → P)",
    example: "If the ground is wet, then it rained. (FALSE—could be a sprinkler)",
    valid: false,
  },
  {
    rule: "Inverse (INVALID)",
    statement: "If not P, then not Q (¬P → ¬Q)",
    example: "If it did not rain, then the ground is not wet. (FALSE—could be a sprinkler)",
    valid: false,
  },
];

const QUANTIFIER_EXAMPLES = [
  {
    quantifier: "All",
    symbol: "∀",
    statement: "All lawyers are ethical.",
    meaning: "If someone is a lawyer, they are ethical.",
    logical: "Lawyer(x) → Ethical(x)",
    color: "#2E7D52",
  },
  {
    quantifier: "Some",
    symbol: "∃",
    statement: "Some lawyers are ethical.",
    meaning: "At least one lawyer is ethical.",
    logical: "∃x: Lawyer(x) ∧ Ethical(x)",
    color: "#C8860A",
  },
  {
    quantifier: "No",
    symbol: "¬∃",
    statement: "No lawyers are unethical.",
    meaning: "There does not exist a lawyer who is unethical.",
    logical: "¬∃x: Lawyer(x) ∧ Unethical(x)",
    color: "#B84030",
  },
];

const PRACTICE_QUESTIONS = [
  {
    question: "If 'All students study hard' is true, which statement must also be true?",
    answers: [
      { letter: "A", text: "Some students study hard", isCorrect: true },
      { letter: "B", text: "If someone doesn't study hard, they're not a student", isCorrect: false },
      { letter: "C", text: "No students study hard", isCorrect: false },
      { letter: "D", text: "If someone is not a student, they don't study hard", isCorrect: false },
      { letter: "E", text: "All students who study hard will succeed", isCorrect: false },
    ],
    explanation:
      "If ALL students study hard, then it's definitely true that SOME students study hard. The contrapositive of 'Student → Studies Hard' is 'Doesn't Study Hard → Not a Student,' but that's not one of the options. Option A is the correct logical consequence.",
  },
  {
    question: "What is the contrapositive of 'If the defendant is guilty, then the evidence is conclusive'?",
    answers: [
      { letter: "A", text: "If the evidence is not conclusive, then the defendant is not guilty", isCorrect: true },
      { letter: "B", text: "If the defendant is not guilty, then the evidence is not conclusive", isCorrect: false },
      { letter: "C", text: "If the evidence is conclusive, then the defendant is guilty", isCorrect: false },
      { letter: "D", text: "The defendant is guilty if and only if the evidence is conclusive", isCorrect: false },
      { letter: "E", text: "The evidence is conclusive only if the defendant is guilty", isCorrect: false },
    ],
    explanation:
      "The contrapositive of 'P → Q' is '¬Q → ¬P'. So the contrapositive of 'Guilty → Conclusive Evidence' is 'Not Conclusive Evidence → Not Guilty.' This is logically equivalent to the original statement.",
  },
  {
    question: "Which of the following is equivalent to 'Some people are not honest'?",
    answers: [
      { letter: "A", text: "All people are not honest", isCorrect: false },
      { letter: "B", text: "There exists at least one person who is not honest", isCorrect: true },
      { letter: "C", text: "No people are honest", isCorrect: false },
      { letter: "D", text: "Most people are not honest", isCorrect: false },
      { letter: "E", text: "It is possible that all people are honest", isCorrect: false },
    ],
    explanation:
      "'Some people are not honest' means 'There exists at least one person who is not honest.' This is different from 'All people are not honest' (which would mean no one is honest) or 'No people are honest' (which means the same thing as all people being dishonest).",
  },
];

export default function LessonFormalLogic() {
  const [, navigate] = useLocation();
  const { currentStep, goTo, resetProgress, hasStarted } =
    useLessonStepProgress("formal-logic", STEPS);
  const { markComplete } = useLessonCompletion("formal-logic");
  const [expandedNotation, setExpandedNotation] = useState<number>(-1);
  const [expandedRule, setExpandedRule] = useState<number>(-1);
  const [expandedQuantifier, setExpandedQuantifier] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showExplanations, setShowExplanations] = useState<{ [key: number]: boolean }>({});

  const handleNext = () => {
    if (currentStep === "intro") goTo("notation");
    else if (currentStep === "notation") goTo("conditionals");
    else if (currentStep === "conditionals") goTo("negation");
    else if (currentStep === "negation") goTo("quantifiers");
    else if (currentStep === "quantifiers") goTo("practice");
    else if (currentStep === "practice") {
      goTo("recap");
      markComplete();
    }
  };

  const handleReset = () => {
    resetProgress();
    setExpandedNotation(-1);
    setExpandedRule(-1);
    setExpandedQuantifier(-1);
    setSelectedAnswers({});
    setShowExplanations({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (questionIdx: number, letter: string) => {
    if (!selectedAnswers[questionIdx]) {
      setSelectedAnswers({ ...selectedAnswers, [questionIdx]: letter });
      setShowExplanations({ ...showExplanations, [questionIdx]: true });
    }
  };

  return (
    <>
      <PageMeta
        title="Formal Logic Foundations | LSAT Mastery"
        description="Build a solid foundation in LSAT formal logic: conditionals, contrapositives, quantifiers, and De Morgan's Laws. Taught by Devaney M. Page, JD."
      />
      <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F7F4EF 0%, #EDE8DF 60%, #E4DDD0 100%)" }}
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate("/lessons")}
        className="fixed top-20 left-4 z-40 p-2 rounded-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.1)",
          backdropFilter: "blur(12px)",
        }}
        title="Back to Lessons"
      >
        <ChevronLeft size={20} style={{ color: "#1E2130" }} />
      </motion.button>

      {/* Reset Progress button */}
      {hasStarted && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleReset}
          className="fixed top-20 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(12px)",
            color: "rgba(30,33,48,0.5)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
          title="Reset lesson progress"
        >
          <RotateCcw size={14} />
          Reset Progress
        </motion.button>
      )}

      <div className="container py-12">
        {/* Intro */}
        {currentStep === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(91,74,138,0.12)",
                  border: "1px solid rgba(91,74,138,0.25)",
                }}
              >
                <Lightbulb size={28} style={{ color: "#5B4A8A" }} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "2.2rem",
                    color: "#1E2130",
                  }}
                >
                  Formal Logic Fundamentals
                </h1>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    color: "rgba(30,33,48,0.5)",
                  }}
                >
                  Master Logical Notation & Concepts
                </p>
              </div>
            </div>

            <p
              className="mb-8"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "1.05rem",
                color: "rgba(30,33,48,0.65)",
                lineHeight: 1.8,
              }}
            >
              Formal logic is the language of the LSAT. Understanding logical notation, conditionals, negation, and quantifiers is essential for mastering Logical Reasoning and Reading Comprehension. This lesson teaches you to translate English statements into logical symbols and understand the relationships between them.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Learn Logical Notation
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Notation */}
        {currentStep === "notation" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Core Logical Symbols
            </h2>

            <div className="space-y-4 mb-10">
              {NOTATION_CONCEPTS.map((concept, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    onClick={() => setExpandedNotation(expandedNotation === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background:
                        expandedNotation === idx
                          ? `rgba(${concept.color === "#2E7D52" ? "46,125,82" : concept.color === "#C8860A" ? "200,134,10" : concept.color === "#B84030" ? "184,64,48" : "91,74,138"},0.05)`
                          : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl"
                          style={{
                            background: `rgba(${concept.color === "#2E7D52" ? "46,125,82" : concept.color === "#C8860A" ? "200,134,10" : concept.color === "#B84030" ? "184,64,48" : "91,74,138"},0.15)`,
                            color: concept.color,
                          }}
                        >
                          {concept.symbol}
                        </div>
                        <div>
                          <h3
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              fontSize: "1.05rem",
                              color: concept.color,
                              marginBottom: "0.25rem",
                            }}
                          >
                            {concept.name}
                          </h3>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.6)",
                            }}
                          >
                            {concept.example}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: concept.color,
                          transform:
                            expandedNotation === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedNotation === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: `rgba(${concept.color === "#2E7D52" ? "46,125,82" : concept.color === "#C8860A" ? "200,134,10" : concept.color === "#B84030" ? "184,64,48" : "91,74,138"},0.08)`,
                            border: `1px solid rgba(${concept.color === "#2E7D52" ? "46,125,82" : concept.color === "#C8860A" ? "200,134,10" : concept.color === "#B84030" ? "184,64,48" : "91,74,138"},0.2)`,
                          }}
                        >
                          <p
                            style={{
                              color: "rgba(30,33,48,0.4)",
                              fontSize: "0.72rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginBottom: "0.4rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            Meaning:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {concept.meaning}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Learn Conditionals
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Conditionals */}
        {currentStep === "conditionals" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Conditionals & Logical Equivalence
            </h2>

            <p
              className="mb-8"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "1rem",
                color: "rgba(30,33,48,0.65)",
                lineHeight: 1.8,
              }}
            >
              A conditional statement (P → Q) has a special property: it is <strong>logically equivalent</strong> to its contrapositive. This means they're always true or false together. However, the converse and inverse are NOT logically equivalent to the original.
            </p>

            <div className="space-y-4 mb-10">
              {CONDITIONAL_RULES.map((rule, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: rule.valid ? "1px solid rgba(46,125,82,0.2)" : "1px solid rgba(184,64,48,0.2)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    onClick={() => setExpandedRule(expandedRule === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background: rule.valid
                        ? "rgba(46,125,82,0.03)"
                        : "rgba(184,64,48,0.03)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              fontSize: "1.05rem",
                              color: rule.valid ? "#2E7D52" : "#B84030",
                            }}
                          >
                            {rule.rule}
                          </h3>
                          {rule.valid && (
                            <span
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#2E7D52",
                                background: "rgba(46,125,82,0.15)",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              VALID
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(30,33,48,0.6)",
                          }}
                        >
                          {rule.statement}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: rule.valid ? "#2E7D52" : "#B84030",
                          transform:
                            expandedRule === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedRule === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: rule.valid
                              ? "rgba(46,125,82,0.08)"
                              : "rgba(184,64,48,0.08)",
                            border: rule.valid
                              ? "1px solid rgba(46,125,82,0.2)"
                              : "1px solid rgba(184,64,48,0.2)",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {rule.example}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Learn Negation
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Negation */}
        {currentStep === "negation" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Negation & De Morgan's Laws
            </h2>

            <div
              className="rounded-xl p-6 mb-8"
              style={{
                background: "rgba(184,64,48,0.08)",
                border: "1px solid rgba(184,64,48,0.2)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#B84030",
                  marginBottom: "0.5rem",
                }}
              >
                De Morgan's Laws
              </h3>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.95rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                  marginBottom: "1rem",
                }}
              >
                When you negate a compound statement, the logic flips:
              </p>
              <div className="space-y-3">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(184,64,48,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#1E2130",
                      marginBottom: "0.25rem",
                    }}
                  >
                    ¬(P ∧ Q) = ¬P ∨ ¬Q
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.85rem",
                      color: "rgba(30,33,48,0.6)",
                    }}
                  >
                    "Not both P and Q" means "Either not P or not Q (or both)"
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(184,64,48,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#1E2130",
                      marginBottom: "0.25rem",
                    }}
                  >
                    ¬(P ∨ Q) = ¬P ∧ ¬Q
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.85rem",
                      color: "rgba(30,33,48,0.6)",
                    }}
                  >
                    "Not P or Q" means "Both not P and not Q"
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Learn Quantifiers
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Quantifiers */}
        {currentStep === "quantifiers" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Quantifiers: All, Some, None
            </h2>

            <div className="space-y-4 mb-10">
              {QUANTIFIER_EXAMPLES.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    onClick={() => setExpandedQuantifier(expandedQuantifier === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background:
                        expandedQuantifier === idx
                          ? `rgba(${q.color === "#2E7D52" ? "46,125,82" : q.color === "#C8860A" ? "200,134,10" : "184,64,48"},0.05)`
                          : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                          style={{
                            background: `rgba(${q.color === "#2E7D52" ? "46,125,82" : q.color === "#C8860A" ? "200,134,10" : "184,64,48"},0.15)`,
                            color: q.color,
                          }}
                        >
                          {q.symbol}
                        </div>
                        <div>
                          <h3
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              fontSize: "1.05rem",
                              color: q.color,
                              marginBottom: "0.25rem",
                            }}
                          >
                            {q.quantifier}
                          </h3>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.6)",
                            }}
                          >
                            {q.statement}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: q.color,
                          transform:
                            expandedQuantifier === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedQuantifier === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div className="space-y-3">
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: `rgba(${q.color === "#2E7D52" ? "46,125,82" : q.color === "#C8860A" ? "200,134,10" : "184,64,48"},0.08)`,
                              border: `1px solid rgba(${q.color === "#2E7D52" ? "46,125,82" : q.color === "#C8860A" ? "200,134,10" : "184,64,48"},0.2)`,
                            }}
                          >
                            <p
                              style={{
                                color: "rgba(30,33,48,0.4)",
                                fontSize: "0.72rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                marginBottom: "0.4rem",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              Meaning:
                            </p>
                            <p
                              style={{
                                fontFamily: "'Lora', serif",
                                fontSize: "0.9rem",
                                color: "rgba(30,33,48,0.65)",
                                lineHeight: 1.6,
                              }}
                            >
                              {q.meaning}
                            </p>
                          </div>
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "#F7F4EF",
                              border: "1px solid rgba(0,0,0,0.08)",
                            }}
                          >
                            <p
                              style={{
                                color: "rgba(30,33,48,0.4)",
                                fontSize: "0.72rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                marginBottom: "0.4rem",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              Logical Form:
                            </p>
                            <p
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "0.9rem",
                                color: "#1E2130",
                                lineHeight: 1.6,
                              }}
                            >
                              {q.logical}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Practice Questions
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Practice */}
        {currentStep === "practice" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Practice Questions
            </h2>

            <div className="space-y-8">
              {PRACTICE_QUESTIONS.map((pq, qIdx) => {
                const selectedAnswer = selectedAnswers[qIdx];
                const isCorrect = selectedAnswer === pq.answers.find((a) => a.isCorrect)?.letter;

                return (
                  <motion.div
                    key={qIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: qIdx * 0.1 }}
                    className="rounded-xl p-6"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Question */}
                    <div
                      className="rounded-lg px-4 py-3 mb-6"
                      style={{
                        background: "rgba(91,74,138,0.07)",
                        border: "1px solid rgba(91,74,138,0.2)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: "#1E2130",
                          lineHeight: 1.6,
                        }}
                      >
                        {qIdx + 1}. {pq.question}
                      </p>
                    </div>

                    {/* Answers */}
                    <div className="space-y-2 mb-6">
                      {pq.answers.map((answer) => {
                        const isSelected = selectedAnswer === answer.letter;
                        const answerIsCorrect = answer.isCorrect;

                        return (
                          <motion.button
                            key={answer.letter}
                            onClick={() => handleAnswer(qIdx, answer.letter)}
                            disabled={!!selectedAnswer}
                            className="w-full text-left rounded-lg p-3 transition-all duration-200"
                            style={{
                              background:
                                isSelected && answerIsCorrect
                                  ? "rgba(46,125,82,0.08)"
                                  : isSelected && !answerIsCorrect
                                  ? "rgba(184,64,48,0.08)"
                                  : "#F7F4EF",
                              border:
                                isSelected && answerIsCorrect
                                  ? "1px solid rgba(46,125,82,0.3)"
                                  : isSelected && !answerIsCorrect
                                  ? "1px solid rgba(184,64,48,0.3)"
                                  : "1px solid rgba(0,0,0,0.08)",
                              opacity: selectedAnswer && !isSelected ? 0.5 : 1,
                              cursor: selectedAnswer ? "default" : "pointer",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs mt-0.5"
                                style={{
                                  background:
                                    isSelected && answerIsCorrect
                                      ? "#2E7D52"
                                      : isSelected && !answerIsCorrect
                                      ? "#B84030"
                                      : "rgba(30,33,48,0.1)",
                                  color:
                                    isSelected
                                      ? "#FFFFFF"
                                      : "rgba(30,33,48,0.4)",
                                  fontFamily: "'Space Grotesk', sans-serif",
                                }}
                              >
                                {isSelected && answerIsCorrect
                                  ? "✓"
                                  : isSelected && !answerIsCorrect
                                  ? "✗"
                                  : answer.letter}
                              </div>
                              <p
                                style={{
                                  fontFamily: "'Lora', serif",
                                  fontSize: "0.9rem",
                                  color: "#1E2130",
                                  lineHeight: 1.5,
                                }}
                              >
                                {answer.text}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                      {showExplanations[qIdx] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-lg p-4"
                          style={{
                            background: isCorrect
                              ? "rgba(46,125,82,0.08)"
                              : "rgba(184,64,48,0.06)",
                            border: `1px solid ${isCorrect ? "rgba(46,125,82,0.3)" : "rgba(184,64,48,0.25)"}`,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 size={18} style={{ color: "#2E7D52", marginTop: "2px" }} />
                            ) : (
                              <AlertCircle size={18} style={{ color: "#B84030", marginTop: "2px" }} />
                            )}
                            <div>
                              <p
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                  color: isCorrect ? "#2E7D52" : "#B84030",
                                  marginBottom: "0.3rem",
                                }}
                              >
                                {isCorrect ? "✓ Correct!" : "Not quite."}
                              </p>
                              <p
                                style={{
                                  fontFamily: "'Lora', serif",
                                  fontSize: "0.85rem",
                                  color: "rgba(30,33,48,0.65)",
                                  lineHeight: 1.6,
                                }}
                              >
                                {pq.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {Object.keys(selectedAnswers).length === PRACTICE_QUESTIONS.length && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{
                  background: "#1E2130",
                  color: "#F7F4EF",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
                }}
              >
                View Recap
                <ChevronRight size={18} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Recap */}
        {currentStep === "recap" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "#1E2130",
              }}
            >
              Key Takeaways
            </h2>

            <div
              className="rounded-xl p-6 mb-8"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div className="space-y-4">
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#2E7D52",
                      marginBottom: "0.5rem",
                    }}
                  >
                    1. Master the Symbols
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    Conditionals (→), negation (¬), conjunction (∧), and disjunction (∨) are the building blocks of logical reasoning. Memorize them and practice translating English into symbols.
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#C8860A",
                      marginBottom: "0.5rem",
                    }}
                  >
                    2. Remember the Contrapositive
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    The contrapositive of "P → Q" is "¬Q → ¬P." These are logically equivalent. The converse and inverse are NOT equivalent—don't confuse them.
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#B84030",
                      marginBottom: "0.5rem",
                    }}
                  >
                    3. Apply De Morgan's Laws
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    When negating compound statements, flip the operator: ¬(P ∧ Q) = ¬P ∨ ¬Q. This is critical for understanding complex arguments.
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#5B4A8A",
                      marginBottom: "0.5rem",
                    }}
                  >
                    4. Understand Quantifiers
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    "All," "Some," and "None" have precise logical meanings. "Some" means "at least one," not "most." This distinction matters in Reading Comprehension and Logical Reasoning.
                  </p>
                </div>
              </div>
            </div>

            <BookingCTA className="mt-8 mb-6" />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/lessons")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Back to Lessons
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}
