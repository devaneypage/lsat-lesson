/**
 * UnifiedDashboard Page
 * Main hub after path selection showing all content sections
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePath } from "@/contexts/PathContext";
import {
  BookOpen,
  BarChart3,
  Zap,
  FileText,
  Download,
  ArrowRight,
  Settings,
} from "lucide-react";

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  count?: number;
  status?: "new" | "in-progress" | "completed";
}

const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: "lessons",
    title: "Interactive Lessons",
    description: "Learn core concepts with guided, interactive lessons",
    icon: <BookOpen className="w-6 h-6" />,
    color: "#1a7dff",
    route: "/lessons",
    count: 5,
    status: "in-progress",
  },
  {
    id: "question-bank",
    title: "Question Bank",
    description: "Practice with 1,000+ LSAT questions organized by type",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "#439cdf",
    route: "/question-bank",
    count: 1014,
  },
  {
    id: "practice-mode",
    title: "Interactive Practice",
    description: "Timed practice with instant feedback and explanations",
    icon: <Zap className="w-6 h-6" />,
    color: "#46e291",
    route: "/practice",
  },
  {
    id: "curriculum",
    title: "Curriculum Guide",
    description: "30-chapter comprehensive curriculum roadmap",
    icon: <FileText className="w-6 h-6" />,
    color: "#ffdd33",
    route: "/curriculum",
    count: 30,
  },
];

export default function UnifiedDashboard() {
  const [, navigate] = useLocation();
  const { selectedPath } = usePath();
  const [stats, setStats] = useState({
    lessonsCompleted: 2,
    questionsAnswered: 47,
    accuracy: 78,
    hoursSpent: 12.5,
  });

  useEffect(() => {
    if (!selectedPath) {
      navigate("/");
    }
  }, [selectedPath, navigate]);

  const getPathLabel = (path: string | null) => {
    const labels: Record<string, string> = {
      LOGICAL_REASONING: "Logical Reasoning",
      READING_COMPREHENSION: "Reading Comprehension",
      FORMAL_LOGIC: "Formal Logic Foundations",
      TEST_STRATEGY: "Test Strategy & Execution",
      COMPREHENSIVE: "Comprehensive LSAT Prep",
    };
    return labels[path || ""] || "LSAT Mastery";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E6E1] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2D3561]">
                Welcome back!
              </h1>
              <p className="text-[#4A5578] mt-1">
                {getPathLabel(selectedPath)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white">
            <p className="text-sm text-[#4A5578] font-medium mb-2">
              Lessons Completed
            </p>
            <p className="text-3xl font-bold text-[#2D3561]">
              {stats.lessonsCompleted}
            </p>
            <p className="text-xs text-[#4A5578] mt-2">of 5 lessons</p>
          </Card>

          <Card className="p-6 bg-white">
            <p className="text-sm text-[#4A5578] font-medium mb-2">
              Questions Answered
            </p>
            <p className="text-3xl font-bold text-[#2D3561]">
              {stats.questionsAnswered}
            </p>
            <p className="text-xs text-[#4A5578] mt-2">of 1,014 questions</p>
          </Card>

          <Card className="p-6 bg-white">
            <p className="text-sm text-[#4A5578] font-medium mb-2">Accuracy</p>
            <p className="text-3xl font-bold text-[#2D3561]">
              {stats.accuracy}%
            </p>
            <p className="text-xs text-[#4A5578] mt-2">
              {stats.accuracy >= 75 ? "Excellent!" : "Keep improving"}
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <p className="text-sm text-[#4A5578] font-medium mb-2">
              Hours Studied
            </p>
            <p className="text-3xl font-bold text-[#2D3561]">
              {stats.hoursSpent}
            </p>
            <p className="text-xs text-[#4A5578] mt-2">this month</p>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2D3561] mb-6">
            Your Learning Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DASHBOARD_SECTIONS.map((section) => (
              <Card
                key={section.id}
                className="p-6 bg-white hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(section.route)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-lg text-white group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: section.color }}
                  >
                    {section.icon}
                  </div>
                  {section.status && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: section.color + "20",
                        color: section.color,
                      }}
                    >
                      {section.status === "new"
                        ? "New"
                        : section.status === "in-progress"
                          ? "In Progress"
                          : "Completed"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#2D3561] mb-2">
                  {section.title}
                </h3>
                <p className="text-[#4A5578] mb-4">{section.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {section.count && (
                    <span className="text-sm font-semibold text-[#4A5578]">
                      {section.count}{" "}
                      {section.id === "lessons"
                        ? "lessons"
                        : section.id === "question-bank"
                          ? "questions"
                          : "chapters"}
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 text-[#4A5578] group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-[#1a7dff] to-[#0052CC] text-white">
            <h3 className="text-lg font-bold mb-2">Session Plan Generator</h3>
            <p className="text-blue-100 mb-4">
              Create detailed tutoring session plans
            </p>
            <Button
              onClick={() => navigate("/session-plan-generator")}
              className="bg-white text-[#0052CC] hover:bg-blue-50 font-semibold"
            >
              Generate Plan
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#46e291] to-[#2D9E5F] text-white">
            <h3 className="text-lg font-bold mb-2">Progress Tracker</h3>
            <p className="text-green-100 mb-4">
              Monitor your improvement over time
            </p>
            <Button
              onClick={() => navigate("/progress")}
              className="bg-white text-[#2D9E5F] hover:bg-green-50 font-semibold"
            >
              View Progress
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#ffdd33] to-[#FFC700] text-[#2D3561]">
            <h3 className="text-lg font-bold mb-2">Download Resources</h3>
            <p className="text-[#4A5578] mb-4">
              Get PDFs, study guides, and materials
            </p>
            <Button
              onClick={() => navigate("/resources")}
              className="bg-white text-[#FFC700] hover:bg-yellow-50 font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
