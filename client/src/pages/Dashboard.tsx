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
import ScoreCard from "@/components/ScoreCard";
import MasteryOverview from "@/components/MasteryOverview";
import QuickNavigation from "@/components/QuickNavigation";
import PathSelector from "@/components/PathSelector";
import { useAllFeatureFlags } from "@/lib/flags";

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
            fontFamily: "'Archivo', sans-serif",
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

  // Main content: concept map (default) or lesson grid (fallback)
  const mainContent = flags.concept_map ? <ConceptMap /> : <LessonGrid />;

  // Sidebar: actions first (P4 fix), then data widgets
  const sidebarContent = (
    <>
      <QuickNavigation />
      {flags.score_card && (
        <ScoreCard currentScore={157} percentile={63} targetScore={170} />
      )}
      <MasteryOverview />
    </>
  );

  return (
    <NexusDashboardLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  );
}
