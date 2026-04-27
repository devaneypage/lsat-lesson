/**
 * Question Bank Page
 * Displays all imported LSAT questions with filtering and search
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
  Download,
  BarChart3,
  Upload,
  Loader,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

export default function QuestionBank() {
  // Fetch questions from backend
  const { data: questionsData, isLoading } = trpc.questions.list.useQuery({
    limit: 10000,
    offset: 0,
  });

  const questions = questionsData?.questions || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [selectedSource, setSelectedSource] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "practice" | "stats" | string>("grid");
  const [selectedQuestion, setSelectedQuestion] = useState<typeof questions[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter and search logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === "all" || q.category === selectedCategory;
      const matchesSource =
        selectedSource === "all" || q.source === selectedSource;

      return (
        matchesSearch && matchesDifficulty && matchesCategory && matchesSource
      );
    });
  }, [questions, searchQuery, selectedDifficulty, selectedCategory, selectedSource]);

  // Get unique categories and sources
  const categories = Array.from(
    new Set(
      questions
        .map((q) => q.category)
        .filter((c) => c !== null && c !== undefined)
    )
  ).sort() as string[];

  const sources = Array.from(
    new Set(
      questions
        .map((q) => q.source)
        .filter((s) => s !== null && s !== undefined)
    )
  ).sort() as string[];

  // Statistics
  const stats = useMemo(() => {
    const byDifficulty = {
      easy: filteredQuestions.filter((q) => q.difficulty === "easy").length,
      medium: filteredQuestions.filter((q) => q.difficulty === "medium").length,
      hard: filteredQuestions.filter((q) => q.difficulty === "hard").length,
    };

    return [
      { name: "Easy", value: byDifficulty.easy },
      { name: "Medium", value: byDifficulty.medium },
      { name: "Hard", value: byDifficulty.hard },
    ];
  }, [filteredQuestions]);

  const handlePracticeMode = (question: typeof questions[0]) => {
    setSelectedQuestion(question);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setViewMode("practice");
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setShowExplanation(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader size={32} style={{ color: "var(--primary)" }} />
        </motion.div>
      </div>
    );
  }

  // Practice Mode View
  if (viewMode === "practice" && selectedQuestion) {
    const isCorrect = selectedAnswer === selectedQuestion.correctAnswer;

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
                    selectedQuestion.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : selectedQuestion.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedQuestion.difficulty?.toUpperCase()}
                </Badge>
                {selectedQuestion.category && (
                  <Badge variant="outline">{selectedQuestion.category}</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#2D3561] mb-4">
                {selectedQuestion.questionText}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {[
                { label: "A", value: selectedQuestion.optionA },
                { label: "B", value: selectedQuestion.optionB },
                { label: "C", value: selectedQuestion.optionC },
                { label: "D", value: selectedQuestion.optionD },
                ...(selectedQuestion.optionE
                  ? [{ label: "E", value: selectedQuestion.optionE }]
                  : []),
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() =>
                    !showExplanation && setSelectedAnswer(option.label)
                  }
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === option.label
                      ? "border-[#0052CC] bg-blue-50"
                      : "border-[#E8E6E1] hover:border-[#0052CC]"
                  } ${
                    showExplanation
                      ? option.label === selectedQuestion.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : selectedAnswer === option.label
                          ? "border-red-500 bg-red-50"
                          : ""
                      : ""
                  }`}
                  disabled={showExplanation}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedAnswer === option.label
                          ? "border-[#0052CC] bg-[#0052CC]"
                          : "border-[#D0CCC7]"
                      }`}
                    >
                      {selectedAnswer === option.label && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-[#2D3561]">{option.value}</span>
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
                    <strong>Explanation:</strong>{" "}
                    {selectedQuestion.explanation || "No explanation available."}
                  </p>
                </div>

                <Button
                  onClick={() => setViewMode("grid")}
                  className="w-full bg-[#0052CC] text-white hover:bg-[#003D99]"
                >
                  Back to Questions
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Stats View
  if (viewMode === "stats") {
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
              <p className="text-[#4A5578] text-sm mb-2">Categories</p>
              <p className="text-3xl font-bold text-[#2D3561]">{categories.length}</p>
            </Card>
            <Card className="p-6 bg-white">
              <p className="text-[#4A5578] text-sm mb-2">Sources</p>
              <p className="text-3xl font-bold text-[#2D3561]">{sources.length}</p>
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

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(value) =>
              setSelectedCategory(value as string | "all")
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select
            value={selectedDifficulty}
            onValueChange={(value) =>
              setSelectedDifficulty(value as string | "all")
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select
            value={selectedSource}
            onValueChange={(value) =>
              setSelectedSource(value as string | "all")
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map((src) => (
                <SelectItem key={src} value={src}>
                  {src}
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
            onClick={() => setViewMode("stats" as "grid" | "practice" | "stats")}
            className={`${
              viewMode === "stats"
                ? "bg-[#0052CC] text-white"
                : "bg-white text-[#2D3561] border border-[#E8E6E1]"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen size={48} className="mx-auto mb-4 text-[#4A5578]" />
              <p className="text-[#4A5578] text-lg">
                No questions found matching your filters.
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
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
                        question.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : question.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {question.difficulty && (
                        <>
                          {question.difficulty.charAt(0).toUpperCase() +
                            question.difficulty.slice(1)}
                        </>
                      )}
                    </Badge>
                  </div>
                  {question.category && (
                    <Badge variant="outline" className="mb-3">
                      {question.category}
                    </Badge>
                  )}
                </div>

                {/* Question Text Preview */}
                <p className="text-[#2D3561] font-medium mb-4 line-clamp-3">
                  {question.questionText}
                </p>

                {/* Source */}
                {question.source && (
                  <p className="text-xs text-[#4A5578]">
                    Source: <strong>{question.source}</strong>
                  </p>
                )}

                {/* Action */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#4A5578]">
                    ID: {question.questionId}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#0052CC]" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
