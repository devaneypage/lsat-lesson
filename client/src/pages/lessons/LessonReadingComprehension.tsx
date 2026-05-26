/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Reading Comprehension - Passage Mapping
 * 
 * Teaches students how to efficiently annotate passages and identify key structural elements.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, BookMarked, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import BookingCTA from "@/components/BookingCTA";
import { useLessonStepProgress } from "@/hooks/useLessonStepProgress";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import PageMeta from "@/components/PageMeta";

type RCStep = "intro" | "framework" | "mapping" | "practice" | "recap";
const STEPS = ["intro", "framework", "mapping", "practice", "recap"] as const satisfies readonly RCStep[];

const PASSAGE = `The development of artificial intelligence has raised important questions about the nature of human cognition. Some researchers argue that AI systems, particularly those using deep learning, operate fundamentally differently from human brains. However, recent studies suggest that both artificial and biological neural networks rely on similar mathematical principles.

One key difference lies in adaptability. Human brains continuously reorganize themselves throughout life, a process known as neuroplasticity. This allows humans to learn new skills and recover from injuries in ways that current AI systems cannot. Conversely, AI systems can process vast amounts of data instantaneously—a capability that far exceeds human capacity.

The question of consciousness remains central to this debate. While AI systems can perform sophisticated tasks, they lack subjective experience. They do not "understand" information in the way humans do. This distinction matters not only philosophically but also practically, as it affects how we deploy AI in sensitive domains like healthcare and criminal justice.`;

const MAPPING_TIPS = [
  {
    title: "Main Idea",
    description: "What is the author's primary argument or central claim?",
    example: "AI and human cognition operate on similar principles but differ in adaptability and consciousness.",
    color: "#2E7D52",
  },
  {
    title: "Structure",
    description: "How is the passage organized? (Compare/contrast, problem/solution, etc.)",
    example: "This passage compares AI and human brains, highlighting similarities and differences.",
    color: "#C8860A",
  },
  {
    title: "Tone",
    description: "What is the author's attitude? (Neutral, critical, supportive, etc.)",
    example: "The author is analytical and balanced, presenting multiple perspectives.",
    color: "#B84030",
  },
  {
    title: "Key Details",
    description: "What specific examples or evidence support the main idea?",
    example: "Neuroplasticity, deep learning, data processing speed, consciousness.",
    color: "#5B4A8A",
  },
];

const PRACTICE_QUESTIONS = [
  {
    question: "The primary purpose of the passage is to",
    answers: [
      { letter: "A", text: "Argue that AI is superior to human cognition", isCorrect: false },
      { letter: "B", text: "Compare and contrast AI and human brains, noting similarities and key differences", isCorrect: true },
      { letter: "C", text: "Explain why AI systems lack consciousness", isCorrect: false },
      { letter: "D", text: "Criticize the use of AI in healthcare and criminal justice", isCorrect: false },
      { letter: "E", text: "Propose a new theory of consciousness based on neural network research", isCorrect: false },
    ],
    explanation:
      "The passage presents a balanced comparison of AI and human cognition, highlighting both similarities (mathematical principles) and differences (neuroplasticity, consciousness). This is the main structure of the passage.",
  },
  {
    question: "Based on the passage, which of the following is true about neuroplasticity?",
    answers: [
      { letter: "A", text: "It is a capability that AI systems possess", isCorrect: false },
      { letter: "B", text: "It allows humans to learn and recover in ways current AI cannot", isCorrect: true },
      { letter: "C", text: "It is less important than processing speed", isCorrect: false },
      { letter: "D", text: "It prevents humans from learning new skills", isCorrect: false },
      { letter: "E", text: "It is a mathematical principle shared by both AI and human brains", isCorrect: false },
    ],
    explanation:
      "The passage explicitly states: 'Human brains continuously reorganize themselves throughout life, a process known as neuroplasticity. This allows humans to learn new skills and recover from injuries in ways that current AI systems cannot.'",
  },
];

export default function LessonReadingComprehension() {
  const [, navigate] = useLocation();
  const { currentStep, goTo, resetProgress, hasStarted } =
    useLessonStepProgress("reading-comprehension", STEPS);
  const { markComplete } = useLessonCompletion("reading-comprehension");
  const [revealedTipIndex, setRevealedTipIndex] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showExplanations, setShowExplanations] = useState<{ [key: number]: boolean }>({});

  const handleNext = () => {
    if (currentStep === "intro") goTo("framework");
    else if (currentStep === "framework") goTo("mapping");
    else if (currentStep === "mapping") goTo("practice");
    else if (currentStep === "practice") {
      goTo("recap");
      markComplete();
    }
  };

  const handleReset = () => {
    resetProgress();
    setRevealedTipIndex(-1);
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
        title="RC Passage Mapping | LSAT Mastery"
        description="Master LSAT Reading Comprehension with passage mapping, question strategies, and comparative passage techniques. Taught by Devaney M. Page, JD."
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
                <BookMarked size={28} style={{ color: "#5B4A8A" }} />
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
                  Reading Comprehension
                </h1>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    color: "rgba(30,33,48,0.5)",
                  }}
                >
                  Master Passage Mapping
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
              The Reading Comprehension section tests your ability to understand complex passages and answer questions about them. The key to success is efficient passage mapping—annotating passages strategically to identify the author's main idea, structure, tone, and key details.
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
              Learn Mapping Framework
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Framework */}
        {currentStep === "framework" && (
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
              The Four-Part Mapping Framework
            </h2>

            <div className="space-y-4 mb-10">
              {MAPPING_TIPS.map((tip, idx) => (
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
                    onClick={() => setRevealedTipIndex(revealedTipIndex === idx ? -1 : idx)}
                    className="w-full text-left p-5 transition-all duration-200"
                    style={{
                      background:
                        revealedTipIndex === idx
                          ? `rgba(${tip.color === "#2E7D52" ? "46,125,82" : tip.color === "#C8860A" ? "200,134,10" : tip.color === "#B84030" ? "184,64,48" : "91,74,138"},0.05)`
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
                            color: tip.color,
                            marginBottom: "0.25rem",
                          }}
                        >
                          {idx + 1}. {tip.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "0.9rem",
                            color: "rgba(30,33,48,0.6)",
                          }}
                        >
                          {tip.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        style={{
                          color: tip.color,
                          transform:
                            revealedTipIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {revealedTipIndex === idx && (
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
                            background: `rgba(${tip.color === "#2E7D52" ? "46,125,82" : tip.color === "#C8860A" ? "200,134,10" : tip.color === "#B84030" ? "184,64,48" : "91,74,138"},0.08)`,
                            border: `1px solid rgba(${tip.color === "#2E7D52" ? "46,125,82" : tip.color === "#C8860A" ? "200,134,10" : tip.color === "#B84030" ? "184,64,48" : "91,74,138"},0.2)`,
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
                            Example:
                          </p>
                          <p
                            style={{
                              fontFamily: "'Lora', serif",
                              fontSize: "0.9rem",
                              color: "rgba(30,33,48,0.65)",
                              lineHeight: 1.6,
                            }}
                          >
                            {tip.example}
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
              Practice Mapping
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Mapping Exercise */}
        {currentStep === "mapping" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
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
              Map This Passage
            </h2>

            {/* Passage */}
            <div
              className="rounded-xl p-6 mb-8"
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
                Sample Passage
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "#1E2130",
                  lineHeight: 2,
                  letterSpacing: "0.3px",
                }}
              >
                {PASSAGE}
              </p>
            </div>

            {/* Mapping Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[
                {
                  label: "Main Idea",
                  answer:
                    "AI and human cognition operate on similar mathematical principles but differ in adaptability and consciousness.",
                  color: "#2E7D52",
                },
                {
                  label: "Structure",
                  answer: "Comparison/contrast: similarities in principles, differences in adaptability and consciousness.",
                  color: "#C8860A",
                },
                {
                  label: "Tone",
                  answer: "Analytical and balanced; the author presents multiple perspectives without strong bias.",
                  color: "#B84030",
                },
                {
                  label: "Key Details",
                  answer: "Neuroplasticity, deep learning, data processing, consciousness, healthcare, criminal justice.",
                  color: "#5B4A8A",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-xl p-4"
                  style={{
                    background: "#FFFFFF",
                    border: `2px solid ${item.color}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: item.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.answer}
                  </p>
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
              Answer Questions
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Practice Questions */}
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
                const isCorrect = selectedAnswer === "B";

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

                        return (
                          <motion.button
                            key={answer.letter}
                            onClick={() => handleAnswer(qIdx, answer.letter)}
                            disabled={!!selectedAnswer}
                            className="w-full text-left rounded-lg p-3 transition-all duration-200"
                            style={{
                              background:
                                isSelected && answer.isCorrect
                                  ? "rgba(46,125,82,0.08)"
                                  : isSelected && !answer.isCorrect
                                  ? "rgba(184,64,48,0.08)"
                                  : "#F7F4EF",
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
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs mt-0.5"
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
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                  marginBottom: "1rem",
                }}
              >
                <strong style={{ color: "#1E2130" }}>Efficient passage mapping</strong> is the foundation of Reading Comprehension success. By identifying the main idea, structure, tone, and key details during your first read, you'll answer questions faster and more accurately.
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.65)",
                  lineHeight: 1.8,
                }}
              >
                Remember: <strong style={{ color: "#1E2130" }}>Don't try to memorize the passage.</strong> Instead, annotate strategically so you can quickly locate information when answering questions. The passage will always be there for reference.
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
