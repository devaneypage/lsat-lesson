import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Sparkles,
  Calendar,
  Clock,
  Target,
  Brain,
  Copy,
  Printer,
  ChevronRight,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

const WEAK_AREAS = [
  "Main Point",
  "Assumption",
  "Strengthen/Weaken",
  "Flaw",
  "Inference",
  "Role of Statement",
  "Point at Issue",
  "Method of Argument",
  "Parallel Reasoning",
  "Conditional Reasoning",
  "Reading Comprehension",
] as const;

type WeakArea = (typeof WEAK_AREAS)[number];
type HoursPerWeek = "4" | "8" | "12" | "16+";

const HOURS_OPTIONS: { value: HoursPerWeek; label: string; description: string }[] = [
  { value: "4", label: "4 hrs/wk", description: "Light — 2 sessions" },
  { value: "8", label: "8 hrs/wk", description: "Moderate — 4 sessions" },
  { value: "12", label: "12 hrs/wk", description: "Intensive — 6 sessions" },
  { value: "16+", label: "16+ hrs/wk", description: "Full-time prep" },
];

export default function LessonPlanGenerator() {
  const [currentScore, setCurrentScore] = useState<number | "untested">(152);
  const [hasScore, setHasScore] = useState(true);
  const [targetScore, setTargetScore] = useState(165);
  const [testDate, setTestDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [hoursPerWeek, setHoursPerWeek] = useState<HoursPerWeek>("8");
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [planMeta, setPlanMeta] = useState<{ weeksUntilTest: number; scoreGap: string } | null>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const generateMutation = trpc.lessonPlan.generate.useMutation({
    onSuccess: (data) => {
      const planText = typeof data.plan === "string" ? data.plan : "";
      setGeneratedPlan(planText);
      setPlanMeta({ weeksUntilTest: data.weeksUntilTest, scoreGap: data.scoreGap });
      setTimeout(() => planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate lesson plan. Please try again.");
    },
  });

  const toggleWeakArea = (area: WeakArea) => {
    setWeakAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = () => {
    if (weakAreas.length === 0) {
      toast.error("Please select at least one weak area.");
      return;
    }
    if (!testDate) {
      toast.error("Please select your test date.");
      return;
    }
    generateMutation.mutate({
      currentScore: hasScore ? (currentScore as number) : "untested",
      targetScore,
      testDate,
      hoursPerWeek,
      weakAreas,
    });
  };

  const handleCopy = async () => {
    if (!generatedPlan) return;
    await navigator.clipboard.writeText(generatedPlan);
    toast.success("Plan copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setGeneratedPlan(null);
    setPlanMeta(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isValid = weakAreas.length > 0 && testDate;
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#1C1F26] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1C1F26]/95 backdrop-blur sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-['Space_Grotesk']">
              AI Lesson Plan Generator
            </h1>
            <p className="text-xs text-white/50">Personalized LSAT study plan in seconds</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Intake Form */}
        {!generatedPlan && (
          <div className="space-y-8">
            {/* Score Section */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 font-['Space_Grotesk']">
                  <Target className="w-4 h-4 text-amber-400" />
                  Score Goals
                </CardTitle>
                <CardDescription className="text-white/50 text-sm">
                  Set your starting point and target score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Has diagnostic? */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHasScore(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hasScore
                        ? "bg-amber-500 text-black"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    I have a diagnostic score
                  </button>
                  <button
                    onClick={() => { setHasScore(false); setCurrentScore("untested"); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !hasScore
                        ? "bg-amber-500 text-black"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    No diagnostic yet
                  </button>
                </div>

                {hasScore && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-white/70">Current Score</label>
                      <span className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">
                        {currentScore}
                      </span>
                    </div>
                    <Slider
                      min={120}
                      max={180}
                      step={1}
                      value={[currentScore as number]}
                      onValueChange={([v]) => setCurrentScore(v)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/30">
                      <span>120</span>
                      <span>150</span>
                      <span>180</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-white/70">Target Score</label>
                    <span className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">
                      {targetScore}
                    </span>
                  </div>
                  <Slider
                    min={120}
                    max={180}
                    step={1}
                    value={[targetScore]}
                    onValueChange={([v]) => setTargetScore(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/30">
                    <span>120</span>
                    <span>150</span>
                    <span>180</span>
                  </div>
                </div>

                {hasScore && typeof currentScore === "number" && targetScore > currentScore && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm text-emerald-300">
                    Score gap: <strong>{targetScore - currentScore} points</strong> — that's achievable with focused preparation.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Section */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 font-['Space_Grotesk']">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Schedule
                </CardTitle>
                <CardDescription className="text-white/50 text-sm">
                  When is your test and how much time can you commit?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Test Date</label>
                  <input
                    type="date"
                    min={minDate}
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-white/70">Study Hours Per Week</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {HOURS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setHoursPerWeek(opt.value)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          hoursPerWeek === opt.value
                            ? "border-amber-400 bg-amber-400/10 text-amber-300"
                            : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"
                        }`}
                      >
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-xs opacity-60 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weak Areas Section */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 font-['Space_Grotesk']">
                  <Brain className="w-4 h-4 text-amber-400" />
                  Weak Areas
                  {weakAreas.length > 0 && (
                    <Badge className="ml-2 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                      {weakAreas.length} selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-white/50 text-sm">
                  Select all question types and topics where you struggle (select at least one)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {WEAK_AREAS.map((area) => {
                    const selected = weakAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleWeakArea(area)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          selected
                            ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                            : "bg-white/5 border-white/15 text-white/60 hover:border-white/30 hover:text-white/80"
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {area}
                      </button>
                    );
                  })}
                </div>
                {weakAreas.length === 0 && (
                  <p className="text-xs text-red-400/70 mt-3">
                    Please select at least one weak area to generate your plan.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!isValid || generateMutation.isPending}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-3 text-base rounded-xl disabled:opacity-40 transition-all"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating your plan…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Lesson Plan
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Generated Plan Output */}
        {generatedPlan && (
          <div ref={planRef} className="space-y-6 print:space-y-4">
            {/* Plan Meta */}
            {planMeta && (
              <div className="flex flex-wrap gap-3 print:hidden">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1.5 text-sm">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {planMeta.weeksUntilTest} weeks until test
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1.5 text-sm">
                  <Target className="w-3.5 h-3.5 mr-1.5" />
                  Score gap: {planMeta.scoreGap}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1.5 text-sm">
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  {weakAreas.length} focus areas
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent ml-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Generate New Plan
              </Button>
            </div>

            {/* Plan Content */}
            <Card className="bg-white/5 border-white/10 text-white print:bg-white print:text-black print:border-gray-200">
              <CardContent className="pt-6 prose prose-invert max-w-none prose-headings:font-['Space_Grotesk'] prose-headings:text-amber-300 prose-strong:text-white prose-li:text-white/85 prose-p:text-white/85 print:prose-headings:text-gray-900 print:prose-p:text-gray-800 print:prose-li:text-gray-800 print:prose-strong:text-gray-900">
                <Streamdown>{generatedPlan}</Streamdown>
              </CardContent>
            </Card>

            {/* Bottom action */}
            <div className="flex justify-center pt-4 print:hidden">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Generate a Different Plan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
