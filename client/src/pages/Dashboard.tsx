/**
 * DESIGN: Nexus Command Center — Dashboard
 * Page: Dashboard
 * 
 * Primary entry point showing student progress, concept map, and quick actions.
 * Two-column layout: main concept map + sidebar with score, mastery, and quick nav.
 */

import NexusDashboardLayout from "@/components/NexusDashboardLayout";
import ConceptMap from "@/components/ConceptMap";
import ScoreCard from "@/components/ScoreCard";
import MasteryOverview from "@/components/MasteryOverview";
import QuickNavigation from "@/components/QuickNavigation";

export default function Dashboard() {
  return (
    <NexusDashboardLayout
      mainContent={<ConceptMap />}
      sidebarContent={
        <>
          <ScoreCard
            currentScore={157}
            percentile={63}
            targetScore={170}
          />
          <MasteryOverview />
          <QuickNavigation />
        </>
      }
    />
  );
}
