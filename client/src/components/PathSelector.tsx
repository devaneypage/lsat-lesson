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
import { BookOpen, Brain, Zap, Target, User, ArrowRight } from "lucide-react";

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

        {/* Meet Your Instructor */}
        <div className="mt-10 flex justify-center">
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
