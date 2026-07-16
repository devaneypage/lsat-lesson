/**
 * DESIGN: Nexus Command Center — Dashboard
 * Page: Dashboard
 *
 * Primary entry point showing student progress, concept map, and quick actions.
 * Two-column layout: main concept map + sidebar with score, mastery, and quick nav.
 *
 * Feature Flags:
 *   nexus_dashboard — if disabled, renders the legacy PathSelector landing page
 *   concept_map     — if disabled, renders LessonGrid instead of ConceptMap
 *   score_card      — if disabled, hides the ScoreCard from the sidebar
 */

import NexusDashboardLayout from "@/components/NexusDashboardLayout";
import ConceptMap from "@/components/ConceptMap";
import LessonGrid from "@/components/LessonGrid";
import QuickNavigation from "@/components/QuickNavigation";
import PathSelector from "@/components/PathSelector";
import { ContinueLearningMain, ContinueLearningSidebar } from "@/components/ContinueLearningDashboard";
import { useAllFeatureFlags } from "@/lib/flags";
import { TODAY_EVIDENCE_STATUS } from "@/lib/learnerExperience";

export default function Dashboard() {
  const { flags, loading } = useAllFeatureFlags();

  // While flags are loading, render a minimal skeleton to avoid layout flash
  if (loading) {
    return (
      <div
        style={{
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.9rem",
            color: "var(--muted-foreground)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Loading…
        </div>
      </div>
    );
  }

  // Kill switch: revert to legacy PathSelector if nexus_dashboard is disabled
  if (!flags.nexus_dashboard) {
    return <PathSelector />;
  }

  const legacyMainContent = flags.concept_map ? <ConceptMap /> : <LessonGrid />;
  const mainContent = flags.learner_dashboard_v2 ? <ContinueLearningMain /> : legacyMainContent;

  const legacySidebar = (
    <>
      <QuickNavigation />
      <section className="border border-border bg-card p-5 text-card-foreground" aria-labelledby="evidence-status-title">
        <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Evidence status
        </p>
        <h2 id="evidence-status-title" className="font-display text-xl font-bold">
          {TODAY_EVIDENCE_STATUS.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {TODAY_EVIDENCE_STATUS.body}
        </p>
      </section>
    </>
  );
  const sidebarContent = flags.learner_dashboard_v2 ? (
    <>
      <ContinueLearningSidebar />
      <QuickNavigation />
    </>
  ) : legacySidebar;

  return (
    <NexusDashboardLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  );
}
