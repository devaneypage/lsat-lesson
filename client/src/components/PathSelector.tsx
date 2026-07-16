/**
 * PathSelector Component
 * Entry point where students choose their study focus area
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentPathType } from "@/types/unified";
import { usePath } from "@/contexts/PathContext";
import { BookOpen, Brain, Zap, Target, User, ArrowRight, Calendar } from "lucide-react";

interface PathOption {
  type: StudentPathType;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedHours: number;
  topics: string[];
  color: string;
}

const PATH_OPTIONS: PathOption[] = [
  {
    type: "LOGICAL_REASONING",
    title: "Master Logical Reasoning",
    description:
      "Deep dive into argument analysis, assumptions, flaws, and strengthening/weakening arguments. Perfect for students who struggle with the LR section.",
    icon: <Brain className="w-8 h-8" />,
    estimatedHours: 40,
    topics: [
      "Main Point",
      "Assumptions",
      "Flaws",
      "Strengthen/Weaken",
      "Parallel Reasoning",
    ],
    color: "#1a7dff",
  },
  {
    type: "READING_COMPREHENSION",
    title: "Ace Reading Comprehension",
    description:
      "Master passage mapping, question types, and speed reading strategies. Build confidence with complex texts and comparative passages.",
    icon: <BookOpen className="w-8 h-8" />,
    estimatedHours: 25,
    topics: [
      "Passage Mapping",
      "Main Idea",
      "Inference",
      "Comparative Passages",
      "Question Strategy",
    ],
    color: "#439cdf",
  },
  {
    type: "FORMAL_LOGIC",
    title: "Formal Logic Foundations",
    description:
      "Build a solid foundation in logical notation, conditionals, negation, and quantifiers. Essential for understanding complex arguments.",
    icon: <Zap className="w-8 h-8" />,
    estimatedHours: 15,
    topics: [
      "Logical Notation",
      "Conditionals",
      "Negation",
      "Quantifiers",
      "De Morgan's Laws",
    ],
    color: "#46e291",
  },
  {
    type: "TEST_STRATEGY",
    title: "Test Strategy & Execution",
    description:
      "Learn time management, pacing strategies, anxiety management, and test-day tactics. Maximize your score on exam day.",
    icon: <Target className="w-8 h-8" />,
    estimatedHours: 10,
    topics: [
      "Time Management",
      "Pacing",
      "Anxiety Management",
      "Test-Day Checklist",
      "Score Optimization",
    ],
    color: "#ffdd33",
  },
];

export default function PathSelector() {
  const [, navigate] = useLocation();
  const { setSelectedPath } = usePath();
  const [selectedType, setSelectedType] = useState<StudentPathType | null>(null);

  const handleSelectPath = (path: StudentPathType) => {
    setSelectedPath(path);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2D3561] mb-4">
            Choose Your Learning Path
          </h1>
          <h2 className="text-base font-semibold text-[#5B4A8A] mb-3 tracking-wide uppercase" style={{ letterSpacing: "0.08em", fontSize: "0.8rem" }}>
            Free LSAT Lessons &mdash; Logical Reasoning &amp; Reading Comprehension
          </h2>
          <p className="text-lg text-[#4A5578] max-w-2xl mx-auto mb-4">
            Select the area where you want to focus your LSAT preparation. You can change your path anytime.
          </p>
          <button
            onClick={() => navigate("/about")}
            className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:opacity-80"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              color: "rgba(91,74,138,0.75)",
            }}
          >
            <User size={14} style={{ color: "#5B4A8A" }} />
            Taught by Devaney M. Page, JD
          </button>
        </div>

        {/* Path Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {PATH_OPTIONS.map((path) => (
            <Card
              key={path.type}
              className={`p-6 cursor-pointer transition-all duration-300 border-2 ${
                selectedType === path.type
                  ? "border-[#0052CC] bg-blue-50"
                  : "border-transparent hover:border-[#0052CC] hover:shadow-lg"
              }`}
              onClick={() => setSelectedType(path.type)}
            >
              {/* Icon & Color Bar */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: path.color }}
                >
                  {path.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2D3561]">
                    {path.title}
                  </h3>
                  <p className="text-sm text-[#4A5578] mt-1">
                    {path.estimatedHours} hours
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#4A5578] mb-4">{path.description}</p>

              {/* Topics */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#2D3561] mb-2">
                  Key Topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {path.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: path.color + "20",
                        color: path.color,
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                  {path.topics.length > 3 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-[#4A5578] bg-[#E8E6E1]">
                      +{path.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Select Button */}
              <Button
                onClick={() => handleSelectPath(path.type)}
                className={`w-full font-semibold transition-all ${
                  selectedType === path.type
                    ? "bg-[#0052CC] text-white hover:bg-[#0041A3]"
                    : "bg-[#F0EDE8] text-[#2D3561] hover:bg-[#0052CC] hover:text-white"
                }`}
              >
                {selectedType === path.type ? "Selected ✓" : "Select Path"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Comprehensive Option */}
        <div className="bg-white rounded-lg border-2 border-[#FFD700] p-8 text-center">
          <h3 className="text-2xl font-bold text-[#2D3561] mb-2">
            Want Everything?
          </h3>
          <p className="text-[#4A5578] mb-6">
            Choose the Comprehensive path to access all lessons, questions, and tools.
          </p>
          <Button
            onClick={() => handleSelectPath("COMPREHENSIVE")}
            className="bg-[#FFD700] text-[#2D3561] font-semibold hover:bg-[#FFC700]"
          >
            Start Comprehensive Path
          </Button>
        </div>

        {/* Book a Session CTA */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/booking")}
            className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #5B4A8A 0%, #7B5EA7 100%)",
              color: "white",
              boxShadow: "0 4px 16px rgba(91,74,138,0.35)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(91,74,138,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,74,138,0.35)";
            }}
          >
            <Calendar size={18} />
            Book a Session with Devaney
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Expertise Section — SEO: highlights LR and RC for keyword alignment */}
        <section
          className="mt-12"
          style={{
            borderTop: "1.5px solid #e5e7eb",
            paddingTop: "2.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: "1.35rem",
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "#1C1F26",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Expert LSAT Tutoring in Two Core Domains
          </h2>
          <p
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: "0.95rem",
              color: "#6B7280",
              textAlign: "center",
              maxWidth: "560px",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            Every lesson is built around the two sections that determine your LSAT score.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            {/* Logical Reasoning */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: "6px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#0E7C7B", flexShrink: 0 }} />
                <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1rem", fontWeight: 900, color: "#1C1F26", margin: 0, letterSpacing: "0.02em" }}>
                  Logical Reasoning
                </h3>
              </div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.6, margin: "0 0 1rem" }}>
                Master argument analysis through five structured lessons: necessary assumptions,
                sufficient assumptions, flaw in reasoning, common flaws, and strengthen/weaken.
                Each lesson uses real LSAT-style questions with step-by-step walkthroughs.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {["Necessary Assumptions", "Sufficient Assumptions", "Flaw in Reasoning", "Common Flaws", "Strengthen/Weaken"].map((t) => (
                  <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#0E7C7B", background: "rgba(14,124,123,0.08)", border: "1px solid rgba(14,124,123,0.2)", borderRadius: "3px", padding: "0.2rem 0.5rem", letterSpacing: "0.03em" }}>{t}</span>
                ))}
              </div>
            </div>
            {/* Reading Comprehension */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: "6px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#D4860A", flexShrink: 0 }} />
                <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "1rem", fontWeight: 900, color: "#1C1F26", margin: 0, letterSpacing: "0.02em" }}>
                  Reading Comprehension
                </h3>
              </div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.6, margin: "0 0 1rem" }}>
                Build the passage-mapping and inference skills needed to handle dense academic
                texts under timed conditions. Learn to identify main ideas, author tone, and
                comparative passage structure with precision.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {["Passage Mapping", "Main Idea", "Inference", "Author Tone", "Comparative Passages"].map((t) => (
                  <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#D4860A", background: "rgba(212,134,10,0.08)", border: "1px solid rgba(212,134,10,0.2)", borderRadius: "3px", padding: "0.2rem 0.5rem", letterSpacing: "0.03em" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Meet Your Instructor */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => navigate("/about")}
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(91,74,138,0.07)",
              border: "1px solid rgba(91,74,138,0.18)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(91,74,138,0.15)" }}
            >
              <User size={16} style={{ color: "#5B4A8A" }} />
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#5B4A8A",
              }}
            >
              Meet your instructor
            </span>
            <ArrowRight
              size={15}
              style={{ color: "#5B4A8A" }}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>

      </div>
    </div>
  );
}
