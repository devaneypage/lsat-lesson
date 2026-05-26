/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Strengthen & Weaken Questions
 * 
 * Teaches the systematic approach to finding answers that impact argument validity.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import BookingCTA from "@/components/BookingCTA";
import { useLessonStepProgress } from "@/hooks/useLessonStepProgress";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import PageMeta from "@/components/PageMeta";

type StepType = "intro" | "strengthen" | "weaken" | "practice" | "recap";
const STEPS = ["intro", "strengthen", "weaken", "practice", "recap"] as const satisfies readonly StepType[];

const STRENGTHEN_EXAMPLES = [
  {
    argument: "Most people who exercise regularly report feeling happier. Therefore, exercise causes happiness.",
    strengthen: "Studies show that people who start exercising report increased happiness within weeks.",
    why: "This provides evidence that the change in exercise leads to change in happiness, supporting causation.",
  },
  {
    argument: "The new policy reduced traffic accidents by 20%. Therefore, the policy was effective.",
    strengthen: "Accidents decreased by 20% only after the policy was implemented, not before.",
    why: "This rules out other causes and shows the policy was the reason for the decrease.",
  },
];

const WEAKEN_EXAMPLES = [
  {
    argument: "Company X's profits increased 50% last year. Therefore, the CEO's new strategy was successful.",
    weaken: "The entire industry experienced a 60% profit increase last year.",
    why: "If the industry boomed anyway, the CEO's strategy might not have been the cause of the increase.",
  },
  {
    argument: "Students who use tutoring services score higher on the SAT. Therefore, tutoring improves scores.",
    weaken: "Students who use tutoring services are typically more motivated and study harder overall.",
    why: "Motivation, not tutoring, might be the real cause of higher scores.",
  },
];

const PRACTICE_QUESTION = {
  stimulus: `A study found that people who drink green tea have lower rates of heart disease than those who don't. The researchers conclude that green tea consumption prevents heart disease.`,
  question: "Which of the following would most strengthen the argument?",
  answers: [
    {
      letter: "A",
      text: "People who drink green tea also tend to exercise more regularly.",
      type: "strengthen",
      isCorrect: false,
      explanation:
        "This would actually weaken the argument by suggesting exercise, not green tea, is the cause.",
    },
    {
      letter: "B",
      text: "In a controlled study, people who began drinking green tea showed a measurable decrease in heart disease risk within one year.",
      type: "strengthen",
      isCorrect: true,
      explanation:
        "This strengthens the argument by showing a causal link: when people start drinking green tea, their heart disease risk decreases.",
    },
    {
      letter: "C",
      text: "Green tea is less expensive than other types of tea.",
      type: "strengthen",
      isCorrect: false,
      explanation:
        "Price has nothing to do with whether green tea prevents heart disease. This is irrelevant.",
    },
    {
      letter: "D",
      text: "Some people who drink green tea still develop heart disease.",
      type: "strengthen",
      isCorrect: false,
      explanation:
        "This would weaken the argument by showing green tea doesn't always prevent heart disease.",
    },
    {
      letter: "E",
      text: "Researchers who conducted the study have received funding from green tea manufacturers.",
      type: "strengthen",
      isCorrect: false,
      explanation:
        "This actually raises concerns about researcher bias and would weaken, not strengthen, the argument's credibility. Funding conflicts are a reason to doubt, not accept, the conclusion.",
    },
  ],
};

export default function LessonStrengthenWeaken() {
  const [, navigate] = useLocation();
  const { currentStep, goTo, resetProgress, hasStarted } =
    useLessonStepProgress("strengthen-weaken", STEPS);
  const { markComplete } = useLessonCompletion("strengthen-weaken");
  const [revealedStrengthIndex, setRevealedStrengthIndex] = useState<number>(-1);
  const [revealedWeakenIndex, setRevealedWeakenIndex] = useState<number>(-1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleNext = () => {
    if (currentStep === "intro") goTo("strengthen");
    else if (currentStep === "strengthen") goTo("weaken");
    else if (currentStep === "weaken") goTo("practice");
    else if (currentStep === "practice") {
      goTo("recap");
      markComplete();
    }
  };

  const handleAnswer = (letter: string) => {
    if (!selectedAnswer) {
      setSelectedAnswer(letter);
      setShowExplanation(true);
    }
  };

  const handleReset = () => {
    resetProgress();
    setRevealedStrengthIndex(-1);
    setRevealedWeakenIndex(-1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCorrect = selectedAnswer === "B";

  return (
    <>
      <PageMeta
        title="Strengthen & Weaken Arguments | LSAT Mastery"
        description="Learn to identify evidence that strengthens or weakens LSAT arguments. Step-by-step lesson taught by Devaney M. Page, JD."
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
                  background: "rgba(46,125,82,0.12)",
                  border: "1px solid rgba(46,125,82,0.25)",
                }}
              >
                <TrendingUp size={28} style={{ color: "#2E7D52" }} />
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
                  Strengthen & Weaken
                </h1>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    color: "rgba(30,33,48,0.5)",
                  }}
                >
                  Impact Arguments with Precision
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
              Strengthen and Weaken questions ask you to find answers that either support or undermine an argument. The key is understanding what makes an argument stronger or weaker — and recognizing which answers actually do what the question asks.
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
              Learn Strengthen
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Strengthen */}
        {currentStep === "strengthen" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={24} style={{ color: "#2E7D52" }} />
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: "#1E2130",
                }}
              >
                Strengthen Questions
              </h2>
            </div>

            <div
              className="rounded-xl p-6 mb-8"
              style={{
                background: "rgba(46,125,82,0.07)",
                border: "1px solid rgba(46,125,82,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "#2E7D52" }}>Strengthen</strong> questions ask: "Which answer choice best supports the argument?"
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.95rem",
                  color: "rgba(30,33,48,0.55)",
                  lineHeight: 1.8,
                  marginTop: "0.75rem",
                }}
              >
                Look for answers that provide additional evidence, rule out alternative explanations, or support the author's reasoning.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {STRENGTHEN_EXAMPLES.map((ex, idx) => (
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
                    onClick={() => setRevealedStrengthIndex(revealedStrengthIndex === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background:
                        revealedStrengthIndex === idx
                          ? "rgba(46,125,82,0.05)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#2E7D52",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Example {idx + 1}: The Argument
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(30,33,48,0.6)",
                            fontStyle: "italic",
                          }}
                        >
                          "{ex.argument}"
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: "#2E7D52",
                          transform:
                            revealedStrengthIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {revealedStrengthIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div className="mb-3">
                          <p
                            style={{
                              color: "#2E7D52",
                              fontSize: "0.75rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginBottom: "0.4rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Strengthening Answer:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "#1E2130",
                              lineHeight: 1.6,
                            }}
                          >
                            "{ex.strengthen}"
                          </p>
                        </div>
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: "rgba(46,125,82,0.07)",
                            border: "1px solid rgba(46,125,82,0.2)",
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
                            Why it strengthens:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {ex.why}
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
              Learn Weaken
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Weaken */}
        {currentStep === "weaken" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <TrendingDown size={24} style={{ color: "#B84030" }} />
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: "#1E2130",
                }}
              >
                Weaken Questions
              </h2>
            </div>

            <div
              className="rounded-xl p-6 mb-8"
              style={{
                background: "rgba(184,64,48,0.07)",
                border: "1px solid rgba(184,64,48,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "#B84030" }}>Weaken</strong> questions ask: "Which answer choice best undermines the argument?"
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.95rem",
                  color: "rgba(30,33,48,0.55)",
                  lineHeight: 1.8,
                  marginTop: "0.75rem",
                }}
              >
                Look for answers that introduce alternative explanations, contradict the evidence, or show the conclusion doesn't follow from the premises.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {WEAKEN_EXAMPLES.map((ex, idx) => (
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
                    onClick={() => setRevealedWeakenIndex(revealedWeakenIndex === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background:
                        revealedWeakenIndex === idx
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
                            fontSize: "1rem",
                            color: "#B84030",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Example {idx + 1}: The Argument
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(30,33,48,0.6)",
                            fontStyle: "italic",
                          }}
                        >
                          "{ex.argument}"
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: "#B84030",
                          transform:
                            revealedWeakenIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {revealedWeakenIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.07)" }}
                      >
                        <div className="mb-3">
                          <p
                            style={{
                              color: "#B84030",
                              fontSize: "0.75rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginBottom: "0.4rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            ✗ Weakening Answer:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "#1E2130",
                              lineHeight: 1.6,
                            }}
                          >
                            "{ex.weaken}"
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
                            Why it weakens:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {ex.why}
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

        {/* Practice */}
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
              Practice: Strengthen the Argument
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
                background: "rgba(46,125,82,0.07)",
                border: "1px solid rgba(46,125,82,0.2)",
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

            {/* Answers */}
            <div className="space-y-3 mb-8">
              {PRACTICE_QUESTION.answers.map((answer) => {
                const isSelected = selectedAnswer === answer.letter;

                return (
                  <motion.button
                    key={answer.letter}
                    onClick={() => handleAnswer(answer.letter)}
                    disabled={!!selectedAnswer}
                    className="w-full text-left rounded-xl p-4 transition-all duration-200"
                    style={{
                      background:
                        isSelected && answer.isCorrect
                          ? "rgba(46,125,82,0.08)"
                          : isSelected && !answer.isCorrect
                          ? "rgba(184,64,48,0.08)"
                          : "#FFFFFF",
                      border:
                        isSelected && answer.isCorrect
                          ? "1px solid rgba(46,125,82,0.3)"
                          : isSelected && !answer.isCorrect
                          ? "1px solid rgba(184,64,48,0.3)"
                          : "1px solid rgba(0,0,0,0.08)",
                      opacity: selectedAnswer && !isSelected ? 0.5 : 1,
                      cursor: selectedAnswer ? "default" : "pointer",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-0.5"
                        style={{
                          background:
                            isSelected && answer.isCorrect
                              ? "#2E7D52"
                              : isSelected && !answer.isCorrect
                              ? "#B84030"
                              : "rgba(30,33,48,0.1)",
                          color:
                            isSelected
                              ? "#FFFFFF"
                              : "rgba(30,33,48,0.4)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {isSelected && answer.isCorrect
                          ? "✓"
                          : isSelected && !answer.isCorrect
                          ? "✗"
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
                        {isCorrect ? "✓ Correct!" : "Not quite."}
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
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                  marginBottom: "1rem",
                }}
              >
                <strong style={{ color: "#2E7D52" }}>Strengthen</strong> questions reward answers that provide additional evidence or rule out alternative explanations. <strong style={{ color: "#B84030" }}>Weaken</strong> questions reward answers that introduce doubt or show the conclusion doesn't follow.
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                }}
              >
                Always read the question carefully: does it ask you to strengthen OR weaken? Then eliminate answers that do the opposite of what's asked.
              </p>
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
