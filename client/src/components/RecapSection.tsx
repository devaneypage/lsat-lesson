/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Recap section — three key takeaways with icons, animated reveal.
 */

import { motion } from "framer-motion";
import { GitBranch, Zap, FlaskConical } from "lucide-react";

const TAKEAWAYS = [
  {
    icon: GitBranch,
    number: "01",
    title: "Find the Gap",
    body: "Every argument has a gap — an unstated premise the author relies on. Your first job is always to identify the conclusion and the premise, then ask: what must be true for this leap to make sense?",
    color: "#F0D060",
  },
  {
    icon: Zap,
    number: "02",
    title: "Necessary = Must Be True",
    body: "A Necessary Assumption is not just something that could be true — it is something the argument cannot function without. If it's false, the argument collapses. This is the definition that guides everything.",
    color: "#6BAF8A",
  },
  {
    icon: FlaskConical,
    number: "03",
    title: "Master the Negation Test™",
    body: "Negate the answer choice. Plug it back in. If the conclusion becomes impossible, you've found your answer — provably, not by instinct. Use this every single time.",
    color: "#C4614A",
  },
];

export default function RecapSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-6"
      style={{ background: "#1C1F26" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(107,175,138,0.15)", color: "#6BAF8A", border: "1px solid rgba(107,175,138,0.3)" }}
          >
            Lesson Complete
          </span>
        </div>

        {/* Heading */}
        <h2
          className="mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F0EDE6", lineHeight: 1.15 }}
        >
          Recap & Key Takeaways
        </h2>
        <p
          className="mb-12"
          style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.8 }}
        >
          These three principles form the foundation of your Necessary Assumptions strategy. Internalize them, and you'll find that they connect directly to Sufficient Assumptions, Strengthen/Weaken questions, and more.
        </p>

        {/* Takeaway cards */}
        <div className="space-y-5">
          {TAKEAWAYS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex gap-5 rounded-xl p-6"
                style={{ background: "#252830", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Icon + number */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}40` }}
                  >
                    <Icon size={22} style={{ color: item.color }} />
                  </div>
                  <span
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}
                  >
                    {item.number}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3
                    className="mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: item.color }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: "0.97rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.8 }}>
                    {item.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* What's next teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 rounded-xl p-6"
          style={{ background: "rgba(240,208,96,0.06)", border: "1px solid rgba(240,208,96,0.2)" }}
        >
          <p style={{ color: "#F0D060", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            What's Next
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(240,237,230,0.7)", lineHeight: 1.8 }}>
            Necessary Assumptions are just one piece of the puzzle — but they are a foundational one. Once you have this skill locked in, you'll find that it connects directly to{" "}
            <strong style={{ color: "#F0EDE6" }}>Sufficient Assumptions</strong>,{" "}
            <strong style={{ color: "#F0EDE6" }}>Strengthen & Weaken</strong> questions, and{" "}
            <strong style={{ color: "#F0EDE6" }}>Flaw in the Reasoning</strong>. The logic is the same — only the task changes.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
