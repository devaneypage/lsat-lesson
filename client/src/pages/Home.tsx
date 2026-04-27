/**
 * DESIGN: Academic Chalkboard Deconstructed
 * - Dark charcoal (#1C1F26) backgrounds
 * - Chalk-white text, amber highlights, sage green/terracotta for feedback
 * - Space Grotesk headers, Lora for stimulus text, JetBrains Mono for logic
 * - Progressive disclosure: each section unlocks as student advances
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import HeroSection from "@/components/HeroSection";
import ProgressBar from "@/components/ProgressBar";
import BridgeSection from "@/components/BridgeSection";
import NegationTestSection from "@/components/NegationTestSection";
import ProTipSection from "@/components/ProTipSection";
import PracticeSection from "@/components/PracticeSection";
import RecapSection from "@/components/RecapSection";
import FooterSection from "@/components/FooterSection";

export type LessonStep = "hero" | "bridge" | "negation" | "protip" | "practice" | "recap";

const STEPS: LessonStep[] = ["hero", "bridge", "negation", "protip", "practice", "recap"];

const SectionReveal = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(0);

  const advanceTo = (step: number) => {
    setCurrentStep((prev) => Math.max(prev, step));
    setTimeout(() => {
      const el = document.getElementById(`section-${STEPS[step]}`);
      if (el) {
        const offset = step > 0 ? 60 : 0;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 120);
  };

  const isUnlocked = (step: number) => currentStep >= step;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Sticky progress bar */}
      <AnimatePresence>
        {currentStep > 0 && (
          <ProgressBar currentStep={currentStep} totalSteps={STEPS.length - 1} steps={STEPS} />
        )}
      </AnimatePresence>

      {/* Hero — always visible */}
      <div id="section-hero" style={{ scrollMarginTop: "60px" }}>
        <HeroSection onStart={() => advanceTo(1)} />
      </div>

      {/* Section 1: Bridge Analogy */}
      {isUnlocked(1) && (
        <SectionReveal id="section-bridge">
          <BridgeSection onComplete={() => advanceTo(2)} />
        </SectionReveal>
      )}

      {/* Section 2: The Negation Test */}
      {isUnlocked(2) && (
        <SectionReveal id="section-negation">
          <NegationTestSection onComplete={() => advanceTo(3)} />
        </SectionReveal>
      )}

      {/* Section 3: Pro Tip */}
      {isUnlocked(3) && (
        <SectionReveal id="section-protip">
          <ProTipSection onComplete={() => advanceTo(4)} />
        </SectionReveal>
      )}

      {/* Section 4: Practice Question */}
      {isUnlocked(4) && (
        <SectionReveal id="section-practice">
          <PracticeSection onComplete={() => advanceTo(5)} />
        </SectionReveal>
      )}

      {/* Section 5: Recap */}
      {isUnlocked(5) && (
        <SectionReveal id="section-recap">
          <RecapSection />
        </SectionReveal>
      )}

      <FooterSection />
    </div>
  );
}
