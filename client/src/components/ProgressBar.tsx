/**
 * DESIGN: Academic Light — Warm Parchment
 * Sticky progress bar: white background, navy text, amber progress fill.
 */

import { motion } from "framer-motion";
export type LessonStep = "hero" | "bridge" | "negation" | "protip" | "practice" | "recap";

const STEP_LABELS: Record<LessonStep, string> = {
  hero: "Intro",
  bridge: "The Bridge",
  negation: "Negation Test™",
  protip: "Pro Tip",
  practice: "Practice",
  recap: "Recap",
};

interface Props {
  currentStep: number;
  totalSteps: number;
  steps: LessonStep[];
}

export default function ProgressBar({ currentStep, totalSteps, steps }: Props) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(247,244,239,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Progress fill bar */}
      <div style={{ height: "3px", background: "rgba(200,134,10,0.15)" }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", background: "#C8860A" }}
        />
      </div>

      {/* Step indicators */}
      <div className="container">
        <div className="flex items-center justify-between py-2 overflow-x-auto">
          {steps.slice(1).map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={step} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: isDone
                      ? "#2E7D52"
                      : isActive
                      ? "#C8860A"
                      : "rgba(30,33,48,0.1)",
                    color: isDone || isActive ? "#FFFFFF" : "rgba(30,33,48,0.3)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{
                    color: isDone
                      ? "#2E7D52"
                      : isActive
                      ? "#C8860A"
                      : "rgba(30,33,48,0.35)",
                    letterSpacing: "0.03em",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {STEP_LABELS[step]}
                </span>
                {idx < steps.length - 2 && (
                  <div
                    className="w-6 h-px mx-1 hidden sm:block"
                    style={{
                      background: isDone
                        ? "rgba(46,125,82,0.3)"
                        : "rgba(30,33,48,0.1)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
