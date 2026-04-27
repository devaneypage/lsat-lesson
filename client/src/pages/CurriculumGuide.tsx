/**
 * Curriculum Guide Page
 * Interactive 30-chapter roadmap with progress tracking and lesson linking
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  Zap,
  Download,
} from "lucide-react";

interface CurriculumChapter {
  id: string;
  number: number;
  title: string;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  description: string;
  estimatedHours: number;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  topics: string[];
  completed: boolean;
  relatedLessons: string[];
  relatedQuestions: number;
}

const CURRICULUM_CHAPTERS: CurriculumChapter[] = [
  // Part 1: Foundations
  {
    id: "ch1",
    number: 1,
    title: "Introduction to Logical Reasoning",
    part: "Part 1",
    description: "Overview of LSAT structure and logical reasoning fundamentals",
    estimatedHours: 2,
    difficulty: "Foundational",
    topics: ["LSAT Overview", "Argument Structure", "Main Point"],
    completed: true,
    relatedLessons: ["Necessary Assumptions"],
    relatedQuestions: 15,
  },
  {
    id: "ch2",
    number: 2,
    title: "Formal Logic Foundations",
    part: "Part 1",
    description: "Logical notation, conditionals, and quantifiers",
    estimatedHours: 3,
    difficulty: "Foundational",
    topics: ["Logical Notation", "Conditionals", "Quantifiers"],
    completed: true,
    relatedLessons: ["Formal Logic Fundamentals"],
    relatedQuestions: 20,
  },
  {
    id: "ch3",
    number: 3,
    title: "Argument Analysis",
    part: "Part 1",
    description: "Breaking down arguments into premises and conclusions",
    estimatedHours: 2.5,
    difficulty: "Foundational",
    topics: ["Premises", "Conclusions", "Argument Mapping"],
    completed: false,
    relatedLessons: ["Necessary Assumptions"],
    relatedQuestions: 18,
  },
  // Part 2: Core Skills
  {
    id: "ch4",
    number: 4,
    title: "Necessary Assumptions",
    part: "Part 2",
    description: "Identifying assumptions required for argument validity",
    estimatedHours: 3,
    difficulty: "Intermediate",
    topics: ["Assumptions", "Negation Test", "Bridge Analogy"],
    completed: false,
    relatedLessons: ["Necessary Assumptions"],
    relatedQuestions: 25,
  },
  {
    id: "ch5",
    number: 5,
    title: "Sufficient Assumptions",
    part: "Part 2",
    description: "Identifying sufficient conditions for argument support",
    estimatedHours: 2.5,
    difficulty: "Intermediate",
    topics: ["Sufficient Conditions", "Conditional Logic"],
    completed: false,
    relatedLessons: [],
    relatedQuestions: 20,
  },
  {
    id: "ch6",
    number: 6,
    title: "Strengthen & Weaken",
    part: "Part 2",
    description: "Strengthening and weakening arguments effectively",
    estimatedHours: 3.5,
    difficulty: "Intermediate",
    topics: ["Strengthen", "Weaken", "Impact Arguments"],
    completed: false,
    relatedLessons: ["Strengthen & Weaken"],
    relatedQuestions: 30,
  },
  {
    id: "ch7",
    number: 7,
    title: "Common Flaws",
    part: "Part 2",
    description: "Recognizing 19 most tested logical fallacies",
    estimatedHours: 4,
    difficulty: "Intermediate",
    topics: ["Logical Flaws", "Fallacies", "Flaw Recognition"],
    completed: false,
    relatedLessons: ["Common Flaws"],
    relatedQuestions: 35,
  },
  // Part 3: Advanced Topics
  {
    id: "ch8",
    number: 8,
    title: "Comparative & Principle Questions",
    part: "Part 3",
    description: "Handling comparative reasoning and principle application",
    estimatedHours: 3,
    difficulty: "Advanced",
    topics: ["Comparative Reasoning", "Principle Application"],
    completed: false,
    relatedLessons: [],
    relatedQuestions: 22,
  },
  {
    id: "ch9",
    number: 9,
    title: "Reading Comprehension Strategies",
    part: "Part 3",
    description: "Passage mapping and question type strategies",
    estimatedHours: 3.5,
    difficulty: "Advanced",
    topics: ["Passage Mapping", "Question Types", "Speed Reading"],
    completed: false,
    relatedLessons: ["Reading Comprehension"],
    relatedQuestions: 28,
  },
  {
    id: "ch10",
    number: 10,
    title: "Test Strategy & Time Management",
    part: "Part 4",
    description: "Optimal pacing and test-day execution",
    estimatedHours: 2,
    difficulty: "Advanced",
    topics: ["Time Management", "Section Strategy", "Test Day"],
    completed: false,
    relatedLessons: [],
    relatedQuestions: 0,
  },
];

export default function CurriculumGuide() {
  const [expandedPart, setExpandedPart] = useState<string | null>("Part 1");
  const [chapters, setChapters] = useState<CurriculumChapter[]>(
    CURRICULUM_CHAPTERS
  );

  const toggleChapterCompletion = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
      )
    );
  };

  const stats = useMemo(() => {
    const completed = chapters.filter((ch) => ch.completed).length;
    const total = chapters.length;
    const totalHours = chapters.reduce((sum, ch) => sum + ch.estimatedHours, 0);
    const completedHours = chapters
      .filter((ch) => ch.completed)
      .reduce((sum, ch) => sum + ch.estimatedHours, 0);

    return {
      completedChapters: completed,
      totalChapters: total,
      progressPercent: (completed / total) * 100,
      completedHours,
      totalHours,
    };
  }, [chapters]);

  const parts = ["Part 1", "Part 2", "Part 3", "Part 4"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2D3561] mb-2">
            Curriculum Guide
          </h1>
          <p className="text-[#4A5578]">
            30-chapter structured path to LSAT mastery
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 bg-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[#4A5578] text-sm mb-2">Chapters Completed</p>
              <p className="text-3xl font-bold text-[#2D3561]">
                {stats.completedChapters}/{stats.totalChapters}
              </p>
            </div>
            <div>
              <p className="text-[#4A5578] text-sm mb-2">Progress</p>
              <Progress value={stats.progressPercent} className="h-2" />
              <p className="text-sm text-[#4A5578] mt-2">
                {Math.round(stats.progressPercent)}%
              </p>
            </div>
            <div>
              <p className="text-[#4A5578] text-sm mb-2">Hours Completed</p>
              <p className="text-3xl font-bold text-[#2D3561]">
                {stats.completedHours}/{stats.totalHours}h
              </p>
            </div>
            <div>
              <p className="text-[#4A5578] text-sm mb-2">Estimated Remaining</p>
              <p className="text-3xl font-bold text-[#2D3561]">
                {Math.round(stats.totalHours - stats.completedHours)}h
              </p>
            </div>
          </div>
        </Card>

        {/* Curriculum by Part */}
        <div className="space-y-4">
          {parts.map((part) => {
            const partChapters = chapters.filter((ch) => ch.part === part);
            const partCompleted = partChapters.filter(
              (ch) => ch.completed
            ).length;
            const isExpanded = expandedPart === part;

            return (
              <Card key={part} className="bg-white overflow-hidden">
                {/* Part Header */}
                <button
                  onClick={() =>
                    setExpandedPart(isExpanded ? null : part)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-[#2D3561]">{part}</h2>
                    <Badge variant="outline">
                      {partCompleted}/{partChapters.length} chapters
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#4A5578]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#4A5578]" />
                  )}
                </button>

                {/* Part Chapters */}
                {isExpanded && (
                  <div className="border-t border-[#E8E6E1] divide-y divide-[#E8E6E1]">
                    {partChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() =>
                              toggleChapterCompletion(chapter.id)
                            }
                            className="mt-1 flex-shrink-0"
                          >
                            {chapter.completed ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-[#D0CCC7]" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold text-[#2D3561] mb-1">
                              Chapter {chapter.number}: {chapter.title}
                            </h3>
                            <p className="text-[#4A5578] text-sm mb-3">
                              {chapter.description}
                            </p>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 mb-3">
                              <div className="flex items-center gap-1 text-sm text-[#4A5578]">
                                <Clock className="w-4 h-4" />
                                {chapter.estimatedHours}h
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {chapter.difficulty}
                              </Badge>
                            </div>

                            {/* Topics */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {chapter.topics.map((topic) => (
                                <span
                                  key={topic}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>

                            {/* Related Resources */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {chapter.relatedLessons.length > 0 && (
                                <div className="flex items-center gap-1 text-[#0052CC]">
                                  <BookOpen className="w-4 h-4" />
                                  {chapter.relatedLessons.length} lesson
                                  {chapter.relatedLessons.length !== 1
                                    ? "s"
                                    : ""}
                                </div>
                              )}
                              {chapter.relatedQuestions > 0 && (
                                <div className="flex items-center gap-1 text-[#0052CC]">
                                  <Zap className="w-4 h-4" />
                                  {chapter.relatedQuestions} questions
                                </div>
                              )}
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex-shrink-0">
                            <Button
                              size="sm"
                              className="bg-[#0052CC] text-white hover:bg-[#003D99]"
                            >
                              Start
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Download CTA */}
        <Card className="mt-8 p-8 bg-gradient-to-r from-[#0052CC] to-[#003D99] text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Export Your Progress</h2>
          <p className="mb-6 text-blue-100">
            Download your curriculum progress and study plan
          </p>
          <Button className="bg-white text-[#0052CC] hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 mx-auto">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </Card>
      </div>
    </div>
  );
}
