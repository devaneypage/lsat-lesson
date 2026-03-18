/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Sticky top progress bar showing lesson steps.
 */

import { motion } from "framer-motion";
import type { LessonStep } from "@/pages/Home";

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
        background: "rgba(28, 31, 38, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Progress fill bar */}
      <div style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", background: "#F0D060" }}
        />
      </div>

      {/* Step indicators */}
      <div className="container">
        <div className="flex items-center justify-between py-2 overflow-x-auto">
          {steps.slice(1).map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isLocked = currentStep < stepNum;

            return (
              <div key={step} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: isDone ? "#6BAF8A" : isActive ? "#F0D060" : "rgba(255,255,255,0.1)",
                    color: isDone || isActive ? "#1C1F26" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{
                    color: isDone ? "#6BAF8A" : isActive ? "#F0D060" : "rgba(255,255,255,0.3)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {STEP_LABELS[step]}
                </span>
                {idx < steps.length - 2 && (
                  <div
                    className="w-6 h-px mx-1 hidden sm:block"
                    style={{ background: isDone ? "rgba(107,175,138,0.4)" : "rgba(255,255,255,0.1)" }}
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
