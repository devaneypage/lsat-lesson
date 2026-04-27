/**
 * Question Bank Page
 * Complete infrastructure for searching, filtering, and practicing 1,000+ questions
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Filter,
  Play,
  Download,
  BarChart3,
  Upload,
  ChevronRight,
} from "lucide-react";
import {
  Question,
  SAMPLE_QUESTIONS,
  Difficulty,
  Section,
  LRQuestionType,
  RCQuestionType,
} from "@/types/questionBank";

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<Section | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "practice" | "stats">("grid");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter and search logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.stimulus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSection =
        selectedSection === "all" || q.section === selectedSection;
      const matchesDifficulty =
        selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchesTopic =
        selectedTopic === "all" || q.topic === selectedTopic;

      return (
        matchesSearch && matchesSection && matchesDifficulty && matchesTopic
      );
    });
  }, [questions, searchQuery, selectedSection, selectedDifficulty, selectedTopic]);

  // Get unique topics
  const topics = Array.from(new Set(questions.map((q) => q.topic)));

  // Statistics
  const stats = useMemo(() => {
    const byDifficulty = {
      [Difficulty.EASY]: filteredQuestions.filter(
        (q) => q.difficulty === Difficulty.EASY
      ).length,
      [Difficulty.MEDIUM]: filteredQuestions.filter(
        (q) => q.difficulty === Difficulty.MEDIUM
      ).length,
      [Difficulty.HARD]: filteredQuestions.filter(
        (q) => q.difficulty === Difficulty.HARD
      ).length,
    };

    return [
      { name: "Easy", value: byDifficulty[Difficulty.EASY] },
      { name: "Medium", value: byDifficulty[Difficulty.MEDIUM] },
      { name: "Hard", value: byDifficulty[Difficulty.HARD] },
    ];
  }, [filteredQuestions]);

  const handleImportCSV = () => {
    // Placeholder for CSV import
    alert("CSV import interface coming soon. Download template to get started.");
  };

  const handlePracticeMode = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setViewMode("practice" as "grid" | "practice" | "stats");
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setShowExplanation(true);
    }
  };

  // Practice Mode View
  if (viewMode === "practice" && selectedQuestion) {
    const isCorrect =
      selectedAnswer === selectedQuestion.correctAnswerId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => setViewMode("grid")}
            variant="outline"
            className="mb-6"
          >
            ← Back to Question Bank
          </Button>

          {/* Question Card */}
          <Card className="p-8 bg-white mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  className={`${
                    selectedQuestion.difficulty === Difficulty.EASY
                      ? "bg-green-100 text-green-800"
                      : selectedQuestion.difficulty === Difficulty.MEDIUM
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedQuestion.difficulty.toUpperCase()}
                </Badge>
                <Badge variant="outline">{selectedQuestion.topic}</Badge>
              </div>
              <h2 className="text-2xl font-bold text-[#2D3561] mb-4">
                {selectedQuestion.stimulus}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {selectedQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    !showExplanation && setSelectedAnswer(option.id)
                  }
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === option.id
                      ? "border-[#0052CC] bg-blue-50"
                      : "border-[#E8E6E1] hover:border-[#0052CC]"
                  } ${
                    showExplanation
                      ? option.isCorrect
                        ? "border-green-500 bg-green-50"
                        : selectedAnswer === option.id
                          ? "border-red-500 bg-red-50"
                          : ""
                      : ""
                  }`}
                  disabled={showExplanation}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedAnswer === option.id
                          ? "border-[#0052CC] bg-[#0052CC]"
                          : "border-[#D0CCC7]"
                      }`}
                    >
                      {selectedAnswer === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-[#2D3561]">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-[#0052CC] text-white hover:bg-[#003D99]"
              >
                Submit Answer
              </Button>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`font-bold mb-2 ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </p>
                  <p className="text-[#2D3561] mb-3">
                    <strong>Explanation:</strong> {selectedQuestion.explanation}
                  </p>
                </div>

                <Button
                  onClick={() => setViewMode("grid")}
                  className="w-full bg-[#0052CC] text-white hover:bg-[#003D99]"
                >
                  Next Question
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Stats View
  if ((viewMode as string) === "stats") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => setViewMode("grid")}
            variant="outline"
            className="mb-6"
          >
            ← Back to Question Bank
          </Button>

          <h1 className="text-3xl font-bold text-[#2D3561] mb-8">
            Question Statistics
          </h1>

          <Card className="p-8 bg-white">
            <h2 className="text-xl font-bold text-[#2D3561] mb-6">
              Questions by Difficulty
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0052CC" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6 bg-white">
              <p className="text-[#4A5578] text-sm mb-2">Total Questions</p>
              <p className="text-3xl font-bold text-[#2D3561]">
                {filteredQuestions.length}
              </p>
            </Card>
            <Card className="p-6 bg-white">
              <p className="text-[#4A5578] text-sm mb-2">Topics Covered</p>
              <p className="text-3xl font-bold text-[#2D3561]">{topics.length}</p>
            </Card>
            <Card className="p-6 bg-white">
              <p className="text-[#4A5578] text-sm mb-2">Average Time</p>
              <p className="text-3xl font-bold text-[#2D3561]">~90s</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main Grid View
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2D3561] mb-2">
            Question Bank
          </h1>
          <p className="text-[#4A5578]">
            {filteredQuestions.length} questions available
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#4A5578]" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#E8E6E1]"
              />
            </div>
          </div>

          {/* Section Filter */}
          <Select
            value={selectedSection}
            onValueChange={(value) =>
              setSelectedSection(value as Section | "all")
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value={Section.LOGICAL_REASONING}>
                Logical Reasoning
              </SelectItem>
              <SelectItem value={Section.READING_COMPREHENSION}>
                Reading Comprehension
              </SelectItem>
              <SelectItem value={Section.FORMAL_LOGIC}>Formal Logic</SelectItem>
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select
            value={selectedDifficulty}
            onValueChange={(value) =>
              setSelectedDifficulty(value as Difficulty | "all")
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value={Difficulty.EASY}>Easy</SelectItem>
              <SelectItem value={Difficulty.MEDIUM}>Medium</SelectItem>
              <SelectItem value={Difficulty.HARD}>Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Topic Filter */}
          <Select
            value={selectedTopic}
            onValueChange={(value) => setSelectedTopic(value)}
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setViewMode("grid")}
            className={`${
              viewMode === "grid"
                ? "bg-[#0052CC] text-white"
                : "bg-white text-[#2D3561] border border-[#E8E6E1]"
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Browse
          </Button>
          <Button
            onClick={() => setViewMode("stats")}
            className={`${
              viewMode === "stats"
                ? "bg-[#0052CC] text-white"
                : "bg-white text-[#2D3561] border border-[#E8E6E1]"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button> 
          <Button
            onClick={handleImportCSV}
            className="ml-auto bg-white text-[#2D3561] border border-[#E8E6E1] hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button className="bg-[#0052CC] text-white hover:bg-[#003D99]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <Card
              key={question.id}
              className="p-6 bg-white hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handlePracticeMode(question)}
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    className={`${
                      question.difficulty === Difficulty.EASY
                        ? "bg-green-100 text-green-800"
                        : question.difficulty === Difficulty.MEDIUM
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {question.difficulty.charAt(0).toUpperCase() +
                      question.difficulty.slice(1)}
                  </Badge>
                  <span className="text-xs text-[#4A5578]">
                    {question.estimatedTime}s
                  </span>
                </div>
                <Badge variant="outline" className="mb-3">
                  {question.topic}
                </Badge>
              </div>

              {/* Stimulus Preview */}
              <p className="text-[#2D3561] font-medium mb-4 line-clamp-3">
                {question.stimulus}
              </p>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {question.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Button className="w-full bg-[#0052CC] text-white hover:bg-[#003D99] flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Practice
              </Button>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <Card className="p-12 bg-white text-center">
            <p className="text-[#4A5578] mb-4">No questions match your filters</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedSection("all");
                setSelectedDifficulty("all");
                setSelectedTopic("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
