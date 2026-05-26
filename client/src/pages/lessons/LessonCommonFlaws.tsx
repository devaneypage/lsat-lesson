/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Common Flaws in LSAT Arguments (19 key logical fallacies)
 *
 * Progress persisted to localStorage. Practice question has 5 answer choices (A–E).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { useLessonStepProgress } from "@/hooks/useLessonStepProgress";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import PageMeta from "@/components/PageMeta";

type FlawStep = "intro" | "flaws" | "practice" | "recap";
const STEPS = ["intro", "flaws", "practice", "recap"] as const satisfies readonly FlawStep[];

const FLAWS = [
  {
    name: "Affirming the Consequent",
    description: "If P then Q. Q is true. Therefore, P is true. (Invalid!)",
    example: "If it rains, the ground is wet. The ground is wet. Therefore, it rained.",
    why: "The ground could be wet for other reasons (sprinkler, etc.)",
  },
  {
    name: "Denying the Antecedent",
    description: "If P then Q. P is false. Therefore, Q is false. (Invalid!)",
    example: "If you study hard, you'll pass. You didn't study hard. Therefore, you won't pass.",
    why: "You might pass anyway through other means.",
  },
  {
    name: "Hasty Generalization",
    description: "Drawing a broad conclusion from limited evidence.",
    example: "I met two people from that city who were rude. Everyone from that city is rude.",
    why: "A sample of 2 people doesn't represent an entire city.",
  },
  {
    name: "Ad Hominem",
    description: "Attacking the person making the argument instead of the argument itself.",
    example: "You're wrong because you're not an expert. (Ignoring the actual evidence)",
    why: "The truth of a claim doesn't depend on who says it.",
  },
  {
    name: "Circular Reasoning (Begging the Question)",
    description: "Using the conclusion as evidence for itself.",
    example: "This book is great because it's well-written. How do you know? Because it's great.",
    why: "This proves nothing; it just repeats the same claim.",
  },
];

const PRACTICE_QUESTION = {
  stimulus: `A new study shows that people who drink coffee live longer than those who don't. Therefore, drinking coffee causes people to live longer. The study involved 500 participants over 10 years, so the results are definitive.`,
  question: "Which of the following best identifies a flaw in the argument?",
  answers: [
    {
      letter: "A",
      text: "The argument confuses correlation with causation.",
      isCorrect: true,
      explanation:
        "The study shows that coffee drinkers live longer, but this doesn't prove coffee causes longevity. Coffee drinkers might exercise more, eat healthier, or have other habits that contribute to longevity. Correlation does not establish causation.",
    },
    {
      letter: "B",
      text: "The argument relies on a sample that is too small.",
      isCorrect: false,
      explanation:
        "500 participants over 10 years is actually a reasonable sample size for this type of study. The problem isn't the size; it's the assumption of causation from a correlational finding.",
    },
    {
      letter: "C",
      text: "The argument attacks the credibility of the researchers.",
      isCorrect: false,
      explanation:
        "The argument doesn't attack the study's credibility; it accepts the findings and draws a conclusion from them. The flaw is in how it interprets those findings, not in questioning who conducted the study.",
    },
    {
      letter: "D",
      text: "The argument uses circular reasoning.",
      isCorrect: false,
      explanation:
        "Circular reasoning would be proving the same thing with itself (e.g., 'coffee is healthy because it's good for you'). Here, the argument is making a causal leap from a correlation — a different type of error.",
    },
    {
      letter: "E",
      text: "The argument assumes that all participants consumed the same amount of coffee.",
      isCorrect: false,
      explanation:
        "While dosage variation is a legitimate methodological concern, it doesn't identify the core logical flaw. The argument's primary error is inferring causation from correlation, not failing to control for quantity.",
    },
  ],
};

export default function LessonCommonFlaws() {
  const [, navigate] = useLocation();
  const { currentStep, goTo, resetProgress, hasStarted } =
    useLessonStepProgress("common-flaws", STEPS);
  const { markComplete } = useLessonCompletion("common-flaws");

  const [revealedFlawIndex, setRevealedFlawIndex] = useState<number>(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleNext = () => {
    if (currentStep === "intro") goTo("flaws");
    else if (currentStep === "flaws") goTo("practice");
    else if (currentStep === "practice") {
      goTo("recap");
      markComplete();
    }
  };

  const toggleFlawReveal = (idx: number) => {
    setRevealedFlawIndex(revealedFlawIndex === idx ? -1 : idx);
  };

  const handleAnswer = (letter: string) => {
    if (!selectedAnswer) {
      setSelectedAnswer(letter);
      setShowExplanation(true);
    }
  };

  const handleReset = () => {
    resetProgress();
    setRevealedFlawIndex(-1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCorrect = selectedAnswer === "A";

  return (
    <>
      <PageMeta
        title="Common Flaws in Reasoning | LSAT Mastery"
        description="Identify the 6 most common logical flaws on the LSAT. Interactive lesson with a Flaw Spotter exercise, taught by Devaney M. Page, JD."
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
        {/* Intro section */}
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
                  background: "rgba(184,64,48,0.12)",
                  border: "1px solid rgba(184,64,48,0.25)",
                }}
              >
                <AlertCircle size={28} style={{ color: "#B84030" }} />
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
                  Common Flaws
                </h1>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    color: "rgba(30,33,48,0.5)",
                  }}
                >
                  The 19 Most Tested Logical Fallacies
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
              The LSAT tests your ability to identify logical errors in arguments. This lesson teaches you the most common flaws that appear on the exam — the mistakes in reasoning that make arguments invalid or weak.
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
              Learn the Flaws
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Flaws section */}
        {currentStep === "flaws" && (
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
              Five Key Flaws (of 19)
            </h2>

            <div className="space-y-4 mb-10">
              {FLAWS.map((flaw, idx) => (
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
                    onClick={() => toggleFlawReveal(idx)}
                    className="w-full text-left p-5 hover:bg-opacity-50 transition-all duration-200"
                    style={{
                      background:
                        revealedFlawIndex === idx
                          ? "rgba(184,64,48,0.05)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: "#B84030",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {idx + 1}. {flaw.name}
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(30,33,48,0.6)",
                          }}
                        >
                          {flaw.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: "#B84030",
                          transform:
                            revealedFlawIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                          flexShrink: 0,
                          marginLeft: "1rem",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {revealedFlawIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div className="mb-3 pt-4">
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
                            Example:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "#1E2130",
                              fontStyle: "italic",
                              lineHeight: 1.6,
                            }}
                          >
                            "{flaw.example}"
                          </p>
                        </div>
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: "rgba(184,64,48,0.07)",
                            border: "1px solid rgba(184,64,48,0.2)",
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
                            Why it's a flaw:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {flaw.why}
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
              Practice Question
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Practice section */}
        {currentStep === "practice" && (
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
              Practice: Identify the Flaw
            </h2>

            {/* Stimulus */}
            <div
              className="rounded-xl p-6 mb-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <p
                style={{
                  color: "rgba(30,33,48,0.4)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Stimulus
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: "#1E2130",
                  lineHeight: 1.85,
                }}
              >
                {PRACTICE_QUESTION.stimulus}
              </p>
            </div>

            {/* Question */}
            <div
              className="rounded-xl px-6 py-4 mb-8"
              style={{
                background: "rgba(184,64,48,0.07)",
                border: "1px solid rgba(184,64,48,0.2)",
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
                {PRACTICE_QUESTION.question}
              </p>
            </div>

            {/* Answers — 5 choices */}
            <div className="space-y-3 mb-8">
              {PRACTICE_QUESTION.answers.map((answer) => {
                const isSelected = selectedAnswer === answer.letter;
                const isThisCorrect = answer.isCorrect;

                return (
                  <motion.button
                    key={answer.letter}
                    onClick={() => handleAnswer(answer.letter)}
                    disabled={!!selectedAnswer}
                    className="w-full text-left rounded-xl p-4 transition-all duration-200"
                    style={{
                      background:
                        isSelected && isThisCorrect
                          ? "rgba(46,125,82,0.08)"
                          : isSelected && !isThisCorrect
                          ? "rgba(184,64,48,0.08)"
                          : !isSelected && selectedAnswer && isThisCorrect
                          ? "rgba(46,125,82,0.04)"
                          : "#FFFFFF",
                      border:
                        isSelected && isThisCorrect
                          ? "1px solid rgba(46,125,82,0.3)"
                          : isSelected && !isThisCorrect
                          ? "1px solid rgba(184,64,48,0.3)"
                          : !isSelected && selectedAnswer && isThisCorrect
                          ? "1px solid rgba(46,125,82,0.2)"
                          : "1px solid rgba(0,0,0,0.08)",
                      opacity: selectedAnswer && !isSelected && !isThisCorrect ? 0.45 : 1,
                      cursor: selectedAnswer ? "default" : "pointer",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-0.5"
                        style={{
                          background:
                            isSelected && isThisCorrect
                              ? "#2E7D52"
                              : isSelected && !isThisCorrect
                              ? "#B84030"
                              : !isSelected && selectedAnswer && isThisCorrect
                              ? "#2E7D52"
                              : "rgba(30,33,48,0.1)",
                          color:
                            isSelected || (!isSelected && selectedAnswer && isThisCorrect)
                              ? "#FFFFFF"
                              : "rgba(30,33,48,0.4)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {isSelected && isThisCorrect
                          ? "✓"
                          : isSelected && !isThisCorrect
                          ? "✗"
                          : !isSelected && selectedAnswer && isThisCorrect
                          ? "✓"
                          : answer.letter}
                      </div>
                      <p
                        style={{
                          fontFamily: "'Lora', serif",
                          fontSize: "0.95rem",
                          color: "#1E2130",
                          lineHeight: 1.6,
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
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl p-5 mb-8"
                  style={{
                    background: isCorrect
                      ? "rgba(46,125,82,0.08)"
                      : "rgba(184,64,48,0.06)",
                    border: `1px solid ${isCorrect ? "rgba(46,125,82,0.3)" : "rgba(184,64,48,0.25)"}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 size={20} style={{ color: "#2E7D52", marginTop: "2px" }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: "#B84030", marginTop: "2px" }} />
                    )}
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: isCorrect ? "#2E7D52" : "#B84030",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {isCorrect ? "✓ Correct!" : "Not quite — here's why:"}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Lora', serif",
                          fontSize: "0.9rem",
                          color: "rgba(30,33,48,0.65)",
                          lineHeight: 1.7,
                        }}
                      >
                        {PRACTICE_QUESTION.answers.find((a) => a.letter === selectedAnswer)?.explanation}
                      </p>
                      {!isCorrect && (
                        <p
                          className="mt-3"
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(46,125,82,0.8)",
                            lineHeight: 1.7,
                          }}
                        >
                          <strong style={{ color: "#2E7D52" }}>Correct answer (A):</strong>{" "}
                          {PRACTICE_QUESTION.answers.find((a) => a.isCorrect)?.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedAnswer && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                View Recap
                <ChevronRight size={18} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Recap section */}
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
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                  marginBottom: "1rem",
                }}
              >
                <strong style={{ color: "#1E2130" }}>Flaw questions</strong> ask you to identify what's wrong with an argument. The argument might have valid premises but still reach an invalid conclusion.
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                }}
              >
                Master the 19 common flaws, and you'll recognize these patterns instantly. Look for logical errors like <strong style={{ color: "#1E2130" }}>confusing correlation with causation</strong>, <strong style={{ color: "#1E2130" }}>hasty generalizations</strong>, and <strong style={{ color: "#1E2130" }}>circular reasoning</strong>.
              </p>
            </div>

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
