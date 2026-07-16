/**
 * Feature Flag Admin Panel — /admin/flags
 *
 * Owner-only UI for toggling feature flags without redeployment.
 * Protected: only users with role="admin" can access this page.
 *
 * Features:
 *   - Search bar (filters by key, name, or description)
 *   - Category filter tabs: All | Legacy | Nexus UX
 *   - Toggle switch per flag
 *   - Rollout percentage slider per flag
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleRight, Shield, RefreshCw, Info, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Category definitions ─────────────────────────────────────────────────────

const LEGACY_KEYS = new Set([
  "lesson_progress_bar",
  "assumption_family_arc_cta",
  "about_testimonials",
  "ai_lesson_plan_generator",
  "question_bank",
]);

const NEXUS_KEYS = new Set([
  "nexus_dashboard",
  "booking_cta",
  "lesson_grid",
  "concept_map",
  "score_card",
]);

type Category = "all" | "legacy" | "nexus";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All Flags",
  legacy: "Legacy",
  nexus: "Nexus UX",
};

// ─── Colour helpers ───────────────────────────────────────────────────────────

const FLAG_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  // Legacy flags
  lesson_progress_bar:        { accent: "#2563eb", bg: "rgba(37,99,235,0.07)",  border: "rgba(37,99,235,0.2)" },
  assumption_family_arc_cta:  { accent: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.2)" },
  about_testimonials:         { accent: "#059669", bg: "rgba(5,150,105,0.07)",  border: "rgba(5,150,105,0.2)" },
  ai_lesson_plan_generator:   { accent: "#d97706", bg: "rgba(217,119,6,0.07)",  border: "rgba(217,119,6,0.2)" },
  question_bank:              { accent: "#dc2626", bg: "rgba(220,38,38,0.07)",  border: "rgba(220,38,38,0.2)" },
  // Nexus UX flags
  nexus_dashboard:            { accent: "#1AABBC", bg: "rgba(26,171,188,0.07)", border: "rgba(26,171,188,0.2)" },
  booking_cta:                { accent: "#EFA01C", bg: "rgba(239,160,28,0.07)", border: "rgba(239,160,28,0.2)" },
  lesson_grid:                { accent: "#1AABBC", bg: "rgba(26,171,188,0.07)", border: "rgba(26,171,188,0.2)" },
  concept_map:                { accent: "#2D6A4F", bg: "rgba(45,106,79,0.07)",  border: "rgba(45,106,79,0.2)" },
  score_card:                 { accent: "#D0452A", bg: "rgba(208,69,42,0.07)",  border: "rgba(208,69,42,0.2)" },
};

const DEFAULT_COLOR = { accent: "#6b7280", bg: "rgba(107,114,128,0.07)", border: "rgba(107,114,128,0.2)" };

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onChange,
  disabled,
  accent,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: enabled ? accent : "#d1d5db" }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? "translateX(1.375rem)" : "translateX(0.25rem)" }}
      />
    </button>
  );
}

// ─── Rollout Slider ───────────────────────────────────────────────────────────

function RolloutSlider({
  value,
  onChange,
  disabled,
  accent,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ accentColor: accent }}
      />
      <span
        className="text-sm font-mono font-bold w-10 text-right"
        style={{ color: accent }}
      >
        {value}%
      </span>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ flagKey }: { flagKey: string }) {
  if (LEGACY_KEYS.has(flagKey)) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}
      >
        Legacy
      </span>
    );
  }
  if (NEXUS_KEYS.has(flagKey)) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ background: "rgba(26,171,188,0.08)", color: "#1AABBC", border: "1px solid rgba(26,171,188,0.2)" }}
      >
        Nexus UX
      </span>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlagAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: flags, isLoading, refetch } = trpc.flags.adminList.useQuery(undefined, {
    enabled: !authLoading && user?.role === "admin",
    refetchOnWindowFocus: false,
  });

  const toggleMutation = trpc.flags.toggle.useMutation({
    onSuccess: async (updated) => {
      toast.success(`Flag "${updated.key}" ${updated.enabled ? "enabled" : "disabled"}`);
      await Promise.all([refetch(), utils.flags.evaluate.invalidate()]);
    },
    onError: (err) => toast.error(err.message),
  });

  const rolloutMutation = trpc.flags.setRollout.useMutation({
    onSuccess: async (updated) => {
      toast.success(`Rollout for "${updated.key}" set to ${updated.rolloutPercentage}%`);
      await Promise.all([refetch(), utils.flags.evaluate.invalidate()]);
    },
    onError: (err) => toast.error(err.message),
  });

  // Local optimistic state for rollout sliders (avoids flicker)
  const [localRollouts, setLocalRollouts] = useState<Record<string, number>>({});

  // ── Search & filter state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  // Derived: filtered + searched flags
  const filteredFlags = useMemo(() => {
    if (!flags) return [];
    const q = searchQuery.trim().toLowerCase();

    return flags.filter((flag) => {
      // Category filter
      if (activeCategory === "legacy" && !LEGACY_KEYS.has(flag.key)) return false;
      if (activeCategory === "nexus"  && !NEXUS_KEYS.has(flag.key))  return false;

      // Search filter — matches key, name, or description
      if (q) {
        const haystack = `${flag.key} ${flag.name} ${flag.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [flags, searchQuery, activeCategory]);

  // Category counts for tab badges
  const counts = useMemo(() => {
    if (!flags) return { all: 0, legacy: 0, nexus: 0 };
    return {
      all:    flags.length,
      legacy: flags.filter((f) => LEGACY_KEYS.has(f.key)).length,
      nexus:  flags.filter((f) => NEXUS_KEYS.has(f.key)).length,
    };
  }, [flags]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Shield size={48} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Access Required
        </h1>
        <p className="text-muted-foreground max-w-sm">
          This page is restricted to site administrators. If you believe this is an error, please contact the site owner.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2 text-sm font-semibold"
          style={{
            background: "var(--nexus-teal)",
            color: "#111",
            border: "1.5px solid var(--nexus-teal)",
            borderRadius: "0.25rem",
          }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-10"
        style={{
          borderColor: "var(--border)",
          background: "rgba(249,248,246,0.97)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container py-5">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: "rgba(26,171,188,0.1)",
                  border: "1.5px solid rgba(26,171,188,0.35)",
                  borderRadius: "0.25rem",
                }}
              >
                <ToggleRight size={20} style={{ color: "#1AABBC" }} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    fontSize: "1.4rem",
                    color: "var(--foreground)",
                    margin: 0,
                    letterSpacing: "0.01em",
                  }}
                >
                  Feature Flags
                </h1>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0 }}>
                  Toggle features without redeployment · changes take effect within 60 s
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "0.25rem",
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </motion.div>
        </div>
      </header>

      {/* ── Search + Filter toolbar ─────────────────────────────────────────── */}
      <div className="container pt-7 pb-1">

        {/* Info banner */}
        <div
          className="flex items-start gap-3 p-4 mb-6"
          style={{
            background: "rgba(26,171,188,0.06)",
            border: "1px solid rgba(26,171,188,0.2)",
            borderRadius: "0.25rem",
          }}
        >
          <Info size={17} style={{ color: "#1AABBC", marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.6, margin: 0 }}>
            Changes take effect immediately — no redeploy needed. The frontend caches flags for 60 seconds,
            so toggled features will appear for all visitors within one minute of a change.
            Rollout percentage controls what fraction of visitors see the feature (100% = everyone). Each visitor is assigned deterministically, so their experience remains stable as they return.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            type="text"
            placeholder="Search by flag key, name, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-sm transition-colors"
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "0.25rem",
              color: "var(--foreground)",
              fontFamily: "'Space Grotesk', sans-serif",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#1AABBC"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "legacy", "nexus"] as Category[]).map((cat) => {
            const isActive = activeCategory === cat;
            const catColor = cat === "nexus" ? "#1AABBC" : cat === "legacy" ? "#2563eb" : "var(--foreground)";
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold transition-all duration-150"
                style={{
                  borderRadius: "0.25rem",
                  border: isActive ? `1.5px solid ${catColor}` : "1.5px solid var(--border)",
                  background: isActive
                    ? cat === "nexus"   ? "rgba(26,171,188,0.1)"
                    : cat === "legacy"  ? "rgba(37,99,235,0.08)"
                    : "rgba(17,17,17,0.06)"
                    : "transparent",
                  color: isActive ? catColor : "var(--muted-foreground)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                {CATEGORY_LABELS[cat]}
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                  style={{
                    background: isActive ? catColor : "var(--muted)",
                    color: isActive ? "#fff" : "var(--muted-foreground)",
                    fontSize: "0.7rem",
                  }}
                >
                  {counts[cat]}
                </span>
              </button>
            );
          })}

          {/* Result count */}
          {(searchQuery || activeCategory !== "all") && (
            <span
              className="ml-auto text-xs"
              style={{ color: "var(--muted-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {filteredFlags.length} of {flags?.length ?? 0} flags
            </span>
          )}
        </div>
      </div>

      {/* ── Flag Cards ──────────────────────────────────────────────────────── */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filteredFlags.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-3 text-center"
          >
            <Search size={36} style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
              No flags match{searchQuery ? ` "${searchQuery}"` : ""}{activeCategory !== "all" ? ` in ${CATEGORY_LABELS[activeCategory]}` : ""}.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="text-sm font-semibold underline"
              style={{ color: "#1AABBC" }}
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFlags.map((flag, idx) => {
                const colors = FLAG_COLORS[flag.key] ?? DEFAULT_COLOR;
                const isMutating =
                  (toggleMutation.isPending && toggleMutation.variables?.key === flag.key) ||
                  (rolloutMutation.isPending && rolloutMutation.variables?.key === flag.key);

                const currentRollout = localRollouts[flag.key] ?? flag.rolloutPercentage;

                return (
                  <motion.div
                    key={flag.key}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="overflow-hidden"
                    style={{
                      background: "var(--card)",
                      border: `1.5px solid ${colors.border}`,
                      borderRadius: "0.25rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Top accent bar */}
                    <div style={{ height: "3px", background: colors.accent }} />

                    <div className="p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3
                              className="font-bold"
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "0.95rem",
                                color: "var(--foreground)",
                              }}
                            >
                              {flag.name}
                            </h3>
                            <CategoryBadge flagKey={flag.key} />
                          </div>
                          <code
                            className="text-xs mt-0.5 block"
                            style={{ color: colors.accent, fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {flag.key}
                          </code>
                        </div>
                        <ToggleSwitch
                          enabled={flag.enabled}
                          accent={colors.accent}
                          disabled={isMutating}
                          onChange={(v) =>
                            toggleMutation.mutate({ key: flag.key, enabled: v })
                          }
                        />
                      </div>

                      {/* Description */}
                      {flag.description && (
                        <p
                          className="text-sm mb-4"
                          style={{ color: "var(--muted-foreground)", lineHeight: 1.55 }}
                        >
                          {flag.description}
                        </p>
                      )}

                      {/* Rollout slider */}
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wide mb-2"
                          style={{ color: "var(--muted-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Rollout Percentage
                        </p>
                        <RolloutSlider
                          value={currentRollout}
                          accent={colors.accent}
                          disabled={isMutating || !flag.enabled}
                          onChange={(v) => {
                            setLocalRollouts((prev) => ({ ...prev, [flag.key]: v }));
                          }}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            disabled={isMutating || !flag.enabled || currentRollout === flag.rolloutPercentage}
                            onClick={() =>
                              rolloutMutation.mutate({ key: flag.key, rolloutPercentage: currentRollout })
                            }
                            className="text-xs px-3 py-1 font-semibold transition-opacity disabled:opacity-40"
                            style={{
                              background: colors.bg,
                              color: colors.accent,
                              border: `1px solid ${colors.border}`,
                              borderRadius: "0.25rem",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className="flex items-center justify-between mt-3 pt-3"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: flag.enabled ? "rgba(5,150,105,0.1)" : "rgba(107,114,128,0.1)",
                            color: flag.enabled ? "#059669" : "#6b7280",
                          }}
                        >
                          {flag.enabled ? "● Enabled" : "○ Disabled"}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          Updated {new Date(flag.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
