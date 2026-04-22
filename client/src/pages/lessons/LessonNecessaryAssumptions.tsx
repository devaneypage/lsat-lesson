/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Necessary Assumptions with the Negation Test™
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ProgressBar from "@/components/ProgressBar";
import BridgeSection from "@/components/BridgeSection";
import NegationTestSection from "@/components/NegationTestSection";
import ProTipSection from "@/components/ProTipSection";
import PracticeSection from "@/components/PracticeSection";
import RecapSection from "@/components/RecapSection";
import FooterSection from "@/components/FooterSection";
import SessionPlanCTA from "@/components/SessionPlanCTA";

export type LessonStep = "hero" | "bridge" | "negation" | "protip" | "practice" | "recap";

const STEPS: LessonStep[] = ["hero", "bridge", "negation", "protip", "practice", "recap"];

export default function LessonNecessaryAssumptions() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleStart = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepComplete = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F4EF" }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-40 p-2 rounded-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ChevronLeft size={20} style={{ color: "#1E2130" }} />
      </motion.button>

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
  );
}
