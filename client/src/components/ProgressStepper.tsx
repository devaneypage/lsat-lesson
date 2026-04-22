/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Component: Progress Stepper
 * 
 * Visual step indicator showing lesson progress (1/5, 2/5, etc.)
 */

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function ProgressStepper({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{
            background: "rgba(45, 27, 105, 0.1)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
            style={{
              background: `linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)`,
            }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (step - 1) * 0.05 }}
              className="flex flex-col items-center flex-1"
            >
              {/* Step Circle */}
              <motion.div
                className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200 mb-2"
                style={{
                  background: isCompleted
                    ? "var(--primary)"
                    : isCurrent
                    ? "var(--secondary)"
                    : "rgba(45, 27, 105, 0.1)",
                  color: isCompleted || isCurrent ? "var(--foreground)" : "var(--muted-foreground)",
                  fontSize: "0.875rem",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  boxShadow: isCurrent
                    ? "0 0 0 3px rgba(255, 184, 28, 0.3)"
                    : "none",
                }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: isCurrent
                    ? "0 0 0 4px rgba(255, 184, 28, 0.4)"
                    : "0 2px 8px rgba(45, 27, 105, 0.15)",
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={20} style={{ color: "var(--primary-foreground)" }} />
                ) : (
                  <span>{step}</span>
                )}
              </motion.div>

              {/* Step Label */}
              {stepLabels && stepLabels[step - 1] && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: isCurrent ? "var(--primary)" : "var(--muted-foreground)",
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: "80px",
                  }}
                >
                  {stepLabels[step - 1]}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current Step Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-4 text-center"
      >
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          Step {currentStep} of {totalSteps}
        </span>
      </motion.div>
    </motion.div>
  );
}
