/**
 * Feature Flag Admin Panel — /admin/flags
 *
 * Owner-only UI for toggling feature flags without redeployment.
 * Protected: only users with role="admin" can access this page.
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { ToggleRight, Shield, RefreshCw, Info } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Colour helpers ───────────────────────────────────────────────────────────

const FLAG_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  lesson_progress_bar:        { accent: "#2563eb", bg: "rgba(37,99,235,0.07)",  border: "rgba(37,99,235,0.2)" },
  assumption_family_arc_cta:  { accent: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.2)" },
  about_testimonials:         { accent: "#059669", bg: "rgba(5,150,105,0.07)",  border: "rgba(5,150,105,0.2)" },
  ai_lesson_plan_generator:   { accent: "#d97706", bg: "rgba(217,119,6,0.07)",  border: "rgba(217,119,6,0.2)" },
  question_bank:              { accent: "#dc2626", bg: "rgba(220,38,38,0.07)",  border: "rgba(220,38,38,0.2)" },
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
      style={{
        background: enabled ? accent : "#d1d5db",
      }}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlagAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: flags, isLoading, refetch } = trpc.flags.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const toggleMutation = trpc.flags.toggle.useMutation({
    onSuccess: (updated) => {
      toast.success(`Flag "${updated.key}" ${updated.enabled ? "enabled" : "disabled"}`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const rolloutMutation = trpc.flags.setRollout.useMutation({
    onSuccess: (updated) => {
      toast.success(`Rollout for "${updated.key}" set to ${updated.rolloutPercentage}%`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Local optimistic state for rollout sliders (avoids flicker)
  const [localRollouts, setLocalRollouts] = useState<Record<string, number>>({});

  // Auth guard
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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Admin Access Required
        </h1>
        <p className="text-muted-foreground max-w-sm">
          This page is restricted to site administrators. If you believe this is an error, please contact the site owner.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10"
        style={{
          borderColor: "var(--border)",
          background: "rgba(249,248,246,0.97)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container py-6">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.1)", border: "2px solid rgba(37,99,235,0.3)" }}
              >
                <Shield size={20} style={{ color: "#2563eb" }} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  Feature Flags
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", margin: 0 }}>
                  Toggle features without redeployment
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </motion.div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="container pt-8 pb-2">
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "rgba(37,99,235,0.06)",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          <Info size={18} style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "0.875rem", color: "var(--foreground)", lineHeight: 1.6, margin: 0 }}>
            Changes take effect immediately — no redeploy needed. The frontend caches flags for 60 seconds,
            so toggled features will appear for all visitors within one minute of a change.
            Rollout percentage controls what fraction of users see the feature (100% = everyone).
          </p>
        </div>
      </div>

      {/* Flag Cards */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(flags ?? []).map((flag, idx) => {
              const colors = FLAG_COLORS[flag.key] ?? DEFAULT_COLOR;
              const isMutating =
                (toggleMutation.isPending && toggleMutation.variables?.key === flag.key) ||
                (rolloutMutation.isPending && rolloutMutation.variables?.key === flag.key);

              const currentRollout = localRollouts[flag.key] ?? flag.rolloutPercentage;

              return (
                <motion.div
                  key={flag.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--card)",
                    border: `1.5px solid ${colors.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: "3px", background: colors.accent }} />

                  <div className="p-5">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold truncate"
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1rem",
                            color: "var(--foreground)",
                          }}
                        >
                          {flag.name}
                        </h3>
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
                        style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}
                      >
                        {flag.description}
                      </p>
                    )}

                    {/* Rollout slider */}
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-2"
                        style={{ color: "var(--muted-foreground)" }}
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
                      {/* Commit rollout on mouse up */}
                      <div className="mt-2 flex justify-end">
                        <button
                          disabled={isMutating || !flag.enabled || currentRollout === flag.rolloutPercentage}
                          onClick={() =>
                            rolloutMutation.mutate({ key: flag.key, rolloutPercentage: currentRollout })
                          }
                          className="text-xs px-3 py-1 rounded-md font-semibold transition-opacity disabled:opacity-40"
                          style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }}
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
        )}
      </main>
    </div>
  );
}
