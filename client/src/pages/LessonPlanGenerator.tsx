/**
 * AI Lesson Plan Generator — /lesson-plan-generator
 *
 * Design: Balanced & Refined light scheme — matches site palette.
 * - Background: var(--background) cream #F4EDE0
 * - Cards: var(--card) #FFFDF8 with 1.5px border
 * - Accent: nexus-amber #EFA01C for active states
 * - Typography: Archivo Black / Archivo
 *
 * Test Date: pre-populated with official LSAC 2026-2027 dates
 * Source: https://www.lsac.org/LSATdates (retrieved 2026-07-03)
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  Timer,
} from "lucide-react";

// ─── Official LSAC 2026-2027 test dates ──────────────────────────────────────
// Source: https://www.lsac.org/LSATdates
// Only future dates (after 2026-07-03) are included.

// ─── Countdown helpers ───────────────────────────────────────────────────────

/** Returns days remaining from today until the given ISO date string (inclusive). */
function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Returns a color and urgency label based on days remaining. */
function urgencyStyle(days: number): { color: string; bg: string; border: string; label: string } {
  if (days < 0)  return { color: "#888",            bg: "rgba(0,0,0,0.04)",          border: "rgba(0,0,0,0.1)",          label: "Closed" };
  if (days === 0) return { color: "#D0452A",         bg: "rgba(208,69,42,0.08)",      border: "rgba(208,69,42,0.3)",      label: "Today!" };
  if (days <= 7)  return { color: "#D0452A",         bg: "rgba(208,69,42,0.08)",      border: "rgba(208,69,42,0.3)",      label: "Urgent" };
  if (days <= 30) return { color: "#EFA01C",         bg: "rgba(239,160,28,0.08)",     border: "rgba(239,160,28,0.3)",     label: "Soon" };
  return           { color: "#1AABBC",               bg: "rgba(26,171,188,0.07)",     border: "rgba(26,171,188,0.25)",    label: "Open" };
}

const LSAT_DATES = [
  { label: "August 2026 — Aug 5–8, 2026",      value: "2026-08-05", regDeadline: "Jun 25, 2026", regDeadlineIso: "2026-06-25", scoreRelease: "Aug 26, 2026" },
  { label: "September 2026 — Sep 9–12, 2026",   value: "2026-09-09", regDeadline: "Jul 28, 2026", regDeadlineIso: "2026-07-28", scoreRelease: "Sep 30, 2026" },
  { label: "October 2026 — Oct 7–10, 2026",     value: "2026-10-07", regDeadline: "Aug 27, 2026", regDeadlineIso: "2026-08-27", scoreRelease: "Oct 28, 2026" },
  { label: "November 2026 — Nov 11–14, 2026",   value: "2026-11-11", regDeadline: "Oct 1, 2026",  regDeadlineIso: "2026-10-01", scoreRelease: "Dec 2, 2026" },
  { label: "January 2027 — Jan 13–16, 2027",    value: "2027-01-13", regDeadline: "Dec 1, 2026",  regDeadlineIso: "2026-12-01", scoreRelease: "Feb 3, 2027" },
  { label: "February 2027 — Feb 12–13, 2027",   value: "2027-02-12", regDeadline: "Dec 29, 2026", regDeadlineIso: "2026-12-29", scoreRelease: "Mar 3, 2027" },
  { label: "April 2027 — Apr 8–10, 2027",       value: "2027-04-08", regDeadline: "Feb 25, 2027", regDeadlineIso: "2027-02-25", scoreRelease: "Apr 28, 2027" },
  { label: "June 2027 — Jun 9–12, 2027",        value: "2027-06-09", regDeadline: "Apr 29, 2027", regDeadlineIso: "2027-04-29", scoreRelease: "Jun 30, 2027" },
] as const;

type LsatDateValue = (typeof LSAT_DATES)[number]["value"] | "custom";

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
  { value: "4",   label: "4 hrs/wk",  description: "Light — 2 sessions" },
  { value: "8",   label: "8 hrs/wk",  description: "Moderate — 4 sessions" },
  { value: "12",  label: "12 hrs/wk", description: "Intensive — 6 sessions" },
  { value: "16+", label: "16+ hrs/wk",description: "Full-time prep" },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1.5px solid var(--border)",
  borderRadius: "0.25rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'Archivo Black', sans-serif",
  fontWeight: 900,
  fontSize: "0.85rem",
  color: "var(--foreground)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: "0.25rem",
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: "0.82rem",
  color: "rgba(17,17,17,0.55)",
  lineHeight: 1.5,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonPlanGenerator() {
  const [currentScore, setCurrentScore] = useState<number | "untested">(152);
  const [hasScore, setHasScore] = useState(true);
  const [selectedLsatDate, setSelectedLsatDate] = useState<LsatDateValue>("2026-10-07");
  const [customDate, setCustomDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState<HoursPerWeek>("8");
  const [targetScore, setTargetScore] = useState(165);
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

  // Resolve the actual date string to pass to the API
  const resolvedTestDate = selectedLsatDate === "custom" ? customDate : selectedLsatDate;

  const handleGenerate = () => {
    if (weakAreas.length === 0) {
      toast.error("Please select at least one weak area.");
      return;
    }
    if (!resolvedTestDate) {
      toast.error("Please select your test date.");
      return;
    }
    generateMutation.mutate({
      currentScore: hasScore ? (currentScore as number) : "untested",
      targetScore,
      testDate: resolvedTestDate,
      hoursPerWeek,
      weakAreas,
    });
  };

  const handleCopy = async () => {
    if (!generatedPlan) return;
    await navigator.clipboard.writeText(generatedPlan);
    toast.success("Plan copied to clipboard!");
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setGeneratedPlan(null);
    setPlanMeta(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isValid = weakAreas.length > 0 && resolvedTestDate;

  // Find the selected date metadata for the info panel
  const selectedDateMeta = LSAT_DATES.find((d) => d.value === selectedLsatDate);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div
        className="border-b sticky top-0 z-10 print:hidden"
        style={{
          background: "rgba(249,248,246,0.97)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{
              background: "rgba(239,160,28,0.12)",
              border: "1.5px solid rgba(239,160,28,0.35)",
              borderRadius: "0.25rem",
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "var(--nexus-amber)" }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontWeight: 900,
                fontSize: "1.1rem",
                color: "var(--foreground)",
                letterSpacing: "0.01em",
                margin: 0,
              }}
            >
              AI Lesson Plan Generator
            </h1>
            <p style={{ ...mutedStyle, margin: 0 }}>
              Personalized LSAT study plan in seconds
            </p>
          </div>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {!generatedPlan && (
          <div className="space-y-6">

            {/* ── Score Goals ────────────────────────────────────────────────── */}
            <div style={cardStyle} className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} style={{ color: "var(--nexus-amber)" }} />
                <p style={sectionLabelStyle}>Score Goals</p>
              </div>
              <p style={{ ...mutedStyle, marginBottom: "1.25rem" }}>
                Set your starting point and target score
              </p>

              {/* Diagnostic toggle */}
              <div className="flex items-center gap-2 mb-5">
                {[
                  { label: "I have a diagnostic score", val: true },
                  { label: "No diagnostic yet", val: false },
                ].map(({ label, val }) => (
                  <button
                    key={label}
                    onClick={() => { setHasScore(val); if (!val) setCurrentScore("untested"); }}
                    className="px-4 py-2 text-sm font-semibold transition-all duration-150"
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      borderRadius: "0.25rem",
                      border: hasScore === val
                        ? "1.5px solid var(--nexus-amber)"
                        : "1.5px solid var(--border)",
                      background: hasScore === val
                        ? "rgba(239,160,28,0.1)"
                        : "transparent",
                      color: hasScore === val ? "var(--nexus-amber)" : "rgba(17,17,17,0.55)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hasScore && (
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-center">
                    <label style={mutedStyle}>Current Score</label>
                    <span
                      style={{
                        fontFamily: "'Archivo Black', sans-serif",
                        fontSize: "1.5rem",
                        color: "var(--nexus-amber)",
                      }}
                    >
                      {currentScore}
                    </span>
                  </div>
                  <Slider
                    min={120} max={180} step={1}
                    value={[currentScore as number]}
                    onValueChange={([v]) => setCurrentScore(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between" style={mutedStyle}>
                    <span>120</span><span>150</span><span>180</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label style={mutedStyle}>Target Score</label>
                  <span
                    style={{
                      fontFamily: "'Archivo Black', sans-serif",
                      fontSize: "1.5rem",
                      color: "#2D6A4F",
                    }}
                  >
                    {targetScore}
                  </span>
                </div>
                <Slider
                  min={120} max={180} step={1}
                  value={[targetScore]}
                  onValueChange={([v]) => setTargetScore(v)}
                  className="w-full"
                />
                <div className="flex justify-between" style={mutedStyle}>
                  <span>120</span><span>150</span><span>180</span>
                </div>
              </div>

              {hasScore && typeof currentScore === "number" && targetScore > currentScore && (
                <div
                  className="mt-4 px-4 py-3 text-sm"
                  style={{
                    background: "rgba(45,106,79,0.07)",
                    border: "1px solid rgba(45,106,79,0.25)",
                    borderRadius: "0.25rem",
                    color: "#2D6A4F",
                    fontFamily: "'Archivo', sans-serif",
                  }}
                >
                  Score gap: <strong>{targetScore - currentScore} points</strong> — that's achievable with focused preparation.
                </div>
              )}
            </div>

            {/* ── Schedule ───────────────────────────────────────────────────── */}
            <div style={cardStyle} className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} style={{ color: "var(--nexus-amber)" }} />
                <p style={sectionLabelStyle}>Schedule</p>
              </div>
              <p style={{ ...mutedStyle, marginBottom: "1.25rem" }}>
                When is your test and how much time can you commit?
              </p>

              {/* LSAT Date Selector */}
              <div className="mb-5">
                <label
                  style={{ ...mutedStyle, display: "block", marginBottom: "0.5rem", fontWeight: 600 }}
                >
                  Test Date
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      color: "var(--nexus-teal)",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Official LSAC 2026–2027 Dates
                  </span>
                </label>

                {/* Dropdown */}
                <div className="relative">
                  <select
                    value={selectedLsatDate}
                    onChange={(e) => setSelectedLsatDate(e.target.value as LsatDateValue)}
                    className="w-full appearance-none pr-10 pl-4 py-2.5 text-sm transition-colors"
                    style={{
                      background: "var(--card)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "0.25rem",
                      color: "var(--foreground)",
                      fontFamily: "'Archivo', sans-serif",
                      outline: "none",
                      cursor: "pointer",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--nexus-amber)"; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {LSAT_DATES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                    <option value="custom">Custom date…</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(17,17,17,0.45)" }}
                  />
                </div>

                {/* Date metadata panel with countdown timer */}
                {selectedDateMeta && (() => {
                  const days = daysUntil(selectedDateMeta.regDeadlineIso);
                  const u = urgencyStyle(days);
                  return (
                    <div
                      className="mt-2 px-4 py-3"
                      style={{
                        background: "rgba(239,160,28,0.04)",
                        border: "1px solid rgba(239,160,28,0.18)",
                        borderRadius: "0.25rem",
                        fontFamily: "'Archivo', sans-serif",
                      }}
                    >
                      {/* Countdown row */}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center gap-2 px-3 py-1.5"
                          style={{
                            background: u.bg,
                            border: `1.5px solid ${u.border}`,
                            borderRadius: "0.25rem",
                          }}
                        >
                          <Clock size={14} style={{ color: u.color }} />
                          <span
                            style={{
                              fontFamily: "'Archivo Black', sans-serif",
                              fontSize: "1.15rem",
                              fontWeight: 900,
                              color: u.color,
                              lineHeight: 1,
                            }}
                          >
                            {days < 0 ? "—" : days}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: u.color, fontWeight: 600 }}>
                            {days < 0 ? "Registration closed" : days === 1 ? "day until reg. deadline" : "days until reg. deadline"}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{ background: u.color, color: "#fff", fontSize: "0.65rem", letterSpacing: "0.05em" }}
                          >
                            {u.label.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: "rgba(17,17,17,0.55)" }}>
                        <span>
                          Reg. deadline: <strong style={{ color: "var(--foreground)" }}>{selectedDateMeta.regDeadline}</strong>
                        </span>
                        <span>
                          Score release: <strong style={{ color: "var(--foreground)" }}>{selectedDateMeta.scoreRelease}</strong>
                        </span>
                        <a
                          href="https://www.lsac.org/LSATdates"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--nexus-teal)", textDecoration: "underline" }}
                        >
                          View on LSAC.org ↗
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Custom date input */}
                {selectedLsatDate === "custom" && (
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-2 w-full px-4 py-2.5 text-sm transition-colors"
                    style={{
                      background: "var(--card)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "0.25rem",
                      color: "var(--foreground)",
                      fontFamily: "'Archivo', sans-serif",
                      outline: "none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--nexus-amber)"; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                )}
              </div>

              {/* Hours per week */}
              <div>
                <label style={{ ...mutedStyle, display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Study Hours Per Week
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HOURS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHoursPerWeek(opt.value)}
                      className="p-3 text-left transition-all duration-150"
                      style={{
                        border: hoursPerWeek === opt.value
                          ? "1.5px solid var(--nexus-amber)"
                          : "1.5px solid var(--border)",
                        background: hoursPerWeek === opt.value
                          ? "rgba(239,160,28,0.08)"
                          : "var(--card)",
                        borderRadius: "0.25rem",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Archivo Black', sans-serif",
                          fontSize: "0.85rem",
                          color: hoursPerWeek === opt.value ? "var(--nexus-amber)" : "var(--foreground)",
                        }}
                      >
                        {opt.label}
                      </div>
                      <div style={{ ...mutedStyle, marginTop: "0.2rem" }}>{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Weak Areas ─────────────────────────────────────────────────── */}
            <div style={cardStyle} className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={16} style={{ color: "var(--nexus-amber)" }} />
                <p style={sectionLabelStyle}>
                  Weak Areas
                  {weakAreas.length > 0 && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: "rgba(239,160,28,0.12)",
                        color: "var(--nexus-amber)",
                        border: "1px solid rgba(239,160,28,0.3)",
                        fontFamily: "'Archivo', sans-serif",
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      {weakAreas.length} selected
                    </span>
                  )}
                </p>
              </div>
              <p style={{ ...mutedStyle, marginBottom: "1.25rem" }}>
                Select all question types and topics where you struggle (select at least one)
              </p>

              <div className="flex flex-wrap gap-2">
                {WEAK_AREAS.map((area) => {
                  const selected = weakAreas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleWeakArea(area)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all duration-150"
                      style={{
                        borderRadius: "0.25rem",
                        border: selected
                          ? "1.5px solid var(--nexus-amber)"
                          : "1.5px solid var(--border)",
                        background: selected ? "rgba(239,160,28,0.1)" : "transparent",
                        color: selected ? "var(--nexus-amber)" : "rgba(17,17,17,0.65)",
                        fontFamily: "'Archivo', sans-serif",
                      }}
                    >
                      {selected && <CheckCircle2 size={13} />}
                      {area}
                    </button>
                  );
                })}
              </div>

              {weakAreas.length === 0 && (
                <p className="text-xs mt-3" style={{ color: "var(--nexus-terra)", fontFamily: "'Archivo', sans-serif" }}>
                  Please select at least one weak area to generate your plan.
                </p>
              )}
            </div>

            {/* ── Generate Button ─────────────────────────────────────────────── */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={!isValid || generateMutation.isPending}
                className="flex items-center gap-2 px-8 py-3.5 font-semibold transition-all duration-150 disabled:opacity-40"
                style={{
                  background: "var(--nexus-amber)",
                  color: "#111111",
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: "0.9rem",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  border: "1.5px solid var(--nexus-amber)",
                  borderRadius: "0.25rem",
                  boxShadow: "0 2px 8px rgba(239,160,28,0.2)",
                }}
                onMouseEnter={(e) => { if (!generateMutation.isPending) e.currentTarget.style.background = "#d98a0b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--nexus-amber)"; }}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating your plan…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate My Lesson Plan
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Generated Plan Output ──────────────────────────────────────────── */}
        {generatedPlan && (
          <div ref={planRef} className="space-y-5 print:space-y-4">

            {/* Meta badges */}
            {planMeta && (
              <div className="flex flex-wrap gap-2 print:hidden">
                {[
                  { icon: <Clock size={13} />, label: `${planMeta.weeksUntilTest} weeks until test`, color: "var(--nexus-amber)", bg: "rgba(239,160,28,0.1)", border: "rgba(239,160,28,0.3)" },
                  { icon: <Target size={13} />, label: `Score gap: ${planMeta.scoreGap}`, color: "#2D6A4F", bg: "rgba(45,106,79,0.08)", border: "rgba(45,106,79,0.25)" },
                  { icon: <Brain size={13} />, label: `${weakAreas.length} focus areas`, color: "var(--nexus-teal)", bg: "rgba(26,171,188,0.08)", border: "rgba(26,171,188,0.25)" },
                ].map(({ icon, label, color, bg, border }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: "0.25rem",
                      color,
                      fontFamily: "'Archivo', sans-serif",
                    }}
                  >
                    {icon}{label}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap print:hidden">
              {[
                { icon: <Copy size={14} />, label: "Copy to Clipboard", onClick: handleCopy },
                { icon: <Printer size={14} />, label: "Print / Save PDF", onClick: handlePrint },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    background: "transparent",
                    border: "1.5px solid var(--border)",
                    borderRadius: "0.25rem",
                    color: "rgba(17,17,17,0.65)",
                    fontFamily: "'Archivo', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--nexus-teal)"; e.currentTarget.style.color = "var(--nexus-teal)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "rgba(17,17,17,0.65)"; }}
                >
                  {icon}{label}
                </button>
              ))}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 ml-auto"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  borderRadius: "0.25rem",
                  color: "rgba(17,17,17,0.65)",
                  fontFamily: "'Archivo', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--nexus-terra)"; e.currentTarget.style.color = "var(--nexus-terra)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "rgba(17,17,17,0.65)"; }}
              >
                <RotateCcw size={14} />
                Generate New Plan
              </button>
            </div>

            {/* Plan content */}
            <div
              style={{
                ...cardStyle,
                padding: "2rem",
              }}
              className="print:bg-white print:border-gray-200"
            >
              <div className="prose prose-sm max-w-none prose-headings:font-['Archivo_Black'] prose-headings:text-[var(--foreground)] prose-strong:text-[var(--foreground)] prose-li:text-[rgba(17,17,17,0.8)] prose-p:text-[rgba(17,17,17,0.8)] print:prose-headings:text-gray-900 print:prose-p:text-gray-800">
                <Streamdown>{generatedPlan}</Streamdown>
              </div>
            </div>

            {/* Bottom reset */}
            <div className="flex justify-center pt-2 print:hidden">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  borderRadius: "0.25rem",
                  color: "rgba(17,17,17,0.65)",
                  fontFamily: "'Archivo', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--nexus-amber)"; e.currentTarget.style.color = "var(--nexus-amber)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "rgba(17,17,17,0.65)"; }}
              >
                <RotateCcw size={14} />
                Generate a Different Plan
              </button>
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
