/**
 * Question Bank Page
 * Displays all imported LSAT questions with filtering and search
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "lucide-react";
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
import { useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useFeatureFlag } from "@/lib/flags";
import type { ConfidenceLevel } from "../../../shared/learnerDomain";
import type { AnswerLetter } from "../../../shared/practiceEvidence";

const QUESTIONS_PER_PAGE = 200;
const DISCOVERY_BATCH_MAX = 50;
const DISCOVERY_DEBOUNCE_MS = 1_500;

const CALIBRATION_LABELS = [
  { state: "well_calibrated", label: "Well calibrated", description: "Confident and correct" },
  { state: "underconfident", label: "Underconfident", description: "Correct despite doubt" },
  { state: "overconfident", label: "Overconfident", description: "Confident but incorrect" },
  { state: "appropriately_uncertain", label: "Appropriately uncertain", description: "Doubt matched to a miss" },
] as const;

const CONFIDENCE_ROWS = [
  { value: "certain", label: "Certain" },
  { value: "unsure", label: "Unsure" },
  { value: "guessed", label: "Guessed" },
] as const;

function formatActiveTime(ms: number | null) {
  if (ms === null) return "—";
  return `${Math.max(1, Math.round(ms / 1000))}s`;
}

export default function QuestionBank() {
  // Get URL parameters for module filtering and direct command-search links.
  const queryParams = useSearch();
  const params = new URLSearchParams(queryParams);
  const moduleId = params.get("module");
  const moduleName = params.get("moduleName");
  const linkedQuestionId = Number(params.get("question")) || null;
  const [page, setPage] = useState(0);
  const { isAuthenticated } = useAuth();
  const { enabled: confidenceTrackingEnabled } = useFeatureFlag("question_confidence_tracking");
  const activeStartedAtRef = useRef<number | null>(null);
  const accumulatedActiveMsRef = useRef(0);

  // Fetch a bounded page for browsing and one explicit item for deep links.
  const { data: questionsData, isLoading } = trpc.questions.list.useQuery({
    limit: QUESTIONS_PER_PAGE,
    offset: page * QUESTIONS_PER_PAGE,
  });
  const { data: linkedQuestion, isLoading: isLinkedQuestionLoading, error: linkedQuestionError } = trpc.questions.getById.useQuery(
    { questionId: linkedQuestionId ?? 1 },
    { enabled: linkedQuestionId !== null, retry: false },
  );

  const questions = questionsData?.questions || [];
  const totalQuestions = questionsData?.total ?? 0;
  const linkedQuestionMissing = linkedQuestionId !== null && !isLinkedQuestionLoading && linkedQuestion === null;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(moduleId ? moduleId : "all");
  const [selectedSource, setSelectedSource] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "practice" | "stats" | string>("grid");
  const [selectedQuestion, setSelectedQuestion] = useState<typeof questions[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerLetter | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const startMutation = trpc.practice.start.useMutation();
  const submitMutation = trpc.practice.submit.useMutation();
  const discoveredMutation = trpc.practice.discovered.useMutation();
  const lastDiscoveryKeyRef = useRef<string | null>(null);
  const submissionResult = submitMutation.data;

  // Fetch tags for the filter dropdown
  const { data: tagsWithCounts = [] } = trpc.tags.listWithCounts.useQuery();

  // Fetch question IDs for the selected tag
  const { data: taggedQuestionData } = trpc.tags.getQuestions.useQuery(
    { tagId: selectedTagId ?? 0, limit: QUESTIONS_PER_PAGE, offset: page * QUESTIONS_PER_PAGE },
    { enabled: selectedTagId !== null }
  );
  const taggedQuestionIds = useMemo(
    () => new Set((taggedQuestionData || []).map((q: { id: number }) => q.id)),
    [taggedQuestionData]
  );

  const practiceSummaryQuery = trpc.practice.summary.useQuery(undefined, {
    enabled: isAuthenticated && confidenceTrackingEnabled && viewMode === "stats",
  });

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

      const matchesTag =
        selectedTagId === null || taggedQuestionIds.has(q.id);

      return (
        matchesSearch && matchesDifficulty && matchesCategory && matchesSource && matchesTag
      );
    });
  }, [questions, searchQuery, selectedDifficulty, selectedCategory, selectedSource, selectedTagId, taggedQuestionIds]);

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

  const resetAttemptState = () => {
    setSelectedAnswer(null);
    setConfidence(null);
    setIdempotencyKey(crypto.randomUUID());
    setShowExplanation(false);
    submitMutation.reset();
    accumulatedActiveMsRef.current = 0;
    activeStartedAtRef.current = Date.now();
  };

  const handlePracticeMode = (question: typeof questions[0]) => {
    setSelectedQuestion(question);
    resetAttemptState();
    setViewMode("practice");
  };

  useEffect(() => {
    if (!linkedQuestion) return;
    setSelectedQuestion(linkedQuestion);
    resetAttemptState();
    setViewMode("practice");
  }, [linkedQuestion]);

  useEffect(() => {
    if (viewMode !== "practice" || !selectedQuestion) return;
    accumulatedActiveMsRef.current = 0;
    activeStartedAtRef.current = document.visibilityState === "visible" ? Date.now() : null;

    if (isAuthenticated) {
      startMutation.mutate({
        questionId: selectedQuestion.id,
        route: "/practice",
        surface: "question_bank",
      });
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && activeStartedAtRef.current !== null) {
        accumulatedActiveMsRef.current += Date.now() - activeStartedAtRef.current;
        activeStartedAtRef.current = null;
      } else if (document.visibilityState === "visible" && activeStartedAtRef.current === null) {
        activeStartedAtRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (activeStartedAtRef.current !== null) {
        accumulatedActiveMsRef.current += Date.now() - activeStartedAtRef.current;
        activeStartedAtRef.current = null;
      }
    };
  }, [isAuthenticated, selectedQuestion?.id, viewMode]);

  // Record privacy-safe discovery for the visible page, debounced and
  // deduplicated per filter/page combination.
  useEffect(() => {
    if (!isAuthenticated || viewMode !== "grid") return;
    const ids = filteredQuestions.slice(0, DISCOVERY_BATCH_MAX).map((q) => q.id);
    if (ids.length === 0) return;
    const discoveryKey = ids.join(",");
    if (lastDiscoveryKeyRef.current === discoveryKey) return;

    const timer = window.setTimeout(() => {
      lastDiscoveryKeyRef.current = discoveryKey;
      discoveredMutation.mutate({
        questionIds: ids,
        route: "/question-bank",
        surface: "question_bank",
      });
    }, DISCOVERY_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, viewMode, filteredQuestions]);

  const handleSubmitAnswer = async () => {
    const effectiveConfidence = confidenceTrackingEnabled ? confidence : "unsure";
    if (!selectedQuestion || !selectedAnswer || !effectiveConfidence || !isAuthenticated) return;
    const activeTimeMs = Math.min(
      30 * 60 * 1_000,
      accumulatedActiveMsRef.current + (activeStartedAtRef.current === null ? 0 : Date.now() - activeStartedAtRef.current),
    );
    activeStartedAtRef.current = null;

    await submitMutation.mutateAsync({
      questionId: selectedQuestion.id,
      idempotencyKey,
      selectedAnswer,
      confidence: effectiveConfidence,
      activeTimeMs: Math.max(0, Math.round(activeTimeMs)),
      context: "practice",
      route: "/practice",
      surface: "question_bank",
    });
    setShowExplanation(true);
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
    const isCorrect = submissionResult?.isCorrect ?? false;
    const answerOptions: Array<{ label: AnswerLetter; value: string }> = [
      { label: "A", value: selectedQuestion.optionA },
      { label: "B", value: selectedQuestion.optionB },
      { label: "C", value: selectedQuestion.optionC },
      { label: "D", value: selectedQuestion.optionD },
      ...(selectedQuestion.optionE ? [{ label: "E" as const, value: selectedQuestion.optionE }] : []),
    ];

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
              {answerOptions.map((option) => (
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
                    showExplanation && submissionResult
                      ? option.label === submissionResult.correctAnswer
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

            {!showExplanation && confidenceTrackingEnabled && (
              <fieldset className="mb-6 rounded-sm border border-border bg-muted/35 p-4">
                <legend className="px-2 font-display text-sm font-bold text-foreground">Before you submit, how confident are you?</legend>
                <p className="mb-3 text-sm leading-6 text-muted-foreground">Choose the state that best describes your reasoning. This is recorded before correctness is revealed.</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    ["certain", "Certain"],
                    ["unsure", "Unsure"],
                    ["guessed", "Guessed"],
                  ] as const).map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      variant={confidence === value ? "default" : "outline"}
                      aria-pressed={confidence === value}
                      onClick={() => setConfidence(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </fieldset>
            )}

            {!isAuthenticated && !showExplanation && (
              <div className="mb-4 rounded-sm border border-[var(--nexus-amber)]/60 bg-[var(--nexus-amber)]/10 p-4" role="status">
                <p className="font-display font-bold text-foreground">Sign in to submit and preserve this attempt.</p>
                <p className="mt-1 text-sm text-muted-foreground">Correctness, timing, and confidence are stored privately in your learner record.</p>
                <Button className="mt-3" onClick={() => window.location.assign(getLoginUrl())}>Sign in</Button>
              </div>
            )}

            {submitMutation.isError && (
              <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                Your answer was not recorded. Review your connection and submit again; the same attempt key prevents duplicates.
              </p>
            )}

            {/* Action Buttons */}
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || (confidenceTrackingEnabled && !confidence) || !isAuthenticated || submitMutation.isPending}
                className="w-full"
              >
                {submitMutation.isPending ? "Recording attempt…" : "Submit answer"}
              </Button>
            ) : submissionResult ? (
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
                    {submissionResult.explanation || "No explanation is available for this question yet."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: <strong className="text-foreground">{submissionResult.confidence}</strong> · Calibration: <strong className="text-foreground">{submissionResult.calibration.replaceAll("_", " ")}</strong> · Active time: <strong className="text-foreground">{Math.max(1, Math.round(submissionResult.activeTimeMs / 1000))}s</strong>
                  </p>
                </div>

                <Button
                  onClick={() => setViewMode("grid")}
                  className="w-full bg-[#0052CC] text-white hover:bg-[#003D99]"
                >
                  Back to Questions
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    );
  }

  // Stats View
  if (viewMode === "stats") {
    const practiceSummary = practiceSummaryQuery.data;

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

          {confidenceTrackingEnabled && (
            <section className="mt-10" aria-labelledby="practice-evidence-heading">
              <h2
                id="practice-evidence-heading"
                className="text-xl font-bold text-[#2D3561] mb-4"
              >
                Your practice evidence
              </h2>

              {!isAuthenticated ? (
                <Card className="p-6 bg-white">
                  <p className="text-[#4A5578] mb-3">
                    Sign in to see calibration and timing from your recorded attempts.
                  </p>
                  <Button onClick={() => window.location.assign(getLoginUrl())}>Sign in</Button>
                </Card>
              ) : practiceSummaryQuery.isLoading ? (
                <Card className="p-6 bg-white" role="status">
                  <p className="text-[#4A5578]">Loading your practice evidence…</p>
                </Card>
              ) : practiceSummaryQuery.isError ? (
                <Card className="p-6 bg-white" role="alert">
                  <p className="text-[#4A5578] mb-3">
                    Your practice evidence could not be loaded.
                  </p>
                  <Button variant="outline" onClick={() => practiceSummaryQuery.refetch()}>
                    Try again
                  </Button>
                </Card>
              ) : !practiceSummary || practiceSummary.totalAttempts === 0 ? (
                <Card className="p-6 bg-white">
                  <p className="text-[#4A5578]">
                    No attempts recorded yet. Answer any question with a confidence
                    choice and your calibration evidence will appear here.
                  </p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6 bg-white">
                      <p className="text-[#4A5578] text-sm mb-2">Attempts</p>
                      <p className="text-3xl font-bold text-[#2D3561]">
                        {practiceSummary.totalAttempts}
                      </p>
                    </Card>
                    <Card className="p-6 bg-white">
                      <p className="text-[#4A5578] text-sm mb-2">Accuracy</p>
                      <p className="text-3xl font-bold text-[#2D3561]">
                        {practiceSummary.accuracyPercent ?? 0}%
                      </p>
                    </Card>
                    <Card className="p-6 bg-white">
                      <p className="text-[#4A5578] text-sm mb-2">Active time (avg / median)</p>
                      <p className="text-3xl font-bold text-[#2D3561]">
                        {formatActiveTime(practiceSummary.averageActiveTimeMs)} / {formatActiveTime(practiceSummary.medianActiveTimeMs)}
                      </p>
                    </Card>
                    <Card className="p-6 bg-white">
                      <p className="text-[#4A5578] text-sm mb-2">Attempts last 7 days</p>
                      <p className="text-3xl font-bold text-[#2D3561]">
                        {practiceSummary.recentAttemptCount}
                      </p>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card className="p-6 bg-white">
                      <h3 className="font-bold text-[#2D3561] mb-4">Calibration</h3>
                      <ul className="space-y-2">
                        {CALIBRATION_LABELS.map(({ state, label, description }) => (
                          <li key={state} className="flex items-center justify-between gap-4">
                            <span className="text-sm text-[#4A5578]" title={description}>
                              {label}
                            </span>
                            <span className="font-bold text-[#2D3561]">
                              {practiceSummary.calibration[state]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="p-6 bg-white">
                      <h3 className="font-bold text-[#2D3561] mb-4">Accuracy by confidence</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[#4A5578]">
                            <th className="pb-2 font-medium">Confidence</th>
                            <th className="pb-2 font-medium">Attempts</th>
                            <th className="pb-2 font-medium">Correct</th>
                            <th className="pb-2 font-medium">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CONFIDENCE_ROWS.map(({ value, label }) => {
                            const row = practiceSummary.byConfidence[value];
                            return (
                              <tr key={value} className="border-t border-[#E8E6E1]">
                                <td className="py-2 text-[#2D3561]">{label}</td>
                                <td className="py-2">{row.attempts}</td>
                                <td className="py-2">{row.correct}</td>
                                <td className="py-2">
                                  {row.accuracyPercent === null ? "—" : `${row.accuracyPercent}%`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Card>
                  </div>
                </>
              )}
            </section>
          )}
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-[#2D3561]">
              Question Bank
            </h1>
            {moduleName && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                Module: {moduleName}
              </Badge>
            )}
          </div>
          <p className="text-[#4A5578]">
            {filteredQuestions.length} questions available
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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

          {/* Tag Filter */}
          <Select
            value={selectedTagId !== null ? String(selectedTagId) : "all"}
            onValueChange={(value) =>
              setSelectedTagId(value === "all" ? null : Number(value))
            }
          >
            <SelectTrigger className="bg-white border-[#E8E6E1]">
              <div className="flex items-center gap-1.5">
                <Tag size={14} className="text-amber-600" />
                <SelectValue placeholder="Filter by tag" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tagsWithCounts.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  {tag.name} ({tag.questionCount})
                </SelectItem>
              ))}
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

        {linkedQuestionId !== null && (isLinkedQuestionLoading || linkedQuestionError || linkedQuestionMissing) && (
          <div className="mb-6 rounded-sm border border-border bg-card px-4 py-3 text-sm text-card-foreground" role={linkedQuestionError || linkedQuestionMissing ? "alert" : "status"}>
            {linkedQuestionError || linkedQuestionMissing
              ? "That question is no longer available. Browse the current question bank instead."
              : "Opening the selected question…"}
          </div>
        )}

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

        {viewMode === "grid" && totalQuestions > QUESTIONS_PER_PAGE && (
          <nav className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Question pages">
            <p className="text-sm text-muted-foreground">
              Showing {page * QUESTIONS_PER_PAGE + 1}–{Math.min((page + 1) * QUESTIONS_PER_PAGE, totalQuestions)} of {totalQuestions}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(current => Math.max(0, current - 1))}>Previous</Button>
              <Button variant="outline" disabled={(page + 1) * QUESTIONS_PER_PAGE >= totalQuestions} onClick={() => setPage(current => current + 1)}>Next</Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
