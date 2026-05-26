/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Necessary Assumptions with the Negation Test™
 *
 * Progress is persisted to localStorage so students can resume mid-lesson.
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft, RotateCcw } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ProgressBar from "@/components/ProgressBar";
import BridgeSection from "@/components/BridgeSection";
import NegationTestSection from "@/components/NegationTestSection";
import ProTipSection from "@/components/ProTipSection";
import PracticeSection from "@/components/PracticeSection";
import RecapSection from "@/components/RecapSection";
import FooterSection from "@/components/FooterSection";
import SessionPlanCTA from "@/components/SessionPlanCTA";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import type { LessonStep } from "@/components/ProgressBar";
import PageMeta from "@/components/PageMeta";

const STEPS: LessonStep[] = ["hero", "bridge", "negation", "protip", "practice", "recap"];

export default function LessonNecessaryAssumptions() {
  const [, navigate] = useLocation();
  const { currentStep, setCurrentStep, resetProgress, hasStarted } =
    useLessonProgress("necessary-assumptions");
  const { markComplete } = useLessonCompletion("necessary-assumptions");

  const handleStart = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepComplete = () => {
    const nextStep = currentStep + 1;
    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep);
      // Mark complete when reaching recap (last step)
      if (nextStep >= STEPS.length - 1) {
        markComplete();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    resetProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    navigate("/lessons");
  };

  return (
    <>
      <PageMeta
        title="Necessary Assumptions | LSAT Mastery"
        description="Master the Negation Test for Necessary Assumption questions. Step-by-step LSAT lesson taught by Devaney M. Page, JD."
      />
      <div className="min-h-screen" style={{ background: "#F7F4EF" }}>
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={handleBack}
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

        {/* Reset Progress button — only shown after lesson has started */}
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

        {/* Progress bar */}
        {currentStep > 0 && (
          <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
        )}

        {/* Hero section */}
        {currentStep === 0 && <HeroSection onStart={handleStart} />}

        {/* Bridge section */}
        {currentStep >= 1 && (
          <div style={{ paddingTop: currentStep === 1 ? "80px" : "0" }}>
            <BridgeSection onComplete={handleStepComplete} />
          </div>
        )}

        {/* Negation Test section */}
        {currentStep >= 2 && (
          <div style={{ paddingTop: currentStep === 2 ? "80px" : "0" }}>
            <NegationTestSection onComplete={handleStepComplete} />
          </div>
        )}

        {/* Pro Tip section */}
        {currentStep >= 3 && (
          <div style={{ paddingTop: currentStep === 3 ? "80px" : "0" }}>
            <ProTipSection onComplete={handleStepComplete} />
          </div>
        )}

        {/* Practice section */}
        {currentStep >= 4 && (
          <div style={{ paddingTop: currentStep === 4 ? "80px" : "0" }}>
            <PracticeSection onComplete={handleStepComplete} />
          </div>
        )}

        {/* Recap section */}
        {currentStep >= 5 && (
          <div style={{ paddingTop: currentStep === 5 ? "80px" : "0" }}>
            <RecapSection />
            <FooterSection />
            <SessionPlanCTA
              lessonTitle="Necessary Assumptions"
              lessonDescription="Master the Negation Test™ framework to identify necessary assumptions in LSAT arguments."
            />
          </div>
        )}
      </div>
    </>
  );
}
